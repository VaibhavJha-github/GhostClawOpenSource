"use client";

import { motion } from "framer-motion";
import { Check, X, Clock } from "lucide-react";

export default function Comparison() {
    return (
        <section className="relative py-24 px-4 overflow-hidden bg-black">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

            <div className="relative max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-red-500/80 text-sm font-mono tracking-widest uppercase mb-2 block">Comparison</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Traditional Method vs <span className="text-[var(--text-muted)]">GhostClaw</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 md:gap-24 relative">
                    {/* Vertical Divider */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--border-medium)] to-transparent" />

                    {/* Left: Traditional */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-xl font-mono text-[var(--text-muted)] italic mb-8">Traditional</h3>

                        <div className="space-y-6 font-mono text-sm">
                            <Step name="Purchasing local virtual machine" time="15 min" />
                            <Step name="Creating SSH keys and storing securely" time="10 min" />
                            <Step name="Connecting to the server via SSH" time="5 min" />
                            <Step name="Installing Node.js and NPM" time="5 min" />
                            <Step name="Installing GhostClaw" time="7 min" />
                            <Step name="Setting up GhostClaw" time="10 min" />
                            <Step name="Connecting to AI provider" time="4 min" />
                            <Step name="Pairing with Telegram" time="4 min" />

                            <div className="h-px bg-[var(--border-strong)] my-6" />

                            <div className="flex justify-between items-center text-lg font-bold">
                                <span className="text-white">Total</span>
                                <span className="text-white">60 min</span>
                            </div>

                            <p className="text-xs text-[var(--text-dim)] mt-6 leading-relaxed">
                                If you're <span className="text-red-500 font-bold">non-technical</span>, multiply these <span className="text-red-500 font-bold">times by 10</span> — you have to learn each step before doing.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: GhostClaw */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col justify-center"
                    >
                        <h3 className="text-xl font-mono text-[var(--text-muted)] italic mb-8 md:hidden">GhostClaw</h3>

                        <div className="relative">
                            <h3 className="text-xl font-mono text-[var(--text-muted)] italic mb-8 hidden md:block">GhostClaw</h3>

                            <div className="text-5xl md:text-6xl font-bold text-white mb-6">
                                &lt;1 min
                            </div>

                            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                                Pick a model, connect Telegram, deploy — done under 1 minute.
                            </p>

                            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                                Servers, SSH and GhostClaw Environment are already set up, waiting to get assigned. Simple, secure and fast connection to your bot.
                            </p>

                            {/* Glowing accent */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-600/10 blur-[80px] rounded-full -z-10" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function Step({ name, time }: { name: string; time: string }) {
    return (
        <div className="flex justify-between items-center group">
            <span className="text-[var(--text-secondary)] group-hover:text-white transition-colors">{name}</span>
            <span className="text-[var(--text-dim)]">{time}</span>
        </div>
    );
}
