import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/agents/[id]/ready - Signal that agent is ready
export async function POST(request: NextRequest, { params }: RouteParams) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const { id } = await params;
        const body = await request.json();

        const authHeader = request.headers.get("authorization") || "";
        const [scheme, token] = authHeader.split(" ");
        const bearerToken = scheme?.toLowerCase() === "bearer" ? (token || "").trim() : "";

        const { data: agent, error: agentError } = await supabaseAdmin
            .from("agents")
            .select("gateway_token")
            .eq("id", id)
            .single();

        if (agentError || !agent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        if (!agent.gateway_token || !bearerToken || bearerToken !== agent.gateway_token) {
            return NextResponse.json(
                { error: "Unauthorized readiness signal" },
                { status: 401 }
            );
        }

        // Verify status is online
        if (body.status !== "online") {
            return NextResponse.json(
                { error: "Invalid status signal" },
                { status: 400 }
            );
        }

        // Update agent status
        const { error } = await supabaseAdmin
            .from("agents")
            .update({
                status: "online",
                ready_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error("Failed to update agent status:", error);
            return NextResponse.json(
                { error: "Database update failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Readiness signal error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
