"use client";

import { motion } from "framer-motion";
import { universalSkills } from "@/lib/skills";

export default function UniversalSkillsSection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Built-in Skills for <span className="text-gradient-orange">Every Business</span>
                    </h2>
                    <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
                        These foundational capabilities come standard. No setup, no extra cost.
                    </p>
                </motion.div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {universalSkills.map((skill, index) => {
                        const Icon = skill.icon;
                        return (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="card group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-500 flex items-center justify-center mb-3 transition-all duration-300">
                                    <Icon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-semibold text-white text-sm mb-1">{skill.name}</h3>
                                <p className="text-xs text-[var(--text-dim)] leading-relaxed">{skill.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
