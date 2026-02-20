"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Check, MessageCircle, Send, AtSign, Zap, TrendingUp, Info } from "lucide-react";

type ModelOption = "claude" | "gpt4o";
type ChannelOption = "telegram" | "discord" | "whatsapp";

export default function DeployPage() {
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState<ModelOption>("gpt4o");
    const [selectedChannel, setSelectedChannel] = useState<ChannelOption>("telegram");
    const [toast, setToast] = useState<string | null>(null);

    // Dummy user for dev mode
    const dummyUser = {
        name: "Vaibhav Jha",
        email: "vaibhav130304@gmail.com",
        avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c"
    };

    const handleGoogleSignIn = () => {
        // DEV MODE: Auto-proceed to onboarding
        localStorage.setItem("ghostclaw_deploy_config", JSON.stringify({
            model: selectedModel,
            channel: selectedChannel,
        }));
        router.push("/onboarding");
    };

    const handleGitHubSignIn = () => {
        // DEV MODE: Auto-proceed to onboarding
        localStorage.setItem("ghostclaw_deploy_config", JSON.stringify({
            model: selectedModel,
            channel: selectedChannel,
        }));
        router.push("/onboarding");
    };

    const handleStartTrial = () => {
        // DEV MODE: Skip Stripe, go to onboarding
        localStorage.setItem("ghostclaw_deploy_config", JSON.stringify({
            model: selectedModel,
            channel: selectedChannel,
        }));
        router.push("/onboarding");
    };

    const models: { id: ModelOption; name: string; icon: string; badge?: string }[] = [
        { id: "claude", name: "Claude Sonnet 4.5", icon: "✳", badge: "Best for code" },
        { id: "gpt4o", name: "GPT-4o", icon: "⚙", badge: "Fast & smart" },
    ];

    const channels: { id: ChannelOption; name: string; icon: React.ReactNode; disabled?: boolean; badge?: string; disabledReason?: string }[] = [
        { id: "telegram", name: "Telegram", icon: <Send className="w-4 h-4" /> },
        { id: "discord", name: "Discord", icon: <MessageCircle className="w-4 h-4" />, disabled: true, badge: "Coming Soon", disabledReason: "Social channel backend is not shipped in this scope yet." },
        { id: "whatsapp", name: "WhatsApp", icon: <AtSign className="w-4 h-4" />, disabled: true, badge: "via dashboard", disabledReason: "WhatsApp integration remains disabled pending backend rollout." },
    ];

    const showDisabledToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    };

    return (
        <main className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600 opacity-10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-orange opacity-5 blur-[120px] rounded-full" />
            </div>

            {/* Back button */}
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
            </Link>

            <div className="relative z-10 text-center max-w-2xl w-full">
                {/* Header with animated badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 mb-8"
                >
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-semibold text-primary-600 font-mono">Launch in 60 Seconds</span>
                    </div>
                    <Zap className="w-4 h-4 text-primary-600" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold mb-4 tracking-tight font-mono"
                >
                    Deploy Your AI Employee
                    <br />
                    <span className="text-gradient-copper">In Under a Minute</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[var(--text-secondary)] text-lg mb-2 font-mono"
                >
                    Your own AI assistant on a secure cloud server,
                    <br />
                    preconfigured and ready to chat via Telegram.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center justify-center gap-6 mb-8"
                >
                    <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono">
                        <TrendingUp className="w-4 h-4 text-primary-600" />
                        <span>48hr free trial</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)] font-mono">
                        <Sparkles className="w-4 h-4 text-primary-600" />
                        <span>BYO API keys</span>
                    </div>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl p-8 text-left shadow-2xl"
                >
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/10 text-primary-600 text-sm font-mono">
                            <span className="font-bold">Step 1 of 3</span>
                        </div>
                    </div>

                    {/* Model Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-3 font-mono">
                            Choose Your AI Model
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {models.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`flex flex-col items-start gap-2 px-4 py-4 rounded-xl border transition-all ${selectedModel === model.id
                                        ? "bg-primary-600/10 border-primary-600/50 text-white shadow-lg"
                                        : "bg-[var(--bg-base)] border-[var(--border-light)] text-[var(--text-muted)] hover:border-primary-600/30"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="text-2xl">{model.icon}</span>
                                        <span className="font-semibold font-mono flex-1">{model.name}</span>
                                        {selectedModel === model.id && <Check className="w-5 h-5 text-primary-600" />}
                                    </div>
                                    {model.badge && (
                                        <span className="text-xs text-[var(--text-dim)] font-mono">{model.badge}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Channel Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-3 font-mono">
                            Select Communication Channel
                        </label>
                        <div className="flex gap-3">
                            {channels.map((channel) => (
                                <button
                                    key={channel.id}
                                    onClick={() => {
                                        if (channel.disabled) {
                                            showDisabledToast(channel.disabledReason || `${channel.name} is currently unavailable.`);
                                            return;
                                        }
                                        setSelectedChannel(channel.id);
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border transition-all ${selectedChannel === channel.id
                                        ? "bg-primary-600/10 border-primary-600/50 text-white"
                                        : channel.disabled
                                            ? "bg-[var(--bg-base)] border-[var(--border-light)] text-[var(--text-dim)] cursor-not-allowed opacity-50"
                                            : "bg-[var(--bg-base)] border-[var(--border-light)] text-[var(--text-muted)] hover:border-primary-600/30"
                                        }`}
                                >
                                    {channel.icon}
                                    <span className="font-medium font-mono">{channel.name}</span>
                                    {channel.badge && (
                                        <span className="text-xs text-[var(--text-dim)] font-mono">({channel.badge})</span>
                                    )}
                                    {selectedChannel === channel.id && !channel.disabled && (
                                        <Check className="w-4 h-4 ml-1 text-primary-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-[var(--text-dim)] font-mono mt-2">
                            Discord/WhatsApp stay disabled for now because Socials backend support is not in this scope.
                        </p>
                    </div>

                    <div className="h-px bg-[var(--border-light)] my-6" />

                    {/* Auth buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={handleGoogleSignIn}
                            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all shadow-lg font-mono"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={handleGitHubSignIn}
                            className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#24292e] text-white font-semibold hover:bg-[#2f363d] transition-all shadow-lg font-mono border border-[var(--border-light)]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                </motion.div>


                {/* Trust indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2 mt-6"
                >
                    <div className="flex -space-x-2">
                        {['V', 'M', 'S', 'A'].map((initial, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 border-2 border-[var(--bg-base)] flex items-center justify-center text-white text-xs font-bold"
                            >
                                {initial}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] font-mono">
                        Join <span className="text-primary-600 font-bold">340+</span> businesses already deployed
                    </span>
                </motion.div>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -12, x: 12 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -12, x: 12 }}
                        className="fixed top-6 right-6 z-50 rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-200 px-4 py-3 text-sm font-mono flex items-center gap-2 shadow-xl"
                    >
                        <Info className="w-4 h-4" />
                        <span>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
