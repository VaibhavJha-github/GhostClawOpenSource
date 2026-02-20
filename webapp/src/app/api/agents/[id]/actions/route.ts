import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
    terminateInstance,
    rebootAgentInstance,
    stopAgentInstance,
    startAgentInstance,
    getInstanceDetails,
    installSkill,
    getSsmClient,
} from "@/lib/aws-ec2";
import { SendCommandCommand } from "@aws-sdk/client-ssm";
import crypto from "crypto";
import { getProviderForModel, normalizeProvider } from "@/lib/model-catalog";
import { requireAuthenticatedUser } from "@/lib/api-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/agents/[id]/actions - Perform an action on the agent
export async function POST(request: NextRequest, { params }: RouteParams) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const userId = authResult.userId;

        const { id } = await params;
        const body = await request.json();
        const { action, skillName } = body;

        if (!action) {
            return NextResponse.json(
                { error: "Missing 'action' in body" },
                { status: 400 }
            );
        }

        // Get agent to find instance ID
        const { data: agent, error: fetchError } = await supabaseAdmin
            .from("agents")
            .select("instance_id, status, telegram_bot_token, name, personality, traits, primary_model, anthropic_api_key, openai_api_key, openrouter_api_key, gemini_api_key, xai_api_key, elevenlabs_api_key, gateway_token, user_id")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (fetchError || !agent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        const instanceId = agent.instance_id;

        if (!instanceId) {
            return NextResponse.json(
                { error: "Agent has no EC2 instance" },
                { status: 400 }
            );
        }

        // Perform the action
        switch (action) {
            case "reboot": {
                // Check if instance is actually running first
                const details = await getInstanceDetails(instanceId);
                if (details?.state === "stopped") {
                    // Can't reboot a stopped instance — start it instead
                    await startAgentInstance(instanceId);
                    await supabaseAdmin
                        .from("agents")
                        .update({ status: "deploying" })
                        .eq("id", id)
                        .eq("user_id", userId);
                    return NextResponse.json({ success: true, message: "Instance was stopped — starting it instead" });
                }
                await rebootAgentInstance(instanceId);
                await supabaseAdmin
                    .from("agents")
                    .update({ status: "deploying" })
                    .eq("id", id)
                    .eq("user_id", userId);
                return NextResponse.json({ success: true, message: "Instance rebooting" });
            }

            case "pause":
            case "stop":
                await stopAgentInstance(instanceId);
                await supabaseAdmin
                    .from("agents")
                    .update({ status: "offline" })
                    .eq("id", id)
                    .eq("user_id", userId);
                return NextResponse.json({ success: true, message: "Instance stopping" });

            case "resume":
            case "start":
                await startAgentInstance(instanceId);
                await supabaseAdmin
                    .from("agents")
                    .update({ status: "deploying" })
                    .eq("id", id)
                    .eq("user_id", userId);
                return NextResponse.json({ success: true, message: "Instance starting" });

            case "delete":
            case "terminate":
                await terminateInstance(instanceId);
                // Fully remove the agent record from DB
                await supabaseAdmin
                    .from("agents")
                    .delete()
                    .eq("id", id)
                    .eq("user_id", userId);
                return NextResponse.json({ success: true, message: "Instance terminated and employee deleted" });

            case "restart_openclaw": {
                const ssm = getSsmClient();
                const cmd = new SendCommandCommand({
                    InstanceIds: [instanceId],
                    DocumentName: "AWS-RunShellScript",
                    Parameters: {
                        commands: ["pm2 restart openclaw"],
                        executionTimeout: ["30"]
                    },
                });
                await ssm.send(cmd);
                return NextResponse.json({ success: true, message: "OpenClaw restarting" });
            }

            case "reset": {
                // Reset instance to base config while keeping Telegram token
                const {
                    newModel,
                    newApiKey,
                    newProvider,
                    newName,
                    newPersonality,
                    selectedSkills,
                } = body;

                const agentName = newName || agent.name || "Atlas";
                const personality = newPersonality || agent.personality || "Helpful assistant";
                const model = newModel || agent.primary_model || "anthropic/claude-sonnet-4-5";
                const requestedProvider = normalizeProvider(newProvider) || getProviderForModel(model) || "anthropic";
                const provider = requestedProvider;
                const telegramToken = agent.telegram_bot_token || "";
                const hasGatewayToken = typeof agent.gateway_token === "string" && agent.gateway_token.length > 0;
                const gatewayToken = hasGatewayToken
                    ? agent.gateway_token
                    : crypto.randomBytes(32).toString("hex");
                const skills: string[] = Array.isArray(selectedSkills)
                    ? selectedSkills
                        .map((skill) => String(skill).replace(/[^a-zA-Z0-9_\-\/]/g, ""))
                        .filter(Boolean)
                    : [];

                // Build env vars — keep telegram, update API key if provided
                const envVars: Record<string, string> = {
                    TELEGRAM_BOT_TOKEN: telegramToken,
                    LLM_PROVIDER: provider,
                    LLM_MODEL: model,
                    AGENT_NAME: agentName,
                    AGENT_PERSONALITY: personality,
                    AGENT_ID: id,
                    USER_ID: agent.user_id || "",
                    OPENCLAW_GATEWAY_TOKEN: gatewayToken,
                };

                // Set the right API key env var
                const apiKey = newApiKey || "";
                if (apiKey) {
                    if (provider === "anthropic") envVars.ANTHROPIC_API_KEY = apiKey;
                    else if (provider === "openai") envVars.OPENAI_API_KEY = apiKey;
                    else if (provider === "google") {
                        envVars.GEMINI_API_KEY = apiKey;
                        envVars.GOOGLE_API_KEY = apiKey;
                    }
                    else if (provider === "openrouter") envVars.OPENROUTER_API_KEY = apiKey;
                    else if (provider === "xai") envVars.XAI_API_KEY = apiKey;
                }
                // Also keep existing keys from DB
                if (agent.anthropic_api_key && !envVars.ANTHROPIC_API_KEY) envVars.ANTHROPIC_API_KEY = agent.anthropic_api_key;
                if (agent.openai_api_key && !envVars.OPENAI_API_KEY) envVars.OPENAI_API_KEY = agent.openai_api_key;
                if (agent.openrouter_api_key && !envVars.OPENROUTER_API_KEY) envVars.OPENROUTER_API_KEY = agent.openrouter_api_key;
                if (agent.gemini_api_key && !envVars.GEMINI_API_KEY) {
                    envVars.GEMINI_API_KEY = agent.gemini_api_key;
                    envVars.GOOGLE_API_KEY = agent.gemini_api_key;
                }
                if (agent.xai_api_key && !envVars.XAI_API_KEY) envVars.XAI_API_KEY = agent.xai_api_key;
                if (agent.elevenlabs_api_key) envVars.ELEVENLABS_API_KEY = agent.elevenlabs_api_key;

                // Build .env content
                const envContent = Object.entries(envVars)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}=${v}`)
                    .join("\n");

                // Build openclaw.json
                const openclawConfig = JSON.stringify({
                    channels: {
                        telegram: {
                            enabled: true,
                            botToken: "${TELEGRAM_BOT_TOKEN}",
                            dmPolicy: "pairing"
                        }
                    },
                    agents: {
                        defaults: {
                            workspace: "/root/.openclaw/workspace",
                            model: {
                                primary: "${LLM_MODEL}"
                            }
                        }
                    },
                    gateway: {
                        mode: "local",
                        port: 18789,
                        auth: {
                            mode: "token",
                            token: "${OPENCLAW_GATEWAY_TOKEN}"
                        }
                    },
                    plugins: {
                        entries: {
                            telegram: { enabled: true }
                        }
                    }
                }, null, 2);

                // Build workspace files
                const soulMd = `# Assistant Personality\n\nYou are ${agentName}, a helpful AI assistant.\n\n${personality}\n\n## Core Traits\n- Be concise but thorough\n- Ask clarifying questions when needed\n- Proactively suggest improvements`;
                const identityMd = `name: ${agentName}\ncreature: AI\nemoji: 🤖`;
                const agentsMd = `# Operating Instructions\n\n## Memory System\n- Use MEMORY.md for long-term facts\n- Keep notes concise and structured\n\n## Safety Guidelines\n- Never share API keys or secrets\n- Ask before taking destructive actions\n- Stay within your configured tools and skills`;
                const memoryMd = `# Long-term Memory\n\n_This file stores important information to remember._`;

                // Build skill install commands
                const skillInstallCmds = skills.length > 0
                    ? skills.map(s => `clawhub install ${s} 2>/dev/null || true`).join(" && ")
                    : "true";

                // Encode files as base64 for safe transfer
                const envB64 = Buffer.from(envContent).toString("base64");
                const configB64 = Buffer.from(openclawConfig).toString("base64");
                const soulB64 = Buffer.from(soulMd).toString("base64");
                const identityB64 = Buffer.from(identityMd).toString("base64");
                const agentsB64 = Buffer.from(agentsMd).toString("base64");
                const memoryB64 = Buffer.from(memoryMd).toString("base64");

                const resetScript = [
                    "set -e",
                    "export HOME=/root",
                    `export PATH="/root/.nvm/versions/node/$(ls /root/.nvm/versions/node/ 2>/dev/null | head -1)/bin:$PATH"`,
                    "pm2 stop openclaw 2>/dev/null || true",
                    "rm -rf /root/.openclaw/workspace/*",
                    "rm -rf /root/.openclaw/skills/* 2>/dev/null || true",
                    "mkdir -p /root/.openclaw/workspace",
                    `echo "${envB64}" | base64 -d > /root/.openclaw/.env`,
                    `echo "${configB64}" | base64 -d > /root/.openclaw/openclaw.json`,
                    `echo "${soulB64}" | base64 -d > /root/.openclaw/workspace/SOUL.md`,
                    `echo "${identityB64}" | base64 -d > /root/.openclaw/workspace/IDENTITY.md`,
                    `echo "${agentsB64}" | base64 -d > /root/.openclaw/workspace/AGENTS.md`,
                    `echo "${memoryB64}" | base64 -d > /root/.openclaw/workspace/MEMORY.md`,
                    "cd /root/.openclaw",
                    "openclaw doctor --fix 2>/dev/null || true",
                    skillInstallCmds,
                    "pm2 delete openclaw 2>/dev/null || true",
                    `pm2 start "openclaw gateway" --name openclaw --max-restarts 10 --restart-delay 5000`,
                    "pm2 save",
                ];

                const ssm = getSsmClient();
                const cmd = new SendCommandCommand({
                    InstanceIds: [instanceId],
                    DocumentName: "AWS-RunShellScript",
                    Parameters: {
                        commands: resetScript,
                        executionTimeout: ["300"]
                    },
                });
                await ssm.send(cmd);

                // Update DB with new config
                const dbUpdates: Record<string, unknown> = {
                    name: agentName,
                    personality: personality,
                    primary_model: model,
                    status: "deploying",
                };
                if (!hasGatewayToken) {
                    dbUpdates.gateway_token = gatewayToken;
                }
                if (newApiKey) {
                    if (provider === "anthropic") dbUpdates.anthropic_api_key = newApiKey;
                    else if (provider === "openai") dbUpdates.openai_api_key = newApiKey;
                    else if (provider === "google") dbUpdates.gemini_api_key = newApiKey;
                    else if (provider === "openrouter") dbUpdates.openrouter_api_key = newApiKey;
                    else if (provider === "xai") dbUpdates.xai_api_key = newApiKey;
                }
                // Update skills in traits
                const existingTraits = (agent.traits || []).filter((t: string) => !t.startsWith("skill:"));
                dbUpdates.traits = [...existingTraits, ...skills.map((s: string) => `skill:${s}`)];

                await supabaseAdmin
                    .from("agents")
                    .update(dbUpdates)
                    .eq("id", id)
                    .eq("user_id", userId);

                return NextResponse.json({ success: true, message: "Instance resetting — this may take a few minutes" });
            }

            case "status": {
                const statusDetails = await getInstanceDetails(instanceId);
                return NextResponse.json({ success: true, instance: statusDetails });
            }

            case "install_skill":
                if (!skillName) {
                    return NextResponse.json({ error: "Missing 'skillName'" }, { status: 400 });
                }
                const installResult = await installSkill(instanceId, skillName);
                return NextResponse.json({
                    success: true,
                    commandId: installResult.commandId,
                    status: installResult.status,
                    output: installResult.output || "",
                });

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error: unknown) {
        console.error("Action error:", error);
        const message = error instanceof Error ? error.message : "Failed to perform action";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
