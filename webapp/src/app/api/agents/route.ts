import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, Agent } from "@/lib/supabase-admin";
import { launchAgentInstance } from "@/lib/aws-ec2";
import { getProviderForModel, normalizeProvider } from "@/lib/model-catalog";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { BILLING_ENABLED } from "@/lib/open-source-mode";
import crypto from "crypto";
import Stripe from "stripe";

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const authenticatedUserId = authResult.userId;

        const body = await request.json();

        const {
            userId: requestUserId,
            agentName,
            personality,
            traits,
            telegramBotToken,
            telegramUserId,
            plan = "starter",
            llmProvider,
            llmModel,
            llmApiKey,
            useCase,
            skills, // Array of strings
            apiKeys,
            stripeSessionId, // Optional: link agent to Stripe subscription
        } = body;

        if (requestUserId && requestUserId !== authenticatedUserId) {
            return NextResponse.json(
                { error: "userId does not match authenticated user" },
                { status: 403 }
            );
        }
        const userId = authenticatedUserId;
        const sanitizedTelegramBotToken = typeof telegramBotToken === "string" ? telegramBotToken.trim() : "";
        const sanitizedTelegramUserId = typeof telegramUserId === "string" ? telegramUserId.trim() : telegramUserId;
        const sanitizedLlmApiKey = typeof llmApiKey === "string" ? llmApiKey.trim() : "";

        // Validate required fields
        if (!userId || !agentName) {
            return NextResponse.json(
                { error: "Missing required fields: userId, agentName" },
                { status: 400 }
            );
        }

        // Generate a secure gateway token
        const gatewayToken = crypto.randomBytes(32).toString("hex");

        // Prepare DB Record
        const dbTraits = [
            ...(traits || []),
            ...(skills?.map((s: string) => `skill:${s}`) || [])
        ];

        const normalizedProvider =
            normalizeProvider(llmProvider) ||
            getProviderForModel(String(llmModel || "")) ||
            "anthropic";
        const defaultModelByProvider: Record<string, string> = {
            anthropic: "anthropic/claude-sonnet-4-5",
            openai: "openai/gpt-5-mini",
            google: "google/gemini-2.5-flash",
            xai: "xai/grok-4-fast-reasoning",
            openrouter: "openrouter/deepseek/deepseek-chat",
        };
        const normalizedModel = typeof llmModel === "string" && llmModel.includes("/")
            ? llmModel
            : (defaultModelByProvider[normalizedProvider] || "anthropic/claude-sonnet-4-5");
        const anthropicKey = normalizedProvider === "anthropic" && sanitizedLlmApiKey ? sanitizedLlmApiKey : null;
        const openaiKey = normalizedProvider === "openai" && sanitizedLlmApiKey ? sanitizedLlmApiKey : null;
        const openrouterKey = normalizedProvider === "openrouter" && sanitizedLlmApiKey ? sanitizedLlmApiKey : null;
        const geminiKey = normalizedProvider === "google" && sanitizedLlmApiKey ? sanitizedLlmApiKey : null;
        const xaiKey = normalizedProvider === "xai" && sanitizedLlmApiKey ? sanitizedLlmApiKey : null;

        const { data: agent, error: dbError } = await supabaseAdmin
            .from("agents")
            .insert({
                user_id: userId,
                name: agentName,
                personality,
                traits: dbTraits,
                telegram_bot_token: sanitizedTelegramBotToken || null,
                telegram_user_id: sanitizedTelegramUserId || null,
                anthropic_api_key: anthropicKey,
                openai_api_key: openaiKey,
                openrouter_api_key: openrouterKey,
                gemini_api_key: geminiKey,
                xai_api_key: xaiKey,
                gateway_token: gatewayToken,
                plan,
                primary_model: normalizedModel, // Save selected model
                status: "deploying",
            })
            .select()
            .single();

        if (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json(
                { error: "Failed to create agent record" },
                { status: 500 }
            );
        }

        // Launch EC2 instance (async - don't wait for completion)
        try {
            const { instanceId } = await launchAgentInstance({
                agentId: agent.id,
                agentName,
                userId,
                plan,
                gatewayToken,
                telegramBotToken: sanitizedTelegramBotToken,
                telegramUserId: sanitizedTelegramUserId,
                llmProvider: normalizedProvider,
                llmModel: normalizedModel,
                llmApiKey: sanitizedLlmApiKey, // Passed to EC2 UserData
                personality,
                traits,
                useCase,
                skills,
                apiKeys,
            });

            // Update agent with instance ID
            await supabaseAdmin
                .from("agents")
                .update({ instance_id: instanceId })
                .eq("id", agent.id);

            // Start polling (background)
            pollForInstanceIP(agent.id, instanceId!);

        } catch (awsError) {
            console.error("AWS error:", awsError);
            await supabaseAdmin
                .from("agents")
                .update({ status: "error" })
                .eq("id", agent.id);

            return NextResponse.json(
                { error: "Failed to launch EC2 instance", agentId: agent.id },
                { status: 500 }
            );
        }

        // Link agent to Stripe subscription if stripeSessionId provided
        if (BILLING_ENABLED && stripeSessionId && process.env.STRIPE_SECRET_KEY) {
            try {
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
                const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
                if (session.subscription) {
                    await supabaseAdmin
                        .from("subscriptions")
                        .update({ agent_id: agent.id })
                        .eq("stripe_subscription_id", session.subscription as string);
                }
            } catch (stripeErr) {
                console.error("Failed to link subscription to agent:", stripeErr);
                // Non-fatal: agent still created successfully
            }
        }

        return NextResponse.json({
            success: true,
            agentId: agent.id,
            status: "deploying",
            gatewayToken,
            estimatedReadySeconds: 120,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET /api/agents - List all agents for a user
export async function GET(request: NextRequest) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const userId = authResult.userId;

        const { data: agents, error } = await supabaseAdmin
            .from("agents")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: "Failed to fetch agents" },
                { status: 500 }
            );
        }

        // Return sanitized agents
        const sanitizedAgents = agents.map((agent: Agent) => ({
            ...agent,
            gateway_token: agent.gateway_token ? "***" : null,
            telegram_bot_token: agent.telegram_bot_token ? "***configured***" : null,
            anthropic_api_key: agent.anthropic_api_key ? "***configured***" : null,
            openai_api_key: agent.openai_api_key ? "***configured***" : null,
            openrouter_api_key: agent.openrouter_api_key ? "***configured***" : null,
            gemini_api_key: agent.gemini_api_key ? "***configured***" : null,
            xai_api_key: agent.xai_api_key ? "***configured***" : null,
        }));

        return NextResponse.json({ agents: sanitizedAgents });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Background function to poll for instance IP
async function pollForInstanceIP(agentId: string, instanceId: string) {
    const { getInstanceDetails } = await import("@/lib/aws-ec2");
    const supabaseAdmin = getSupabaseAdmin();

    const maxAttempts = 30;
    const intervalMs = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));

        try {
            const details = await getInstanceDetails(instanceId);

            if (details.publicIp && details.state === "running") {
                // Set to "starting" — the actual "online" status comes from
                // the first heartbeat after OpenClaw gateway is responsive
                await supabaseAdmin
                    .from("agents")
                    .update({
                        ip_address: details.publicIp,
                        status: "starting",
                    })
                    .eq("id", agentId);

                console.log(`Agent ${agentId} EC2 running at ${details.publicIp}, waiting for heartbeat...`);
                return;
            }
        } catch (error) {
            console.error(`Poll attempt ${attempt + 1} failed:`, error);
        }
    }

    // If we reach here, instance never became ready
    await supabaseAdmin
        .from("agents")
        .update({ status: "error" })
        .eq("id", agentId);
}
