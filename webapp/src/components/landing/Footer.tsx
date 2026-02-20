"use client";

import Link from "next/link";
import { Zap, Send, Github } from "lucide-react";

// Custom Icons for X and Discord
const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.43 13.43 0 0 0-1.044 2.135 18.455 18.455 0 0 0-4.609 0c-.297-.735-.61-1.455-1.044-2.135a.074.074 0 0 0-.079-.037 19.782 19.782 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.018.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.076.076 0 0 0-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.018.077.077 0 0 0 .032-.054c.5-5.177-2.595-9.699-6.494-13.655a.076.076 0 0 0-.029-.029z" />
    </svg>
);

const footerLinks = {
    product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Skills", href: "/skills" },
        { label: "Changelog", href: "/changelog" },
    ],
    company: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
    ],
    legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
    ],
};

const socialLinks = [
    { icon: XIcon, href: "https://twitter.com/ultimateclaw", label: "X (Twitter)" },
    { icon: DiscordIcon, href: "https://discord.gg/ultimateclaw", label: "Discord" },
    { icon: Github, href: "https://github.com/ultimateclaw", label: "GitHub" },
];

export default function Footer() {
    return (
        <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] pt-16 pb-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-5 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="/ghostclaw.png"
                                alt="GhostClaw Logo"
                                className="w-8 h-8 object-contain"
                            />
                            <span className="font-bold text-lg text-white">GhostClaw</span>
                        </Link>
                        <p className="text-sm text-[var(--text-muted)] mb-4 max-w-xs">
                            AI employees that never sleep. Deploy autonomous agents in 30 seconds.
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Product</h4>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[var(--text-dim)]">
                        © {new Date().getFullYear()} GhostClaw. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
                        <Send className="w-4 h-4 text-orange-400" />
                        <span>Primary support via</span>
                        <a href="mailto:support@ghostclaw.ai" className="text-orange-400 hover:underline">
                            Email
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
