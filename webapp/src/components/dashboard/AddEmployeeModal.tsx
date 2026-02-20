"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Zap, Info } from "lucide-react";

interface Plan {
    id: "starter" | "professional" | "enterprise";
    name: string;
    badge?: string;
    specs: string;
    price: number;
}

const plans: Plan[] = [
    {
        id: "starter",
        name: "Starter",
        badge: "0 AVAIL",
        specs: "2 vCPU · 2GB · 20GB",
        price: 49,
    },
    {
        id: "professional",
        name: "Professional",
        badge: "POPULAR",
        specs: "2 vCPU · 4GB · 50GB",
        price: 99,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        specs: "4 vCPU · 8GB · 100GB",
        price: 200,
    },
];

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase?: (planId: string, quantity: number) => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onPurchase }: AddEmployeeModalProps) {
    const [quantities, setQuantities] = useState<Record<string, number>>({
        starter: 1,
        professional: 1,
        enterprise: 1,
    });
    const [toast, setToast] = useState<{ type: "info" | "error"; message: string } | null>(null);

    const handleQuantityChange = (planId: string, delta: number) => {
        setQuantities((prev) => ({
            ...prev,
            [planId]: Math.max(1, Math.min(10, prev[planId] + delta)),
        }));
    };

    const handleBuy = (plan: Plan) => {
        if (onPurchase) {
            onPurchase(plan.id, quantities[plan.id]);
            return;
        }
        setToast({ type: "info", message: "In-modal checkout is coming soon. Use Billing page for now." });
        setTimeout(() => setToast(null), 2600);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative z-10 w-full max-w-3xl bg-[#0d0d10] border border-[var(--border-glass)] rounded-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-glass)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Add Another Employee</h2>
                                <p className="text-sm text-[var(--text-muted)]">Choose a plan for your new AI employee</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>
                    </div>

                    {/* Table */}
                    <div className="p-6">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr] gap-4 px-4 pb-3 text-xs font-medium text-[var(--text-dim)] uppercase tracking-wider">
                            <span>Plan</span>
                            <span>Specs</span>
                            <span>Price</span>
                            <span className="text-right">Quantity</span>
                        </div>

                        {/* Table Rows */}
                        <div className="space-y-2">
                            {plans.map((plan) => {
                                const isSoldOut = plan.badge === "0 AVAIL";
                                return (
                                    <div
                                        key={plan.id}
                                        className={`grid grid-cols-[1.5fr_1.5fr_1fr_1fr] gap-4 items-center px-4 py-4 rounded-xl border transition-colors ${plan.badge === "POPULAR"
                                            ? "bg-orange-500/5 border-orange-500/20"
                                            : "bg-white/2 border-[var(--border-glass)] hover:bg-white/3"
                                            }`}
                                    >
                                        {/* Plan Name */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{plan.name}</span>
                                            {plan.badge && (
                                                <span className={`text-xs px-2 py-0.5 rounded ${plan.badge === "POPULAR"
                                                    ? "bg-orange-500/20 text-orange-400"
                                                    : "bg-green-500/20 text-green-400"
                                                    }`}>
                                                    {plan.badge}
                                                </span>
                                            )}
                                        </div>

                                        {/* Specs */}
                                        <span className="text-sm text-[var(--text-muted)]">{plan.specs}</span>

                                        {/* Price */}
                                        <div>
                                            <span className="text-lg font-bold">${plan.price}</span>
                                            <span className="text-sm text-[var(--text-muted)]">/mo</span>
                                        </div>

                                        {/* Quantity + Buy */}
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-[var(--border-glass)]">
                                                <button
                                                    onClick={() => handleQuantityChange(plan.id, -1)}
                                                    className="p-1.5 hover:bg-white/5 transition-colors"
                                                    disabled={quantities[plan.id] <= 1 || isSoldOut}
                                                >
                                                    <Minus className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                </button>
                                                <span className="w-6 text-center text-sm font-medium">
                                                    {quantities[plan.id]}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(plan.id, 1)}
                                                    className="p-1.5 hover:bg-white/5 transition-colors"
                                                    disabled={quantities[plan.id] >= 10 || isSoldOut}
                                                >
                                                    <Plus className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                </button>
                                            </div>
                                            <div className="relative group/comingsoon">
                                                <button
                                                    onClick={() => {
                                                        if (isSoldOut) {
                                                            setToast({ type: "error", message: `${plan.name} plan is currently unavailable.` });
                                                            setTimeout(() => setToast(null), 2400);
                                                            return;
                                                        }
                                                        handleBuy(plan);
                                                    }}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isSoldOut
                                                        ? "bg-white/3 text-[var(--text-dim)] border-white/5 cursor-not-allowed"
                                                        : "bg-white/5 hover:bg-white/10 border-[var(--border-glass)]"
                                                        }`}
                                                >
                                                    Buy
                                                </button>
                                                {!onPurchase && !isSoldOut && (
                                                    <div className="absolute right-0 bottom-full mb-2 w-52 rounded-lg border border-white/10 bg-black/85 px-3 py-2 text-[11px] text-[var(--text-secondary)] opacity-0 group-hover/comingsoon:opacity-100 transition-opacity pointer-events-none z-10">
                                                        Checkout integration here is coming soon.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-[var(--border-glass)] flex items-center justify-between">
                        <p className="text-sm text-[var(--text-dim)]">
                            All plans include 48-hour free trial
                        </p>
                        <button
                            onClick={onClose}
                            className="btn-glass px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>
                    </div>

                    <AnimatePresence>
                        {toast && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`absolute bottom-4 right-4 rounded-lg border px-3 py-2 text-xs flex items-center gap-2 shadow-xl ${toast.type === "error"
                                    ? "bg-red-500/10 border-red-500/25 text-red-200"
                                    : "bg-blue-500/10 border-blue-500/25 text-blue-200"
                                    }`}
                            >
                                <Info className="w-3.5 h-3.5" />
                                <span>{toast.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
