#!/bin/bash
set -e
export AWS_PAGER=""

# GhostClaw IAM Setup Script
# Creates the necessary IAM Role and Instance Profile for SSM access.

ROLE_NAME="GhostClawSSMRole"
PROFILE_NAME="GhostClawInstanceProfile"

echo "🛡️ Setting up IAM Role: $ROLE_NAME..."

# 1. Create Trust Policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Check if role exists, else create
if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "✅ Role $ROLE_NAME already exists."
else
    echo "Creating role..."
    aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json
    echo "✅ Role created."
fi

# 3. Attach SSM Policy
echo "Attaching AmazonSSMManagedInstanceCore policy..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# 4. Create Instance Profile
if aws iam get-instance-profile --instance-profile-name $PROFILE_NAME 2>/dev/null; then
    echo "✅ Instance Profile $PROFILE_NAME already exists."
else
    echo "Creating instance profile..."
    aws iam create-instance-profile --instance-profile-name $PROFILE_NAME
    echo "✅ Instance Profile created."
fi

# 5. Add Role to Instance Profile
if aws iam get-instance-profile --instance-profile-name $PROFILE_NAME | grep -q "$ROLE_NAME"; then
    echo "✅ Role already in Instance Profile."
else
    echo "Adding role to instance profile..."
    aws iam add-role-to-instance-profile --instance-profile-name $PROFILE_NAME --role-name $ROLE_NAME
fi

# Cleanup
rm trust-policy.json

echo "🎉 IAM Setup Complete! Use '$PROFILE_NAME' when launching instances."
