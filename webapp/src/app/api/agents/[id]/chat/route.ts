import { NextRequest, NextResponse } from "next/server";
import { proxyToAgent } from "@/lib/agent-proxy";
import { requireAuthenticatedUser, assertAgentOwnership } from "@/lib/api-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/agents/[id]/chat - Send message to agent gateway
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const { id } = await params;
        const ownership = await assertAgentOwnership(authResult.userId, id);
        if (ownership.response) {
            return ownership.response;
        }
        const body = await request.json();

        // Forward to OpenClaw Gateway chat API
        // Endpoint: /api/chat (standard for many agent gateways)
        const result = await proxyToAgent(id, "/api/chat", {
            method: "POST",
            body,
            timeout: 30000 // Long timeout for LLM generation
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to communicate with agent" },
                { status: 502 }
            );
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("Chat proxy error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET /api/agents/[id]/chat - Get chat history
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const { id } = await params;
        const ownership = await assertAgentOwnership(authResult.userId, id);
        if (ownership.response) {
            return ownership.response;
        }

        // Forward to OpenClaw Gateway history API
        const result = await proxyToAgent(id, "/api/chat/history");

        if (!result.success) {
            // If history fails, return empty list instead of erroring out
            // to allow the UI to load
            return NextResponse.json({ messages: [] });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        return NextResponse.json({ messages: [] });
    }
}
