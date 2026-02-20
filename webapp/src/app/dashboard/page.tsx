"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [checkingAgents, setCheckingAgents] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        const checkAgents = async () => {
            try {
                const { data: agents, error } = await supabase
                    .from("agents")
                    .select("id")
                    .eq("user_id", user.id)
                    .limit(1);

                if (agents && agents.length > 0) {
                    router.replace(`/dashboard/employees/${agents[0].id}`);
                } else {
                    router.replace("/onboarding");
                }
            } catch (error) {
                console.error("Error checking agents:", error);
                router.replace("/onboarding"); // Fallback
            } finally {
                setCheckingAgents(false);
            }
        };

        checkAgents();
    }, [user, authLoading, router]);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 relative overflow-hidden bg-[var(--bg-base)]">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Custom Loader */}
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin" />
                    <div className="absolute inset-4 border-4 border-orange-500/20 rounded-full" />
                    <div className="absolute inset-4 border-4 border-b-orange-400 rounded-full animate-spin-reverse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                    </div>
                </div>

                <div className="space-y-2 text-center">
                    <h2 className="text-xl font-bold text-white font-mono tracking-tight">ACCESSING NEURAL LINK</h2>
                    <div className="flex items-center gap-2 justify-center text-sm text-[var(--text-muted)] font-mono">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="tracking-widest uppercase">Authenticating User Identity...</span>
                    </div>
                </div>
            </div>

            {/* Scanning line effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-orange-500/5 to-transparent h-[20%] w-full animate-scan" />
        </div>
    );
}
