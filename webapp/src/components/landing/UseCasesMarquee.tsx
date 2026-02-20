"use client";

import { cn } from "@/lib/utils";
import {
    Mail,
    MessageSquareReply,
    Languages,
    Inbox,
    Headphones,
    FileText,
    Bell,
    CalendarPlus,
    CalendarDays,
    ClipboardList,
    Globe,
    Calculator,
    Receipt,
    Shield,
    CreditCard,
    AlarmClock,
    CircleDollarSign,
    Tag,
    Search,
    Percent,
    TrendingDown,
    GitCompare,
    Handshake,
    FilePenLine,
    Telescope,
    Users,
    FileSpreadsheet,
    Presentation,
    Plane,
    ChefHat,
    Share2,
    Newspaper,
    Target,
    Send,
    Briefcase,
    UsersRound,
    ChartColumn
} from "lucide-react";

const useCases = [
    // Row 1
    { icon: Mail, text: "Read & summarize email" },
    { icon: MessageSquareReply, text: "Draft replies and follow-ups" },
    { icon: Languages, text: "Translate messages in real time" },
    { icon: Inbox, text: "Organize your inbox" },
    { icon: Headphones, text: "Answer support tickets" },
    { icon: FileText, text: "Summarize long documents" },
    { icon: Bell, text: "Notify before a meeting" },
    { icon: CalendarPlus, text: "Schedule meetings from chat" },

    // Row 2
    { icon: AlarmClock, text: "Remind you of deadlines" },
    { icon: CalendarDays, text: "Plan your week" },
    { icon: ClipboardList, text: "Take meeting notes" },
    { icon: Globe, text: "Sync across time zones" },
    { icon: Calculator, text: "Do your taxes" },
    { icon: Receipt, text: "Track expenses and receipts" },
    { icon: Shield, text: "Compare insurance quotes" },
    { icon: CreditCard, text: "Manage subscriptions" },

    // Row 3
    { icon: Calculator, text: "Run payroll calculations" },
    { icon: CircleDollarSign, text: "Negotiate refunds" },
    { icon: Tag, text: "Find coupons" },
    { icon: Search, text: "Find best prices online" },
    { icon: Percent, text: "Find discount codes" },
    { icon: TrendingDown, text: "Price-drop alerts" },
    { icon: GitCompare, text: "Compare product specs" },
    { icon: Handshake, text: "Negotiate deals" },

    // Row 4
    { icon: FilePenLine, text: "Write contracts and NDAs" },
    { icon: Telescope, text: "Research competitors" },
    { icon: Users, text: "Screen and prioritize leads" },
    { icon: FileSpreadsheet, text: "Generate invoices" },
    { icon: Presentation, text: "Create presentations from bullet points" },
    { icon: Plane, text: "Book travel and hotels" },
    { icon: ChefHat, text: "Find recipes from ingredients" },
    { icon: Share2, text: "Draft social posts" },

    // Row 5
    { icon: Newspaper, text: "Monitor news and alerts" },
    { icon: Target, text: "Set and track goals" },
    { icon: Send, text: "Screen cold outreach" },
    { icon: Briefcase, text: "Draft job descriptions" },
    { icon: UsersRound, text: "Run standup summaries" },
    { icon: ChartColumn, text: "Track OKRs and KPIs" }
];

const styles = [
    "border border-white/5 bg-[var(--bg-elevated)]/50 text-[var(--text-primary)] hover:border-[var(--color-accent-primary)]/50", // Standard Card
    "border border-white/5 bg-gradient-to-r from-[var(--color-accent-primary)]/10 to-transparent text-[var(--text-primary)] hover:border-[var(--color-accent-primary)]/50", // Terracotta Gradient
    "border border-white/5 bg-[var(--bg-elevated)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)]", // Subtle Glass
    "bg-[var(--bg-elevated)] border border-white/5 text-[var(--text-primary)] shadow-sm shadow-black/20", // Solid Elevated
    "bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(217,119,87,0.1),transparent)] border border-[var(--color-accent-primary)]/20 text-[var(--text-primary)]", // Radial Glow (Terracotta tint)
    "bg-[var(--bg-base)] border border-white/5 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]", // Base Dark
    "border border-dashed border-[var(--color-text-dim)]/30 text-[var(--text-dim)] hover:text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/50" // Dashed Outline
];

const row1 = useCases.slice(0, 8);
const row2 = useCases.slice(8, 16);
const row3 = useCases.slice(16, 24);
const row4 = useCases.slice(24, 32);
const row5 = useCases.slice(32);

export default function UseCasesMarquee() {
    return (
        <section className="py-24 bg-[var(--bg-base)] relative overflow-hidden flex flex-col items-center justify-center min-w-0">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-[var(--bg-elevated)]/20 to-[var(--bg-base)] z-0 pointer-events-none" />

            <div className="relative z-10 w-full max-w-full overflow-hidden flex flex-col gap-4">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        What can GhostClaw do for you?
                    </h2>
                    <p className="text-xl text-[var(--text-muted)]">
                        One assistant, thousands of use cases
                    </p>
                </div>

                <MarqueeRow items={row1} direction="left" speed="45s" />
                <MarqueeRow items={row2} direction="right" speed="50s" />
                <MarqueeRow items={row3} direction="left" speed="55s" />
                <MarqueeRow items={row4} direction="right" speed="48s" />
                <MarqueeRow items={row5} direction="left" speed="60s" />

                {/* Fade Edges */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 md:w-20 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-20" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 md:w-20 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-20" aria-hidden="true" />
            </div>

            <div className="text-center mt-12 relative z-10 px-4">
                <p className="text-[var(--text-dim)] text-sm font-mono italic">
                    PS. You can add as many use cases as you want via natural language
                </p>
            </div>
        </section>
    );
}

function MarqueeRow({ items, direction, speed }: { items: typeof useCases, direction: "left" | "right", speed: string }) {
    return (
        <div
            className="group flex overflow-hidden p-2 flex-row gap-[0.5rem] sm:gap-[0.75rem]"
            style={{
                "--duration": speed,
                "--gap": "0.75rem"
            } as React.CSSProperties}
        >
            <div
                className={cn(
                    "flex shrink-0 justify-around gap-[0.75rem] animate-marquee flex-row group-hover:[animation-play-state:paused]",
                    direction === "right" && "[animation-direction:reverse]"
                )}
            >
                {items.map((item, i) => (
                    <MarqueeItem key={i} item={item} index={i} />
                ))}
            </div>
            <div
                className={cn(
                    "flex shrink-0 justify-around gap-[0.75rem] animate-marquee flex-row group-hover:[animation-play-state:paused]",
                    direction === "right" && "[animation-direction:reverse]"
                )}
                aria-hidden="true"
            >
                {items.map((item, i) => (
                    <MarqueeItem key={i} item={item} index={i} />
                ))}
            </div>
        </div>
    );
}

function MarqueeItem({ item, index }: { item: { icon: any, text: string }, index: number }) {
    const Icon = item.icon;
    const styleIndex = (item.text.length + index) % styles.length; // Deterministic random style
    const styleClass = styles[styleIndex];

    return (
        <span className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shrink-0 transition-all duration-300 hover:scale-105 cursor-default backdrop-blur-sm",
            styleClass
        )}>
            <Icon className="size-4 shrink-0 text-[var(--color-accent-secondary)] opacity-80 group-hover:opacity-100 transition-opacity" />
            {item.text}
        </span>
    );
}
