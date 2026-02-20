"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart, Users, Layers, Briefcase, Calculator, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentConfig } from "@/lib/agent-config";
import {
    DEFAULT_SKILLS,
    getCategoryOnlySkills,
    type Skill,
} from "@/lib/skills";
import { BusinessType } from "@/components/BusinessTypePopup";

interface Step4SkillsProps {
    config: AgentConfig;
    updateConfig: (updates: Partial<AgentConfig>) => void;
}

const businessTypes: { id: BusinessType; label: string; icon: any }[] = [
    { id: "ecommerce", label: "E-Commerce", icon: ShoppingCart },
    { id: "saas", label: "SaaS", icon: Calculator },
    { id: "agency", label: "Agency", icon: Layers },
    { id: "local", label: "Local Biz", icon: Users },
    { id: "professional", label: "Professional", icon: Briefcase },
];

export default function Step4Skills({ config, updateConfig }: Step4SkillsProps) {
    const [selectedCategories, setSelectedCategories] = useState<BusinessType[]>(
        config.useCase ? config.useCase.split(",") as BusinessType[] : []
    );

    // Category-specific skills (not including defaults)
    const categorySkills = getCategoryOnlySkills(selectedCategories);

    // Auto-enable all recommended skills when categories change
    useEffect(() => {
        const allSkillIds = [
            ...DEFAULT_SKILLS.map(s => s.id),
            ...categorySkills.map(s => s.id),
        ];
        // Deduplicate
        const unique = [...new Set(allSkillIds)];
        updateConfig({ skills: unique });
    }, [selectedCategories]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleCategory = (id: BusinessType) => {
        let newCats;
        if (selectedCategories.includes(id)) {
            newCats = selectedCategories.filter(c => c !== id);
        } else {
            newCats = [...selectedCategories, id];
        }
        setSelectedCategories(newCats);
        updateConfig({ useCase: newCats.join(",") });
    };

    const toggleSkill = (skillId: string) => {
        const current = config.skills || [];
        if (current.includes(skillId)) {
            updateConfig({ skills: current.filter(s => s !== skillId) });
        } else {
            updateConfig({ skills: [...current, skillId] });
        }
    };

    const renderSkillCard = (skill: Skill) => {
        const isEnabled = config.skills.includes(skill.id);
        return (
            <motion.button
                key={skill.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => toggleSkill(skill.id)}
                className={`relative flex items-start p-4 rounded-xl border text-left transition-all ${isEnabled
                    ? "bg-primary-600/5 border-primary-600/50"
                    : "bg-[var(--bg-base)] border-[var(--border-light)] opacity-60 grayscale"
                    }`}
            >
                <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${isEnabled ? "bg-primary-600/20 text-primary-600" : "bg-[var(--bg-muted)] text-[var(--text-dim)]"
                    }`}>
                    <div className="w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {skill.name.charAt(0)}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm truncate ${isEnabled ? "text-white" : "text-[var(--text-secondary)]"}`}>
                            {skill.name}
                        </span>
                        {isEnabled && (
                            <Check className="w-4 h-4 text-primary-600 flex-shrink-0 ml-2" />
                        )}
                    </div>
                    <p className="text-xs text-[var(--text-dim)] line-clamp-2">
                        {skill.description}
                    </p>
                </div>
            </motion.button>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Skills & Abilities</h2>
                <p className="text-[var(--text-secondary)]">Select your business type to auto-install relevant skills.</p>
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {businessTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => toggleCategory(type.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedCategories.includes(type.id)
                            ? "bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-900/20"
                            : "bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-primary-600/50 hover:text-[var(--text-secondary)]"
                            }`}
                    >
                        <type.icon className="w-6 h-6 mb-2" />
                        <span className="text-xs font-semibold">{type.label}</span>
                    </button>
                ))}
            </div>

            {/* Recommendation Banner */}
            {selectedCategories.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-600/5 border border-primary-600/20">
                    <Info className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-white font-medium">Recommended skills for your use case</p>
                        <p className="text-xs text-[var(--text-dim)] mt-1">
                            We recommend installing all of these skills for the best experience.
                            Toggle off any you don't need.
                        </p>
                    </div>
                </div>
            )}

            {/* Default Skills Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Core Skills</h3>
                    <span className="text-xs text-[var(--text-dim)]">
                        Installed for everyone
                    </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                    <AnimatePresence>
                        {DEFAULT_SKILLS.map(renderSkillCard)}
                    </AnimatePresence>
                </div>
            </div>

            {/* Category-Specific Skills */}
            {categorySkills.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                            {selectedCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(" + ")} Skills
                        </h3>
                        <span className="text-xs text-[var(--text-dim)]">
                            {categorySkills.filter(s => config.skills.includes(s.id)).length}/{categorySkills.length} selected
                        </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                        <AnimatePresence>
                            {categorySkills.map(renderSkillCard)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {selectedCategories.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-[var(--border-light)] rounded-xl text-[var(--text-dim)]">
                    Select a business type above to see additional recommended skills.
                    <br />
                    <span className="text-xs">Core skills will be installed regardless.</span>
                </div>
            )}

            {/* Total count */}
            <div className="text-center text-sm text-[var(--text-dim)]">
                {config.skills.length} skills will be installed on your agent
            </div>
        </div>
    );
}
