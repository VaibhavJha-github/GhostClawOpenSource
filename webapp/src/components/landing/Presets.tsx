"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Briefcase, Dumbbell, HardHat, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const presets = [
    {
        id: "ecommerce",
        name: "E-Commerce",
        icon: ShoppingCart,
        color: "from-orange-500 to-red-500",
        description: "Order support, abandoned cart recovery, review requests, and social selling.",
        skills: ["ElevenLabs Voice", "Calendly", "Zapier", "MinerU PDF"],
        useCases: ["Handle shipping questions", "Recover abandoned carts via call", "Automate order updates"],
    },
    {
        id: "saas",
        name: "SaaS",
        icon: Briefcase,
        color: "from-blue-500 to-cyan-500",
        description: "Lead qualification, demo scheduling, churn prevention, and customer success.",
        skills: ["Calendly", "Memory System", "Workflows", "Progressive Memory"],
        useCases: ["Qualify inbound leads", "Auto-schedule demos", "Monitor churn signals"],
    },
    {
        id: "gym",
        name: "Gym & Fitness",
        icon: Dumbbell,
        color: "from-green-500 to-emerald-500",
        description: "Class booking, member check-ins, retention calls, and local marketing.",
        skills: ["ElevenLabs Voice", "Calendly", "Booking System", "SMS"],
        useCases: ["Voice-based class booking", "Call inactive members", "Send workout reminders"],
    },
    {
        id: "construction",
        name: "Construction",
        icon: HardHat,
        color: "from-yellow-500 to-amber-500",
        description: "Quote generation, supplier outreach, project updates, and crew scheduling.",
        skills: ["MinerU PDF", "Workflows", "Memory System", "Email"],
        useCases: ["Generate quotes from specs", "Get supplier bids", "Update clients automatically"],
    },
];

export function Presets() {
    return (
        <section id="presets" className="relative py-24 sm:py-32 bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Choose Your
                        <span className="text-gradient"> Industry Preset</span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Pre-configured skill bundles for your business. Select a preset and get running in seconds.
                    </p>
                </motion.div>

                {/* Preset Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {presets.map((preset, index) => (
                        <motion.div
                            key={preset.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300"
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center mb-4`}>
                                <preset.icon className="w-7 h-7 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-2">{preset.name}</h3>
                            <p className="text-zinc-400 mb-4">{preset.description}</p>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {preset.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Use Cases */}
                            <ul className="space-y-2 mb-6">
                                {preset.useCases.map((useCase) => (
                                    <li key={useCase} className="flex items-start gap-2 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        {useCase}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link href={`/signup?preset=${preset.id}`}>
                                <Button variant="secondary" className="w-full group-hover:border-purple-500">
                                    Choose {preset.name}
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Custom Option */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <p className="text-zinc-400 mb-4">
                        Need something different? Browse all 100+ skills and build your own.
                    </p>
                    <Link href="/signup?preset=custom">
                        <Button variant="ghost">Create Custom Agent →</Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
