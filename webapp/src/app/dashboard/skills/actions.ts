"use server";

import { installSkill } from "@/lib/aws-ec2";

export async function installSkillToVM(agentId: string, instanceId: string, skillRef: string) {
    if (!instanceId) {
        return { success: false, error: "No instance ID provided" };
    }

    if (!skillRef) {
        return { success: false, error: "No skill reference provided" };
    }

    try {
        const result = await installSkill(instanceId, skillRef);
        return {
            success: true,
            commandId: result.commandId,
            status: result.status,
            output: result.output || "",
        };
    } catch (err: unknown) {
        console.error("Failed to install skill:", err);
        const message = err instanceof Error ? err.message : "Failed to install skill";
        return {
            success: false,
            error: message,
        };
    }
}
