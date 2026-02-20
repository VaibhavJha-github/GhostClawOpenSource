/**
 * Agent Proxy Helper
 * Handles communication between the dashboard and the running agent on EC2
 */

import { getSupabaseAdmin } from "./supabase-admin";

// Development mode - when agent isn't available, use mock data
const DEV_MODE = process.env.NODE_ENV === "development" || !process.env.AWS_ACCESS_KEY_ID;

interface AgentConnection {
    ip: string;
    gatewayToken: string;
    gatewayPort: number;
}

/**
 * Get agent connection details from database
 */
export async function getAgentConnection(agentId: string): Promise<AgentConnection | null> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: agent, error } = await supabaseAdmin
        .from("agents")
        .select("ip_address, gateway_token, gateway_port")
        .eq("id", agentId)
        .single();

    if (error || !agent || !agent.ip_address) {
        return null;
    }

    return {
        ip: agent.ip_address,
        gatewayToken: agent.gateway_token || "",
        gatewayPort: agent.gateway_port || 18789,
    };
}

/**
 * Proxy a request to the agent's API
 */
export async function proxyToAgent(
    agentId: string,
    path: string,
    options: {
        method?: string;
        body?: unknown;
        timeout?: number;
    } = {}
): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const conn = await getAgentConnection(agentId);

    if (!conn) {
        // Return mock data in dev mode
        if (DEV_MODE) {
            return getMockResponse(path, options);
        }
        return { success: false, error: "Agent not connected" };
    }

    const url = `http://${conn.ip}:${conn.gatewayPort}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

    try {
        const response = await fetch(url, {
            method: options.method || "GET",
            headers: {
                "Authorization": `Bearer ${conn.gatewayToken}`,
                "Content-Type": "application/json",
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return { success: false, error: `Agent returned ${response.status}` };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Agent proxy error:", error);

        // Fallback to mock in dev
        if (DEV_MODE) {
            return getMockResponse(path, options);
        }

        return { success: false, error: "Failed to connect to agent" };
    }
}

/**
 * Mock responses for development without running agent
 */
function getMockResponse(
    path: string,
    options: { method?: string; body?: unknown }
): { success: boolean; data?: unknown; error?: string } {
    // Mock workspace files
    if (path.startsWith("/api/files/")) {
        const filename = path.replace("/api/files/", "");
        if (options.method === "PUT") {
            return { success: true, data: { saved: true } };
        }
        return {
            success: true,
            data: {
                content: getMockFileContent(filename),
                filename,
            },
        };
    }

    // Mock config
    if (path === "/api/agent/config") {
        if (options.method === "PATCH") {
            return { success: true, data: { updated: true } };
        }
        return {
            success: true,
            data: {
                primaryModel: "anthropic/claude-sonnet-4-20250514",
                agentName: "Atlas",
                personality: "A helpful AI assistant",
            },
        };
    }

    // Mock activity
    if (path === "/api/agent/activity") {
        return {
            success: true,
            data: {
                events: [
                    { type: "system", message: "Agent started", timestamp: new Date().toISOString() },
                    { type: "message", message: "Received message from user", timestamp: new Date().toISOString() },
                ],
            },
        };
    }

    // Mock skills
    if (path === "/api/agent/skills") {
        return {
            success: true,
            data: {
                installed: ["web-browser", "file-manager"],
                available: ["calendar", "email", "twitter"],
            },
        };
    }

    return { success: true, data: {} };
}

function getMockFileContent(filename: string): string {
    const mockFiles: Record<string, string> = {
        "SOUL.md": `# Agent Personality

You are Atlas, a helpful AI assistant created by GhostClaw.

## Core Traits
- Professional and friendly
- Detail-oriented
- Always helpful

## Communication Style
- Clear and concise
- Uses proper grammar
- Explains complex topics simply
`,
        "MEMORY.md": `# Agent Memory

## Important Information
- User prefers concise responses
- Last task: Research on AI agents

## Notes
- Remember to check calendar daily
`,
        "USER.md": `# User Information

## Preferences
- Timezone: UTC+10 (Australia)
- Language: English
- Notification: Telegram

## Contact
- Primary: Telegram
`,
        "HEARTBEAT.md": `# Scheduled Tasks

## Daily
- 09:00: Check emails
- 12:00: Generate daily summary

## Weekly
- Monday 10:00: Weekly planning review
`,
    };

    return mockFiles[filename] || (filename.endsWith(".json") ? "{}" : `# ${filename}\n\nNo content yet.`);
}
