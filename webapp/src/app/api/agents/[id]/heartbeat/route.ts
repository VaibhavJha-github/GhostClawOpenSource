import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

type HeartbeatStatus = "deploying" | "online" | "offline" | "error" | "terminated" | "running" | "stopped" | "pending" | "stopping" | "starting";
type CheckStatus = "ok" | "warn" | "error" | "info";

interface HeartbeatCheck {
  name: string;
  status: CheckStatus;
  message: string;
  value?: string | number | null;
}

interface HeartbeatLog {
  type: string;
  message: string;
  timestamp?: string;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNonNegativeInt(value: unknown, fallback = 0): number {
  const parsed = Math.round(toNumber(value, fallback));
  return parsed >= 0 ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toIsoTimestamp(value: unknown, fallbackIso: string): string {
  if (typeof value !== "string" || value.trim() === "") return fallbackIso;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallbackIso;
  return parsed.toISOString();
}

function toHeartbeatStatus(raw: unknown): HeartbeatStatus {
  const value = String(raw || "").toLowerCase();
  if (value === "online" || value === "running") return "online";
  if (value === "offline" || value === "stopped") return "offline";
  if (value === "terminated") return "terminated";
  if (value === "error" || value === "degraded") return "error";
  if (value === "pending" || value === "starting" || value === "deploying" || value === "stopping") {
    return value as HeartbeatStatus;
  }
  return "online";
}

function toCheckStatus(raw: unknown): CheckStatus {
  const value = String(raw || "").toLowerCase();
  if (value === "ok" || value === "warn" || value === "error" || value === "info") return value;
  return "info";
}

function sanitizeChecks(raw: unknown): HeartbeatCheck[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object")
    .map((entry) => ({
      name: String(entry.name || "check"),
      status: toCheckStatus(entry.status),
      message: String(entry.message || ""),
      value: typeof entry.value === "number" || typeof entry.value === "string" ? entry.value : null,
    }))
    .filter((entry) => entry.message.length > 0)
    .slice(0, 20);
}

function sanitizeLogs(raw: unknown, fallbackIso: string): HeartbeatLog[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object")
    .map((entry) => ({
      type: String(entry.type || "info"),
      message: String(entry.message || ""),
      timestamp: toIsoTimestamp(entry.timestamp, fallbackIso),
    }))
    .filter((entry) => entry.message.length > 0)
    .slice(0, 20);
}

function getBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return "";
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token) return "";
  if (scheme.toLowerCase() !== "bearer") return "";
  return token.trim();
}

function normalizeIp(ip: string): string {
  return ip.replace(/^::ffff:/, "").trim();
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { id } = await params;
    const body = await request.json();

    const nowIso = new Date().toISOString();
    const status = toHeartbeatStatus(body.status);
    const cpuUsage = clamp(toNonNegativeInt(body.cpu_usage_percent, 0), 0, 100);
    const memoryUsed = toNonNegativeInt(body.memory_used_mb, 0);
    const storageUsed = toNonNegativeInt(body.storage_used_bytes, 0);
    const heartbeatTimestamp = toIsoTimestamp(body.timestamp, nowIso);
    const checks = sanitizeChecks(body.checks);
    const logs = sanitizeLogs(body.logs, heartbeatTimestamp);

    const providedToken = getBearerToken(request);
    const requestIp = normalizeIp((request.headers.get("x-forwarded-for") || "").split(",")[0] || "");
    const { data: agent, error: fetchAgentError } = await supabaseAdmin
      .from("agents")
      .select("gateway_token, status, ip_address")
      .eq("id", id)
      .single();

    if (fetchAgentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const tokenAuth = Boolean(agent.gateway_token) && providedToken === agent.gateway_token;
    const ipAuth = Boolean(agent.ip_address) && normalizeIp(String(agent.ip_address)) === requestIp;
    if (!tokenAuth && !ipAuth) {
      return NextResponse.json({ error: "Unauthorized heartbeat token" }, { status: 401 });
    }

    const updatePayload: Record<string, unknown> = {
      storage_used_bytes: storageUsed,
      memory_used_mb: memoryUsed,
      cpu_usage_percent: cpuUsage,
      status,
      last_heartbeat_at: heartbeatTimestamp,
    };

    const { error: updateError } = await supabaseAdmin
      .from("agents")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update agent heartbeat:", updateError);
      return NextResponse.json({ error: "Failed to update heartbeat" }, { status: 500 });
    }

    const activities: Array<Record<string, unknown>> = [];

    if (agent.status && agent.status !== status) {
      activities.push({
        agent_id: id,
        type: "system",
        content: `Agent state changed from ${agent.status} to ${status}`,
        metadata: {
          source: "heartbeat",
          previous_status: agent.status,
          new_status: status,
        },
        created_at: heartbeatTimestamp,
      });
    }

    checks
      .filter((check) => check.status === "warn" || check.status === "error")
      .forEach((check) => {
        activities.push({
          agent_id: id,
          type: check.status === "error" ? "error" : "warning",
          content: `[${check.name}] ${check.message}`,
          metadata: {
            source: "heartbeat_check",
            check_name: check.name,
            check_status: check.status,
            value: check.value ?? null,
          },
          created_at: heartbeatTimestamp,
        });
      });

    logs.forEach((log) => {
      activities.push({
        agent_id: id,
        type: log.type || "info",
        content: log.message,
        metadata: {
          source: "heartbeat_log",
        },
        created_at: log.timestamp || heartbeatTimestamp,
      });
    });

    if (activities.length > 0) {
      const { error: logsError } = await supabaseAdmin
        .from("agent_activities")
        .insert(activities.slice(0, 30));

      if (logsError) {
        console.error("Failed to insert heartbeat activities:", logsError);
      }
    }

    return NextResponse.json({
      success: true,
      status,
      receivedAt: heartbeatTimestamp,
      checks: checks.length,
      logs: logs.length,
    });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
