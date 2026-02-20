"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import type { HubItem } from "@/lib/sections";

interface FixedHubSectionProps {
    items: HubItem[];
}

export default function FixedHubSection({ items }: FixedHubSectionProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        setActiveId(activeId === id ? null : id);
    };

    const activeItem = items.find((item) => item.id === activeId);

    if (!items || items.length === 0) return null;

    return (
        <section className="py-24 px-4 bg-[var(--bg-base)] border-t border-[var(--border-light)] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary-600/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-mono mb-4">Explore More Features</h2>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Discover additional tools to enhance your workflow. Click to learn more.
                    </p>
                </div>

                {/* Grid of Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeId === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleToggle(item.id)}
                                className={`
                                    relative p-4 rounded-xl border text-left transition-all duration-300 group
                                    ${isActive
                                        ? "border-primary-600 bg-primary-600/10 shadow-[0_0_20px_rgba(234,88,12,0.15)]"
                                        : "border-[var(--border-light)] bg-[var(--bg-elevated)] hover:border-primary-600/30 hover:bg-[var(--bg-elevated)]/80"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                                        ${isActive ? "bg-primary-600 text-white" : "bg-[var(--bg-base)] text-[var(--text-muted)] group-hover:text-primary-600"}
                                    `}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className={`absolute top-4 right-4 text-[var(--text-dim)] transition-transform duration-300 ${isActive ? "rotate-180 text-primary-600" : ""}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className={`font-mono text-sm font-bold ${isActive ? "text-primary-600" : "text-[var(--text-primary)]"}`}>
                                    {item.title}
                                </h3>
                            </button>
                        );
                    })}
                </div>

                {/* Expanded Content Area */}
                <div className="relative min-h-[0px]"> {/* Container to avoid layout shift jumping too much, though AnimatePresence handles height */}
                    <AnimatePresence mode="wait">
                        {activeItem && (
                            <motion.div
                                key={activeItem.id}
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="bg-[var(--bg-elevated)] border border-primary-600/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[80px] rounded-full pointer-events-none" />

                                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-900/20">
                                            <activeItem.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold font-mono mb-2 flex items-center gap-3">
                                                {activeItem.title}
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600/10 text-primary-600 font-mono uppercase tracking-wider border border-primary-600/20">
                                                    Feature
                                                </span>
                                            </h3>
                                            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
                                                {activeItem.description}
                                            </p>
                                            <button className="text-primary-600 font-mono font-bold text-sm hover:underline flex items-center gap-1 group">
                                                Learn technical details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
