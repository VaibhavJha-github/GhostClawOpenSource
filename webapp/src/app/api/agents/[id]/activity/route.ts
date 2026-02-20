import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAuthenticatedUser } from "@/lib/api-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const supabaseAdmin = getSupabaseAdmin();
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const userId = authResult.userId;

        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "20");

        const { data: ownedAgent } = await supabaseAdmin
            .from("agents")
            .select("id")
            .eq("id", id)
            .eq("user_id", userId)
            .single();
        if (!ownedAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        const { data: logs, error } = await supabaseAdmin
            .from("agent_activities")
            .select("*")
            .eq("agent_id", id)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Failed to fetch activity logs:", error);
            return NextResponse.json({ logs: [] });
        }

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Activity fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
