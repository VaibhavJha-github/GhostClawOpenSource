"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Star } from "lucide-react";
import Link from "next/link";

interface Plan {
    name: string;
    price: number;
    specs: string;
    popular: boolean;
    features: string[];
    priceId: string;  // Stripe Price ID
}

const defaultPlans: Plan[] = [
    {
        name: "Starter",
        price: 49,
        specs: "2 vCPU • 2 GB RAM • 20 GB SSD",
        popular: false,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "starter-plan",
        features: [
            "1 AI agent deployment",
            "BYO API keys (all providers)",
            "All integrations included",
            "All AI models (Claude, GPT)",
            "Browser automation & web search",
            "Cancel anytime"
        ],
    },
    {
        name: "Pro",
        price: 99,
        specs: "2 vCPU • 4 GB RAM • 50 GB SSD",
        popular: true,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "professional-plan",
        features: [
            "1 AI agent deployment",
            "BYO API keys (all providers)",
            "All integrations included",
            "All AI models (Claude, GPT)",
            "More RAM & storage",
            "Priority support"
        ],
    },
    {
        name: "Enterprise",
        price: 219,
        specs: "4 vCPU • 8 GB RAM • 100 GB SSD",
        popular: false,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "enterprise-plan",
        features: [
            "Up to 5 AI agent deployments",
            "BYO API keys (all providers)",
            "All integrations included",
            "All AI models (Claude, GPT)",
            "High performance server",
            "Dedicated support"
        ],
    },
];

export default function Pricing() {
    const [plans, setPlans] = useState<Plan[]>(defaultPlans);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch("/api/prices");
                if (!res.ok) throw new Error("Failed to fetch prices");
                const data = await res.json();

                setPlans(prevPlans => prevPlans.map(plan => {
                    const key = plan.name.toLowerCase(); // starter, pro, business
                    if (data[key]) {
                        return {
                            ...plan,
                            price: data[key].amount,
                            priceId: data[key].id || plan.priceId
                        };
                    }
                    return plan;
                }));
            } catch (error) {
                console.error("Error fetching prices:", error);
            }
        };

        fetchPrices();
    }, []);

    return (
        <section id="pricing" className="relative py-32 px-4 overflow-hidden">
            {/* Warm background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-[var(--bg-muted)] to-[var(--bg-base)] opacity-60" />
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary-600 opacity-5 blur-[120px] rounded-full" />

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
                        <span className="text-sm font-medium text-primary-600">Simple Pricing</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-mono">
                        Choose Your{" "}
                        <span className="text-gradient-copper">Perfect Plan</span>
                    </h2>
                    <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-mono">
                        All plans include deployment, BYO API keys, and access to every feature.
                        <br />
                        <span className="text-primary-600 font-medium">48-hour free trial. Credit card required.</span>
                    </p>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            className={`
                                relative group
                                ${plan.popular ? 'md:-translate-y-4' : ''}
                            `}
                        >
                            {/* Card */}
                            <div className={`
                                relative h-full rounded-3xl p-8 
                                transition-all duration-500
                                ${plan.popular
                                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-2xl shadow-primary-600/20 border-2 border-primary-500'
                                    : 'bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-primary-600/30 hover:shadow-xl'
                                }
                            `}>
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-primary-700 text-xs font-bold shadow-lg">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            MOST POPULAR
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="mb-8">
                                    <h3 className={`text-2xl font-bold mb-2 font-mono ${plan.popular ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm font-mono ${plan.popular ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                                        {plan.specs}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className={`text-5xl md:text-6xl font-bold ${plan.popular ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                                            ${plan.price}
                                        </span>
                                        <span className={`text-lg ${plan.popular ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                                            /month
                                        </span>
                                    </div>
                                    <div className={`
                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                                        ${plan.popular
                                            ? 'bg-white/10 text-white'
                                            : 'bg-primary-600/10 text-primary-600'
                                        }
                                    `}>
                                        <Zap className="w-4 h-4" />
                                        BYO API keys
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <Link
                                    href="/signup"
                                    className={`
                                        block text-center py-4 px-6 rounded-2xl font-bold text-lg
                                        transition-all duration-300 mb-8
                                        ${plan.popular
                                            ? "bg-white text-primary-700 hover:bg-white/90 hover:scale-105 shadow-lg"
                                            : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 hover:shadow-lg"
                                        }
                                    `}
                                >
                                    Start Free Trial
                                </Link>

                                {/* Features */}
                                <div className="space-y-4">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className={`
                                                flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
                                                ${plan.popular ? 'bg-white/20' : 'bg-primary-600/10'}
                                            `}>
                                                <Check className={`w-3.5 h-3.5 ${plan.popular ? 'text-white' : 'text-primary-600'}`} />
                                            </div>
                                            <span className={`text-sm ${plan.popular ? 'text-white/90' : 'text-[var(--text-secondary)]'}`}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <p className="text-[var(--text-muted)] font-mono">
                        All plans include a 48-hour free trial • BYO API keys • Cancel anytime
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
