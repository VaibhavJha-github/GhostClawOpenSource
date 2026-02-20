"use client";

import { motion } from "framer-motion";
import { Globe, FileText, Sparkles, Brain, Zap, MessageSquare, Twitter, Layers, TrendingUp } from "lucide-react";

// Feature data
const features = [
    {
        icon: Brain,
        title: "Multi-Model AI",
        description: "Claude, GPT-4, Llama—switch between the best models for each task",
        gradient: "from-purple-500/20 to-pink-500/10",
        size: "large"
    },
    {
        icon: Globe,
        title: "Web Browsing",
        description: "Navigate websites, extract data, and interact with forms automatically",
        gradient: "from-blue-500/20 to-cyan-500/10",
        size: "medium"
    },
    {
        icon: Zap,
        title: "Instant Deployments",
        description: "Push to production in under 60 seconds with zero downtime",
        gradient: "from-yellow-500/20 to-orange-500/10",
        size: "medium"
    },
    {
        icon: MessageSquare,
        title: "Voice & Text",
        description: "Handle phone calls, SMS, email, and chat across all channels",
        gradient: "from-green-500/20 to-emerald-500/10",
        size: "large"
    },
    {
        icon: FileText,
        title: "Document Processing",
        description: "Parse, analyze, and generate documents in any format",
        gradient: "from-indigo-500/20 to-purple-500/10",
        size: "medium"
    },
    {
        icon: TrendingUp,
        title: "Real-Time Analytics",
        description: "Track performance, costs, and ROI with live dashboards",
        gradient: "from-orange-500/20 to-red-500/10",
        size: "medium"
    },
];

export default function BentoFeatures() {
    return (
        <section className="relative py-32 px-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[var(--bg-base)]" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary-600 opacity-5 blur-[140px] rounded-full" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-6">
                        <Sparkles className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-semibold text-primary-600 font-mono">Powered by Latest AI</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-mono">
                        Enterprise Features,
                        <br />
                        <span className="text-gradient-copper">Startup Speed</span>
                    </h2>
                    <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-mono">
                        Every capability you need to automate your business operations—
                        <br />
                        built-in, tested, and ready to deploy.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        const isLarge = feature.size === "large";

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className={`
                                    group relative overflow-hidden rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-light)]
                                    p-8 hover:border-primary-600/30 hover:shadow-2xl transition-all
                                    ${isLarge ? 'md:col-span-2' : 'md:col-span-1'}
                                `}
                            >
                                {/* Gradient Background on Hover */}
                                <div className={`
                                    absolute inset-0 bg-gradient-to-br ${feature.gradient}
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-700
                                `} />

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className="mb-6">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600/10 group-hover:bg-primary-600/20 transition-all group-hover:scale-110 duration-300">
                                            <Icon className="w-7 h-7 text-primary-600" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-primary-300 transition-colors font-mono">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-[var(--text-muted)] leading-relaxed group-hover:text-[var(--text-secondary)] transition-colors font-mono">
                                        {feature.description}
                                    </p>

                                    {/* Hover indicator */}
                                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-primary-600/10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-primary-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative grain */}
                                <div
                                    className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <p className="text-[var(--text-muted)] font-mono">
                        And 50+ more capabilities included with every plan
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
