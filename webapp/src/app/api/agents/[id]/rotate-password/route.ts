import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSsmClient } from "@/lib/aws-ec2";
import { SendCommandCommand } from "@aws-sdk/client-ssm";
import { requireAuthenticatedUser } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        const authResult = await requireAuthenticatedUser(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await request.json();
        const { password } = body;

        if (!password || password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const encodedPassword = Buffer.from(password, "utf8").toString("base64");

        // 2. Get Agent Instance ID
        const supabaseAdmin = getSupabaseAdmin();
        const { data: agent, error } = await supabaseAdmin
            .from("agents")
            .select("instance_id")
            .eq("id", id)
            .eq("user_id", authResult.userId)
            .single();

        if (error || !agent?.instance_id) {
            return NextResponse.json({ error: "Agent not found or no instance running" }, { status: 404 });
        }

        // 3. Execute Rotation Script via SSM
        const ssm = getSsmClient();
        const command = new SendCommandCommand({
            InstanceIds: [agent.instance_id],
            DocumentName: "AWS-RunShellScript",
            Parameters: {
                commands: [
                    `ROTATE_PASS="$(echo '${encodedPassword}' | base64 -d)"`,
                    `/root/rotate-vnc.sh "$ROTATE_PASS"`
                ],
            },
        });

        const result = await ssm.send(command);

        return NextResponse.json({
            success: true,
            commandId: result.Command?.CommandId
        });

    } catch (error: unknown) {
        console.error("Error rotating password:", error);
        const message = error instanceof Error ? error.message : "Failed to rotate password";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
