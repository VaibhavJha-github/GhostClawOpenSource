"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    ExternalLink,
    Info,
    Plus,
    Minus,
    XCircle,
} from "lucide-react";

const machines = [
    {
        plan: "Starter",
        badge: "",
        badgeColor: "",
        specs: "2 vCPU · 2GB · 20GB",
        price: 49,
        quantity: 1,
    },
    {
        plan: "Professional",
        badge: "POPULAR",
        badgeColor: "bg-primary-600",
        specs: "2 vCPU · 4GB · 50GB",
        price: 99,
        quantity: 1,
    },
    {
        plan: "Enterprise",
        badge: "",
        badgeColor: "",
        specs: "4 vCPU · 8GB · 100GB",
        price: 200,
        quantity: 1,
    },
];

const planFeatures = {
    Starter: [
        "All models",
        "All integrations",
        "BYO API keys",
        "Web browsing",
    ],
    Professional: [
        "All models",
        "All integrations",
        "BYO API keys",
        "Priority support",
    ],
    Enterprise: [
        "All models",
        "All integrations",
        "BYO API keys",
        "Dedicated support",
    ],
};

export default function BillingPage() {
    // TODO: Verify actual active plan from Supabase/Stripe
    const activePlan = "Starter";
    const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

    const [machineQuantities, setMachineQuantities] = useState<Record<string, number>>({
        Starter: 1,
        Professional: 1,
        Enterprise: 1,
    });

    const updateQuantity = (plan: string, delta: number) => {
        setMachineQuantities(prev => ({
            ...prev,
            [plan]: Math.max(1, prev[plan] + delta)
        }));
    };

    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2800);
    };

    const showComingSoon = (feature: string) => {
        showToast("info", `${feature} is coming soon. This action is intentionally disabled right now.`);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-3xl font-bold mb-2 font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--text-muted)]">Billing</h1>
                <p className="text-[var(--text-muted)] font-mono">Manage subscriptions and machines</p>
            </div>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Machines Section */}
                <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold mb-1 font-mono">Machines</h2>
                            <p className="text-sm text-[var(--text-muted)] font-mono">1 of 1 in use</p>
                        </div>
                        <div className="relative group">
                            <button
                                type="button"
                                onClick={() => showComingSoon("Manage subscriptions")}
                            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-semibold font-mono transition-colors"
                            >
                                <span>Manage Subscriptions</span>
                                <ExternalLink className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 w-56 rounded-lg border border-white/10 bg-black/85 px-3 py-2 text-[11px] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Billing portal wiring is not enabled in this build yet.
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20 backdrop-blur-md">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase font-mono tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase font-mono tracking-wider">
                                        Specs
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase font-mono tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase font-mono tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {machines.map((machine, idx) => {
                                    const isCurrent = machine.plan === activePlan;
                                    return (
                                        <tr
                                            key={machine.plan}
                                            className={idx !== machines.length - 1 ? "border-b border-[var(--border-light)]" : ""}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold font-mono text-white">{machine.plan}</span>
                                                    {machine.badge && machine.badge !== "TRIAL" && (
                                                        <span className={`px-2 py-0.5 ${machine.badgeColor} text-white text-xs font-bold rounded font-mono shadow-md shadow-orange-900/20`}>
                                                            {machine.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[var(--text-secondary)] font-mono text-sm">
                                                {machine.specs}
                                            </td>
                                            <td className="px-4 py-4 font-semibold font-mono text-white">
                                                ${machine.price}/mo
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(machine.plan, -1)}
                                                        disabled={machineQuantities[machine.plan] <= 1}
                                                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-mono font-semibold">
                                                        {machineQuantities[machine.plan]}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(machine.plan, 1)}
                                                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isCurrent) {
                                                            showToast("info", "This is your current plan.");
                                                            return;
                                                        }
                                                        showComingSoon(`Plan upgrade to ${machine.plan}`);
                                                    }}
                                                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-all font-mono text-sm ${isCurrent
                                                        ? "bg-primary-600/20 text-primary-400 border border-primary-600/20"
                                                        : "bg-white/5 text-[var(--text-muted)] border border-white/5 hover:border-amber-500/30 hover:text-amber-200"
                                                        }`}
                                                >
                                                    {isCurrent ? "Current Plan" : "Upgrade"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Plan comparison */}
                    <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-[var(--border-light)]">
                        {Object.entries(planFeatures).map(([plan, features]) => (
                            <div key={plan}>
                                <h3 className="font-bold mb-3 font-mono text-white">{plan}</h3>
                                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                                    {features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                                            <span className="font-mono">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-[var(--border-light)] backdrop-blur-md">
                        <p className="text-sm text-[var(--text-secondary)] font-mono">
                            <span className="font-bold text-white">Need custom infrastructure?</span>
                            <br />
                            Volume discounts, dedicated support, and custom integrations.
                            <button
                                type="button"
                                onClick={() => showComingSoon("Contact Sales flow")}
                                className="text-primary-400 hover:text-primary-300 ml-2 font-semibold transition-colors"
                            >
                                Contact Sales →
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -14, x: 16 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -14, x: 16 }}
                        className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 ${toast.type === "success"
                            ? "bg-green-500/10 border-green-500/25 text-green-300"
                            : toast.type === "error"
                                ? "bg-red-500/10 border-red-500/25 text-red-300"
                                : "bg-blue-500/10 border-blue-500/25 text-blue-300"
                            }`}
                    >
                        {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : toast.type === "error" ? <XCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        <span className="text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
