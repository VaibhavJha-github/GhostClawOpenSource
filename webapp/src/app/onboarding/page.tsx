"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Sparkles,
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSkillsForCategories, CATEGORY_SKILLS_MAP, type Skill as CategorySkill } from "@/lib/skills";
import { PROVIDER_OPTIONS } from "@/lib/agent-config";
import { authFetch } from "@/lib/auth-fetch";
import type { BusinessType } from "@/components/BusinessTypePopup";

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface OnboardingData {
    // Step 1 - Telegram
    telegramToken: string;
    botName: string;
    botId: string;
    // Step 2 - Payment
    stripeSessionId: string;
    // Step 3 - Business Type
    businessTypes: BusinessType[];
    customInput: string;
    // Step 4 - Skills
    selectedSkills: string[];
    // Step 5 - Deploy + Brain
    llmProvider: string;
    llmApiKey: string;
    agentId: string | null;
    deployStatus: "idle" | "deploying" | "polling" | "ready" | "error";
    // Step 6 - Welcome (no extra data)
}

const businessOptions: { id: BusinessType; name: string; icon: typeof ShoppingCart; description: string }[] = [
    { id: "ecommerce", name: "E-Commerce", icon: ShoppingCart, description: "Online stores & dropshipping" },
    { id: "local", name: "Local Services", icon: Store, description: "Physical businesses & services" },
    { id: "saas", name: "SaaS", icon: Monitor, description: "Software companies" },
    { id: "agency", name: "Agency", icon: Megaphone, description: "Marketing & creative work" },
    { id: "professional", name: "Professional", icon: Briefcase, description: "Knowledge-based services" },
    { id: "custom", name: "Something Else", icon: PenTool, description: "Tell us what you do" },
];

const providerOptions = PROVIDER_OPTIONS;
const ONBOARDING_STORAGE_KEY = "ghostclaw_onboarding_v2";
const LEGACY_ONBOARDING_STORAGE_KEY = "ghostclaw_onboarding";
const TELEGRAM_WARMUP_MS = 5 * 60 * 1000;

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </main>
        }>
            <OnboardingContent />
        </Suspense>
    );
}

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const billingDisabled = process.env.NEXT_PUBLIC_OPEN_SOURCE_MODE !== "false";

    const defaultData: OnboardingData = {
        telegramToken: "",
        botName: "",
        botId: "",
        stripeSessionId: "",
        businessTypes: [],
        customInput: "",
        selectedSkills: [],
        llmProvider: "anthropic",
        llmApiKey: "",
        agentId: null,
        deployStatus: "idle",
    };

    const [step, setStep] = useState<OnboardingStep>(1);
    const [data, setData] = useState<OnboardingData>(defaultData);

    // UI state
    const [isValidatingToken, setIsValidatingToken] = useState(false);
    const [tokenError, setTokenError] = useState("");
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState("");
    const [recommendedSkills, setRecommendedSkills] = useState<CategorySkill[]>([]);
    const hasAutoCheckoutAttemptedRef = useRef(false);
    const hasAppliedQueryParamsRef = useRef(false);
    const deploymentPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const deployRequestInFlightRef = useRef(false);
    const [paymentCanceled, setPaymentCanceled] = useState(false);
    const [telegramWarmupEndsAt, setTelegramWarmupEndsAt] = useState<number | null>(null);
    const [telegramWarmupRemainingSeconds, setTelegramWarmupRemainingSeconds] = useState(0);

    // Restore onboarding data from localStorage (survives Stripe redirect)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY) || localStorage.getItem(LEGACY_ONBOARDING_STORAGE_KEY);
            if (!saved) return;

            const parsed = JSON.parse(saved) as Partial<OnboardingData> & { step?: number; telegramWarmupEndsAt?: number };
            const parsedStep = Number(parsed.step);

            setData(prev => ({
                ...prev,
                ...(typeof parsed.telegramToken === "string" ? { telegramToken: parsed.telegramToken } : {}),
                ...(typeof parsed.botName === "string" ? { botName: parsed.botName } : {}),
                ...(typeof parsed.botId === "string" ? { botId: parsed.botId } : {}),
                ...(Array.isArray(parsed.businessTypes) ? { businessTypes: parsed.businessTypes as BusinessType[] } : {}),
                ...(typeof parsed.customInput === "string" ? { customInput: parsed.customInput } : {}),
                ...(Array.isArray(parsed.selectedSkills) ? { selectedSkills: parsed.selectedSkills as string[] } : {}),
                ...(typeof parsed.llmProvider === "string" ? { llmProvider: parsed.llmProvider } : {}),
                ...(typeof parsed.agentId === "string" ? { agentId: parsed.agentId } : {}),
                ...(typeof parsed.deployStatus === "string" &&
                    ["idle", "deploying", "polling", "ready", "error"].includes(parsed.deployStatus)
                    ? { deployStatus: parsed.deployStatus as OnboardingData["deployStatus"] }
                    : {}),
            }));

            if (typeof parsed.telegramWarmupEndsAt === "number" && Number.isFinite(parsed.telegramWarmupEndsAt)) {
                setTelegramWarmupEndsAt(parsed.telegramWarmupEndsAt);
            }

            if (Number.isFinite(parsedStep) && parsedStep >= 1 && parsedStep <= 6) {
                setStep(parsedStep as OnboardingStep);
            }
        } catch { /* ignore */ }
    }, []);

    // Persist onboarding state to localStorage on every change
    useEffect(() => {
        try {
            const toSave = {
                step,
                telegramToken: data.telegramToken,
                botName: data.botName,
                botId: data.botId,
                businessTypes: data.businessTypes,
                customInput: data.customInput,
                selectedSkills: data.selectedSkills,
                llmProvider: data.llmProvider,
                agentId: data.agentId,
                deployStatus: data.deployStatus,
                telegramWarmupEndsAt,
                // Don't persist API key for security.
            };
            localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(toSave));
        } catch { /* ignore */ }
    }, [step, data.telegramToken, data.botName, data.botId, data.businessTypes, data.customInput, data.selectedSkills, data.llmProvider, data.agentId, data.deployStatus, telegramWarmupEndsAt]);

    // Auth guard
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login?redirect=/onboarding");
        }
    }, [user, authLoading, router]);

    // Handle return from Stripe once, then clean URL params so stale step values don't reset onboarding.
    useEffect(() => {
        if (hasAppliedQueryParamsRef.current) return;

        const stepParam = searchParams.get("step");
        const sessionId = searchParams.get("session_id");
        const canceled = searchParams.get("payment_canceled") === "1";

        if (!stepParam && !sessionId && !canceled) {
            hasAppliedQueryParamsRef.current = true;
            return;
        }

        if (stepParam && !Number.isNaN(Number(stepParam))) {
            const stepNum = parseInt(stepParam, 10);
            if (stepNum >= 1 && stepNum <= 6) {
                setStep(prev => (prev > stepNum ? prev : (stepNum as OnboardingStep)));
            }
        }
        if (sessionId) {
            setData(prev => ({ ...prev, stripeSessionId: sessionId }));
        }
        if (canceled) {
            setPaymentCanceled(true);
            setStep(prev => (prev > 2 ? prev : 2));
        }

        hasAppliedQueryParamsRef.current = true;
        router.replace("/onboarding");
    }, [searchParams, router]);

    // Update recommended skills when business types change
    useEffect(() => {
        if (data.businessTypes.length > 0) {
            const skills = getSkillsForCategories(data.businessTypes);
            setRecommendedSkills(skills);
            // Auto-select all skills from CATEGORY_SKILLS_MAP (id = owner/slug for clawhub install)
            const allIds = data.businessTypes
                .flatMap(type => CATEGORY_SKILLS_MAP[type as BusinessType] || [])
                .filter((skill, index, arr) => arr.findIndex(s => s.id === skill.id) === index)
                .map(s => s.id);
            setData(prev => ({
                ...prev,
                selectedSkills: allIds,
            }));
        }
    }, [data.businessTypes]);

    // --- Step 1: Telegram Validation ---
    const validateTelegramToken = async () => {
        const token = data.telegramToken.trim();

        // Regex validation first
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
                    telegramToken: token,
                    botName: result.result.first_name,
                    botId: result.result.id.toString(),
                }));
                // Auto-advance
                setStep(2);
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
    const handleStripeCheckout = useCallback(async () => {
        if (!user) return;
        if (billingDisabled) {
            setStep(3);
            return;
        }
        if (isCheckingOut) return;
        setIsCheckingOut(true);
        setCheckoutError("");
        setPaymentCanceled(false);
        try {
            const appUrl = window.location.origin;
            const res = await authFetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    plan: "starter",
                    successUrl: `${appUrl}/onboarding?step=3&session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: `${appUrl}/onboarding?step=2&payment_canceled=1`,
                }),
            });

            if (res.ok) {
                const { checkoutUrl } = await res.json();
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                    return;
                }
            }
            setCheckoutError("Could not start Stripe checkout. Please try again.");
        } catch {
            setCheckoutError("Connection issue while opening Stripe. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    }, [user, isCheckingOut, billingDisabled]);

    const handleSkipPayment = () => {
        setStep(3);
    };

    const formatDurationMmSs = useCallback((totalSeconds: number) => {
        const safe = Math.max(0, Math.floor(totalSeconds));
        const minutes = Math.floor(safe / 60);
        const seconds = safe % 60;
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }, []);

    const markAgentReady = useCallback((agentId: string) => {
        setData(prev => ({ ...prev, agentId, deployStatus: "ready" }));
        setStep(6);
        setTelegramWarmupEndsAt(prev => {
            if (prev && prev > Date.now()) return prev;
            return Date.now() + TELEGRAM_WARMUP_MS;
        });
    }, []);

    useEffect(() => {
        if (!telegramWarmupEndsAt) {
            setTelegramWarmupRemainingSeconds(0);
            return;
        }

        const updateRemaining = () => {
            const remaining = Math.max(0, Math.ceil((telegramWarmupEndsAt - Date.now()) / 1000));
            setTelegramWarmupRemainingSeconds(remaining);
        };

        updateRemaining();
        const timer = setInterval(updateRemaining, 1000);
        return () => clearInterval(timer);
    }, [telegramWarmupEndsAt]);

    const stopDeploymentPolling = useCallback(() => {
        if (deploymentPollTimerRef.current) {
            clearInterval(deploymentPollTimerRef.current);
            deploymentPollTimerRef.current = null;
        }
    }, []);

    const checkAgentReadiness = useCallback(async (agentId: string): Promise<"ready" | "pending" | "missing"> => {
        try {
            const res = await authFetch(`/api/agents/${agentId}`);
            if (res.status === 404) return "missing";
            if (!res.ok) return "pending";

            const payload = await res.json();
            const agent = payload?.agent;
            const dbStatus = String(agent?.status || "").toLowerCase();
            const ec2State = String(agent?.instance_status?.state || "").toLowerCase();
            const heartbeatAgeSeconds = typeof agent?.heartbeat_age_seconds === "number" ? agent.heartbeat_age_seconds : null;

            if (dbStatus === "terminated" || ec2State === "terminated") return "missing";
            if (dbStatus === "online") return "ready";

            // If status reconciliation is slightly delayed, accept running + fresh heartbeat as ready.
            if (ec2State === "running" && heartbeatAgeSeconds !== null && heartbeatAgeSeconds <= 180) {
                return "ready";
            }

            return "pending";
        } catch {
            return "pending";
        }
    }, []);

    const startDeploymentPolling = useCallback((agentId: string) => {
        if (!agentId) return;
        stopDeploymentPolling();

            const pollOnce = async () => {
            const readiness = await checkAgentReadiness(agentId);

            if (readiness === "ready") {
                stopDeploymentPolling();
                markAgentReady(agentId);
                return;
            }

            if (readiness === "missing") {
                stopDeploymentPolling();
                setData(prev => ({ ...prev, agentId: null, deployStatus: "error" }));
            }
        };

        void pollOnce();
        deploymentPollTimerRef.current = setInterval(() => {
            void pollOnce();
        }, 3000);
    }, [checkAgentReadiness, stopDeploymentPolling, markAgentReady]);

    useEffect(() => {
        return () => stopDeploymentPolling();
    }, [stopDeploymentPolling]);

    // If user refreshes or navigates away/back during deployment, auto-resume polling.
    useEffect(() => {
        const inProgress = data.deployStatus === "deploying" || data.deployStatus === "polling";
        if (!inProgress || !data.agentId) return;
        setStep(prev => (prev < 5 ? 5 : prev));
        startDeploymentPolling(data.agentId);
    }, [data.deployStatus, data.agentId, startDeploymentPolling]);

    // When tab/window regains focus, reconcile with server to avoid duplicate deploys.
    useEffect(() => {
        const onVisibleOrFocus = () => {
            if (document.visibilityState === "hidden") return;
            const inProgress = data.deployStatus === "deploying" || data.deployStatus === "polling";
            if (!inProgress || !data.agentId) return;

            void (async () => {
                const readiness = await checkAgentReadiness(data.agentId!);
                if (readiness === "ready") {
                    stopDeploymentPolling();
                    markAgentReady(data.agentId!);
                    return;
                }

                if (readiness === "missing") {
                    stopDeploymentPolling();
                    setData(prev => ({ ...prev, agentId: null, deployStatus: "error" }));
                    return;
                }

                if (!deploymentPollTimerRef.current) {
                    startDeploymentPolling(data.agentId!);
                }
            })();
        };

        document.addEventListener("visibilitychange", onVisibleOrFocus);
        window.addEventListener("focus", onVisibleOrFocus);
        return () => {
            document.removeEventListener("visibilitychange", onVisibleOrFocus);
            window.removeEventListener("focus", onVisibleOrFocus);
        };
    }, [data.deployStatus, data.agentId, checkAgentReadiness, startDeploymentPolling, stopDeploymentPolling, markAgentReady]);

    // Auto-start Stripe checkout when payment step is reached to reduce friction.
    useEffect(() => {
        if (step !== 2) {
            hasAutoCheckoutAttemptedRef.current = false;
            return;
        }

        if (billingDisabled) {
            hasAutoCheckoutAttemptedRef.current = true;
            setStep(3);
            return;
        }
        if (paymentCanceled) return;
        if (isCheckingOut) return;
        if (hasAutoCheckoutAttemptedRef.current) return;

        hasAutoCheckoutAttemptedRef.current = true;
        void handleStripeCheckout();
    }, [step, paymentCanceled, isCheckingOut, handleStripeCheckout, billingDisabled]);

    // --- Step 3: Business Type ---
    const toggleBusinessType = (id: BusinessType) => {
        setData(prev => ({
            ...prev,
            businessTypes: prev.businessTypes.includes(id)
                ? prev.businessTypes.filter(t => t !== id)
                : [...prev.businessTypes, id],
        }));
    };

    // --- Step 4: Skills ---
    const toggleSkill = (skillId: string) => {
        setData(prev => ({
            ...prev,
            selectedSkills: prev.selectedSkills.includes(skillId)
                ? prev.selectedSkills.filter(s => s !== skillId)
                : [...prev.selectedSkills, skillId],
        }));
    };

    // --- Step 5: Deploy ---
    const handleDeploy = async () => {
        if (!user) return;
        if (deployRequestInFlightRef.current) return;
        deployRequestInFlightRef.current = true;

        try {
            if (data.agentId) {
                const readiness = await checkAgentReadiness(data.agentId);
                if (readiness === "ready") {
                    stopDeploymentPolling();
                    markAgentReady(data.agentId);
                    return;
                }

                if (readiness === "pending") {
                    setData(prev => ({ ...prev, deployStatus: "polling" }));
                    setStep(prev => (prev < 5 ? 5 : prev));
                    startDeploymentPolling(data.agentId);
                    return;
                }
                // If missing/terminated, continue below to create a new one.
            }

            setData(prev => ({ ...prev, deployStatus: "deploying" }));
            const provider = providerOptions.find(p => p.id === data.llmProvider);

            const response = await authFetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    agentName: "Atlas",
                    telegramBotToken: data.telegramToken.trim(),
                    useCase: data.businessTypes.join(","),
                    skills: data.selectedSkills,
                    llmProvider: data.llmProvider,
                    llmModel: provider?.defaultModel || "anthropic/claude-sonnet-4-5",
                    llmApiKey: data.llmApiKey,
                    plan: "starter",
                }),
            });

            if (response.ok) {
                const resData = await response.json();
                const newAgentId = typeof resData.agentId === "string"
                    ? resData.agentId
                    : typeof resData.agent?.id === "string"
                        ? resData.agent.id
                        : "";

                if (!newAgentId) {
                    throw new Error("Agent ID missing from deploy response");
                }

                setData(prev => ({
                    ...prev,
                    agentId: newAgentId,
                    deployStatus: "polling",
                }));
                setStep(prev => (prev < 5 ? 5 : prev));
                startDeploymentPolling(newAgentId);
            } else {
                const err = await response.json();
                setData(prev => ({ ...prev, deployStatus: "error" }));
                alert(`Deployment failed: ${err.error || "Unknown error"}`);
            }
        } catch {
            setData(prev => ({ ...prev, deployStatus: "error" }));
            alert("Connection failed. Please try again.");
        } finally {
            deployRequestInFlightRef.current = false;
        }
    };
    const telegramWarmupActive = telegramWarmupRemainingSeconds > 0;

    const handleBack = () => {
        if (step > 1 && step < 6) setStep((step - 1) as OnboardingStep);
    };

    if (authLoading || !user) {
        return (
            <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-orange-600 opacity-10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500 opacity-5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Progress Bar */}
                <div className="h-1 bg-[var(--border-light)] w-full">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(step / 6) * 100}%` }}
                    />
                </div>

                <div className="p-8 min-h-[500px] flex flex-col">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: TELEGRAM */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col justify-center">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-6 relative">
                                        <Image src="/icons/telegram_icon.webp" alt="Telegram" fill className="object-contain" />
                                    </div>
                                    <h1 className="text-2xl font-bold font-mono mb-2">Connect Telegram</h1>
                                    <p className="text-[var(--text-muted)]">Where should your agent live?</p>
                                </div>

                                <div className="space-y-4 max-w-md mx-auto w-full">
                                    <div>
                                        <label className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider mb-2 block">Bot Token</label>
                                        <input
                                            type="text"
                                            placeholder="123456:ABC-DEF..."
                                            value={data.telegramToken}
                                            onChange={e => {
                                                setData(prev => ({ ...prev, telegramToken: e.target.value }));
                                                setTokenError("");
                                            }}
                                            className="w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl font-mono focus:border-orange-500 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Success message */}
                                    {data.botName && !tokenError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">
                                            <Check className="w-4 h-4" />
                                            Connected to <strong>{data.botName}</strong>
                                        </motion.div>
                                    )}

                                    {/* Error message */}
                                    {tokenError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                                            <X className="w-4 h-4" />
                                            {tokenError}
                                        </motion.div>
                                    )}

                                    <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border-light)] text-sm text-[var(--text-muted)] space-y-2">
                                        <p>1. Open Telegram & search <strong className="text-white">@BotFather</strong></p>
                                        <p>2. Send <code className="bg-white/10 px-1 rounded">/newbot</code></p>
                                        <p>3. Copy the token and paste it above</p>
                                    </div>

                                    <button
                                        onClick={validateTelegramToken}
                                        disabled={!data.telegramToken || isValidatingToken}
                                        className="w-full btn-primary py-3 rounded-xl font-bold font-mono flex items-center justify-center gap-2"
                                    >
                                        {isValidatingToken ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        {isValidatingToken ? "Verifying..." : "Connect"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: PAYMENT */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col justify-center text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-900/20">
                                    <CreditCard className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold font-mono mb-2">
                                    {billingDisabled ? "Open-Source Mode: Billing Disabled" : "Redirecting to Stripe..."}
                                </h1>
                                <p className="text-[var(--text-muted)] max-w-sm mx-auto mb-8">
                                    {billingDisabled
                                        ? "This build does not connect to Stripe. Continue directly to setup."
                                        : paymentCanceled
                                        ? "Checkout was canceled. Continue when you are ready."
                                        : "We are opening secure checkout automatically so you can start your trial faster."}
                                </p>

                                <div className="max-w-xs mx-auto w-full space-y-3">
                                    <button
                                        onClick={handleStripeCheckout}
                                        disabled={isCheckingOut}
                                        className="w-full bg-[#635BFF] hover:bg-[#534be0] text-white py-3 rounded-xl font-bold font-mono flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#635BFF]/20 disabled:opacity-50"
                                    >
                                        {!billingDisabled && isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {billingDisabled ? "Continue Setup" : isCheckingOut ? "Opening Stripe..." : "Continue to Stripe"}
                                    </button>

                                    {checkoutError && (
                                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                            {checkoutError}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSkipPayment}
                                        className="w-full text-xs text-[var(--text-dim)] hover:text-[var(--text-muted)] underline decoration-dotted"
                                    >
                                        Skip (Development Mode)
                                    </button>
                                </div>

                                {!billingDisabled && (
                                    <div className="mt-8 flex items-center justify-center gap-4 text-xs text-[var(--text-dim)]">
                                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Payment</span>
                                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Cancel Anytime</span>
                                    </div>
                                )}

                                <button onClick={handleBack} className="mt-6 text-sm text-[var(--text-muted)] hover:text-white">
                                    <ArrowLeft className="w-4 h-4 inline mr-1" />Back
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 3: BUSINESS TYPE */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col">
                                <h1 className="text-2xl font-bold font-mono mb-2 text-center">What are you building?</h1>
                                <p className="text-center text-[var(--text-muted)] mb-6 text-sm">Select all that apply</p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {businessOptions.map((option) => {
                                        const isSelected = data.businessTypes.includes(option.id);
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => toggleBusinessType(option.id)}
                                                className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                                                    ? "border-orange-500 bg-orange-500/10"
                                                    : "border-[var(--border-light)] bg-[var(--bg-base)] hover:border-orange-500/50"
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </motion.div>
                                                )}
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${isSelected ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-[var(--bg-muted)]"}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-[var(--text-muted)]"}`} />
                                                </div>
                                                <h3 className="font-semibold text-white text-sm mb-0.5">{option.name}</h3>
                                                <p className="text-xs text-[var(--text-dim)]">{option.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom input */}
                                <AnimatePresence>
                                    {data.businessTypes.includes("custom") && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                                            <label className="block text-sm text-[var(--text-muted)] mb-2">What do you want to automate?</label>
                                            <textarea
                                                value={data.customInput}
                                                onChange={(e) => setData(prev => ({ ...prev, customInput: e.target.value }))}
                                                placeholder="e.g., Managing my real estate listings, handling customer inquiries..."
                                                className="w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl font-mono text-sm resize-none h-20 focus:border-orange-500 outline-none"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-auto flex justify-between">
                                    <button onClick={handleBack} className="text-[var(--text-muted)] hover:text-white px-4 flex items-center gap-1">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        disabled={data.businessTypes.length === 0}
                                        className="btn-primary px-8 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: SKILLS */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col">
                                <h1 className="text-2xl font-bold font-mono mb-2 text-center">Select Skills</h1>
                                <p className="text-center text-[var(--text-muted)] mb-6 text-sm">
                                    Recommended for {businessOptions.find(opt => data.businessTypes.includes(opt.id))?.name || "your business"}. Toggle off any you don&apos;t need.
                                </p>

                                <div className="space-y-3 max-w-2xl mx-auto w-full overflow-y-auto max-h-[400px] pr-2">
                                    {/* Combine skills from all selected categories */}
                                    {data.businessTypes
                                        .flatMap(type => CATEGORY_SKILLS_MAP[type as BusinessType] || [])
                                        .filter((skill, index, arr) => arr.findIndex(s => s.id === skill.id) === index)
                                        .map((skill) => {
                                        const isOn = data.selectedSkills.includes(skill.id);
                                        return (
                                            <div
                                                key={skill.id}
                                                className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-sm font-bold flex items-center gap-2">
                                                            {skill.name}
                                                            <div className="relative group/tooltip">
                                                                <div className="w-4 h-4 rounded-full border border-[var(--text-muted)] text-[var(--text-muted)] flex items-center justify-center text-[10px] cursor-help">i</div>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-[var(--border-light)] rounded-lg text-xs text-[var(--text-secondary)] opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                                                                    {skill.description}
                                                                </div>
                                                            </div>
                                                        </span>
                                                        <span className="text-xs text-[var(--text-muted)]">{skill.description}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleSkill(skill.id)}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${isOn ? "bg-green-500" : "bg-[var(--border-light)]"}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isOn ? "translate-x-6" : ""}`} />
                                                </button>
                                            </div>
                                        )
                                    })}

                                    {data.businessTypes.length === 0 && (
                                        <div className="text-center text-[var(--text-dim)] py-8 border border-dashed border-[var(--border-glass)] rounded-xl">
                                            Please select a business type in the previous step.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-between max-w-md mx-auto w-full">
                                    <button onClick={handleBack} className="text-[var(--text-muted)] hover:text-white px-4 flex items-center gap-1">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={() => setStep(5)}
                                        className="btn-primary px-8 py-2 rounded-xl flex items-center gap-2"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: DEPLOY + BRAIN */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col justify-center">
                                {data.deployStatus === "idle" || data.deployStatus === "error" ? (
                                    <>
                                        <div className="text-center mb-8">
                                            <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-[var(--border-light)]">
                                                <Key className="w-8 h-8 text-[var(--text-primary)]" />
                                            </div>
                                            <h1 className="text-2xl font-bold font-mono">Deploy & Activate</h1>
                                            <p className="text-[var(--text-muted)]">Choose your AI provider and deploy your agent.</p>
                                        </div>

                                        <div className="max-w-md mx-auto w-full space-y-4">
                                            {/* Provider Selection */}
                                            <div>
                                                <label className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider mb-3 block">AI Provider</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {providerOptions.map((provider) => (
                                                        <button
                                                            key={provider.id}
                                                            onClick={() => setData(prev => ({ ...prev, llmProvider: provider.id }))}
                                                            className={`p-3 rounded-xl border text-center transition-all ${data.llmProvider === provider.id
                                                                ? "border-orange-500 bg-orange-500/10"
                                                                : "border-[var(--border-light)] bg-[var(--bg-base)] hover:border-orange-500/50"
                                                                }`}
                                                        >
                                                            <div className="w-10 h-10 mx-auto mb-2 relative">
                                                                <Image src={provider.icon} alt={provider.name} fill className="object-contain" />
                                                            </div>
                                                            <p className="text-xs font-mono font-medium">{provider.name.split(" ")[0]}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* API Key */}
                                            <div>
                                                <label className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider mb-2 block">API Key</label>
                                                <input
                                                    type="password"
                                                    placeholder="sk-..."
                                                    value={data.llmApiKey}
                                                    onChange={(e) => setData(prev => ({ ...prev, llmApiKey: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl font-mono focus:border-orange-500 outline-none"
                                                />
                                                <p className="text-xs text-[var(--text-dim)] mt-2">
                                                    Keys are stored securely on your VM. We never see them.
                                                </p>
                                            </div>

                                            {data.deployStatus === "error" && (
                                                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg text-center">
                                                    Deployment failed. Please try again.
                                                </div>
                                            )}

                                            <button
                                                onClick={handleDeploy}
                                                disabled={!data.llmApiKey}
                                                className="w-full btn-primary py-3 rounded-xl font-bold font-mono mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <Rocket className="w-4 h-4" />
                                                Deploy Agent
                                            </button>

                                            <button onClick={handleBack} className="w-full text-sm text-[var(--text-muted)] hover:text-white mt-2">
                                                <ArrowLeft className="w-4 h-4 inline mr-1" />Back
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* Deploying / Polling state */
                                    <div className="text-center">
                                        <div className="relative w-24 h-24 mx-auto mb-8">
                                            <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                                            <div className="relative bg-[var(--bg-base)] border border-orange-500/50 rounded-full w-full h-full flex items-center justify-center">
                                                <Zap className="w-10 h-10 text-orange-500 animate-pulse" />
                                            </div>
                                        </div>

                                        <h1 className="text-2xl font-bold font-mono mb-4">
                                            {data.deployStatus === "deploying" ? "Deploying Agent..." : "Setting Up..."}
                                        </h1>
                                        <p className="text-[var(--text-muted)] mb-8">
                                            Provisioning EC2 Instance & Installing Skills
                                        </p>
                                        <p className="text-xs text-amber-300/90 mb-6">
                                            Telegram can take up to 5 minutes after deploy to fully respond. This is normal.
                                        </p>

                                        <div className="max-w-xs mx-auto bg-[var(--bg-base)] rounded-xl p-4 border border-[var(--border-light)] text-left space-y-3 font-mono text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-dim)]">Status</span>
                                                <span className="text-orange-400 animate-pulse">
                                                    {data.deployStatus === "deploying" ? "Launching..." : "Configuring..."}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-dim)]">Skills</span>
                                                <span>{data.selectedSkills.length} selected</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-dim)]">Provider</span>
                                                <span className="capitalize">{data.llmProvider}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 6: WELCOME */}
                        {step === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center text-center">
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
                                    <div className="relative bg-green-500/10 border border-green-500/30 rounded-full w-full h-full flex items-center justify-center">
                                        <Check className="w-10 h-10 text-green-400" />
                                    </div>
                                </div>

                                <h1 className="text-3xl font-bold font-mono mb-2">Your AI Employee is Live!</h1>
                                <p className="text-[var(--text-muted)] mb-6">
                                    Atlas is deployed{data.botName ? ` with ${data.botName}` : ""}.
                                </p>

                                <div className={`max-w-md mx-auto rounded-xl border p-3 text-sm mb-6 ${
                                    telegramWarmupActive
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-100"
                                        : "bg-green-500/10 border-green-500/30 text-green-100"
                                }`}>
                                    {telegramWarmupActive ? (
                                        <>
                                            <p className="font-semibold mb-1">Telegram is warming up</p>
                                            <p>
                                                Reply checks can take up to 5 minutes after first deploy.
                                                Time left: <span className="font-mono">{formatDurationMmSs(telegramWarmupRemainingSeconds)}</span>
                                            </p>
                                            <p className="text-xs mt-2 opacity-90">
                                                Send <code className="bg-black/20 px-1 rounded">/start</code> to your bot and wait a minute before retrying.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold mb-1">Telegram should be active now</p>
                                            <p>If your bot still does not reply, open dashboard and press Restart OpenClaw once.</p>
                                        </>
                                    )}
                                </div>

                                <div className="max-w-xs mx-auto bg-[var(--bg-base)] rounded-xl p-4 border border-[var(--border-light)] text-left space-y-3 font-mono text-sm mb-8">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-dim)]">Agent</span>
                                        <span>Atlas</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-dim)]">Status</span>
                                        <span className="text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
                                        </span>
                                    </div>
                                    {data.botName && (
                                        <div className="flex justify-between">
                                            <span className="text-[var(--text-dim)]">Telegram</span>
                                            <span>{data.botName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-dim)]">Skills</span>
                                        <span>{data.selectedSkills.length} installed</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
                                        localStorage.removeItem(LEGACY_ONBOARDING_STORAGE_KEY);
                                        router.push(`/dashboard/employees/${data.agentId}`);
                                    }}
                                    className="btn-primary py-3 px-8 rounded-xl font-bold font-mono mx-auto flex items-center gap-2"
                                >
                                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </main>
    );
}
