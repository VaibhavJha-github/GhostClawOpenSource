"use client";

import { motion } from "framer-motion";
import { Activity, Shield, Cpu, MessageSquare, Check, Terminal } from "lucide-react";

export default function AutonomyGrid() {
    return (
        <section className="py-24 px-4 bg-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(120,60,255,0.05),transparent_50%)]" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <p className="text-xs font-mono text-[var(--text-dim)] tracking-widest uppercase mb-4">Capability Matrix</p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Built for <span className="text-gradient-copper">autonomy</span>
                    </h2>
                    <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
                        Your personal AI workforce, distilled into a single deployment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Autonomous Heartbeat */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 min-h-[320px] relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-green-400" />
                            <span className="text-xs font-mono text-green-400 uppercase tracking-wider">Always Alive</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Autonomous Heartbeat</h3>
                        <p className="text-[var(--text-muted)] text-sm mb-8 max-w-sm">
                            Your agent runs 24/7 with built-in health monitoring. Auto-restart on failure. Zero human intervention.
                        </p>

                        {/* Pulse Animation */}
                        <div className="absolute bottom-6 left-6 right-6 h-32 flex items-center overflow-hidden">
                            {/* Grid Background (Optional Tech Feel) */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_top,black,transparent)]" />

                            <div className="relative w-full h-24 flex items-center">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                                    {/* Background static line (dim) */}
                                    <path
                                        d="M0,50 L30,50 L40,50 L45,20 L50,80 L55,50 L65,50 L300,50"
                                        fill="none"
                                        stroke="rgba(34,197,94,0.2)"
                                        strokeWidth="2"
                                        vectorEffect="non-scaling-stroke"
                                    />

                                    {/* Animated Pulse (Bright + Glow) */}
                                    <motion.path
                                        d="M0,50 L30,50 L40,50 L45,20 L50,80 L55,50 L65,50 L300,50"
                                        fill="none"
                                        stroke="#4ade80"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                        filter="url(#glow)"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{
                                            pathLength: [0, 0.4, 0], // Draw segment and undraw
                                            pathOffset: [0, 0, 1],   // Move segment across
                                            opacity: [0, 1, 0]       // Fade in/out at ends
                                        }}
                                        transition={{
                                            duration: 2,
                                            ease: "linear",
                                            repeat: Infinity,
                                            repeatDelay: 1 // 3 seconds total cycle approx (2s anim + 1s delay)
                                        }}
                                    />
                                    <defs>
                                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                </svg>
                            </div>

                            <div className="absolute top-2 right-0 text-right z-10">
                                <div className="flex items-center justify-end gap-2">
                                    <div className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </div>
                                    <div className="text-green-400 font-mono text-xs font-bold">ONLINE</div>
                                </div>
                                <div className="text-[var(--text-dim)] font-mono text-[10px] mt-0.5">uptime: 99.9%</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Multi-Channel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 min-h-[320px] relative overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-[var(--text-muted)]" />
                            <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">Channels</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Multi-Channel Ready</h3>
                        <p className="text-[var(--text-muted)] text-sm mb-8 max-w-sm">
                            Telegram, Discord, Slack, WhatsApp — deploy to any platform.
                        </p>

                        <div className="flex flex-col gap-3">
                            <div className="bg-[var(--bg-subtle)] p-3 rounded-lg rounded-tl-none self-start max-w-[80%] border border-[var(--border-light)]">
                                <p className="text-xs text-[var(--text-muted)]">Summarize my emails</p>
                            </div>
                            <div className="bg-primary-600/10 p-3 rounded-lg rounded-tr-none self-end max-w-[80%] border border-primary-600/20">
                                <p className="text-xs text-primary-400">Found 3 priority items...</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Security */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 min-h-[280px] relative overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-[var(--text-muted)]" />
                            <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">Security</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Secure Sandbox</h3>
                        <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm">
                            Isolated container per instance. Your data never leaves the boundary.
                        </p>
                        <div className="flex items-center gap-4 text-xs font-mono text-green-400">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> TLS 1.3</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> E2E Encrypted</span>
                        </div>
                    </motion.div>

                    {/* Card 4: Model Agnostic */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 min-h-[280px] relative overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Cpu className="w-5 h-5 text-[var(--text-muted)]" />
                            <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">Models</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Model Agnostic</h3>
                        <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm">
                            Switch between Claude, GPT, and Gemini in one click. No re-deployment needed.
                        </p>

                        <div className="flex gap-2">
                            <div className="px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-400 text-xs font-mono bg-orange-500/5">Claude Opus</div>
                            <div className="px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 text-xs font-mono bg-blue-500/5">GPT-5.2</div>
                            <div className="px-3 py-1.5 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-mono bg-purple-500/5">Gemini 3 Flash</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
