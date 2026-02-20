"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play, Clock, Check, Sparkles, Brain, Laptop } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Hero() {
    const { signInWithGoogle, signInWithGithub } = useAuth();
    const router = useRouter();

    const handleSignIn = (provider: string) => {
        if (provider === 'google') signInWithGoogle();
        if (provider === 'github') signInWithGithub();
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
            {/* Hero specific ambient glow - Subtle & Warm */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/05 via-transparent to-transparent blur-3xl pointer-events-none" />

            <div className="relative max-w-5xl mx-auto text-center z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-sm mb-8 text-[var(--text-secondary)] border border-[var(--border-glass)]"
                >
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>No technical skills needed • 1-Minute Setup</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl sm:text-7xl md:text-8xl font-bold leading-tight mb-8 tracking-tight font-mono"
                >
                    <span className="text-white">Deploy AI Employees</span>
                    <br />
                    <span className="text-gradient-glass opacity-60 text-5xl sm:text-6xl md:text-7xl block mt-2 font-medium">
                        GhostClaw in 60 seconds
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-12 leading-relaxed font-mono"
                >
                    <span className="font-semibold text-[var(--text-secondary)]">Infinite possibilities at your fingertips</span>
                    <br />
                    They learn, adapt, and handle the tasks you don't want to do.
                </motion.p>

                {/* CTAs */}
                {/* Deploy Access Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto mb-20"
                >
                    <div className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 text-left shadow-2xl shadow-black/50 relative overflow-hidden group">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 space-y-8">
                            {/* Model Selection */}
                            <div>
                                <label className="block text-white font-semibold mb-3 text-lg">Which model do you want as default?</label>
                                <div className="flex flex-wrap gap-3">
                                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-primary-600 text-white font-medium ring-1 ring-primary-600/50 shadow-lg shadow-primary-600/10">
                                        <div className="relative w-6 h-6">
                                            <Image
                                                src="/icons/claude_icon.png"
                                                alt="Claude"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        Claude Opus 4.5
                                        <div className="bg-primary-600 rounded-full p-0.5 ml-1">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-light)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors">
                                        <div className="relative w-6 h-6">
                                            <Image
                                                src="/icons/chatgpt_icon.png"
                                                alt="GPT"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        GPT-5.2
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-light)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors">
                                        <div className="relative w-6 h-6">
                                            <Image
                                                src="/icons/gemini_icons.png"
                                                alt="Gemini"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        Gemini 3 Flash
                                    </button>
                                </div>
                            </div>

                            {/* Channel Selection */}
                            <div>
                                <label className="block text-white font-semibold mb-3 text-lg">Which channel do you want to use for sending messages?</label>
                                <div className="flex flex-wrap gap-3">
                                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-blue-500/50 text-white font-medium shadow-lg shadow-blue-500/10">
                                        <div className="relative w-6 h-6">
                                            <Image
                                                src="/icons/telegram_icon.webp"
                                                alt="Telegram"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        Telegram
                                    </button>
                                    <div className="relative opacity-60 cursor-not-allowed">
                                        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-light)] text-[var(--text-dim)] w-full">
                                            <div className="relative w-8 h-8">
                                                <Image
                                                    src="/icons/discord_icon.png"
                                                    alt="Discord"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            Discord
                                        </button>
                                        <span className="absolute bottom-1 right-2 text-[10px] text-[var(--text-dim)]">Coming soon</span>
                                    </div>
                                    <div className="relative opacity-60 cursor-not-allowed">
                                        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-light)] text-[var(--text-dim)] w-full">
                                            <div className="relative w-6 h-6">
                                                <Image
                                                    src="/icons/whatsapp_icon.png"
                                                    alt="WhatsApp"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            WhatsApp
                                        </button>
                                        <span className="absolute bottom-1 right-2 text-[10px] text-[var(--text-dim)]">Coming soon</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sign In Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-[var(--border-light)]">
                                <button onClick={() => handleSignIn('google')} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                    Sign in with Google
                                </button>
                                <button onClick={() => handleSignIn('github')} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#24292e] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2b3137] transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    Sign in with GitHub
                                </button>
                            </div>


                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <div className="relative inline-block cursor-not-allowed opacity-60">
                                <button disabled className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-light)] pointer-events-none">
                                    <Laptop className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span className="text-sm font-medium text-[var(--text-muted)]">
                                        Run locally with <span className="text-primary-400">preset skills</span>
                                    </span>
                                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                        Coming Soon
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Benefits / Trust */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel inline-flex flex-wrap items-center justify-center gap-8 px-8 py-4 rounded-2xl border border-[var(--border-glass)]"
                >
                    <div className="flex items-center gap-2 text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Works with your apps</span>
                    </div>
                    <div className="w-px h-4 bg-[var(--border-glass)] hidden sm:block" />
                    <div className="flex items-center gap-2 text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]">
                        <Brain className="w-4 h-4" />
                        <span className="text-sm font-medium">Self-learning</span>
                    </div>
                    <div className="w-px h-4 bg-[var(--border-glass)] hidden sm:block" />
                    <div className="flex items-center gap-2 text-[var(--text-dim)] transition-colors hover:text-[var(--text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">24/7 Availability</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
