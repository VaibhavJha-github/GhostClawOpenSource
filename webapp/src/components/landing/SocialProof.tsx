"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Testimonial {
    name: string;
    handle: string;
    avatar: string; // URL or placeholder color
    content: string;
    highlight?: boolean;
}

const testimonials: Testimonial[] = [
    {
        name: "Priya Sharma",
        handle: "@priyacodes_",
        avatar: "/avatars/priya.jpg",
        content: "My community: 5K members. Questions per day: ~200. Me before GhostClaw: drowning. Me after: vibing. Gemini 1.5 Flash handles everything. Haven't answered a support question in 3 weeks.",
        highlight: false,
    },
    {
        name: "Nikhil Kamath",
        handle: "@nikhilhacks",
        avatar: "/avatars/nikhil.jpg",
        content: "Just deployed GhostClaw for our community chat. Claude Opus handling member questions better than most humans on our team. 60 second setup is not cap—actually wild.",
    },
    {
        name: "Rachel Chen",
        handle: "@racheladev",
        avatar: "/avatars/rachel.jpg",
        content: "I was skeptical about ClawBot but it literally saved my SaaS. My support channel was a disaster—now the bot handles 90% of questions with actual context from past conversations.",
    },
    {
        name: "Arjun Mehta",
        handle: "@arjunbuilds",
        avatar: "/avatars/arjun.jpg",
        content: "GhostClaw + GPT-5.2 is genuinely the best combo I've tried this year. Tool calling integration is chef's kiss. My dev community bot went from useless to invaluable overnight.",
    },
    {
        name: "Maya Rodriguez",
        handle: "@mayaisthecode",
        avatar: "/avatars/maya.jpg",
        content: "Switched from custom bot infrastructure to GhostClaw. Saved ~$200/month instantly. The 'one click deploy' is not marketing BS—I timed it, took 47 seconds from signup to live bot.",
    },
    {
        name: "James Kim",
        handle: "@jamesk_css",
        avatar: "/avatars/james.jpg",
        content: "The fact that my bot uses DeepSeek R1 and costs almost nothing is insane. Open source models + GhostClaw = unlimited AI bots for my entire team. Game changer.",
    },
    {
        name: "Luna Park",
        handle: "@luna_ships",
        avatar: "/avatars/luna.jpg",
        content: "GhostClaw just works. Connected my channel -> picked Kimi K2.5 -> hit deploy. 60 seconds later: fully functional AI assistant. I've spent entire weekends trying to do this with LangChain.",
    },
    {
        name: "Omar Hassan",
        handle: "@omarh_ai",
        avatar: "/avatars/omar.jpg",
        content: "Grok 4.1 on GhostClaw is absolutely cracked. 2M context window?? My bot literally remembers entire conversation histories from weeks ago. This changes everything.",
    },
    {
        name: "Ava Martinez",
        handle: "@ava_devs",
        avatar: "/avatars/ava.jpg",
        content: "Been building chat bots for 3 years. GhostClaw is the first platform that made me feel like I wasted all that time. Deploy -> done. No servers, no YAML, no headaches. 10/10.",
    },
    {
        name: "David Zhang",
        handle: "@davidz_dev",
        avatar: "/avatars/david.jpg",
        content: "The ROI on GhostClaw is ridiculous. Cut support costs by 70% in month one. The bot handles technical questions better than our junior devs. Not replacing humans—augmenting them perfectly.",
    },
    {
        name: "Sophie Anderson",
        handle: "@sophie_codes",
        avatar: "/avatars/sophie.jpg",
        content: "Deployed 4 different bots across our Discord and Slack communities. Each one tailored to different audiences. The multi-model support means I can optimize for cost vs. capability per use case.",
    },
    {
        name: "Marcus Johnson",
        handle: "@marcusjbuilds",
        avatar: "/avatars/marcus.jpg",
        content: "Watched someone build an entire customer support pipeline with ClawBot in under 5 minutes on stream. No code, no Docker, no .env files. Just pick model -> connect channel -> deploy. This is the future.",
    },
];

export default function SocialProof() {
    // Split testimonials into two rows
    const row1 = testimonials.slice(0, 6);
    const row2 = testimonials.slice(6, 12);

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[var(--bg-secondary)]/20 to-black z-0" />

            <div className="relative z-10 w-full">
                <div className="text-center mb-16 max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Everyone is Working <span className="text-blue-500">Smarter</span>. Why Not <br />
                        <span className="text-white">You?</span>
                    </h2>
                    <p className="text-[var(--text-muted)] mt-4">
                        Join thousands of people using GhostClaw to save hours every week—no tech skills required.
                    </p>
                </div>

                {/* Sliders Container */}
                <div className="flex flex-col gap-6 relative max-w-7xl mx-auto overflow-hidden">
                    {/* Fade Edges */}
                    <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

                    {/* Row 1 - Left */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            className="flex gap-6 flex-nowrap"
                            animate={{ x: [0, "-50%"] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 30
                            }}
                            style={{ width: "max-content" }}
                        >
                            {[...row1, ...row1].map((t, i) => (
                                <div
                                    key={`${t.handle}-${i}`}
                                    className="w-[300px] md:w-[400px] flex-shrink-0 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-6 hover:border-[var(--border)] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">{t.name}</div>
                                            <div className="text-[var(--text-dim)] text-xs">{t.handle}</div>
                                        </div>
                                        <div className="ml-auto text-[var(--text-dim)] hover:text-white cursor-pointer">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                        {t.content}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Row 2 - Right */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            className="flex gap-6 flex-nowrap"
                            animate={{ x: ["-50%", 0] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 35
                            }}
                            style={{ width: "max-content" }}
                        >
                            {[...row2, ...row2].map((t, i) => (
                                <div
                                    key={`${t.handle}-${i}`}
                                    className="w-[300px] md:w-[400px] flex-shrink-0 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-2xl p-6 hover:border-[var(--border)] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">{t.name}</div>
                                            <div className="text-[var(--text-dim)] text-xs">{t.handle}</div>
                                        </div>
                                        <div className="ml-auto text-[var(--text-dim)] hover:text-white cursor-pointer">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                        {t.content}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
