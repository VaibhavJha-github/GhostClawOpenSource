import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { BILLING_ENABLED } from "@/lib/open-source-mode";

// Lazy initialize Stripe
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export async function POST(request: NextRequest) {
    if (!BILLING_ENABLED) {
        return NextResponse.json(
            { error: "Stripe webhooks are disabled in open-source mode", disabled: true },
            { status: 503 }
        );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const stripe = getStripe();
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Stripe webhook received: ${event.type}`);

    try {
        switch (event.type) {
            // ============================================
            // CHECKOUT COMPLETED - New subscription started
            // ============================================
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const plan = session.metadata?.plan || "starter";
                const agentId = session.metadata?.agentId || null;

                if (!userId) {
                    console.error("No client_reference_id in checkout session");
                    break;
                }

                // Create subscription record (link to specific agent if provided)
                await supabaseAdmin.from("subscriptions").insert({
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    plan,
                    status: "trialing",
                    trial_end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
                    ...(agentId ? { agent_id: agentId } : {}),
                });

                // Mark user's onboarding as complete
                await supabaseAdmin
                    .from("users")
                    .update({ onboarding_completed: true })
                    .eq("id", userId);

                console.log(`New subscription for user ${userId}, plan: ${plan}`);
                break;
            }

            // ============================================
            // SUBSCRIPTION UPDATED - Status change
            // ============================================
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sub = subscription as any;

                await supabaseAdmin
                    .from("subscriptions")
                    .update({
                        status: subscription.status,
                        current_period_start: sub.current_period_start
                            ? new Date(sub.current_period_start * 1000).toISOString()
                            : null,
                        current_period_end: sub.current_period_end
                            ? new Date(sub.current_period_end * 1000).toISOString()
                            : null,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                    })
                    .eq("stripe_subscription_id", subscription.id);

                console.log(`Subscription ${subscription.id} updated: ${subscription.status}`);
                break;
            }

            // ============================================
            // SUBSCRIPTION DELETED - User canceled
            // ============================================
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                // Get the subscription to find the user and linked agent
                const { data: sub } = await supabaseAdmin
                    .from("subscriptions")
                    .select("user_id, agent_id")
                    .eq("stripe_subscription_id", subscription.id)
                    .single();

                if (sub) {
                    // Update subscription status
                    await supabaseAdmin
                        .from("subscriptions")
                        .update({ status: "canceled" })
                        .eq("stripe_subscription_id", subscription.id);

                    const { terminateInstance } = await import("@/lib/aws-ec2");

                    if (sub.agent_id) {
                        // Per-agent subscription: terminate only the linked agent
                        const { data: agent } = await supabaseAdmin
                            .from("agents")
                            .select("id, instance_id")
                            .eq("id", sub.agent_id)
                            .neq("status", "terminated")
                            .single();

                        if (agent) {
                            if (agent.instance_id) {
                                try {
                                    await terminateInstance(agent.instance_id);
                                } catch (e) {
                                    console.error(`Failed to terminate instance ${agent.instance_id}:`, e);
                                }
                            }
                            await supabaseAdmin
                                .from("agents")
                                .update({ status: "terminated" })
                                .eq("id", agent.id);
                        }

                        console.log(`Subscription canceled for agent ${sub.agent_id}, agent terminated`);
                    } else {
                        // Legacy subscription (no agent_id): terminate all user's agents
                        const { data: agents } = await supabaseAdmin
                            .from("agents")
                            .select("id, instance_id")
                            .eq("user_id", sub.user_id)
                            .neq("status", "terminated");

                        if (agents && agents.length > 0) {
                            for (const agent of agents) {
                                if (agent.instance_id) {
                                    try {
                                        await terminateInstance(agent.instance_id);
                                    } catch (e) {
                                        console.error(`Failed to terminate instance ${agent.instance_id}:`, e);
                                    }
                                }

                                await supabaseAdmin
                                    .from("agents")
                                    .update({ status: "terminated" })
                                    .eq("id", agent.id);
                            }
                        }

                        console.log(`Legacy subscription canceled for user ${sub.user_id}, all agents terminated`);
                    }
                }
                break;
            }

            // ============================================
            // INVOICE PAYMENT FAILED
            // ============================================
            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const inv = invoice as any;

                await supabaseAdmin
                    .from("subscriptions")
                    .update({ status: "past_due" })
                    .eq("stripe_subscription_id", inv.subscription);

                console.log(`Payment failed for subscription ${inv.subscription}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error(`Error processing ${event.type}:`, error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
