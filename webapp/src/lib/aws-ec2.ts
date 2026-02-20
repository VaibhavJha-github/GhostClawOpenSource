import {
  EC2Client,
  RunInstancesCommand,
  TerminateInstancesCommand,
  RebootInstancesCommand,
  DescribeInstancesCommand,
  StopInstancesCommand,
  StartInstancesCommand,
} from "@aws-sdk/client-ec2";
import { SSMClient, SendCommandCommand, GetCommandInvocationCommand } from "@aws-sdk/client-ssm";
import crypto from "crypto";
import path from "path";

// --- Configuration ---
const REGION = process.env.AWS_REGION || "us-east-1";
const AMI_ID = process.env.AWS_AMI_ID || "ami-0abcdef1234567890"; // TODO: User to provide
const KEY_NAME = process.env.AWS_KEY_PAIR_NAME || "ghostclaw-key";
const SECURITY_GROUP_ID = process.env.AWS_SECURITY_GROUP_ID;
const IAM_PROFILE = process.env.AWS_IAM_INSTANCE_PROFILE || "GhostClawInstanceProfile";
const OPENCLAW_ROOT = "/root/.openclaw";
const DEFAULT_AMI_PLACEHOLDER = "ami-0abcdef1234567890";

export interface AgentRuntimeCheck {
  name: string;
  status: "ok" | "warn" | "error" | "info";
  message: string;
  value?: string | number | null;
}

export interface AgentRuntimeLogEntry {
  type: string;
  message: string;
  timestamp?: string;
}

export interface AgentRuntimeSnapshot {
  status: string;
  cpu_usage_percent: number;
  memory_used_mb: number;
  storage_used_bytes: number;
  memory_total_mb?: number;
  storage_total_bytes?: number;
  load_1m?: number;
  system_uptime_seconds?: number;
  heartbeat_version?: number;
  timestamp?: string;
  openclaw?: {
    status?: string;
    pid?: number;
    uptime_seconds?: number;
    transport?: string;
  };
  checks?: AgentRuntimeCheck[];
  logs?: AgentRuntimeLogEntry[];
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNonNegativeInt(value: unknown, fallback = 0): number {
  const parsed = Math.round(toNumber(value, fallback));
  return parsed >= 0 ? parsed : fallback;
}

function toOptionalIsoString(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function normalizeRuntimeSnapshot(raw: unknown): AgentRuntimeSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;

  const checks = Array.isArray(source.checks)
    ? source.checks
      .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object")
      .map((entry) => ({
        name: String(entry.name || "check"),
        status: (["ok", "warn", "error", "info"].includes(String(entry.status)) ? String(entry.status) : "info") as AgentRuntimeCheck["status"],
        message: String(entry.message || ""),
        value: typeof entry.value === "number" || typeof entry.value === "string" ? entry.value : null,
      }))
      .slice(0, 20)
    : [];

  const logs = Array.isArray(source.logs)
    ? source.logs
      .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object")
      .map((entry) => ({
        type: String(entry.type || "info"),
        message: String(entry.message || ""),
        timestamp: toOptionalIsoString(entry.timestamp),
      }))
      .filter((entry) => entry.message.length > 0)
      .slice(0, 20)
    : [];

  const openclawRaw = source.openclaw;
  const openclaw = openclawRaw && typeof openclawRaw === "object"
    ? {
      status: typeof (openclawRaw as Record<string, unknown>).status === "string"
        ? String((openclawRaw as Record<string, unknown>).status)
        : undefined,
      pid: toNonNegativeInt((openclawRaw as Record<string, unknown>).pid, 0),
      uptime_seconds: toNonNegativeInt((openclawRaw as Record<string, unknown>).uptime_seconds, 0),
      transport: typeof (openclawRaw as Record<string, unknown>).transport === "string"
        ? String((openclawRaw as Record<string, unknown>).transport)
        : undefined,
    }
    : undefined;

  return {
    status: typeof source.status === "string" ? source.status : "online",
    cpu_usage_percent: Math.min(100, Math.max(0, toNonNegativeInt(source.cpu_usage_percent, 0))),
    memory_used_mb: toNonNegativeInt(source.memory_used_mb, 0),
    storage_used_bytes: toNonNegativeInt(source.storage_used_bytes, 0),
    memory_total_mb: toNonNegativeInt(source.memory_total_mb, 0),
    storage_total_bytes: toNonNegativeInt(source.storage_total_bytes, 0),
    load_1m: toNumber(source.load_1m, 0),
    system_uptime_seconds: toNonNegativeInt(source.system_uptime_seconds, 0),
    heartbeat_version: toNonNegativeInt(source.heartbeat_version, 1),
    timestamp: toOptionalIsoString(source.timestamp) || new Date().toISOString(),
    openclaw,
    checks,
    logs,
  };
}

function normalizeProvider(provider?: string): string {
  if (!provider) return "";
  return provider === "gemini" ? "google" : provider;
}

function ensureLaunchPrerequisites() {
  if (!AMI_ID || AMI_ID === DEFAULT_AMI_PLACEHOLDER) {
    throw new Error("AWS_AMI_ID is not configured. Set a valid AMI before launching agents.");
  }
}

function resolveOpenClawPath(filePath: string): string {
  const normalized = filePath.startsWith("/")
    ? path.posix.normalize(filePath)
    : path.posix.normalize(path.posix.join(OPENCLAW_ROOT, filePath));

  if (normalized !== OPENCLAW_ROOT && !normalized.startsWith(`${OPENCLAW_ROOT}/`)) {
    throw new Error("Access denied: path must stay within /root/.openclaw/");
  }

  return normalized;
}

// --- Singleton Clients ---
let _ec2Client: EC2Client | null = null;
let _ssmClient: SSMClient | null = null;

export function getEc2Client() {
  if (!_ec2Client) {
    _ec2Client = new EC2Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _ec2Client;
}

export function getSsmClient() {
  if (!_ssmClient) {
    _ssmClient = new SSMClient({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _ssmClient;
}

// --- Constants ---
export const INSTANCE_TYPES = {
  starter: "t3.small",     // 2GB RAM — OpenClaw needs ~500MB minimum
  professional: "t3.medium",
  enterprise: "t3.large",
} as const;

export interface LaunchAgentParams {
  agentId: string;
  agentName: string;
  userId: string;
  plan: "starter" | "professional" | "enterprise";
  gatewayToken: string;
  telegramBotToken?: string;
  telegramUserId?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  personality?: string;
  traits?: string[];
  useCase?: string;
  skills?: string[];
  apiKeys?: Record<string, string>;
  llmProvider?: string;
  llmModel?: string;
  llmApiKey?: string;
}

/**
 * Launch an EC2 instance for an agent (Native Install)
 */
export async function launchAgentInstance(params: LaunchAgentParams) {
  const {
    agentId,
    agentName,
    userId,
    plan,
    gatewayToken,
    telegramBotToken,
    personality,
    skills,
    llmProvider,
    llmModel,
    llmApiKey,
  } = params;

  ensureLaunchPrerequisites();

  const instanceType = INSTANCE_TYPES[plan] || "t2.micro";
  const normalizedProvider =
    normalizeProvider(llmProvider) ||
    normalizeProvider(llmModel?.split("/")[0]) ||
    "anthropic";
  const defaultModelByProvider: Record<string, string> = {
    anthropic: "anthropic/claude-sonnet-4-5",
    openai: "openai/gpt-5-mini",
    google: "google/gemini-2.5-flash",
    xai: "xai/grok-4-fast-reasoning",
    openrouter: "openrouter/deepseek/deepseek-chat",
  };
  const normalizedModel = llmModel || defaultModelByProvider[normalizedProvider] || "anthropic/claude-sonnet-4-5";

  // 1. Prepare User Data Script (Initial Boot)
  // This script runs ONCE when the instance launches as ROOT.
  // Build env lines, filtering out empty provider keys
  const gwToken = gatewayToken || crypto.randomBytes(32).toString("hex");
  const sanitizedTelegramBotToken = (telegramBotToken || "").trim();
  const sanitizedLlmApiKey = (llmApiKey || "").trim();

  const envLines = [
    `TELEGRAM_BOT_TOKEN=${sanitizedTelegramBotToken}`,
    ...(normalizedProvider === "openai" && sanitizedLlmApiKey ? [`OPENAI_API_KEY=${sanitizedLlmApiKey}`] : []),
    ...(normalizedProvider === "anthropic" && sanitizedLlmApiKey ? [`ANTHROPIC_API_KEY=${sanitizedLlmApiKey}`] : []),
    ...(normalizedProvider === "openrouter" && sanitizedLlmApiKey ? [`OPENROUTER_API_KEY=${sanitizedLlmApiKey}`] : []),
    ...(normalizedProvider === "google" && sanitizedLlmApiKey ? [`GEMINI_API_KEY=${sanitizedLlmApiKey}`, `GOOGLE_API_KEY=${sanitizedLlmApiKey}`] : []),
    ...(normalizedProvider === "xai" && sanitizedLlmApiKey ? [`XAI_API_KEY=${sanitizedLlmApiKey}`] : []),
    `LLM_PROVIDER=${normalizedProvider}`,
    `LLM_MODEL=${normalizedModel}`,
    `AGENT_NAME="${agentName}"`,
    `AGENT_PERSONALITY="${personality || "Helpful Assistant"}"`,
    `AGENT_ID="${agentId}"`,
    `USER_ID="${userId}"`,
    `OPENCLAW_GATEWAY_TOKEN=${gwToken}`,
  ].join("\n");

  // Prefer server-only APP_URL for EC2 callbacks to avoid leaking dev localhost NEXT_PUBLIC_APP_URL values.
  const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

  // Skills installed via `clawhub install <slug>` after OpenClaw starts
  const skillSlugs = (skills || [])
    .map((s) => s.replace(/[^a-zA-Z0-9_\-\/]/g, ""))
    .filter(Boolean);

  // OpenClaw crashes with MissingEnvVarError if a referenced env var doesn't exist
  // So we don't put provider keys in the JSON config — OpenClaw auto-detects
  // ANTHROPIC_API_KEY / OPENAI_API_KEY / etc. from the .env file directly.
  // The models.providers section is only needed for custom/non-built-in providers.

  const userDataScript = `#!/bin/bash
# GhostClaw Init Script (AL2023)
set -e
export HOME=/root

mkdir -p /root/.openclaw
mkdir -p /root/.openclaw/workspace

# 0. Install crontab (not included in AL2023 by default)
dnf install -y cronie > /dev/null 2>&1
systemctl enable crond
systemctl start crond

# 0b. Ensure SSM agent is installed/running so dashboard actions work
dnf install -y amazon-ssm-agent > /dev/null 2>&1 || true
systemctl enable amazon-ssm-agent || true
systemctl restart amazon-ssm-agent || systemctl start amazon-ssm-agent || true

# 1a. Install Desktop Environment (XFCE + VNC) - headless
dnf install -y xorg-x11-server-Xorg xorg-x11-xinit xorg-x11-drv-evdev \
    xfce4-panel xfce4-session xfce4-settings xfce4-terminal xfce4-appfinder xfwm4 \
    tigervnc-server firefox git python3-pip

# Configure VNC for root
mkdir -p /root/.vnc
VNC_BOOT_PASSWORD=$(python3 - <<'PY'
import secrets
import string
alphabet = string.ascii_letters + string.digits
print("".join(secrets.choice(alphabet) for _ in range(16)))
PY
)
echo "\${VNC_BOOT_PASSWORD}" | vncpasswd -f > /root/.vnc/passwd
chmod 600 /root/.vnc/passwd

# Start VNC Server on :1
vncserver :1 -geometry 1280x800 -depth 24

# Install noVNC
cd /opt
if [ ! -d "/opt/noVNC" ]; then
  git clone https://github.com/novnc/noVNC.git
  git clone https://github.com/novnc/websockify.git /opt/noVNC/utils/websockify
fi

# Start noVNC Proxy
nohup /opt/noVNC/utils/novnc_proxy --vnc localhost:5901 --listen 6080 > /var/log/novnc.log 2>&1 &

# 1. Environment Variables
cat <<EOF > /root/.openclaw/.env
${envLines}
EOF

  # Sanitize .env file (remove leading/trailing whitespace from values)
  sed -i 's/=[[:space:]]*/=/g' /root/.openclaw/.env
  sed -i 's/[[:space:]]*$//g' /root/.openclaw/.env

# 2. OpenClaw Config
# API keys auto-detected from .env (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
# gateway.mode=local required, plugins.entries.telegram.enabled=true for Telegram
cat <<'OCEOF' > /root/.openclaw/openclaw.json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "\${TELEGRAM_BOT_TOKEN}",
      "dmPolicy": "pairing"
    }
  },
  "agents": {
    "defaults": {
      "workspace": "/root/.openclaw/workspace",
      "model": {
        "primary": "\${LLM_MODEL}"
      }
    }
  },
  "gateway": {
    "mode": "local",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "\${OPENCLAW_GATEWAY_TOKEN}"
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  }
}
OCEOF

# Create required directories (doctor warns about these)
mkdir -p /root/.openclaw/agents/main/sessions
mkdir -p /root/.openclaw/credentials
chmod 700 /root/.openclaw
chmod 600 /root/.openclaw/openclaw.json

# 3. SOUL.md (Personality)
cat <<EOF > /root/.openclaw/workspace/SOUL.md
# Assistant Personality

You are ${agentName}, a helpful AI assistant.

${personality || "You are friendly, professional, and always eager to help."}

## Core Traits
- Be concise but thorough
- Ask clarifying questions when needed
- Proactively suggest improvements
EOF

# 4. IDENTITY.md
cat <<EOF > /root/.openclaw/workspace/IDENTITY.md
name: ${agentName}
creature: AI
emoji: 🤖
EOF

# 5. AGENTS.md
cat <<'AGEOF' > /root/.openclaw/workspace/AGENTS.md
# Operating Instructions

## Memory System
- Use MEMORY.md for long-term facts
- Keep notes concise and structured

## Safety Guidelines
- Never share API keys or secrets
- Ask before taking destructive actions
- Stay within your configured tools and skills
AGEOF

# 6. MEMORY.md
if [ ! -f "/root/.openclaw/workspace/MEMORY.md" ]; then
  echo "# Long-term Memory" > /root/.openclaw/workspace/MEMORY.md
  echo "" >> /root/.openclaw/workspace/MEMORY.md
  echo "_This file stores important information to remember._" >> /root/.openclaw/workspace/MEMORY.md
fi

# 7. VNC Password Rotation Script
cat <<'VNC' > /root/rotate-vnc.sh
#!/bin/bash
NEW_PASS="\$1"
if [ -z "\$NEW_PASS" ]; then
  echo "Usage: \$0 <new_password>"
  exit 1
fi
mkdir -p /root/.vnc
if command -v vncpasswd >/dev/null 2>&1; then
  echo "\$NEW_PASS" | vncpasswd -f > /root/.vnc/passwd
  chmod 600 /root/.vnc/passwd
fi
if [ -d "/home/ubuntu" ]; then
  mkdir -p /home/ubuntu/.vnc
  if command -v vncpasswd >/dev/null 2>&1; then
     echo "\$NEW_PASS" | vncpasswd -f > /home/ubuntu/.vnc/passwd
     chmod 600 /home/ubuntu/.vnc/passwd
     chown -R ubuntu:ubuntu /home/ubuntu/.vnc
  fi
fi
if systemctl list-unit-files | grep -q vncserver; then
  systemctl restart vncserver@1 || true
fi
VNC
chmod +x /root/rotate-vnc.sh

# 8. Start OpenClaw Gateway via PM2
set -a
source /root/.openclaw/.env
set +a

# Run doctor to finalize config (enables telegram, creates missing dirs)
openclaw doctor --fix 2>/dev/null || true

pm2 start "openclaw gateway" --name openclaw --max-restarts 10 --restart-delay 5000
pm2 save

# 9. Wait for OpenClaw gateway to be responsive before signaling ready
echo "Waiting for OpenClaw gateway to be ready..."
READY=false
for i in \$(seq 1 60); do
  if curl -sf http://localhost:18789/ > /dev/null 2>&1; then
    echo "OpenClaw gateway is ready after \${i}x5s!"
    READY=true
    break
  fi
  sleep 5
done

if [ "\$READY" = "false" ]; then
  echo "OpenClaw gateway did not respond in time, continuing anyway..."
fi

# 10. Install Skills via clawhub
export PATH="/root/.nvm/versions/node/$(ls /root/.nvm/versions/node/ 2>/dev/null | head -1)/bin:$PATH"
npm i -g clawhub 2>/dev/null || true
echo "Installing ${skillSlugs.length} skills..."
cd /root/.openclaw
${skillSlugs.map(slug => `clawhub install ${slug} 2>/dev/null || echo "Failed to install skill: ${slug}"`).join("\n")}
${skillSlugs.length > 0 ? `echo "Skills installed, restarting OpenClaw..."\npm2 restart openclaw\nsleep 5` : "echo 'No skills to install'"}

# 11. Signal readiness via heartbeat
curl -s -X POST "${appUrl}/api/agents/${agentId}/heartbeat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${gwToken}" \
  -d '{"status":"online","cpu_usage_percent":0,"memory_used_mb":0,"storage_used_bytes":0}' || true

# 12. Heartbeat & Metrics Service
cat <<'HB' > /root/heartbeat.sh
#!/bin/bash
set -euo pipefail
AGENT_ID="${agentId}"
API_URL="${appUrl}/api/agents/${agentId}/heartbeat"

if [ -f /root/.openclaw/.env ]; then
  set -a
  source /root/.openclaw/.env
  set +a
fi

PAYLOAD=\$(python3 <<'PY'
import json
import os
import re
import subprocess
import time

def run(cmd: str) -> str:
    try:
        return subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL, text=True).strip()
    except Exception:
        return ""

def to_int(value: str, default: int = 0) -> int:
    try:
        return int(float(value))
    except Exception:
        return default

def to_float(value: str, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return default

cpu_usage = 0
cpu_line = run("LC_ALL=C top -bn1 | grep 'Cpu(s)' | head -1")
if cpu_line:
    match = re.search(r"([0-9]+(?:\\.[0-9]+)?)\\s*id", cpu_line)
    if match:
        idle = to_float(match.group(1), 100.0)
        cpu_usage = max(0, min(100, int(round(100 - idle))))

mem_total = to_int(run("free -m | awk '/Mem:/ {print $2}'"))
mem_used = to_int(run("free -m | awk '/Mem:/ {print $3}'"))
disk_total = to_int(run("df -B1 / | awk 'NR==2 {print $2}'"))
disk_used = to_int(run("df -B1 / | awk 'NR==2 {print $3}'"))
load_1m = to_float(run("awk '{print $1}' /proc/loadavg"))
system_uptime_seconds = to_int(run("awk '{print int($1)}' /proc/uptime"))

openclaw_status = "offline"
openclaw_pid = to_int(run("pm2 pid openclaw"))
openclaw_uptime_seconds = 0

pm2_jlist_raw = run("pm2 jlist")
if pm2_jlist_raw:
    try:
        apps = json.loads(pm2_jlist_raw)
        for app in apps:
            if app.get("name") != "openclaw":
                continue
            pm2_env = app.get("pm2_env") or {}
            openclaw_status = str(pm2_env.get("status") or "unknown")
            pm_uptime = pm2_env.get("pm_uptime")
            if isinstance(pm_uptime, (int, float)) and pm_uptime > 0:
                openclaw_uptime_seconds = int(max(0, (time.time() * 1000 - pm_uptime) / 1000))
            pid_value = app.get("pid")
            if isinstance(pid_value, int):
                openclaw_pid = pid_value
            break
    except Exception:
        pass

status = "online" if openclaw_status == "online" else "error"
checks = []
logs = []

checks.append({
    "name": "openclaw_gateway",
    "status": "ok" if openclaw_status == "online" else "error",
    "message": "OpenClaw gateway is running" if openclaw_status == "online" else f"OpenClaw gateway status: {openclaw_status}",
    "value": openclaw_status,
})

if mem_total > 0:
    mem_percent = round((mem_used / mem_total) * 100, 1)
    mem_status = "ok"
    if mem_percent >= 92:
        mem_status = "error"
    elif mem_percent >= 85:
        mem_status = "warn"
    checks.append({
        "name": "memory_usage",
        "status": mem_status,
        "message": f"Memory usage at {mem_percent}%",
        "value": mem_percent,
    })
    if mem_status != "ok":
        logs.append({
            "type": "warning" if mem_status == "warn" else "error",
            "message": f"High memory usage ({mem_percent}%)",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })

if disk_total > 0:
    disk_percent = round((disk_used / disk_total) * 100, 1)
    disk_status = "ok"
    if disk_percent >= 95:
        disk_status = "error"
    elif disk_percent >= 90:
        disk_status = "warn"
    checks.append({
        "name": "disk_usage",
        "status": disk_status,
        "message": f"Disk usage at {disk_percent}%",
        "value": disk_percent,
    })
    if disk_status != "ok":
        logs.append({
            "type": "warning" if disk_status == "warn" else "error",
            "message": f"High disk usage ({disk_percent}%)",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })

payload = {
    "status": status,
    "cpu_usage_percent": cpu_usage,
    "memory_used_mb": mem_used,
    "memory_total_mb": mem_total,
    "storage_used_bytes": disk_used,
    "storage_total_bytes": disk_total,
    "load_1m": load_1m,
    "system_uptime_seconds": system_uptime_seconds,
    "heartbeat_version": 2,
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "openclaw": {
        "status": openclaw_status,
        "pid": openclaw_pid,
        "uptime_seconds": openclaw_uptime_seconds,
        "transport": "pm2",
    },
    "checks": checks,
    "logs": logs[:10],
}

print(json.dumps(payload))
PY
)

# 1. Write to local file for SSM polling (Backup)
echo "\$PAYLOAD" > /root/.openclaw/stats.json
chmod 644 /root/.openclaw/stats.json

# 2. Try to push to API (Primary)
TOKEN_HEADER=""
if [ -n "\${OPENCLAW_GATEWAY_TOKEN:-}" ]; then
  TOKEN_HEADER="Authorization: Bearer \${OPENCLAW_GATEWAY_TOKEN}"
fi

if [ -n "\$TOKEN_HEADER" ]; then
  curl -sS --max-time 8 -X POST "\$API_URL" \
    -H "Content-Type: application/json" \
    -H "\$TOKEN_HEADER" \
    -d "\$PAYLOAD" > /dev/null || true
else
  curl -sS --max-time 8 -X POST "\$API_URL" \
    -H "Content-Type: application/json" \
    -d "\$PAYLOAD" > /dev/null || true
fi
HB

chmod +x /root/heartbeat.sh
(crontab -l 2>/dev/null; echo "* * * * * /root/heartbeat.sh") | crontab -
`;

  const userDataEncoded = Buffer.from(userDataScript).toString("base64");

  const command = new RunInstancesCommand({
    ImageId: AMI_ID,
    InstanceType: instanceType,
    MinCount: 1,
    MaxCount: 1,
    KeyName: KEY_NAME,
    SecurityGroupIds: SECURITY_GROUP_ID ? [SECURITY_GROUP_ID] : undefined,
    IamInstanceProfile: { Name: IAM_PROFILE }, // Crucial for SSM
    UserData: userDataEncoded,
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [
          { Key: "Name", Value: `GhostClaw - ${agentName} ` },
          { Key: "GhostClaw:AgentId", Value: agentId },
          { Key: "GhostClaw:UserId", Value: userId },
        ],
      },
    ],
  });

  const ec2 = getEc2Client();
  const response = await ec2.send(command);

  if (!response.Instances?.[0]?.InstanceId) {
    throw new Error("Failed to launch EC2 instance: No InstanceId returned");
  }

  return {
    instanceId: response.Instances[0].InstanceId,
    privateIp: response.Instances[0].PrivateIpAddress,
    launchTime: response.Instances[0].LaunchTime,
  };
}

/**
 * Terminate an EC2 instance
 */
export async function terminateInstance(instanceId: string) {
  const command = new TerminateInstancesCommand({
    InstanceIds: [instanceId],
  });
  const ec2 = getEc2Client();
  return await ec2.send(command);
}

/**
 * Reboot an EC2 instance
 */
export async function rebootAgentInstance(instanceId: string) {
  const command = new RebootInstancesCommand({
    InstanceIds: [instanceId],
  });
  const ec2 = getEc2Client();
  return await ec2.send(command);
}

/**
 * Stop (Pause) an EC2 instance
 */
export async function stopAgentInstance(instanceId: string) {
  const command = new StopInstancesCommand({
    InstanceIds: [instanceId],
  });
  const ec2 = getEc2Client();
  return await ec2.send(command);
}

/**
 * Start (Resume) an EC2 instance
 */
export async function startAgentInstance(instanceId: string) {
  const command = new StartInstancesCommand({
    InstanceIds: [instanceId],
  });
  const ec2 = getEc2Client();
  return await ec2.send(command);
}

/**
 * Get instance details including public IP and State
 */
export async function getInstanceDetails(instanceId: string) {
  const command = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  });
  const ec2 = getEc2Client();
  const response = await ec2.send(command);
  const instance = response.Reservations?.[0]?.Instances?.[0];

  return {
    instanceId: instance?.InstanceId,
    publicIp: instance?.PublicIpAddress,
    privateIp: instance?.PrivateIpAddress,
    state: instance?.State?.Name, // running, pending, stopped, terminated
    launchTime: instance?.LaunchTime,
  };
}

/**
 * Install a skill via SSM using `clawhub install`
 */
export interface InstallSkillResult {
  commandId: string;
  status: "Success" | "Pending";
  output?: string;
}

export async function installSkill(instanceId: string, skillName: string) {
  const safeName = skillName.replace(/[^a-zA-Z0-9_\-\/]/g, "");
  if (!safeName) {
    throw new Error("Invalid skill reference");
  }
  const command = new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands: [
        `export HOME=/root`,
        `export PATH="/root/.nvm/versions/node/$(ls /root/.nvm/versions/node/ 2>/dev/null | head -1)/bin:$PATH"`,
        `npm i -g clawhub 2>/dev/null || true`,
        `cd /root/.openclaw`,
        `clawhub install ${safeName}`,
        `pm2 restart openclaw`,
      ],
    },
  });
  const ssm = getSsmClient();
  const sendResult = await ssm.send(command);
  const commandId = sendResult.Command?.CommandId;

  if (!commandId) {
    throw new Error("Failed to send skill install command");
  }

  // Try to confirm quickly, but still support long-running installs.
  for (let i = 0; i < 15; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    let invocation: {
      Status?: string;
      StandardOutputContent?: string;
      StandardErrorContent?: string;
    } | null = null;
    try {
      invocation = await ssm.send(new GetCommandInvocationCommand({
        CommandId: commandId,
        InstanceId: instanceId,
      }));
    } catch {
      // Invocation may not be available yet; continue polling.
      continue;
    }

    if (!invocation) {
      continue;
    }

    if (invocation.Status === "Success") {
      return {
        commandId,
        status: "Success",
        output: invocation.StandardOutputContent || "",
      };
    }

    if (invocation.Status === "Failed" || invocation.Status === "Cancelled" || invocation.Status === "TimedOut") {
      throw new Error(invocation.StandardErrorContent || "Skill installation failed");
    }
  }

  return { commandId, status: "Pending" };
}

/**
 * Update Agent Environment Variables via SSM
 */
export async function updateAgentEnv(instanceId: string, envVars: Record<string, string>) {
  const updates = Object.entries(envVars)
    .filter(([key]) => /^[A-Z0-9_]+$/.test(key))
    .map(([key, value]) => ({
      key,
      valueB64: Buffer.from(value || "").toString("base64"),
    }));

  if (updates.length === 0) {
    throw new Error("No valid environment keys to update");
  }

  const envUpdateCommands = updates.map(({ key, valueB64 }) =>
    `update_env "${key}" "$(echo '${valueB64}' | base64 -d)"`
  );

  const command = new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands: [
        `set -e`,
        `mkdir -p /root/.openclaw`,
        `touch /root/.openclaw/.env`,
        `update_env(){ KEY="$1"; VALUE="$2"; TMP_FILE="$(mktemp)"; grep -v "^$KEY=" /root/.openclaw/.env > "$TMP_FILE" || true; printf '%s=%s\\n' "$KEY" "$VALUE" >> "$TMP_FILE"; mv "$TMP_FILE" /root/.openclaw/.env; }`,
        ...envUpdateCommands,
        `pm2 restart openclaw`
      ],
    },
  });
  const ssm = getSsmClient();
  return await ssm.send(command);
}

/**
 * Get Agent Stats via SSM (CPU, Memory, Storage)
 * Reads from /root/.openclaw/stats.json which is updated by cron
 */
export async function getAgentStats(instanceId: string): Promise<AgentRuntimeSnapshot | null> {
  try {
    const ssm = getSsmClient();
    const command = new SendCommandCommand({
      InstanceIds: [instanceId],
      DocumentName: "AWS-RunShellScript",
      Parameters: {
        commands: ["cat /root/.openclaw/stats.json"],
        executionTimeout: ["5"]
      },
    });

    const sendResult = await ssm.send(command);
    const commandId = sendResult.Command?.CommandId;

    if (!commandId) return null;

    // Wait for command to complete (simple polling)
    let tries = 0;
    while (tries < 5) {
      await new Promise(r => setTimeout(r, 1000));
      const result = await ssm.send(new GetCommandInvocationCommand({
        CommandId: commandId,
        InstanceId: instanceId,
      }));

      if (result.Status === "Success") {
        try {
          return normalizeRuntimeSnapshot(JSON.parse(result.StandardOutputContent || "{}"));
        } catch {
          return null;
        }
      } else if (result.Status === "Failed" || result.Status === "Cancelled") {
        return null;
      }
      tries++;
    }
    return null;
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return null;
  }
}

/**
 * Read a file from the agent via SSM
 */
export async function readAgentFile(instanceId: string, filePath: string) {
  const safePath = resolveOpenClawPath(filePath);

  const ssm = getSsmClient();
  const command = new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands: [`cat "${safePath}"`],
    },
  });

  const sendResult = await ssm.send(command);
  const commandId = sendResult.Command?.CommandId;
  if (!commandId) throw new Error("Failed to send SSM command");

  // Poll for result
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    const result = await ssm.send(new GetCommandInvocationCommand({
      CommandId: commandId,
      InstanceId: instanceId,
    }));

    if (result.Status === "Success") {
      return result.StandardOutputContent;
    } else if (result.Status === "Failed") {
      throw new Error(result.StandardErrorContent || "Failed to read file");
    }
  }
  throw new Error("Timeout reading file");
}

/**
 * Write a file to the agent via SSM
 * Uses base64 to avoid shell escaping issues
 */
export async function writeAgentFile(instanceId: string, filePath: string, content: string) {
  const safePath = resolveOpenClawPath(filePath);

  const base64Content = Buffer.from(content).toString("base64");

  const ssm = getSsmClient();
  const command = new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands: [
        `mkdir -p $(dirname "${safePath}")`,
        `echo "${base64Content}" | base64 -d > "${safePath}"`
      ],
    },
  });

  const sendResult = await ssm.send(command);
  const commandId = sendResult.Command?.CommandId;
  if (!commandId) throw new Error("Failed to send SSM command");

  // Poll for completion so callers only get success when write is actually applied
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const result = await ssm.send(new GetCommandInvocationCommand({
      CommandId: commandId,
      InstanceId: instanceId,
    }));

    if (result.Status === "Success") {
      return true;
    }
    if (result.Status === "Failed" || result.Status === "Cancelled" || result.Status === "TimedOut") {
      throw new Error(result.StandardErrorContent || "Failed to write file");
    }
  }

  throw new Error("Timeout writing file");
}
