import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
    ALL_MODELS,
    PROVIDER_CATALOG,
    getProviderForModel,
    getProviderEnvKeys,
} from "@/lib/model-catalog";
import { requireAuthenticatedUser } from "@/lib/api-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/agents/[id]/config - Get agent configuration
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
            .select("name, personality, traits, primary_model, anthropic_api_key, openai_api_key, openrouter_api_key, gemini_api_key, xai_api_key, elevenlabs_api_key")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (error || !agent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        // Return config with masked API keys
        return NextResponse.json({
            agentName: agent.name,
            personality: agent.personality,
            traits: agent.traits,
            primaryModel: agent.primary_model || "anthropic/claude-sonnet-4-5",
            hasAnthropicKey: !!agent.anthropic_api_key,
            hasOpenaiKey: !!agent.openai_api_key,
            hasOpenrouterKey: !!agent.openrouter_api_key,
            hasGeminiKey: !!agent.gemini_api_key,
            hasXaiKey: !!agent.xai_api_key,
            hasElevenLabsKey: !!agent.elevenlabs_api_key,
            availableModels: ALL_MODELS,
            providers: PROVIDER_CATALOG.map(({ id, label, description, envKey }) => ({ id, label, description, envKey })),
        });
    } catch (error) {
        console.error("Config read error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/agents/[id]/config - Update agent configuration
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

        const updates: Record<string, unknown> = {};

        // Map request fields to database columns
        if (body.primaryModel) {
            const provider = getProviderForModel(String(body.primaryModel));
            if (!provider) {
                return NextResponse.json(
                    { error: "Invalid primary model format. Expected provider/model." },
                    { status: 400 }
                );
            }
            updates.primary_model = body.primaryModel;
        }
        if (body.agentName) updates.name = body.agentName;
        if (body.personality !== undefined) updates.personality = body.personality;
        if (body.traits !== undefined) updates.traits = body.traits;

        // Handle API keys (only update if provided)
        if (body.anthropicApiKey) updates.anthropic_api_key = body.anthropicApiKey;
        if (body.openaiApiKey) updates.openai_api_key = body.openaiApiKey;
        if (body.openrouterApiKey) updates.openrouter_api_key = body.openrouterApiKey;
        if (body.geminiApiKey) updates.gemini_api_key = body.geminiApiKey;
        if (body.xaiApiKey) updates.xai_api_key = body.xaiApiKey;
        if (body.elevenLabsApiKey) updates.elevenlabs_api_key = body.elevenLabsApiKey;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 }
            );
        }

        // Update database
        const { data: updatedAgent, error: updateError } = await supabaseAdmin
            .from("agents")
            .update(updates)
            .eq("id", id)
            .eq("user_id", userId)
            .select("instance_id, anthropic_api_key, openai_api_key, openrouter_api_key, gemini_api_key, xai_api_key")
            .single();

        if (updateError) {
            console.error("Database update error:", updateError);
            return NextResponse.json(
                { error: "Failed to update configuration" },
                { status: 500 }
            );
        }

        let ssmSuccess = false;
        // If we have an instance ID and API keys are being updated, push to SSM
        const envUpdates: Record<string, string> = {};
        if (body.anthropicApiKey) envUpdates["ANTHROPIC_API_KEY"] = body.anthropicApiKey;
        if (body.openaiApiKey) envUpdates["OPENAI_API_KEY"] = body.openaiApiKey;
        if (body.openrouterApiKey) envUpdates["OPENROUTER_API_KEY"] = body.openrouterApiKey;
        if (body.geminiApiKey) {
            envUpdates["GEMINI_API_KEY"] = body.geminiApiKey;
            envUpdates["GOOGLE_API_KEY"] = body.geminiApiKey;
        }
        if (body.xaiApiKey) envUpdates["XAI_API_KEY"] = body.xaiApiKey;
        if (body.elevenLabsApiKey) envUpdates["ELEVENLABS_API_KEY"] = body.elevenLabsApiKey;

        if (updatedAgent?.instance_id && Object.keys(envUpdates).length > 0) {
            try {
                // Dynamically import to avoid circular dependencies if any (though aws-ec2.ts should be fine)
                const { updateAgentEnv } = await import("@/lib/aws-ec2");
                await updateAgentEnv(updatedAgent.instance_id, envUpdates);
                ssmSuccess = true;
            } catch (err) {
                console.error("Failed to push config via SSM:", err);
            }
        }

        // If primary model changed, also push provider/model refs to .env
        if (body.primaryModel && updatedAgent?.instance_id) {
            try {
                const { updateAgentEnv } = await import("@/lib/aws-ec2");
                const provider = getProviderForModel(String(body.primaryModel));
                const modelEnv: Record<string, string> = { LLM_MODEL: body.primaryModel };
                if (provider) {
                    modelEnv.LLM_PROVIDER = provider;
                    // Keep provider key aliases in sync when available in DB or this request payload.
                    const providerKeyFromDb =
                        provider === "anthropic"
                            ? updatedAgent?.anthropic_api_key
                            : provider === "openai"
                                ? updatedAgent?.openai_api_key
                                : provider === "openrouter"
                                    ? updatedAgent?.openrouter_api_key
                                    : provider === "google"
                                        ? updatedAgent?.gemini_api_key
                                        : provider === "xai"
                                            ? updatedAgent?.xai_api_key
                                            : null;

                    for (const envKey of getProviderEnvKeys(provider)) {
                        if (envUpdates[envKey]) {
                            modelEnv[envKey] = envUpdates[envKey];
                        } else if (providerKeyFromDb) {
                            modelEnv[envKey] = providerKeyFromDb;
                        }
                    }
                }
                await updateAgentEnv(updatedAgent.instance_id, modelEnv);
                ssmSuccess = true;
            } catch (err) {
                console.error("Failed to push model via SSM:", err);
            }
        }

        return NextResponse.json({
            success: true,
            synced: ssmSuccess,
            message: ssmSuccess
                ? "Configuration saved and synced to agent"
                : "Configuration saved (will apply on next restart)",
        });
    } catch (error) {
        console.error("Config update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
