"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, DollarSign } from "lucide-react";

interface Metric {
    icon: typeof TrendingUp;
    value: string;
    label: string;
    color: string;
}

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    avatar: string;
    metric: string;
}

const metrics: Metric[] = [
    {
        icon: DollarSign,
        value: "$2.4M+",
        label: "Revenue Generated",
        color: "text-green-500"
    },
    {
        icon: TrendingUp,
        value: "847%",
        label: "Avg ROI",
        color: "text-primary-600"
    },
    {
        icon: Clock,
        value: "12,400+",
        label: "Hours Saved",
        color: "text-accent-blue"
    },
];

const testimonials: Testimonial[] = [
    {
        name: "Sarah Chen",
        role: "Founder",
        company: "DropFlow",
        quote: "Cart recovery calls alone increased revenue 23% in month one. This replaced 3 VAs.",
        avatar: "SC",
        metric: "+23% Revenue"
    },
    {
        name: "Marcus Johnson",
        role: "Owner",
        company: "Peak Fitness",
        quote: "Members love the booking automation. Zero missed appointments. Retention up 40%.",
        avatar: "MJ",
        metric: "+40% Retention"
    },
    {
        name: "Emily Rodriguez",
        role: "CEO",
        company: "ScaleUp SaaS",
        quote: "Lead qualification runs 24/7. Sales only talks to qualified prospects. Complete game changer.",
        avatar: "ER",
        metric: "3x Pipeline"
    },
];

export default function Testimonials() {
    return (
        <section className="relative py-32 px-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[var(--bg-muted)] opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-primary-600/5 to-transparent" />

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-6">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 border-2 border-[var(--bg-base)] flex items-center justify-center text-white text-xs font-bold">S</div>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-orange to-primary-600 border-2 border-[var(--bg-base)] flex items-center justify-center text-white text-xs font-bold">M</div>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-700 to-primary-800 border-2 border-[var(--bg-base)] flex items-center justify-center text-white text-xs font-bold">E</div>
                        </div>
                        <span className="text-sm font-semibold text-primary-600">Real Results from Real Businesses</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-mono">
                        Businesses Winning with{" "}
                        <span className="text-gradient-copper">AI Employees</span>
                    </h2>
                    <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-mono">
                        From e-commerce to SaaS, see how companies are automating revenue and scaling faster.
                    </p>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-6 text-center hover:border-primary-600/30 hover:shadow-lg transition-all"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600/10 mb-4`}>
                                    <Icon className={`w-6 h-6 ${metric.color}`} />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2 font-mono">
                                    {metric.value}
                                </div>
                                <div className="text-sm text-[var(--text-muted)] font-mono">
                                    {metric.label}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Testimonials - Modern Card Design */}
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            className="group relative"
                        >
                            {/* Card */}
                            <div className="relative h-full bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-8 hover:border-primary-600/30 hover:shadow-xl transition-all">
                                {/* Metric Badge */}
                                <div className="absolute -top-3 -right-3">
                                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold shadow-lg">
                                        {testimonial.metric}
                                    </div>
                                </div>

                                {/* Quote */}
                                <p className="text-[var(--text-secondary)] leading-relaxed mb-6 text-lg font-mono">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold shadow-md">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--text-primary)]">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {testimonial.role}, {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
