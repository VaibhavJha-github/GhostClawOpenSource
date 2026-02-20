"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Zap, Shield, Clock, MousePointerClick, Sparkles, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function ValueProps() {
    return (
        <section className="py-32 px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-[var(--bg-muted)] to-[var(--bg-base)] opacity-60" />
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary-600 opacity-5 blur-[120px] rounded-full" />

            <div className="relative max-w-7xl mx-auto space-y-40">

                {/* Feature 1: Preconfigured Agents */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-600 blur-sm opacity-50 rounded-full" />
                                <Clock className="relative w-4 h-4 text-primary-600" />
                            </div>
                            <span className="text-sm font-semibold text-primary-600 font-mono">Save 20+ Hours Weekly</span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-mono">
                            240+ Agent Templates
                            <br />
                            <span className="text-gradient-copper">Ready to Deploy</span>
                        </h2>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 leading-relaxed font-mono">
                            No setup required. Choose a template, customize, and launch your AI employee in under 60 seconds.
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-xl p-4 text-center hover:border-primary-600/30 transition-all">
                                <div className="text-2xl font-bold text-primary-600 mb-1 font-mono">240+</div>
                                <div className="text-xs text-[var(--text-muted)] font-mono">Templates</div>
                            </div>
                            <div className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-xl p-4 text-center hover:border-primary-600/30 transition-all">
                                <div className="text-2xl font-bold text-primary-600 mb-1 font-mono">&lt;60s</div>
                                <div className="text-xs text-[var(--text-muted)] font-mono">Setup Time</div>
                            </div>
                            <div className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-xl p-4 text-center hover:border-primary-600/30 transition-all">
                                <div className="text-2xl font-bold text-primary-600 mb-1 font-mono">24/7</div>
                                <div className="text-xs text-[var(--text-muted)] font-mono">Uptime</div>
                            </div>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-3 mb-8">
                            {[
                                "Pre-configured for your industry",
                                "Customizable skills and workflows",
                                "Deploy across multiple channels"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600/10 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-primary-600" />
                                    </div>
                                    <span className="text-[var(--text-secondary)] font-mono">{item}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all hover:scale-105 hover:shadow-lg font-mono">
                            Browse Templates
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    {/* Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-8 bg-gradient-to-r from-primary-600/10 to-accent-orange/10 blur-3xl rounded-full" />
                        <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 hover:border-primary-600/30 transition-all">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-light)]">
                                <span className="text-sm font-bold text-[var(--text-muted)] font-mono">POPULAR TEMPLATES</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-500 font-mono">Live</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: "Sales Closer", role: "Lead Conversion", color: "bg-gradient-to-br from-green-500 to-emerald-600", initial: "SC" },
                                    { name: "Support Hero", role: "Customer Service", color: "bg-gradient-to-br from-blue-500 to-indigo-600", initial: "SH" },
                                    { name: "Data Analyst", role: "Research & Insights", color: "bg-gradient-to-br from-purple-500 to-pink-600", initial: "DA" },
                                ].map((agent, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="group flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-primary-600/50 hover:bg-[var(--bg-muted)] transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                                {agent.initial}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[var(--text-primary)] text-sm font-mono">{agent.name}</div>
                                                <div className="text-xs text-[var(--text-muted)] font-mono">{agent.role}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Feature 2: One-Click Skills */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual - Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1 relative"
                    >
                        <div className="absolute -inset-8 bg-gradient-to-l from-accent-orange/10 to-primary-600/10 blur-3xl rounded-full" />
                        <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 hover:border-primary-600/30 transition-all">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-light)]">
                                <span className="text-sm font-bold text-[var(--text-muted)] font-mono">SKILL MARKETPLACE</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-primary-600/10 text-primary-600 border border-primary-600/20 font-mono">150+ Skills</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: "Web Scraping", status: "Installed", active: true, icon: "🌐" },
                                    { name: "Email Automation", status: "Installed", active: true, icon: "✉️" },
                                    { name: "Document Analysis", status: "Available", active: false, icon: "📄" },
                                    { name: "Voice Calling", status: "Available", active: false, icon: "📞" },
                                ].map((skill, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-light)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{skill.icon}</div>
                                            <span className="font-semibold text-[var(--text-secondary)] font-mono">{skill.name}</span>
                                        </div>
                                        <button className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all font-mono ${skill.active
                                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                                : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105"
                                            }`}>
                                            {skill.status}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Text - Right */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="order-1 lg:order-2"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-6">
                            <Sparkles className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-semibold text-primary-600 font-mono">150+ Pre-Built Skills</span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-mono">
                            Extend Capabilities
                            <br />
                            <span className="text-gradient-copper">With One Click</span>
                        </h2>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 leading-relaxed font-mono">
                            From web scraping to voice calls, add powerful skills to your AI employee instantly. No coding, no configuration files.
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-5 hover:border-primary-600/30 transition-all group">
                                <Zap className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                                <div className="font-bold text-[var(--text-primary)] mb-1 font-mono">Instant Deploy</div>
                                <div className="text-xs text-[var(--text-muted)] font-mono">Active in seconds</div>
                            </div>
                            <div className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-5 hover:border-primary-600/30 transition-all group">
                                <Shield className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                                <div className="font-bold text-[var(--text-primary)] mb-1 font-mono">Sandboxed</div>
                                <div className="text-xs text-[var(--text-muted)] font-mono">100% isolated</div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all hover:scale-105 hover:shadow-lg font-mono">
                            Explore Skills
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
