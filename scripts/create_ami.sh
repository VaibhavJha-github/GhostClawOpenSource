#!/bin/bash
set -e
export AWS_PAGER=""

# GhostClaw Base AMI Creation Script (Amazon Linux 2023)
# Usage: ./create_ami.sh [AWS_REGION] [KEY_PAIR_NAME]

REGION=${1:-"us-east-1"}
KEY_PAIR=${2:-"ghostclaw-key"}
INSTANCE_TYPE="t2.micro"
AMI_NAME="GhostClaw-Base-AMI-$(date +%Y%m%d-%H%M)"
IAM_PROFILE="GhostClawInstanceProfile"

echo "Starting GhostClaw Base AMI Build in $REGION..."

# 1. Get latest Amazon Linux 2023 AMI ID
echo "Finding latest Amazon Linux 2023 AMI..."
BASE_AMI_ID=$(aws ec2 describe-images --owners amazon \
    --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" \
    --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text --region $REGION)

echo "Found Base AMI: $BASE_AMI_ID"

# 2. Launch Instance for Setup
echo "Launching setup instance..."
USER_DATA=$(base64 <<'USERDATA'
#!/bin/bash
set -e

# Update System (AL2023 uses dnf)
dnf update -y
dnf install -y git

# Install Node.js 22 (Using NodeSource)
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs

# Verify Node
node -v > /root/node_version.txt
npm -v >> /root/node_version.txt

# Install Process Manager (PM2) & OpenClaw
npm install -g pm2 openclaw

# Setup OpenClaw Directory
mkdir -p /root/.openclaw
echo "OpenClaw $(openclaw --version 2>/dev/null || echo unknown) installed via npm" > /root/.openclaw/installed

# Setup PM2 Startup (run as root)
export HOME=/root
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

# Install pm2-logrotate to prevent disk fill
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Save empty process list so resurrect works
pm2 save

# Signal Completion
echo "DONE" > /root/userdata_complete
USERDATA
)

INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $BASE_AMI_ID \
    --count 1 \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_PAIR \
    --iam-instance-profile Name=$IAM_PROFILE \
    --user-data "$USER_DATA" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=GhostClaw-Builder}]" \
    --query "Instances[0].InstanceId" --output text --region $REGION)

echo "Waiting for instance $INSTANCE_ID to initialize..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# 3. Wait for SSM to come online, then poll for completion
echo "Waiting for SSM connection..."
for i in $(seq 1 30); do
    STATUS=$(aws ssm get-connection-status --target $INSTANCE_ID --region $REGION --query "Status" --output text 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "connected" ]; then
        echo "SSM connected!"
        break
    fi
    echo "  SSM status: $STATUS (attempt $i/30)..."
    sleep 10
done

# 4. Poll for userdata completion via SSM
echo "Waiting for installation to complete..."
for i in $(seq 1 30); do
    CMD_ID=$(aws ssm send-command \
        --instance-ids $INSTANCE_ID \
        --document-name "AWS-RunShellScript" \
        --parameters 'commands=["cat /root/userdata_complete 2>/dev/null || echo PENDING"]' \
        --timeout-seconds 30 \
        --query "Command.CommandId" --output text --region $REGION 2>/dev/null || echo "")

    if [ -n "$CMD_ID" ]; then
        sleep 10
        RESULT=$(aws ssm get-command-invocation \
            --command-id $CMD_ID \
            --instance-id $INSTANCE_ID \
            --region $REGION \
            --query "StandardOutputContent" --output text 2>/dev/null || echo "PENDING")

        if echo "$RESULT" | grep -q "DONE"; then
            echo "Installation complete!"
            break
        fi
    fi
    echo "  Still installing (attempt $i/30)..."
    sleep 20
done

# 5. Verify installations
echo "Verifying installations..."
VERIFY_CMD=$(aws ssm send-command \
    --instance-ids $INSTANCE_ID \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=["node -v","npm -v","pm2 -v 2>/dev/null","openclaw --version 2>/dev/null","echo VERIFY_DONE"]' \
    --timeout-seconds 30 \
    --query "Command.CommandId" --output text --region $REGION)
sleep 15
aws ssm get-command-invocation \
    --command-id $VERIFY_CMD \
    --instance-id $INSTANCE_ID \
    --region $REGION \
    --query "StandardOutputContent" --output text 2>/dev/null || echo "Verification skipped"

# 6. Create AMI
echo "Creating AMI: $AMI_NAME..."
NEW_AMI_ID=$(aws ec2 create-image \
    --instance-id $INSTANCE_ID \
    --name "$AMI_NAME" \
    --description "GhostClaw Base Image - AL2023, Node 22, OpenClaw, PM2" \
    --no-reboot \
    --query "ImageId" --output text --region $REGION)

echo "AMI Created: $NEW_AMI_ID"

# 7. Clean Up
echo "Terminating builder instance..."
aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region $REGION > /dev/null

echo ""
echo "========================================="
echo "  Golden AMI: $NEW_AMI_ID"
echo "========================================="
echo ""
echo "Add to webapp/.env.local:"
echo "  AWS_AMI_ID=$NEW_AMI_ID"
echo ""
echo "Wait for AMI to become 'available' before using:"
echo "  aws ec2 wait image-available --image-ids $NEW_AMI_ID --region $REGION"
