"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { HomepageSection } from "@/lib/sections";

interface DynamicSectionProps {
    section: HomepageSection;
    index: number;
}

export default function DynamicSection({ section, index }: DynamicSectionProps) {
    const Icon = section.icon;
    const isEven = index % 2 === 0;

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="py-24 px-4 relative overflow-hidden"
        >
            {/* Background glow effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute ${isEven ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600 opacity-5 blur-[120px] rounded-full`} />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className={`grid md:grid-cols-2 gap-12 lg:gap-16 items-center ${!isEven && 'md:grid-flow-col-dense'}`}>
                    {/* Content Side */}
                    <div className={`${!isEven && 'md:col-start-2'}`}>
                        {/* Icon badge - Enhanced */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-6"
                        >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600/20">
                                <Icon className="w-4 h-4 text-primary-600" />
                            </div>
                            <span className="text-sm font-semibold text-primary-600 font-mono">Featured</span>
                        </motion.div>

                        {/* Title with gradient */}
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-mono">
                            {section.title.split(' ').slice(0, -2).join(' ')}{' '}
                            <span className="text-gradient-copper">
                                {section.title.split(' ').slice(-2).join(' ')}
                            </span>
                        </h3>

                        {/* Subtitle */}
                        <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed font-mono">
                            {section.subtitle}
                        </p>

                        {/* Features list - Enhanced */}
                        <ul className="space-y-3 mb-8">
                            {section.features.map((feature, i) => (
                                <motion.li
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600/10 flex items-center justify-center mt-0.5">
                                        <Check className="w-3 h-3 text-primary-600" />
                                    </div>
                                    <span className="text-[var(--text-secondary)] font-mono">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>

                        {/* CTA Button - Premium */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/20 font-mono"
                        >
                            {section.ctaText}
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Visual Side - Premium Card with Icon */}
                    <div className={`${!isEven && 'md:col-start-1 md:row-start-1'}`}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative group"
                        >
                            {/* Main card */}
                            <div className="aspect-[4/3] bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 flex items-center justify-center overflow-hidden transition-all hover:border-primary-600/30">
                                {/* Background pattern */}
                                <div className="absolute inset-0 opacity-[0.02]">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                    }} />
                                </div>

                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Icon with gradient background */}
                                <div className="relative z-10">
                                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-600/20 to-primary-700/10 flex items-center justify-center border border-primary-600/10 group-hover:scale-110 transition-transform duration-500">
                                        <Icon className="w-16 h-16 text-primary-600 group-hover:rotate-12 transition-transform duration-500" />
                                    </div>
                                </div>

                                {/* Decorative dots */}
                                <div className="absolute top-4 right-4 flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600/30" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600/20" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600/10" />
                                </div>
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] text-xs font-bold text-primary-600 font-mono shadow-lg">
                                AI-Powered
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
