import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Service role client singleton (lazy initialized)
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
            process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );
    }
    return _supabaseAdmin;
}

// Types for our database
export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    referral_code: string;
    referred_by: string | null;
    onboarding_completed: boolean;
    selected_model: string;
    selected_channel: string;
    created_at: string;
    updated_at: string;
}

export interface Agent {
    id: string;
    user_id: string;
    name: string;
    personality: string | null;
    traits: string[] | null;
    primary_model: string;
    fallback_models: string[];
    instance_id: string | null;
    ip_address: string | null;
    gateway_token: string | null;
    gateway_port: number;
    status: "deploying" | "online" | "offline" | "error" | "terminated";
    plan: "starter" | "professional" | "enterprise";
    telegram_bot_token: string | null;
    telegram_user_id: string | null;
    discord_token: string | null;
    anthropic_api_key: string | null;
    openai_api_key: string | null;
    openrouter_api_key: string | null;
    gemini_api_key: string | null;
    xai_api_key: string | null;
    elevenlabs_api_key: string | null;

    // Stats
    messages_count: number;
    tasks_completed: number;
    api_cost_usd: number;

    // Real-time Metrics
    storage_used_bytes: number;
    memory_used_mb: number;
    cpu_usage_percent: number;
    last_heartbeat_at: string | null;

    created_at: string;
    updated_at: string;
    last_active_at: string | null;
    ready_at: string | null;
}

export interface Subscription {
    id: string;
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string | null;
    stripe_price_id: string | null;
    plan: "starter" | "professional" | "enterprise";
    status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete";
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    trial_end: string | null;
    created_at: string;
    updated_at: string;
}

export interface Credit {
    id: string;
    user_id: string;
    amount: number;
    balance_after: number;
    source: "signup_bonus" | "monthly_refill" | "referral_bonus" | "purchase" | "usage";
    description: string | null;
    created_at: string;
}

export interface ActivityLog {
    id: string;
    agent_id: string;
    type: "message" | "task" | "skill" | "error" | "system";
    content: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
}
