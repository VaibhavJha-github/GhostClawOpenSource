import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSsmClient } from "@/lib/aws-ec2";
import { SendCommandCommand, GetCommandInvocationCommand } from "@aws-sdk/client-ssm";
import { requireAuthenticatedUser } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

async function getInstanceId(agentId: string, userId: string): Promise<string | null> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: agent, error } = await supabaseAdmin
        .from("agents")
        .select("instance_id")
        .eq("id", agentId)
        .eq("user_id", userId)
        .single();
    if (error || !agent?.instance_id) return null;
    return agent.instance_id;
}

async function runSsmCommand(instanceId: string, command: string): Promise<{ output: string; error: string; status: string }> {
    const ssm = getSsmClient();
    const sendCmd = new SendCommandCommand({
        InstanceIds: [instanceId],
        DocumentName: "AWS-RunShellScript",
        Parameters: {
            commands: [command],
            workingDirectory: ["/root"],
            executionTimeout: ["30"],
        },
    });

    const sendResult = await ssm.send(sendCmd);
    const commandId = sendResult.Command?.CommandId;
    if (!commandId) throw new Error("Failed to send command to instance");

    let attempts = 0;
    while (attempts < 10) {
        await new Promise(r => setTimeout(r, 500));
        try {
            const invResult = await ssm.send(
                new GetCommandInvocationCommand({ CommandId: commandId, InstanceId: instanceId })
            );
            if (invResult.Status === "Success" || invResult.Status === "Failed") {
                return {
                    output: invResult.StandardOutputContent || "",
                    error: invResult.StandardErrorContent || "",
                    status: invResult.Status,
                };
            }
        } catch {
            // Command not ready yet
        }
        attempts++;
    }
    throw new Error("Command timed out");
}

interface ParsedCronJob {
    name: string;
    schedule: string;
    command: string;
    raw: string;
    isSystem: boolean;
}

function parseCrontab(output: string): { jobs: ParsedCronJob[]; systemJobs: ParsedCronJob[] } {
    const lines = output.split("\n").filter(l => l.trim() !== "");
    const jobs: ParsedCronJob[] = [];
    const systemJobs: ParsedCronJob[] = [];

    let pendingName = "";

    for (const line of lines) {
        // Skip pure comment lines that aren't name markers
        if (line.startsWith("#") && !line.startsWith("# name:")) {
            continue;
        }

        // Name comment for the next job
        if (line.startsWith("# name:")) {
            pendingName = line.replace("# name:", "").trim();
            continue;
        }

        // Parse cron line: 5 schedule fields + command
        const match = line.match(/^(\S+\s+\S+\s+\S+\s+\S+\s+\S+)\s+(.+)$/);
        if (!match) continue;

        const [, schedule, command] = match;
        const isSystem = command.includes("heartbeat") || command.includes("/root/heartbeat");

        const job: ParsedCronJob = {
            name: pendingName || (isSystem ? "Heartbeat" : command.substring(0, 40)),
            schedule,
            command,
            raw: line,
            isSystem,
        };

        if (isSystem) {
            systemJobs.push(job);
        } else {
            jobs.push(job);
        }

        pendingName = "";
    }

    return { jobs, systemJobs };
}

function validateCronSchedule(schedule: string): boolean {
    const fields = schedule.trim().split(/\s+/);
    if (fields.length !== 5) return false;
    // Basic validation: each field should match cron patterns
    const cronFieldPattern = /^(\*|(\*\/\d+)|(\d+(-\d+)?(,\d+(-\d+)?)*))$/;
    return fields.every(f => cronFieldPattern.test(f));
}

// GET — List cron jobs
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const instanceId = await getInstanceId(id, authResult.userId);
        if (!instanceId) {
            return NextResponse.json({ error: "Agent not found or no instance running" }, { status: 404 });
        }

        const result = await runSsmCommand(instanceId, 'crontab -l 2>/dev/null || echo ""');
        const { jobs, systemJobs } = parseCrontab(result.output);

        return NextResponse.json({ jobs, systemJobs });
    } catch (error: any) {
        console.error("Error listing cron jobs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — Add a cron job
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body = await request.json();
        const { schedule, command, name } = body;

        if (!schedule || !command) {
            return NextResponse.json({ error: "schedule and command are required" }, { status: 400 });
        }

        if (!validateCronSchedule(schedule)) {
            return NextResponse.json({ error: "Invalid cron schedule format. Must be 5 fields (e.g. '0 9 * * *')" }, { status: 400 });
        }

        const instanceId = await getInstanceId(id, authResult.userId);
        if (!instanceId) {
            return NextResponse.json({ error: "Agent not found or no instance running" }, { status: 404 });
        }

        const safeName = (name || "Unnamed task").replace(/'/g, "");
        const safeCommand = command.replace(/'/g, "'\\''");
        const ssmCommand = `(crontab -l 2>/dev/null; echo '# name: ${safeName}'; echo '${schedule} ${safeCommand}') | crontab -`;

        const result = await runSsmCommand(instanceId, ssmCommand);

        if (result.status === "Failed") {
            return NextResponse.json({ error: result.error || "Failed to add cron job" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error adding cron job:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE — Remove a cron job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }
        const body = await request.json();
        const { raw, name } = body;

        if (!raw) {
            return NextResponse.json({ error: "raw cron line is required" }, { status: 400 });
        }

        const instanceId = await getInstanceId(id, authResult.userId);
        if (!instanceId) {
            return NextResponse.json({ error: "Agent not found or no instance running" }, { status: 404 });
        }

        // Remove the cron line and its name comment
        let ssmCommand = `crontab -l 2>/dev/null | grep -vF '${raw.replace(/'/g, "'\\''")}' | crontab -`;

        // Also remove the name comment if provided
        if (name) {
            const safeName = name.replace(/'/g, "");
            ssmCommand = `crontab -l 2>/dev/null | grep -vF '${raw.replace(/'/g, "'\\''")}' | grep -vF '# name: ${safeName}' | crontab -`;
        }

        const result = await runSsmCommand(instanceId, ssmCommand);

        if (result.status === "Failed") {
            return NextResponse.json({ error: result.error || "Failed to remove cron job" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error removing cron job:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
