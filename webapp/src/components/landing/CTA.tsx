"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Clock } from "lucide-react";

export default function CTA() {
    return (
        <section className="relative py-32 px-4 overflow-hidden">
            {/* Layered background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-primary-900/5 to-[var(--bg-base)]" />
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary-600 opacity-8 blur-[150px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-accent-orange opacity-5 blur-[120px] rounded-full" />

            <div className="relative max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-600 blur-sm opacity-50 rounded-full" />
                            <Sparkles className="relative w-4 h-4 text-primary-600" />
                        </div>
                        <span className="text-sm font-semibold text-primary-600">Deploy in Under 60 Seconds</span>
                    </div>

                    {/* Headline - Breaking pattern with unique copy */}
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-mono">
                        Your First AI Employee
                        <br />
                        <span className="text-gradient-copper font-mono">Awaits Deployment</span>
                    </h2>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-mono">
                        Join hundreds of businesses automating customer calls, booking appointments,
                        and recovering revenue—while you sleep.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Link
                            href="/deploy"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-600/30"
                        >
                            <span>Start Free Trial</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-2xl bg-primary-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                        </Link>

                        <Link
                            href="#pricing"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-elevated)]/50 backdrop-blur-sm text-[var(--text-primary)] font-semibold text-lg hover:border-primary-600/50 hover:bg-[var(--bg-elevated)] transition-all"
                        >
                            View Pricing
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <span>BYO API keys</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-600" />
                            <span>48-hour free trial</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary-600" />
                            <span>Deploy in 60 seconds</span>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute -top-20 -left-20 w-40 h-40 border border-primary-600/10 rounded-full" />
                <div className="absolute -top-32 -left-32 w-64 h-64 border border-primary-600/5 rounded-full" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 border border-primary-600/10 rounded-full" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 border border-primary-600/5 rounded-full" />
            </div>
        </section>
    );
}
