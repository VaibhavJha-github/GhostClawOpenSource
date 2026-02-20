"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Zap,
    ShoppingCart,
    Store,
    Monitor,
    Megaphone,
    Briefcase,
    PenTool,
    Key,
    CreditCard,
    ShieldCheck,
    Loader2,
    X,
    Rocket,
    User,
    Brain,
    Sparkles,
    Shield,
    Star,
    MessageCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_SKILLS_MAP } from "@/lib/skills";
import { PROVIDER_OPTIONS } from "@/lib/agent-config";
import { authFetch } from "@/lib/auth-fetch";
import type { BusinessType } from "@/components/BusinessTypePopup";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface WizardData {
    // Step 1 - Name + Personality
    agentName: string;
    personality: "atlas" | "nova" | "max" | "sage";
    // Step 2 - Plan
    plan: "starter" | "professional" | "enterprise";
    stripeSessionId: string;
    // Step 3 - Telegram
    telegramToken: string;
    botName: string;
    botId: string;
    // Step 4 - Brain + API Key
    llmProvider: string;
    llmApiKey: string;
    // Step 5 - Use Case
    businessTypes: BusinessType[];
    customInput: string;
    // Step 6 - Skills
    selectedSkills: string[];
    // Step 7 - Deploy
    agentId: string | null;
    deployStatus: "idle" | "deploying" | "polling" | "ready" | "error";
}

const personalities = [
    { id: "atlas" as const, name: "Atlas", emoji: "🏛️", description: "Professional & reliable", traits: "Formal tone, thorough, data-driven" },
    { id: "nova" as const, name: "Nova", emoji: "✨", description: "Creative & enthusiastic", traits: "Friendly, innovative, proactive" },
    { id: "max" as const, name: "Max", emoji: "⚡", description: "Fast & efficient", traits: "Direct, concise, action-oriented" },
    { id: "sage" as const, name: "Sage", emoji: "🧠", description: "Wise & analytical", traits: "Thoughtful, strategic, detailed" },
];

const businessOptions: { id: BusinessType; name: string; icon: typeof ShoppingCart; description: string }[] = [
    { id: "ecommerce", name: "E-Commerce", icon: ShoppingCart, description: "Online stores & dropshipping" },
    { id: "local", name: "Local Services", icon: Store, description: "Physical businesses & services" },
    { id: "saas", name: "SaaS", icon: Monitor, description: "Software companies" },
    { id: "agency", name: "Agency", icon: Megaphone, description: "Marketing & creative work" },
    { id: "professional", name: "Professional", icon: Briefcase, description: "Knowledge-based services" },
    { id: "custom", name: "Something Else", icon: PenTool, description: "Tell us what you do" },
];

const plans = [
    {
        id: "starter" as const,
        name: "Starter",
        price: "$49",
        period: "/mo",
        description: "Perfect for getting started",
        features: ["1 AI Employee", "t2.micro instance", "BYO API keys", "Email + Chat support"],
        icon: Zap,
        popular: false,
    },
    {
        id: "professional" as const,
        name: "Pro",
        price: "$99",
        period: "/mo",
        description: "For growing businesses",
        features: ["1 AI Employee", "t3.small instance", "BYO API keys", "Priority support", "Advanced skills"],
        icon: Star,
        popular: true,
    },
    {
        id: "enterprise" as const,
        name: "Enterprise",
        price: "$219",
        period: "/mo",
        description: "Maximum power",
        features: ["1 AI Employee", "t3.medium instance", "BYO API keys", "Dedicated support", "All skills", "Custom config"],
        icon: Shield,
        popular: false,
    },
];

const providerOptions = PROVIDER_OPTIONS;

export default function NewAgentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </div>
        }>
            <NewAgentWizard />
        </Suspense>
    );
}

function NewAgentWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const billingDisabled = process.env.NEXT_PUBLIC_OPEN_SOURCE_MODE !== "false";

    const [step, setStep] = useState<WizardStep>(1);
    const [data, setData] = useState<WizardData>({
        agentName: "",
        personality: "atlas",
        plan: "starter",
        stripeSessionId: "",
        telegramToken: "",
        botName: "",
        botId: "",
        llmProvider: "anthropic",
        llmApiKey: "",
        businessTypes: [],
        customInput: "",
        selectedSkills: [],
        agentId: null,
        deployStatus: "idle",
    });

    // UI state
    const [isValidatingToken, setIsValidatingToken] = useState(false);
    const [tokenError, setTokenError] = useState("");
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Handle return from Stripe
    useEffect(() => {
        const stepParam = searchParams.get("step");
        const sessionId = searchParams.get("session_id");
        const planParam = searchParams.get("plan");

        if (stepParam) {
            const stepNum = parseInt(stepParam, 10);
            if (stepNum >= 1 && stepNum <= 7) {
                setStep(stepNum as WizardStep);
            }
        }
        if (sessionId) {
            setData(prev => ({ ...prev, stripeSessionId: sessionId }));
        }
        if (planParam) {
            setData(prev => ({ ...prev, plan: planParam as WizardData["plan"] }));
        }
    }, [searchParams]);

    // Auto-select skills when business types change
    useEffect(() => {
        if (data.businessTypes.length > 0) {
            const allSkills = data.businessTypes
                .flatMap(type => CATEGORY_SKILLS_MAP[type as BusinessType] || [])
                .filter((skill, index, arr) => arr.findIndex(s => s.id === skill.id) === index);
            setData(prev => ({
                ...prev,
                selectedSkills: allSkills.map(s => s.id), // Use skill.id (slug/owner) instead of skill.slug
            }));
        }
    }, [data.businessTypes]);

    // --- Step 3: Telegram Validation ---
    const validateTelegramToken = async () => {
        const token = data.telegramToken.trim();
        if (!/^\d+:[A-Za-z0-9_-]{35,}$/.test(token)) {
            setTokenError("Invalid format - should look like 123456:ABC-DEF...");
            return;
        }

        setIsValidatingToken(true);
        setTokenError("");

        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
            const result = await response.json();
            if (result.ok) {
                setData(prev => ({
                    ...prev,
                    botName: result.result.first_name,
                    botId: result.result.id.toString(),
                }));
                setStep(4);
            } else {
                setTokenError("Token not found or expired - check @BotFather");
            }
        } catch {
            setTokenError("Network error - please try again");
        } finally {
            setIsValidatingToken(false);
        }
    };

    // --- Step 2: Stripe Checkout ---
    const handleStripeCheckout = async (selectedPlan: WizardData["plan"]) => {
        if (!user) return;
        if (billingDisabled) {
            setData(prev => ({ ...prev, plan: selectedPlan }));
            setStep(3);
            return;
        }
        setData(prev => ({ ...prev, plan: selectedPlan }));
        setIsCheckingOut(true);
        try {
            const appUrl = window.location.origin;
            const res = await authFetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    plan: selectedPlan,
                    successUrl: `${appUrl}/dashboard/new?step=3&session_id={CHECKOUT_SESSION_ID}&plan=${selectedPlan}`,
                    cancelUrl: `${appUrl}/dashboard/new?step=2`,
                }),
            });

            if (res.ok) {
                const { checkoutUrl } = await res.json();
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                    return;
                }
            }
            alert("Failed to create checkout session");
        } catch {
            alert("Connection error. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    // --- Step 5: Business Type ---
    const toggleBusinessType = (id: BusinessType) => {
        setData(prev => ({
            ...prev,
            businessTypes: prev.businessTypes.includes(id)
                ? prev.businessTypes.filter(t => t !== id)
                : [...prev.businessTypes, id],
        }));
    };

    // --- Step 6: Skills ---
    const toggleSkill = (id: string) => {
        setData(prev => ({
            ...prev,
            selectedSkills: prev.selectedSkills.includes(id)
                ? prev.selectedSkills.filter(s => s !== id)
                : [...prev.selectedSkills, id],
        }));
    };

    // --- Step 7: Deploy ---
    const handleDeploy = async () => {
        if (!user) return;

        setData(prev => ({ ...prev, deployStatus: "deploying" }));

        const provider = providerOptions.find(p => p.id === data.llmProvider);

        try {
            const response = await authFetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    agentName: data.agentName || "Agent",
                    personality: data.personality,
                    telegramBotToken: data.telegramToken,
                    useCase: data.businessTypes.join(","),
                    skills: data.selectedSkills,
                    llmProvider: data.llmProvider,
                    llmModel: provider?.defaultModel || "anthropic/claude-sonnet-4-5",
                    llmApiKey: data.llmApiKey,
                    plan: data.plan,
                    stripeSessionId: data.stripeSessionId || undefined,
                }),
            });

            if (response.ok) {
                const resData = await response.json();
                const newAgentId = resData.agentId || resData.agent?.id;
                setData(prev => ({
                    ...prev,
                    agentId: newAgentId,
                    deployStatus: "polling",
                }));
                pollForReady(newAgentId);
            } else {
                const err = await response.json();
                setData(prev => ({ ...prev, deployStatus: "error" }));
                alert(`Deployment failed: ${err.error || "Unknown error"}`);
            }
        } catch {
            setData(prev => ({ ...prev, deployStatus: "error" }));
            alert("Connection failed. Please try again.");
        }
    };

    const pollForReady = useCallback((agentId: string) => {
        let attempts = 0;
        const maxAttempts = 40;

        const poll = setInterval(async () => {
            attempts++;
            try {
                const res = await authFetch(`/api/agents/${agentId}`);
                if (res.ok) {
                    const { agent } = await res.json();
                    const status = agent.instance_status?.state || agent.status;
                    if (status === "running" || status === "online") {
                        clearInterval(poll);
                        setData(prev => ({ ...prev, deployStatus: "ready" }));
                        // Redirect to the new employee's dashboard
                        router.push(`/dashboard/employees/${agentId}`);
                        return;
                    }
                }
            } catch { /* continue polling */ }

            if (attempts >= maxAttempts) {
                clearInterval(poll);
                setData(prev => ({ ...prev, deployStatus: "ready" }));
                router.push(`/dashboard/employees/${agentId}`);
            }
        }, 3000);
    }, [router]);

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as WizardStep);
    };

    const stepLabels = ["Name", "Plan", "Telegram", "Brain", "Use Case", "Skills", "Deploy"];

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold font-mono mb-1">Add New Employee</h1>
                <p className="text-[var(--text-muted)] text-sm">Deploy a new AI agent in minutes</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-1 mb-8 relative">
                {/* Connecting line background */}
                <div className="absolute top-[15px] left-0 w-full h-[1px] bg-white/10 -z-10" />

                {stepLabels.map((label, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === step;
                    const isComplete = stepNum < step;
                    return (
                        <div key={label} className="flex items-center flex-1 relative">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all z-10 ${isComplete ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110" :
                                    isActive ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.6)] scale-125 ring-2 ring-orange-500/30" :
                                        "bg-[#1A1817] text-[var(--text-dim)] border border-white/10"
                                    }`}>
                                    {isComplete ? <Check className="w-4 h-4" /> : stepNum}
                                </div>
                                <span className={`text-[10px] mt-2 font-mono uppercase tracking-widest transition-colors ${isActive ? "text-orange-400 font-bold drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "text-[var(--text-dim)]"}`}>
                                    {label}
                                </span>
                            </div>
                            {i < stepLabels.length - 1 && (
                                <div className={`h-[1px] flex-1 mx-1 ${isComplete ? "bg-gradient-to-r from-green-500 to-green-500" : isComplete && isActive ? "bg-gradient-to-r from-green-500 to-orange-500" : isActive ? "bg-gradient-to-r from-orange-500 to-white/10" : "bg-white/10"}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">

                {/* STEP 1: NAME + PERSONALITY */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="glass-card rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-orange-500/10 transition-colors" />

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold font-mono text-white tracking-tight">Identity Matrix</h2>
                                    <p className="text-sm text-[var(--text-muted)]">Define your agent's core persona</p>
                                </div>
                            </div>

                            <div className="mb-8 relative z-10">
                                <label className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2 block font-bold">Designation</label>
                                <input
                                    type="text"
                                    placeholder="e.g., ATLAS, NOVA, MAX..."
                                    value={data.agentName}
                                    onChange={e => setData(prev => ({ ...prev, agentName: e.target.value }))}
                                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl font-mono focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 focus:bg-black/60 outline-none transition-all placeholder:text-white/20 text-lg"
                                    maxLength={30}
                                />
                            </div>

                            <div className="relative z-10">
                                <label className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-3 block font-bold">Personality Core</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {personalities.map(p => {
                                        const isSelected = data.personality === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => setData(prev => ({ ...prev, personality: p.id, agentName: prev.agentName || p.name }))}
                                                className={`relative p-5 rounded-xl border text-left transition-all duration-300 ${isSelected
                                                    ? "border-orange-500/50 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </motion.div>
                                                )}
                                                <span className="text-3xl mb-3 block filter drop-shadow-md">{p.emoji}</span>
                                                <h3 className="font-bold font-mono text-base text-white mb-1">{p.name}</h3>
                                                <p className="text-xs text-[var(--text-muted)] mb-2">{p.description}</p>
                                                <div className="inline-block px-2 py-1 rounded bg-black/20 text-[10px] text-[var(--text-dim)] border border-white/5 font-mono">
                                                    {p.traits}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!data.agentName.trim()}
                                className="btn-primary px-8 py-3 rounded-xl font-bold font-mono flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
                            >
                                Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: PLAN SELECTION */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold font-mono mb-2 text-white">Select Power Level</h2>
                            <p className="text-sm text-[var(--text-muted)]">Choose the computational resources for your agent</p>
                        </div>

                        <div className="grid grid-cols-3 gap-5">
                            {plans.map(plan => {
                                const Icon = plan.icon;
                                const isSelected = data.plan === plan.id;
                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-2xl border p-6 transition-all duration-300 group ${plan.popular
                                            ? "bg-gradient-to-b from-orange-500/10 to-transparent border-orange-500/30"
                                            : "bg-[#1A1817]/60 border-white/5"
                                            } ${isSelected ? "ring-2 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)] transform scale-[1.02]" : "hover:bg-white/5 hover:border-white/10"}`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-bold font-mono rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/30">
                                                Recommended
                                            </div>
                                        )}
                                        <div className="text-center mb-6">
                                            <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${plan.popular
                                                ? "bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20"
                                                : "bg-white/5 border border-white/5"
                                                }`}>
                                                <Icon className={`w-6 h-6 ${plan.popular ? "text-white" : "text-[var(--text-muted)]"}`} />
                                            </div>
                                            <h3 className="font-bold font-mono text-lg text-white mb-1">{plan.name}</h3>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-3xl font-bold text-white tracking-tight">{plan.price}</span>
                                                <span className="text-[var(--text-dim)] text-sm font-mono">{plan.period}</span>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] mt-2 min-h-[32px]">{plan.description}</p>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map(f => (
                                                <li key={f} className="flex items-start gap-3 text-xs text-[var(--text-secondary)]">
                                                    <div className="mt-0.5 w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-2.5 h-2.5 text-green-400" />
                                                    </div>
                                                    <span className="leading-tight">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => handleStripeCheckout(plan.id)}
                                            disabled={isCheckingOut}
                                            className={`w-full py-3 rounded-xl font-bold font-mono text-sm transition-all ${plan.popular
                                                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5"
                                                : "border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 hover:text-white"
                                                } disabled:opacity-50`}
                                        >
                                            {billingDisabled ? "Select Plan" : isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Deploy Unit"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button onClick={handleBack} className="text-[var(--text-muted)] hover:text-white px-4 flex items-center gap-2 font-mono text-sm group transition-colors">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="text-xs text-[var(--text-dim)] hover:text-[var(--text-muted)] font-mono border-b border-dotted border-[var(--text-dim)] hover:border-[var(--text-muted)] transition-colors"
                            >
                                {billingDisabled ? "Continue // Open Source Mode" : "Skip // Dev Mode"}
                            </button>
                        </div>

                        {!billingDisabled && (
                            <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-mono opacity-60">
                                <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Secure Protocol</span>
                                <span className="flex items-center gap-2"><Check className="w-3 h-3" /> Cancel Anytime</span>
                                <span className="flex items-center gap-2"><CreditCard className="w-3 h-3" /> 48h Trial Period</span>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* STEP 3: CONNECT TELEGRAM */}
                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 mx-auto mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 relative z-10 rotate-3 transition-transform group-hover:rotate-6">
                                        <MessageCircle className="w-8 h-8 text-white fill-white/20" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold font-mono mb-2 text-white">Neural Link</h2>
                                <p className="text-sm text-[var(--text-muted)]">Establish a secure connection via Telegram</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-2 block font-bold">Bot Token</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="123456:ABC-DEF..."
                                            value={data.telegramToken}
                                            onChange={e => {
                                                setData(prev => ({ ...prev, telegramToken: e.target.value }));
                                                setTokenError("");
                                            }}
                                            className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl font-mono focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-dim)] font-mono border border-white/5 px-2 py-1 rounded bg-black/20">
                                            SECURE
                                        </div>
                                    </div>
                                </div>

                                {data.botName && !tokenError && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-3 text-green-400 text-sm bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span>Link established: <strong className="font-mono">{data.botName}</strong></span>
                                    </motion.div>
                                )}

                                {tokenError && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-3 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <X className="w-3.5 h-3.5" />
                                        </div>
                                        {tokenError}
                                    </motion.div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">1</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Open Telegram & search @BotFather</p>
                                            <p className="text-xs text-[var(--text-muted)]">The official bot creator</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">2</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Send <code className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">/newbot</code></p>
                                            <p className="text-xs text-[var(--text-muted)]">Follow the simple prompts</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">3</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Copy the HTTP API Token</p>
                                            <p className="text-xs text-[var(--text-muted)]">Paste it in the field above</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={validateTelegramToken}
                                    disabled={!data.telegramToken || isValidatingToken}
                                    className="w-full btn-primary py-4 rounded-xl font-bold font-mono flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/30"
                                >
                                    {isValidatingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    {isValidatingToken ? "Verifying Uplink..." : "Initialize Connection"}
                                </button>

                                <button onClick={handleBack} className="w-full text-sm text-[var(--text-muted)] hover:text-white mt-2 flex items-center justify-center gap-2 group transition-colors">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: BRAIN + API KEY */}
                {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto border border-white/5 relative overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-[60px]" />

                            <div className="text-center mb-8 relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10 shadow-inner">
                                    <Brain className="w-8 h-8 text-purple-400" />
                                </div>
                                <h2 className="text-xl font-bold font-mono mb-2 text-white">Cognitive Model</h2>
                                <p className="text-sm text-[var(--text-muted)]">Select the AI architecture to power your agent</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-3 block font-bold">Provider Architecture</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {providerOptions.map(provider => (
                                            <button
                                                key={provider.id}
                                                onClick={() => setData(prev => ({ ...prev, llmProvider: provider.id }))}
                                                className={`p-4 rounded-xl border text-center transition-all duration-300 group ${data.llmProvider === provider.id
                                                    ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                                    : "border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/10"
                                                    }`}
                                            >
                                                <div className="w-10 h-10 mx-auto mb-3 relative grayscale group-hover:grayscale-0 transition-all">
                                                    <Image src={provider.icon} alt={provider.name} fill className="object-contain drop-shadow-md" />
                                                </div>
                                                <p className={`text-xs font-mono font-medium ${data.llmProvider === provider.id ? "text-white" : "text-[var(--text-muted)]"}`}>
                                                    {provider.name.split(" ")[0]}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-2 block font-bold">Access Key</label>
                                    <input
                                        type="password"
                                        placeholder="sk-..."
                                        value={data.llmApiKey}
                                        onChange={e => setData(prev => ({ ...prev, llmApiKey: e.target.value }))}
                                        className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl font-mono focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all placeholder:text-white/20 text-sm"
                                    />
                                    <p className="text-[10px] text-[var(--text-dim)] mt-3 flex items-center gap-1.5 bg-white/5 p-2 rounded-lg border border-white/5">
                                        <Key className="w-3 h-3 text-purple-400" />
                                        Encryption Level: High. Keys stored locally on agent VM only.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button onClick={handleBack} className="flex-1 btn-glass py-3 rounded-xl font-mono text-sm flex items-center justify-center gap-2 hover:bg-white/10">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={() => setStep(5)}
                                        disabled={!data.llmApiKey}
                                        className="flex-1 btn-primary py-3 rounded-xl font-bold font-mono flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/30 shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 5: USE CASE */}
                {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold font-mono mb-2 text-white">Mission parameters</h2>
                            <p className="text-sm text-[var(--text-muted)]">Define the operational scope for your agent</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {businessOptions.map(option => {
                                const isSelected = data.businessTypes.includes(option.id);
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleBusinessType(option.id)}
                                        className={`glass-card relative p-5 rounded-xl border text-left transition-all duration-300 group ${isSelected
                                            ? "border-orange-500/50 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                            : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                                            }`}
                                    >
                                        {isSelected && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
                                                <Check className="w-3 h-3 text-white" />
                                            </motion.div>
                                        )}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isSelected ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20" : "bg-white/5 border border-white/5 group-hover:bg-white/10"}`}>
                                            <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-[var(--text-muted)] group-hover:text-white"}`} />
                                        </div>
                                        <h3 className="font-bold font-mono text-sm mb-1 text-white">{option.name}</h3>
                                        <p className="text-xs text-[var(--text-dim)] group-hover:text-[var(--text-secondary)] transition-colors">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {data.businessTypes.includes("custom") && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                    <label className="block text-xs font-mono text-orange-400 uppercase tracking-widest mb-2 font-bold">Custom Directives</label>
                                    <textarea
                                        value={data.customInput}
                                        onChange={e => setData(prev => ({ ...prev, customInput: e.target.value }))}
                                        placeholder="e.g., Managing my real estate listings, handling customer inquiries..."
                                        className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl font-mono text-sm resize-none h-24 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all placeholder:text-white/20"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between pt-4">
                            <button onClick={handleBack} className="text-[var(--text-muted)] hover:text-white px-4 flex items-center gap-2 font-mono text-sm group transition-colors">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                            </button>
                            <button
                                onClick={() => setStep(6)}
                                disabled={data.businessTypes.length === 0}
                                className="btn-primary px-8 py-3 rounded-xl font-bold font-mono flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 6: SKILLS */}
                {step === 6 && (
                    <motion.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold font-mono mb-2 text-white">Skill Modules</h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                <span className="text-orange-400 font-bold">{data.selectedSkills.length}</span> modules loaded based on your mission profile.
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {data.businessTypes
                                .flatMap(type => CATEGORY_SKILLS_MAP[type as BusinessType] || [])
                                .filter((skill, index, arr) => arr.findIndex(s => s.id === skill.id) === index)
                                .map(skill => {
                                    const isOn = data.selectedSkills.includes(skill.id);
                                    return (
                                        <div
                                            key={skill.id}
                                            className={`glass-card flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isOn ? "border-green-500/30 bg-green-500/5" : "border-white/5 bg-transparent hover:bg-white/5"
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Zap className={`w-3 h-3 ${isOn ? "text-green-400" : "text-[var(--text-dim)]"}`} />
                                                    <span className={`font-mono text-sm font-bold block truncate ${isOn ? "text-white" : "text-[var(--text-muted)]"}`}>{skill.name}</span>
                                                </div>
                                                <span className="text-xs text-[var(--text-dim)] block truncate pl-5">{skill.description}</span>
                                            </div>
                                            <button
                                                onClick={() => toggleSkill(skill.id)}
                                                className={`w-12 h-6 rounded-full p-1 transition-all flex-shrink-0 ml-4 shadow-inner ${isOn ? "bg-green-500 shadow-green-900/50" : "bg-black/40 border border-white/10"}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isOn ? "translate-x-6" : ""}`} />
                                            </button>
                                        </div>
                                    );
                                })}

                            {data.businessTypes.length === 0 && (
                                <div className="text-center text-[var(--text-dim)] py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                                    <p className="font-mono text-sm">No mission profile selected.</p>
                                    <p className="text-xs mt-2">Return to previous step.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={handleBack} className="text-[var(--text-muted)] hover:text-white px-4 flex items-center gap-2 font-mono text-sm group transition-colors">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                            </button>
                            <button
                                onClick={() => setStep(7)}
                                className="btn-primary px-8 py-3 rounded-xl font-bold font-mono flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
                            >
                                Initiate Deployment <Rocket className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 7: DEPLOY */}
                {step === 7 && (
                    <motion.div key="step7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {(data.deployStatus === "idle" || data.deployStatus === "error") ? (
                            <div className="glass-card rounded-2xl p-10 max-w-md mx-auto text-center border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />

                                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] relative z-10 animate-bounce-slow">
                                    <Rocket className="w-12 h-12 text-white" />
                                </div>

                                <h2 className="text-xl font-bold font-mono mb-2 text-white">Ready to Deploy</h2>
                                <p className="text-sm text-[var(--text-muted)] mb-6">
                                    <strong className="text-white">{data.agentName}</strong> will be deployed with <span className="text-orange-400 font-bold">{data.selectedSkills.length}</span> skills on the <span className="text-orange-400 capitalize font-bold">{data.plan}</span> plan.
                                </p>

                                <div className="bg-white/5 rounded-xl p-5 border border-white/5 text-left space-y-3 font-mono text-sm mb-8 backdrop-blur-md">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-dim)] text-xs uppercase tracking-wider">Designation</span>
                                        <span className="text-white font-bold">{data.agentName}</span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-dim)] text-xs uppercase tracking-wider">Personality Core</span>
                                        <span className="capitalize text-white">{data.personality}</span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-dim)] text-xs uppercase tracking-wider">Cognitive Model</span>
                                        <span className="capitalize text-white">{data.llmProvider}</span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-dim)] text-xs uppercase tracking-wider">Neural Link</span>
                                        <span className="text-blue-400">{data.botName || "Connected"}</span>
                                    </div>
                                </div>

                                {data.deployStatus === "error" && (
                                    <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded-xl mb-6 border border-red-500/20 flex items-center gap-3">
                                        <X className="w-5 h-5 flex-shrink-0" />
                                        Deployment failed. Please try again.
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleDeploy}
                                        className="w-full btn-primary py-4 rounded-xl font-bold font-mono flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all text-lg"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Launch {data.agentName}
                                    </button>

                                    <button onClick={handleBack} className="w-full text-sm text-[var(--text-muted)] hover:text-white py-2 flex items-center justify-center gap-2 group transition-colors">
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> modify_parameters
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Deploying / Polling state */
                            <div className="text-center py-12">
                                <div className="relative w-32 h-32 mx-auto mb-12">
                                    <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping blur-xl" />
                                    <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse blur-md" />
                                    <div className="relative glass-card rounded-full w-full h-full flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                                        <Zap className="w-12 h-12 text-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                                    </div>
                                </div>

                                <h2 className="text-3xl font-bold font-mono mb-4 text-white tracking-tight">
                                    {data.deployStatus === "deploying" ? "Initializing..." : "System Integration..."}
                                </h2>
                                <p className="text-[var(--text-muted)] mb-10 max-w-md mx-auto">
                                    Provisioning dedicated computational matrix and injecting <span className="text-orange-400">{data.selectedSkills.length}</span> skill modules...
                                </p>

                                <div className="max-w-sm mx-auto bg-black/40 rounded-xl p-6 border border-white/10 text-left space-y-4 font-mono text-sm shadow-xl backdrop-blur-xl">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-dim)] uppercase tracking-wider text-xs">Agent ID</span>
                                        <span className="text-white font-bold">{data.agentName}</span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-dim)] uppercase tracking-wider text-xs">Status</span>
                                        <span className="text-orange-400 animate-pulse font-bold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                                            {data.deployStatus === "deploying" ? "LAUNCHING" : "CONFIGURING"}
                                        </span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-dim)] uppercase tracking-wider text-xs">Resource Plan</span>
                                        <span className="capitalize text-white">{data.plan}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
