"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Store,
    Monitor,
    Megaphone,
    Briefcase,
    PenTool,
    ArrowRight,
    Check
} from "lucide-react";

export type BusinessType = "ecommerce" | "local" | "saas" | "agency" | "professional" | "custom";

interface BusinessOption {
    id: BusinessType;
    name: string;
    icon: typeof ShoppingCart;
    description: string;
    examples: string;
}

const businessOptions: BusinessOption[] = [
    {
        id: "ecommerce",
        name: "E-Commerce",
        icon: ShoppingCart,
        description: "Online stores & dropshipping",
        examples: "Shopify, WooCommerce, Amazon",
    },
    {
        id: "local",
        name: "Local Services",
        icon: Store,
        description: "Physical businesses & services",
        examples: "Gyms, salons, plumbers, retail",
    },
    {
        id: "saas",
        name: "SaaS",
        icon: Monitor,
        description: "Software companies",
        examples: "B2B, B2C, startups",
    },
    {
        id: "agency",
        name: "Agency",
        icon: Megaphone,
        description: "Marketing & creative work",
        examples: "Ads, content, SEO, design",
    },
    {
        id: "professional",
        name: "Professional",
        icon: Briefcase,
        description: "Knowledge-based services",
        examples: "Legal, accounting, consulting",
    },
    {
        id: "custom",
        name: "Something Else",
        icon: PenTool,
        description: "Tell us what you do",
        examples: "We'll tailor it for you",
    },
];

interface BusinessTypePopupProps {
    onComplete: (selected: BusinessType[], customInput: string) => void;
}

export default function BusinessTypePopup({ onComplete }: BusinessTypePopupProps) {
    const [selected, setSelected] = useState<BusinessType[]>([]);
    const [customInput, setCustomInput] = useState("");
    const [isVisible, setIsVisible] = useState(true);

    // Check localStorage on mount
    useEffect(() => {
        const savedTypes = localStorage.getItem("ghostclaw_business_types");
        if (savedTypes) {
            setIsVisible(false);
        }
    }, []);

    const toggleSelection = (id: BusinessType) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleContinue = () => {
        if (selected.length === 0) return;

        // Save to localStorage
        localStorage.setItem("ghostclaw_business_types", JSON.stringify(selected));
        if (customInput.trim()) {
            localStorage.setItem("ghostclaw_custom_input", customInput);
        }

        setIsVisible(false);
        onComplete(selected, customInput);
    };

    const handleSkip = () => {
        localStorage.setItem("ghostclaw_business_types", JSON.stringify([]));
        setIsVisible(false);
        onComplete([], "");
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-backdrop"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="modal-content p-8"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
                            <img src="/ghostclaw.png" alt="GhostClaw" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Welcome to GhostClaw
                        </h2>
                        <p className="text-[var(--text-muted)]">
                            What are you building? <span className="text-[var(--text-dim)]">(Select all that apply)</span>
                        </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6 stagger-children">
                        {businessOptions.map((option) => {
                            const isSelected = selected.includes(option.id);
                            const Icon = option.icon;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => toggleSelection(option.id)}
                                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                                        ? "border-[var(--primary-600)] bg-[var(--primary-600)]/10"
                                        : "border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)]"
                                        }`}
                                >
                                    {/* Selected checkmark */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--primary-600)] flex items-center justify-center"
                                        >
                                            <Check className="w-3 h-3 text-white" />
                                        </motion.div>
                                    )}

                                    <div className={`w-10 h-10 flex items-center justify-center mb-3`}>
                                        <Icon className={`w-6 h-6 ${isSelected ? "text-[var(--primary-600)]" : "text-[var(--text-muted)]"}`} />
                                    </div>

                                    <h3 className="font-semibold text-white text-sm mb-0.5">{option.name}</h3>
                                    <p className="text-xs text-[var(--text-dim)]">{option.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Input (shows when custom is selected) */}
                    <AnimatePresence>
                        {selected.includes("custom") && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6"
                            >
                                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                    What do you want to automate?
                                </label>
                                <textarea
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="e.g., Managing my real estate listings, handling customer inquiries..."
                                    className="input resize-none h-24"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Continue Button */}
                    <button
                        onClick={handleContinue}
                        disabled={selected.length === 0}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${selected.length > 0
                            ? "btn-primary"
                            : "bg-[var(--bg-tertiary)] text-[var(--text-dim)] cursor-not-allowed"
                            }`}
                    >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleSkip}
                        className="w-full mt-3 py-3 rounded-xl border border-white/10 text-[var(--text-muted)] hover:text-white hover:border-white/20 transition-colors"
                    >
                        Skip personalization for now
                    </button>

                    {/* Note */}
                    <p className="text-center text-xs text-[var(--text-dim)] mt-4">
                        This helps us show you relevant features. You can change this anytime.
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
