import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSsmClient } from "@/lib/aws-ec2";
import { SendCommandCommand, GetCommandInvocationCommand } from "@aws-sdk/client-ssm";
import { requireAuthenticatedUser } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

const TERMINAL_FAST_POLL_ATTEMPTS = 10;
const TERMINAL_FAST_POLL_INTERVAL_MS = 500;
const TERMINAL_MAX_COMMAND_LENGTH = 4000;

type InvocationStatus =
  | "Pending"
  | "InProgress"
  | "Delayed"
  | "Cancelling"
  | "Success"
  | "Cancelled"
  | "TimedOut"
  | "Failed"
  | "DeliveryTimedOut"
  | "ExecutionTimedOut"
  | "Undeliverable"
  | "InvalidPlatform"
  | "Terminated"
  | "AccessDenied";

async function getAgentInstanceId(agentId: string, userId: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select("instance_id")
    .eq("id", agentId)
    .eq("user_id", userId)
    .single();

  if (error || !agent?.instance_id) {
    return null;
  }

  return agent.instance_id;
}

function normalizeSsmError(error: unknown): string {
  if (!error || typeof error !== "object") return "Failed to execute command";
  const err = error as { name?: string; message?: string };
  const message = String(err.message || "Failed to execute command");

  if (message.includes("TargetNotConnected")) {
    return "Instance is not connected to SSM yet. Wait 30-60 seconds and retry.";
  }
  if (message.includes("InvalidInstanceId")) {
    return "Instance ID is invalid or instance is terminated.";
  }
  if (message.includes("UnsupportedPlatformType")) {
    return "Instance platform is not supported for SSM shell commands.";
  }

  return message;
}

function isInvocationNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; message?: string };
  if (err.name === "InvocationDoesNotExist") return true;
  const message = String(err.message || "").toLowerCase();
  return message.includes("invocation does not exist") || message.includes("invocationdoesnotexist");
}

function isTerminalStatus(status: InvocationStatus): boolean {
  return (
    status === "Success" ||
    status === "Failed" ||
    status === "Cancelled" ||
    status === "TimedOut" ||
    status === "DeliveryTimedOut" ||
    status === "ExecutionTimedOut" ||
    status === "Undeliverable" ||
    status === "InvalidPlatform" ||
    status === "Terminated" ||
    status === "AccessDenied"
  );
}

async function getInvocationResult(instanceId: string, commandId: string) {
  const ssm = getSsmClient();

  try {
    const invocation = await ssm.send(
      new GetCommandInvocationCommand({
        CommandId: commandId,
        InstanceId: instanceId,
      })
    );

    const status = (invocation.Status || "Pending") as InvocationStatus;
    return {
      found: true,
      status,
      output: invocation.StandardOutputContent || "",
      error: invocation.StandardErrorContent || "",
      responseCode: invocation.ResponseCode ?? null,
    };
  } catch (error) {
    if (isInvocationNotFoundError(error)) {
      return {
        found: false,
        status: "Pending" as InvocationStatus,
        output: "",
        error: "",
        responseCode: null,
      };
    }
    throw error;
  }
}

// POST /api/agents/[id]/command
// Executes a command and attempts to return immediate output.
// If still running, returns a commandId so the client can poll GET /command.
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const authResult = await requireAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const command = typeof body.command === "string" ? body.command.trim() : "";

    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }

    if (command.length > TERMINAL_MAX_COMMAND_LENGTH) {
      return NextResponse.json(
        { error: `Command too long (max ${TERMINAL_MAX_COMMAND_LENGTH} characters)` },
        { status: 400 }
      );
    }

    const instanceId = await getAgentInstanceId(id, authResult.userId);
    if (!instanceId) {
      return NextResponse.json({ error: "Agent not found or no instance running" }, { status: 404 });
    }

    const ssm = getSsmClient();
    const sendResult = await ssm.send(
      new SendCommandCommand({
        InstanceIds: [instanceId],
        DocumentName: "AWS-RunShellScript",
        Parameters: {
          commands: [command],
          workingDirectory: ["/root"],
          executionTimeout: ["120"],
        },
      })
    );

    const commandId = sendResult.Command?.CommandId;
    if (!commandId) {
      return NextResponse.json({ error: "Failed to send command to instance" }, { status: 500 });
    }

    for (let i = 0; i < TERMINAL_FAST_POLL_ATTEMPTS; i++) {
      await new Promise((resolve) => setTimeout(resolve, TERMINAL_FAST_POLL_INTERVAL_MS));
      const result = await getInvocationResult(instanceId, commandId);
      if (!result.found) continue;

      if (isTerminalStatus(result.status)) {
        return NextResponse.json({
          id: commandId,
          status: result.status,
          output: result.output,
          error: result.error,
          responseCode: result.responseCode,
          done: true,
        });
      }
    }

    return NextResponse.json({
      id: commandId,
      status: "Pending",
      message: "Command is still running.",
      done: false,
    });
  } catch (error) {
    const message = normalizeSsmError(error);
    console.error("Error executing command:", error);
    const status = message.includes("SSM") || message.includes("Instance")
      ? 503
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/agents/[id]/command?commandId=xxxx
// Polls command invocation status/output for a previously submitted command.
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const authResult = await requireAuthenticatedUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const commandId = request.nextUrl.searchParams.get("commandId")?.trim();
    if (!commandId) {
      return NextResponse.json({ error: "commandId is required" }, { status: 400 });
    }

    const instanceId = await getAgentInstanceId(id, authResult.userId);
    if (!instanceId) {
      return NextResponse.json({ error: "Agent not found or no instance running" }, { status: 404 });
    }

    const result = await getInvocationResult(instanceId, commandId);
    if (!result.found) {
      return NextResponse.json({
        id: commandId,
        status: "Pending",
        output: "",
        error: "",
        done: false,
      });
    }

    const done = isTerminalStatus(result.status);

    return NextResponse.json({
      id: commandId,
      status: result.status,
      output: result.output,
      error: result.error,
      responseCode: result.responseCode,
      done,
    });
  } catch (error) {
    const message = normalizeSsmError(error);
    console.error("Error polling command:", error);
    const status = message.includes("SSM") || message.includes("Instance")
      ? 503
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
