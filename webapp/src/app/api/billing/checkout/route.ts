import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { BILLING_ENABLED } from "@/lib/open-source-mode";

// Lazy initialize Stripe
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Price IDs from your Stripe dashboard
const PRICE_IDS = {
    starter: process.env.STRIPE_PRICE_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
    professional: process.env.STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
};

// POST /api/billing/checkout - Create Stripe Checkout session
export async function POST(request: NextRequest) {
    if (!BILLING_ENABLED) {
        return NextResponse.json(
            { error: "Billing is disabled in open-source mode", disabled: true },
            { status: 503 }
        );
    }

    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        const { userId: requestUserId, plan, successUrl, cancelUrl, agentId } = body;
        const userId = authResult.userId;

        if (!plan) {
            return NextResponse.json(
                { error: "Missing plan" },
                { status: 400 }
            );
        }

        if (requestUserId && requestUserId !== userId) {
            return NextResponse.json(
                { error: "userId does not match authenticated user" },
                { status: 403 }
            );
        }

        if (!(plan in PRICE_IDS)) {
            return NextResponse.json(
                { error: "Invalid plan" },
                { status: 400 }
            );
        }
        const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
        if (!priceId) {
            return NextResponse.json(
                { error: `Missing Stripe price configuration for plan '${plan}'` },
                { status: 500 }
            );
        }

        if (agentId) {
            const { data: ownedAgent } = await supabaseAdmin
                .from("agents")
                .select("id")
                .eq("id", agentId)
                .eq("user_id", userId)
                .single();
            if (!ownedAgent) {
                return NextResponse.json(
                    { error: "Invalid agent for this user" },
                    { status: 404 }
                );
            }
        }

        // Build metadata (include agentId if provided for per-agent subscriptions)
        const metadata: Record<string, string> = { plan, userId };
        if (agentId) metadata.agentId = agentId;

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            client_reference_id: userId,
            metadata,
            subscription_data: {
                trial_period_days: 2, // 48 hour trial
                metadata,
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
