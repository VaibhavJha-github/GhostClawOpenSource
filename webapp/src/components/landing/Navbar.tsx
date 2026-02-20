"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Earn", href: "/earn" },
    { label: "Blog", href: "/blog" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${scrolled ? "w-[90%] md:w-[600px]" : "w-[95%] md:w-[700px]"
                    }`}
            >
                <div className="glass rounded-full px-4 py-3 border border-[var(--border-light)] shadow-2xl shadow-black/20 bg-[var(--bg-secondary)]/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 pl-2">
                            <img
                                src="/ghostclaw.png"
                                alt="GhostClaw Logo"
                                className="w-8 h-8 object-contain"
                            />
                            <span className="font-bold text-sm md:text-base text-white tracking-tight hidden sm:block">
                                GhostClaw
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1 bg-[var(--bg-tertiary)]/50 rounded-full px-2 py-1 border border-white/5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-xs font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop CTAs */}
                        <div className="hidden md:flex items-center gap-2 pr-1">
                            <Link
                                href="/login"
                                className="text-xs font-medium text-[var(--text-muted)] hover:text-white px-3 py-1.5 transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-[var(--primary-500)] hover:bg-[var(--primary-400)] text-white text-xs font-bold py-2 px-4 rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/20 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-20 left-4 right-4 z-50 md:hidden"
                        >
                            <div className="glass rounded-2xl p-4 border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl">
                                <div className="flex flex-col space-y-1">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="block px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="h-px bg-[var(--border)] my-2" />
                                    <Link
                                        href="/login"
                                        className="block px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 text-center transition-all"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="block px-4 py-3 rounded-xl text-sm font-bold bg-[var(--primary-500)] text-white text-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                                    >
                                        Start Free Trial
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
