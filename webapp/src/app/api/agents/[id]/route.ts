import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, Agent } from "@/lib/supabase-admin";
import { terminateInstance, getInstanceDetails, getAgentStats, AgentRuntimeSnapshot } from "@/lib/aws-ec2";
import { requireAuthenticatedUser } from "@/lib/api-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

function normalizeDbStatus(status?: string | null): string {
    const value = String(status || "").toLowerCase();
    if (["deploying", "online", "offline", "error", "terminated", "running", "stopped", "pending", "stopping", "starting"].includes(value)) {
        return value;
    }
    return "online";
}

// GET /api/agents/[id] - Get a single agent
export async function GET(request: NextRequest, { params }: RouteParams) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const userId = authResult.userId;

        const { id } = await params;

        const { data: agent, error } = await supabaseAdmin
            .from("agents")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (error || !agent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        // Get real-time instance status if we have an instance ID
        let instanceStatus = null;
        let runtimeSnapshot: AgentRuntimeSnapshot | null = null;
        if (agent.instance_id) {
            try {
                instanceStatus = await getInstanceDetails(agent.instance_id);

                // Auto-reconcile: sync Supabase status with real EC2 state
                const ec2State = instanceStatus?.state; // running | stopped | terminated | pending | shutting-down
                const dbStatus = agent.status;
                let correctedStatus: string | null = null;

                if (ec2State === "running" && ["deploying", "starting", "pending", "stopping"].includes(dbStatus)) {
                    correctedStatus = "online";
                } else if (ec2State === "stopped" && ["deploying", "starting", "pending", "online", "running", "stopping"].includes(dbStatus)) {
                    correctedStatus = "offline";
                } else if (ec2State === "terminated" && dbStatus !== "terminated") {
                    correctedStatus = "terminated";
                }

                // If running, try to pull latest stats via SSM (bypass localhost heartbeat issue)
                if (ec2State === "running") {
                    const stats = await getAgentStats(agent.instance_id);
                    if (stats) {
                        runtimeSnapshot = stats;
                        const runtimeStatus = typeof stats.status === "string" ? stats.status : "";
                        const statusFromRuntime = runtimeStatus ? normalizeDbStatus(runtimeStatus) : correctedStatus;
                        const heartbeatAt = stats.timestamp || new Date().toISOString();

                        // Update storage/cpu/mem in DB
                        await supabaseAdmin
                            .from("agents")
                            .update({
                                storage_used_bytes: stats.storage_used_bytes || 0,
                                memory_used_mb: stats.memory_used_mb || 0,
                                cpu_usage_percent: stats.cpu_usage_percent || 0,
                                last_heartbeat_at: heartbeatAt,
                                ...(statusFromRuntime ? { status: statusFromRuntime } : {}),
                                ip_address: instanceStatus?.publicIp || agent.ip_address || null,
                            })
                            .eq("id", id)
                            .eq("user_id", userId);

                        // Merge into agent object for immediate response
                        agent.storage_used_bytes = stats.storage_used_bytes;
                        agent.memory_used_mb = stats.memory_used_mb;
                        agent.cpu_usage_percent = stats.cpu_usage_percent;
                        agent.last_heartbeat_at = heartbeatAt;
                        agent.ip_address = instanceStatus?.publicIp || agent.ip_address;
                        if (statusFromRuntime) {
                            agent.status = statusFromRuntime;
                        }

                        // If we updated stats, we don't need to update status separately below unless it changed
                        correctedStatus = null;
                    }
                }

                if (correctedStatus) {
                    await supabaseAdmin
                        .from("agents")
                        .update({ status: correctedStatus, ip_address: instanceStatus?.publicIp || null })
                        .eq("id", id)
                        .eq("user_id", userId);
                    agent.status = correctedStatus;
                    agent.ip_address = instanceStatus?.publicIp || agent.ip_address;
                }
            } catch (e) {
                console.error("Failed to get instance status:", e);
            }
        }

        const heartbeatAgeSeconds = agent.last_heartbeat_at
            ? Math.max(0, Math.floor((Date.now() - new Date(agent.last_heartbeat_at).getTime()) / 1000))
            : null;

        // Sanitize sensitive data
        const sanitizedAgent = {
            ...agent,
            gateway_token: agent.gateway_token ? "***" : null,
            telegram_bot_token: agent.telegram_bot_token ? "***configured***" : null,
            anthropic_api_key: agent.anthropic_api_key ? "***configured***" : null,
            openai_api_key: agent.openai_api_key ? "***configured***" : null,
            openrouter_api_key: agent.openrouter_api_key ? "***configured***" : null,
            gemini_api_key: agent.gemini_api_key ? "***configured***" : null,
            xai_api_key: agent.xai_api_key ? "***configured***" : null,
            instance_status: instanceStatus,
            runtime_snapshot: runtimeSnapshot,
            heartbeat_age_seconds: heartbeatAgeSeconds,
        };

        return NextResponse.json({ agent: sanitizedAgent });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/agents/[id] - Update agent config
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const userId = authResult.userId;

        const { id } = await params;
        const body = await request.json();

        // Fields that can be updated
        const allowedFields = [
            "name",
            "personality",
            "traits",
            "primary_model",
            "anthropic_api_key",
            "openai_api_key",
            "openrouter_api_key",
            "gemini_api_key",
            "xai_api_key",
            "telegram_bot_token",
            "telegram_user_id",
        ];

        // Filter to only allowed fields
        const updates: Partial<Agent> = {};
        for (const field of allowedFields) {
            if (field in body) {
                (updates as Record<string, unknown>)[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        const { data: agent, error } = await supabaseAdmin
            .from("agents")
            .update(updates)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: "Failed to update agent" },
                { status: 500 }
            );
        }

        // TODO: If API keys or config changed, update the running container
        // This would involve SSHing into the EC2 instance and restarting the container

        return NextResponse.json({ success: true, agent });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/agents/[id] - Terminate agent and EC2 instance
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const userId = authResult.userId;

        const { id } = await params;

        // Get agent to find instance ID
        const { data: agent, error: fetchError } = await supabaseAdmin
            .from("agents")
            .select("instance_id, status")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (fetchError || !agent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        // Terminate EC2 instance if it exists
        if (agent.instance_id) {
            try {
                await terminateInstance(agent.instance_id);
            } catch (awsError) {
                console.error("Failed to terminate EC2 instance:", awsError);
                // Continue anyway - we'll mark it as terminated in DB
            }
        }

        // Update agent status to terminated
        const { error: updateError } = await supabaseAdmin
            .from("agents")
            .update({ status: "terminated" })
            .eq("id", id)
            .eq("user_id", userId);

        if (updateError) {
            console.error("Failed to update agent status:", updateError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
