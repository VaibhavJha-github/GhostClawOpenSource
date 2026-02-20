import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { readAgentFile, writeAgentFile } from "@/lib/aws-ec2";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import path from "path";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Map short filenames to full EC2 paths
const FILE_PATH_MAP: Record<string, string> = {
    "SOUL.md": "/root/.openclaw/workspace/SOUL.md",
    "USER.md": "/root/.openclaw/workspace/USER.md",
    "HEARTBEAT.md": "/root/.openclaw/workspace/HEARTBEAT.md",
    "MEMORY.md": "/root/.openclaw/workspace/MEMORY.md",
    "IDENTITY.md": "/root/.openclaw/workspace/IDENTITY.md",
    "AGENTS.md": "/root/.openclaw/workspace/AGENTS.md",
    "BOOTSTRAP.md": "/root/.openclaw/workspace/BOOTSTRAP.md",
    "openclaw.json": "/root/.openclaw/openclaw.json",
};

const OPENCLAW_ROOT = "/root/.openclaw";

function resolveFilePath(shortName: string): string {
    const mapped = FILE_PATH_MAP[shortName] ?? shortName;
    const normalized = mapped.startsWith("/")
        ? path.posix.normalize(mapped)
        : path.posix.normalize(path.posix.join(OPENCLAW_ROOT, mapped));

    if (normalized !== OPENCLAW_ROOT && !normalized.startsWith(`${OPENCLAW_ROOT}/`)) {
        throw new Error("Invalid file path");
    }

    return normalized;
}

// Helper to get instance ID
async function getInstanceId(agentId: string, userId: string) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("agents")
        .select("instance_id")
        .eq("id", agentId)
        .eq("user_id", userId)
        .single();

    if (error || !data?.instance_id) return null;
    return data.instance_id;
}

// GET /api/agents/[id]/files?path=SOUL.md - Read a file from the agent
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const filePath = request.nextUrl.searchParams.get("path");

        if (!filePath) {
            return NextResponse.json(
                { error: "Missing 'path' parameter" },
                { status: 400 }
            );
        }

        const instanceId = await getInstanceId(id, authResult.userId);
        if (!instanceId) {
            // Fallback to mock/empty if no instance (or return error)
            // For now, let's return a friendly error so dashboard knows it's not connected
            return NextResponse.json(
                { error: "Agent is not connected to an instance" },
                { status: 404 }
            );
        }

        let resolvedPath: string;
        try {
            resolvedPath = resolveFilePath(filePath);
        } catch {
            return NextResponse.json(
                { error: "Invalid file path" },
                { status: 400 }
            );
        }

        try {
            const content = await readAgentFile(instanceId, resolvedPath);
            return NextResponse.json({ content, filename: filePath });
        } catch (error: unknown) {
            console.error("SSM Read Error:", error);
            const message = error instanceof Error ? error.message : "Failed to read file from instance";
            return NextResponse.json(
                { error: message },
                { status: 502 }
            );
        }
    } catch (error) {
        console.error("File read error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/agents/[id]/files?path=SOUL.md - Write a file to the agent
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { id } = await params;
        const filePath = request.nextUrl.searchParams.get("path");
        const body = await request.json();

        if (!filePath) {
            return NextResponse.json(
                { error: "Missing 'path' parameter" },
                { status: 400 }
            );
        }

        if (body.content === undefined) {
            return NextResponse.json(
                { error: "Missing 'content' in body" },
                { status: 400 }
            );
        }

        const instanceId = await getInstanceId(id, authResult.userId);
        if (!instanceId) {
            return NextResponse.json(
                { error: "Agent is not connected to an instance" },
                { status: 404 }
            );
        }

        let resolvedPath: string;
        try {
            resolvedPath = resolveFilePath(filePath);
        } catch {
            return NextResponse.json(
                { error: "Invalid file path" },
                { status: 400 }
            );
        }

        try {
            await writeAgentFile(instanceId, resolvedPath, body.content);
            return NextResponse.json({ success: true, saved: true, restartRequired: filePath === "openclaw.json" });
        } catch (error: unknown) {
            console.error("SSM Write Error:", error);
            const message = error instanceof Error ? error.message : "Failed to write file to instance";
            return NextResponse.json(
                { error: message },
                { status: 502 }
            );
        }

    } catch (error) {
        console.error("File write error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
