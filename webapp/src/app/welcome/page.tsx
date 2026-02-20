"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Gift, Sparkles, MessageCircle, ArrowRight, Zap, TrendingUp, Clock } from "lucide-react";

export default function WelcomePage() {
    const router = useRouter();
    const [agentName, setAgentName] = useState("Atlas");

    useEffect(() => {
        const config = localStorage.getItem("ghostclaw_agent_config");
        if (config) {
            const parsed = JSON.parse(config);
            if (parsed.agentName) {
                setAgentName(parsed.agentName);
            }
        }
    }, []);

    return (
        <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-green-500/15 via-primary-600/10 to-transparent blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center max-w-2xl w-full"
            >
                {/* Success animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="relative w-24 h-24 mx-auto mb-8"
                >
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/30 to-primary-600/30 blur-xl animate-pulse" />

                    {/* Main checkmark */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 border-4 border-green-400/30 flex items-center justify-center shadow-2xl">
                        <Check className="w-12 h-12 text-white" strokeWidth={3} />
                    </div>

                    {/* Sparkle effects */}
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl font-bold mb-4 font-mono"
                >
                    Your AI Employee is
                    <br />
                    <span className="text-gradient-copper">Ready to Work!</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-[var(--text-secondary)] text-xl mb-8 font-mono"
                >
                    <span className="text-primary-600 font-bold">{agentName}</span> is now active and waiting for your first message
                </motion.p>

                {/* BYO Keys banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-primary-600/20 to-accent-orange/10 border border-primary-600/30 rounded-2xl p-8 mb-8 relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <Gift className="w-6 h-6 text-primary-600" />
                            <span className="text-2xl font-bold text-primary-600 font-mono">48-Hour Free Trial!</span>
                        </div>
                        <p className="text-[var(--text-secondary)] font-mono">
                            Add your own API keys in the <span className="text-white font-bold">Configuration</span> tab to get started
                        </p>
                    </div>
                </motion.div>

                {/* Quick actions grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid md:grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { icon: MessageCircle, title: "Send /start", desc: "Open Telegram", color: "text-[#0088cc]", bg: "bg-[#0088cc]/10" },
                        { icon: Zap, title: "Instant Setup", desc: "Already configured", color: "text-primary-600", bg: "bg-primary-600/10" },
                        { icon: TrendingUp, title: "24/7 Active", desc: "Always online", color: "text-green-500", bg: "bg-green-500/10" },
                    ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={i}
                                className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-6 hover:border-primary-600/30 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-3 mx-auto`}>
                                    <Icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div className="text-sm font-bold text-white mb-1 font-mono">{item.title}</div>
                                <div className="text-xs text-[var(--text-muted)] font-mono">{item.desc}</div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Main CTA */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => router.push("/dashboard")}
                    className="w-full flex items-center justify-center gap-2 py-5 px-8 rounded-xl bg-primary-600 text-white text-lg font-bold hover:bg-primary-700 hover:scale-[1.02] transition-all shadow-2xl font-mono"
                >
                    Go to Dashboard
                    <ArrowRight className="w-6 h-6" />
                </motion.button>

                {/* Secondary instruction */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] font-mono"
                >
                    <Clock className="w-4 h-4" />
                    <span>
                        Message {agentName} on Telegram to get started
                    </span>
                </motion.div>
            </motion.div>
        </main>
    );
}
