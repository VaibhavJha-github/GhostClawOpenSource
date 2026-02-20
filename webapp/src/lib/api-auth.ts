import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function extractBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return "";
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return "";
  return token.trim();
}

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId };
}

export async function assertAgentOwnership(
  userId: string,
  agentId: string,
  selectColumns = "id",
) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select(selectColumns)
    .eq("id", agentId)
    .eq("user_id", userId)
    .single();

  if (error || !agent) {
    return { agent: null, response: NextResponse.json({ error: "Agent not found" }, { status: 404 }) };
  }

  return { agent, response: null };
}
