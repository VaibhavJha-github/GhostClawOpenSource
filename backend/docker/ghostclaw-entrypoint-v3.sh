#!/bin/bash
# ghostclaw-entrypoint.sh - Inject config from environment variables and start gateway

set -e

CONFIG_DIR="/home/node/.openclaw"
WORKSPACE_DIR="$CONFIG_DIR/workspace"

echo "=========================================="
echo " GhostClaw Agent Starting..."
echo " Name: ${AGENT_NAME:-Atlas}"
echo " Model: ${PRIMARY_MODEL:-anthropic/claude-sonnet-4-20250514}"
echo "=========================================="

# Ensure directories exist
mkdir -p "$CONFIG_DIR"
mkdir -p "$WORKSPACE_DIR"

# Create openclaw.json from environment variables (JSON format required!)
# We use direct file appending to avoid shell escaping hell
cat > "$CONFIG_DIR/openclaw.json" <<EOF
{
  "agents": {
    "defaults": {
      "workspace": "$WORKSPACE_DIR",
      "model": {
        "primary": "${PRIMARY_MODEL:-anthropic/claude-sonnet-4-20250514}",
        "fallbacks": [
          "openai/gpt-5.2",
          "deepseek/deepseek-reasoner",
          "google/gemini-3-flash"
        ]
      },
      "models": {
        "anthropic/claude-opus-4-5": { "alias": "opus" },
        "anthropic/claude-sonnet-4-5": { "alias": "sonnet" },
        "anthropic/claude-sonnet-4-20250514": { "alias": "sonnet-old" },
        "google/gemini-3-flash": { "alias": "flash" },
        "deepseek/deepseek-chat": { "alias": "ds" }
      },
      "heartbeat": {
        "every": "30m",
        "model": "google/gemini-2.5-flash-lite",
        "target": "last"
      },
      "subagents": {
        "model": "deepseek/deepseek-reasoner",
        "maxConcurrent": 1,
        "archiveAfterMinutes": 60
      },
      "imageModel": {
        "primary": "google/gemini-3-flash",
        "fallbacks": ["openai/gpt-5.2"]
      },
      "contextTokens": 200000,
      "humanDelay": {
        "mode": "natural",
        "minMs": 800,
        "maxMs": 2500
      }
    }
  },
  "gateway": {
    "mode": "local",
    "port": 18789,
    "bind": "lan",
    "auth": {
      "mode": "token",
      "token": "${GATEWAY_TOKEN}"
    }
  },
  "channels": {
EOF

if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  cat >> "$CONFIG_DIR/openclaw.json" <<EOF
    "telegram": {
      "botToken": "$TELEGRAM_BOT_TOKEN",
      "dmPolicy": "pairing",
      "allowFrom": ["*"]
    }
EOF
  echo " Telegram: Configured"
fi

CONFIG_JSON_PART2=$(cat <<EOF
  },
  "ui": {
    "seamColor": "#D2A679",
    "assistant": {
      "name": "${AGENT_NAME:-Atlas}"
    }
  },
  "tools": {
    "profile": "full",
    "exec": {
      "host": "node",
      "security": "full"
    },
    "web": {
      "search": {
        "enabled": true,
        "provider": "brave"
      },
      "fetch": {
        "enabled": true,
        "maxChars": 50000
      }
    }
  },
  "skills": {
    "install": {
      "nodeManager": "npm"
    },
    "entries": {
      "model-usage": {
        "enabled": true
      }
    }
  }
}
EOF
)

echo "$CONFIG_JSON_PART2" >> "$CONFIG_DIR/openclaw.json"

# Create SOUL.md (personality)
if [ -n "$SOUL_CONTENT" ]; then
  echo "$SOUL_CONTENT" > "$WORKSPACE_DIR/SOUL.md"
else
  cat > "$WORKSPACE_DIR/SOUL.md" <<EOF
# ${AGENT_NAME:-Atlas}

You are ${AGENT_NAME:-Atlas}, a helpful AI assistant created by GhostClaw.

## Personality
${PERSONALITY_DESCRIPTION:-You are friendly, professional, and always eager to help. You communicate clearly and concisely.}

## Core Traits
- Be concise but thorough in your responses
- Ask clarifying questions when the request is ambiguous
- Proactively suggest improvements when you see opportunities
- Always be honest about your limitations

## Communication Style
- Use natural, conversational language
- Break down complex topics into digestible pieces
- Provide examples when explaining concepts
- Summarize key points at the end of longer responses
EOF
fi

# Create MEMORY.md if it doesn't exist
if [ ! -f "$WORKSPACE_DIR/MEMORY.md" ]; then
  cat > "$WORKSPACE_DIR/MEMORY.md" <<EOF
# Long-term Memory

_This file stores important information to remember across conversations._

## User Preferences
- (To be filled as I learn about you)

## Important Context
- (Key information gathered over time)

## Project Notes
- (Things to remember about ongoing work)
EOF
fi

# Export API keys
if [ -n "$ANTHROPIC_API_KEY" ]; then
  export ANTHROPIC_API_KEY
  echo " Anthropic API: Configured"
fi
if [ -n "$OPENAI_API_KEY" ]; then
  export OPENAI_API_KEY
  echo " OpenAI API: Configured"
fi

echo "=========================================="
echo " Config written to $CONFIG_DIR/openclaw.json"
echo " Starting gateway on port 18789..."
echo "=========================================="

# Start gateway from the app directory
cd /app
export HOME=/home/node

# Ensure .openclaw is accessible in app directory too (covers "local dir" lookup)
if [ ! -d "/app/.openclaw" ]; then
  ln -s /home/node/.openclaw /app/.openclaw
fi

exec node dist/index.js gateway --bind lan --port 18789
