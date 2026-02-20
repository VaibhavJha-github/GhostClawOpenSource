"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Rocket } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Sparkles,
        title: "Pick Your Agent",
        description: "Choose from 240+ templates or build from scratch",
        color: "from-primary-600 to-primary-700"
    },
    {
        number: "02",
        icon: Zap,
        title: "Connect Channels",
        description: "Link Telegram, Discord, or email in one click",
        color: "from-accent-orange to-primary-600"
    },
    {
        number: "03",
        icon: Rocket,
        title: "Launch & Scale",
        description: "Your AI employee is live and revenue-generating",
        color: "from-primary-700 to-primary-800"
    }
];

export default function Features() {
    return (
        <section id="how-it-works" className="relative py-32 px-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[var(--bg-secondary)] opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-primary-600/5 to-transparent" />

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-6">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="text-sm font-semibold text-primary-600 font-mono">3-Step Setup Process</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-mono">
                        From Zero to{" "}
                        <span className="text-gradient-copper">AI Employee</span>
                        <br />
                        <span className="text-[var(--text-muted)] text-3xl md:text-4xl">in Under 60 Seconds</span>
                    </h2>
                    <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-mono">
                        No DevOps. No configuration files. No technical skills required.
                        <br />
                        <span className="text-primary-600 font-semibold">Just pure automation.</span>
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting lines - desktop only */}
                    <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-600/20 to-transparent" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, duration: 0.6 }}
                                className="relative"
                            >
                                {/* Card */}
                                <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 hover:border-primary-600/30 hover:shadow-xl transition-all group h-full">
                                    {/* Number Badge */}
                                    <div className="absolute -top-4 -right-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg font-mono`}>
                                            {step.number}
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className="relative mb-6">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        {/* Glow effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 blur-xl rounded-2xl`} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 font-mono">
                                        {step.title}
                                    </h3>
                                    <p className="text-[var(--text-muted)] leading-relaxed font-mono">
                                        {step.description}
                                    </p>

                                    {/* Check icon */}
                                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-green-500" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-muted)] font-mono">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <span>BYO API keys</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <span>48-hour free trial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
