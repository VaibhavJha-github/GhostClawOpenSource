"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone,
    Mail,
    Calendar,
    BarChart3,
    ShoppingCart,
    Target,
    Layers,
    FileSearch,
    Send,
    TrendingUp,
    Users,
    Sparkles,
    NotebookPen,
    Calculator,
    Receipt,
    Handshake,
    Banknote,
    FileText,
    Plane,
    Briefcase,
    Binoculars,
    Headset,
    Kanban,
    Languages,
    Megaphone,
    Package,
    Video,
    Palette,
    Database,
} from "lucide-react";

interface DiscoveryIcon {
    id: string;
    icon: typeof Phone;
    label: string;
    description: string;
}

const discoveryIcons: DiscoveryIcon[] = [
    { id: "voice", icon: Phone, label: "Voice Calls", description: "AI-powered inbound/outbound calls" },
    { id: "email", icon: Mail, label: "Email", description: "Smart email automation" },
    { id: "calendar", icon: Calendar, label: "Booking", description: "Appointment scheduling" },
    { id: "analytics", icon: BarChart3, label: "Analytics", description: "Reports & insights" },
    { id: "cart", icon: ShoppingCart, label: "Cart Recovery", description: "Recover abandoned carts" },
    { id: "scoring", icon: Target, label: "Lead Scoring", description: "Qualify & route leads" },
    { id: "campaigns", icon: Layers, label: "Campaigns", description: "Multi-channel automation" },
    { id: "docs", icon: FileSearch, label: "Documents", description: "Review & analysis" },
    { id: "social", icon: Send, label: "Social", description: "Safe multi-platform posting" },
    { id: "ads", icon: TrendingUp, label: "Ads", description: "Ad optimization tools" },
    { id: "retention", icon: Users, label: "Retention", description: "Churn prevention" },
    { id: "content", icon: Sparkles, label: "Content", description: "AI-generated copy" },
    { id: "meeting-notes", icon: NotebookPen, label: "Meetings", description: "Transcribe & summarize meetings" },
    { id: "taxes", icon: Calculator, label: "Taxes", description: "Automate tax preparation" },
    { id: "expenses", icon: Receipt, label: "Expenses", description: "Track & categorize receipts" },
    { id: "negotiation", icon: Handshake, label: "Negotiate", description: "Auto-negotiate deals" },
    { id: "payroll", icon: Banknote, label: "Payroll", description: "Run global payroll" },
    { id: "invoices", icon: FileText, label: "Invoices", description: "Generate & send invoices" },
    { id: "travel", icon: Plane, label: "Travel", description: "Book flights & hotels" },
    { id: "recruiting", icon: Briefcase, label: "Hiring", description: "Draft JDs & screen candidates" },
    { id: "leads", icon: Target, label: "Lead Gen", description: "Scrape & enrich leads" },
    { id: "support", icon: Headset, label: "Support", description: "24/7 AI customer service" },
    { id: "projects", icon: Kanban, label: "Projects", description: "Manage tasks & sprints" },
    { id: "translation", icon: Languages, label: "Translate", description: "Real-time localization" },
    { id: "branding", icon: Palette, label: "Branding", description: "Generate logos & assets" },
    { id: "data", icon: Database, label: "Data", description: "Scrape & organize data" },
    { id: "influencer", icon: Megaphone, label: "Influencer", description: "Auto-pitch & collab" },
    { id: "inventory", icon: Package, label: "Inventory", description: "Predict & reorder" },
    { id: "ugc", icon: Video, label: "UGC", description: "Manage creators" },
];

interface DiscoveryBarProps {
    onIconClick: (iconId: string) => void;
    activeIcon: string | null;
}

export default function DiscoveryBar({ onIconClick, activeIcon }: DiscoveryBarProps) {
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

    return (
        <section className="relative py-20 px-4 overflow-hidden">
            {/* Warm gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-[var(--bg-muted)] to-[var(--bg-base)] opacity-50" />

            {/* Copper glow accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-600 opacity-5 blur-[100px] rounded-full" />

            <div className="relative max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 font-mono">
                        Explore All Capabilities
                    </h2>
                    <p className="text-lg text-[var(--text-muted)] font-mono">
                        Hover over each capability to learn more
                    </p>
                </motion.div>

                {/* Icons Grid */}
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {discoveryIcons.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeIcon === item.id;
                        const isHovered = hoveredIcon === item.id;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="relative group"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onIconClick(item.id)}
                                    onMouseEnter={() => setHoveredIcon(item.id)}
                                    onMouseLeave={() => setHoveredIcon(null)}
                                    className={`
                                        w-full aspect-square rounded-2xl 
                                        flex flex-col items-center justify-center gap-3 p-4
                                        transition-all duration-300
                                        ${isActive
                                            ? "bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-600/20"
                                            : "bg-[var(--bg-elevated)] border border-[var(--border-light)] hover:border-primary-500/50 hover:shadow-lg"
                                        }
                                    `}
                                >
                                    {/* Icon */}
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center
                                        transition-all duration-300
                                        ${isActive
                                            ? "bg-white/10"
                                            : "bg-primary-600/5 group-hover:bg-primary-600/10"
                                        }
                                    `}>
                                        <Icon className={`
                                            w-6 h-6 transition-colors
                                            ${isActive ? "text-white" : "text-primary-600"}
                                        `} />
                                    </div>

                                    {/* Label */}
                                    <span className={`
                                        text-xs font-medium text-center leading-tight font-mono
                                        ${isActive ? "text-white" : "text-[var(--text-secondary)]"}
                                    `}>
                                        {item.label}
                                    </span>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.button>

                                {/* Enhanced Tooltip */}
                                <AnimatePresence>
                                    {isHovered && !isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20"
                                        >
                                            <div className="relative px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-xl shadow-xl backdrop-blur-sm">
                                                {/* Arrow */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                                    <div className="w-2 h-2 bg-[var(--bg-elevated)] border-r border-b border-[var(--border-medium)] rotate-45" />
                                                </div>

                                                <p className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap mb-1">
                                                    {item.label}
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
