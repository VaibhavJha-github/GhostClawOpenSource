"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Bot,
    Pause,
    X,
    Trash2,
    Sparkles,
    Monitor,
    Wrench,
    Zap,
    Settings,
    FolderOpen,
    TerminalSquare,
    MessageCircle,
    CheckCircle,
    Hammer,
    DollarSign,
    HardDrive,
    Wifi,
    Save,
    ChevronDown,
    ExternalLink,
    Copy,
    RefreshCw,
    Edit,
    RotateCcw,
    Search,
    Heart,
    User,
    Clock,
    Brain,
    Sparkle,
    Play,
    Loader2,
    Send,
    Info,
    Plus,
    Globe,
    Key,
    ArrowRight,
    Shield,
    Layers,
    LayoutDashboard,
    Power,
    AlertTriangle,
    Gauge,
} from "lucide-react";
import { CATEGORY_SKILLS_MAP, universalSkills } from "@/lib/skills";
import { authFetch } from "@/lib/auth-fetch";
import {
    BUDGET_RECOMMENDATIONS,
    PROVIDER_CATALOG,
    USE_CASE_RECOMMENDATIONS,
    getModelCatalog,
    getProviderCatalog,
    getProviderConfigField,
    getProviderForModel,
} from "@/lib/model-catalog";

// Interface Definitions
interface RuntimeCheck {
    name: string;
    status: "ok" | "warn" | "error" | "info";
    message: string;
    value?: string | number | null;
}

interface AgentConfig {
    agentName: string;
    personality: string;
    traits: string[];
    skills: string[];
    telegramToken: string;
    status: string;
    ipAddress?: string;
    instanceId?: string;
    messagesCount: number;
    tasksCompleted: number;
    apiCostUsd: number;
    storageUsedBytes: number;
    cpuUsagePercent: number;
    memoryUsedMb: number;
    memoryTotalMb: number;
    storageTotalBytes: number;
    load1m: number;
    systemUptimeSeconds: number;
    openclawStatus: string;
    openclawUptimeSeconds: number;
    heartbeatAgeSeconds: number | null;
    checks: RuntimeCheck[];
}

type TabId = "overview" | "chat" | "desktop" | "skills" | "automation" | "configuration" | "workspace" | "console" | "models";

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: string;
}

interface SecondaryModel {
    id: string;
    model: string;
    useCase: string;
    apiKey: string;
}

function ChatInterface({ agentId, agentName }: { agentId: string, agentName: string }) {
    return (
        <div className="flex flex-col h-[calc(100vh-280px)] glass-card rounded-xl overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                        <Send className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Chat via Telegram</h3>
                    <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
                        {agentName} communicates through Telegram. Open your Telegram bot to send messages, assign tasks, and interact with your AI employee in real-time.
                    </p>
                    <div className="space-y-3">
                        <div className="glass-card p-4 rounded-xl text-left">
                            <h4 className="text-sm font-semibold text-white mb-2">How to chat:</h4>
                            <ol className="text-xs text-[var(--text-muted)] space-y-1.5 list-decimal list-inside">
                                <li>Open Telegram and find your bot</li>
                                <li>Send any message to start a conversation</li>
                                <li>Your agent will respond using its configured AI model</li>
                            </ol>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-left border-orange-500/20">
                            <div className="flex items-start gap-3">
                                <Info className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-[var(--text-muted)]">
                                    Haven&apos;t set up Telegram yet? Go to the <strong className="text-white">Overview</strong> tab and follow the &quot;Connect Neural Interface&quot; steps to pair your bot.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ActivityLog {
    id: string;
    type: string;
    content: string;
    created_at: string;
}

const dummyProviders = [
    ...PROVIDER_CATALOG.map((provider) => ({
        id: provider.id,
        name: provider.label,
        description: provider.description,
        icon:
            provider.id === "anthropic" ? "🔶" :
                provider.id === "openai" ? "🟢" :
                    provider.id === "google" ? "✨" :
                        provider.id === "xai" ? "✕" : "⚙️",
        envKey: provider.envKey,
    })),
    { id: "elevenlabs", name: "ElevenLabs", description: "Premium TTS", icon: "🔊", envKey: "ELEVENLABS_API_KEY" },
];

const workspaceFiles = [
    { name: "SOUL.md", type: "personality", icon: "❤️", description: "Personality" },
    { name: "USER.md", type: "info", icon: "👤", description: "Your info" },
    { name: "HEARTBEAT.md", type: "scheduled", icon: "💓", description: "Scheduled" },
    { name: "MEMORY.md", type: "memory", icon: "🧠", description: "Memory" },
];

const configFiles = [
    { name: "openclaw.json", type: "config", icon: "⚙️", description: "OpenClaw Config" },
];

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0m";
    const totalMinutes = Math.floor(seconds / 60);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function formatHeartbeatAge(ageSeconds: number | null): string {
    if (ageSeconds === null || !Number.isFinite(ageSeconds)) return "No heartbeat";
    if (ageSeconds < 60) return "just now";
    const minutes = Math.floor(ageSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// Map EC2/DB statuses to user-friendly display
function getStatusDisplay(status: string): { label: string; color: string; pulse: boolean } {
    switch (status) {
        case "online":
        case "running":
            return { label: "Online", color: "text-green-400", pulse: false };
        case "offline":
        case "stopped":
            return { label: "Paused", color: "text-gray-400", pulse: false };
        case "pending":
        case "deploying":
            return { label: "Starting...", color: "text-orange-400", pulse: true };
        case "stopping":
            return { label: "Pausing...", color: "text-orange-400", pulse: true };
        case "terminated":
            return { label: "Terminated", color: "text-red-400", pulse: false };
        default:
            return { label: status || "Unknown", color: "text-gray-400", pulse: false };
    }
}

function getStatusDotColor(status: string): string {
    switch (status) {
        case "online":
        case "running":
            return "bg-green-500";
        case "offline":
        case "stopped":
            return "bg-gray-500";
        case "pending":
        case "deploying":
        case "stopping":
            return "bg-orange-500 animate-pulse";
        case "terminated":
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
}

function isTransitionalState(status: string): boolean {
    return ["pending", "deploying", "stopping", "starting"].includes(status);
}

function canPause(status: string): boolean {
    return ["online", "running"].includes(status);
}

function canResume(status: string): boolean {
    return ["offline", "stopped"].includes(status);
}

function getCheckBadgeStyles(status: RuntimeCheck["status"]): string {
    if (status === "ok") return "bg-green-500/15 text-green-300 border-green-500/30";
    if (status === "warn") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    if (status === "error") return "bg-red-500/15 text-red-300 border-red-500/30";
    return "bg-white/10 text-[var(--text-muted)] border-white/10";
}

// Business types for reset wizard skills step
const BUSINESS_TYPES = [
    { id: "ecommerce", name: "E-Commerce" },
    { id: "local", name: "Local Services" },
    { id: "saas", name: "SaaS" },
    { id: "agency", name: "Agency" },
    { id: "professional", name: "Professional" },
];

export default function EmployeeDashboard() {
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
    const [selectedModel, setSelectedModel] = useState("anthropic/claude-sonnet-4-5");
    const [modelsView, setModelsView] = useState<"catalog" | "suggestions">("catalog");
    const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [connectionPassword, setConnectionPassword] = useState("");
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // API state
    const [fileContent, setFileContent] = useState("");
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [isSavingFile, setIsSavingFile] = useState(false);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [isPerformingAction, setIsPerformingAction] = useState(false);
    const [isRotatingPassword, setIsRotatingPassword] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
    const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
    const [pollInterval, setPollInterval] = useState(10000);
    const [pairingCode, setPairingCode] = useState("");
    const [isApprovingPairing, setIsApprovingPairing] = useState(false);
    const [telegramPaired, setTelegramPaired] = useState(false);
    const [secondaryModels, setSecondaryModels] = useState<SecondaryModel[]>([]);
    const [primaryModelApiKey, setPrimaryModelApiKey] = useState("");
    const [isSavingModels, setIsSavingModels] = useState(false);
    const [pollCountdown, setPollCountdown] = useState(10);
    const [savingProviderId, setSavingProviderId] = useState<string | null>(null);

    // Provider key status (fetched from config endpoint)
    const [providerKeyStatus, setProviderKeyStatus] = useState<Record<string, boolean>>({});

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset modal state
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetStep, setResetStep] = useState(0);
    const [resetModel, setResetModel] = useState("");
    const [resetProvider, setResetProvider] = useState("anthropic");
    const [resetApiKey, setResetApiKey] = useState("");
    const [resetName, setResetName] = useState("");
    const [resetPersonality, setResetPersonality] = useState("");
    const [resetBusinessType, setResetBusinessType] = useState("");
    const [resetSelectedSkills, setResetSelectedSkills] = useState<string[]>([]);
    const [isResetting, setIsResetting] = useState(false);

    // Desktop state
    const [desktopConnected, setDesktopConnected] = useState(false);

    // Automation/Cron state
    const [cronJobs, setCronJobs] = useState<{ name: string; schedule: string; command: string; raw: string }[]>([]);
    const [systemCronJobs, setSystemCronJobs] = useState<{ name: string; schedule: string; command: string; raw: string }[]>([]);
    const [isLoadingCrons, setIsLoadingCrons] = useState(false);
    const [showAddCronModal, setShowAddCronModal] = useState(false);
    const [newCronName, setNewCronName] = useState("");
    const [newCronSchedule, setNewCronSchedule] = useState("0 9 * * *");
    const [newCronCommand, setNewCronCommand] = useState("");
    const [isAddingCron, setIsAddingCron] = useState(false);
    const [isDeletingCron, setIsDeletingCron] = useState<string | null>(null);

    const agentId = params.id as string;
    const [installingSkill, setInstallingSkill] = useState<string | null>(null);

    // Load agent config & status
    const loadConfig = useCallback(async () => {
        try {
            const res = await authFetch(`/api/agents/${agentId}`);
            if (res.ok) {
                const data = await res.json();
                const agent = data.agent;

                const skills = (agent.traits || [])
                    .filter((t: string) => t.startsWith("skill:"))
                    .map((t: string) => t.replace("skill:", ""));

                const realTraits = (agent.traits || []).filter((t: string) => !t.startsWith("skill:"));

                const newStatus = agent.instance_status?.state || agent.status || "offline";
                const runtime = (agent.runtime_snapshot || {}) as Record<string, unknown>;
                const runtimeOpenClaw = runtime.openclaw && typeof runtime.openclaw === "object"
                    ? runtime.openclaw as Record<string, unknown>
                    : {};
                const runtimeChecks = Array.isArray(runtime.checks)
                    ? runtime.checks
                        .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object")
                        .map((entry) => ({
                            name: String(entry.name || "check"),
                            status: (["ok", "warn", "error", "info"].includes(String(entry.status)) ? String(entry.status) : "info") as RuntimeCheck["status"],
                            message: String(entry.message || ""),
                            value: typeof entry.value === "number" || typeof entry.value === "string" ? entry.value : null,
                        }))
                        .slice(0, 10)
                    : [];

                setAgentConfig({
                    agentName: agent.name || "Atlas",
                    personality: agent.personality || "",
                    traits: realTraits,
                    skills: skills,
                    telegramToken: agent.telegram_bot_token || "",
                    status: newStatus,
                    ipAddress: agent.ip_address || agent.instance_status?.publicIp,
                    instanceId: agent.instance_id,
                    messagesCount: agent.messages_count || 0,
                    tasksCompleted: agent.tasks_completed || 0,
                    apiCostUsd: agent.api_cost_usd || 0,
                    storageUsedBytes: toNumber(runtime.storage_used_bytes, agent.storage_used_bytes || 0),
                    cpuUsagePercent: toNumber(runtime.cpu_usage_percent, agent.cpu_usage_percent || 0),
                    memoryUsedMb: toNumber(runtime.memory_used_mb, agent.memory_used_mb || 0),
                    memoryTotalMb: toNumber(runtime.memory_total_mb, 0),
                    storageTotalBytes: toNumber(runtime.storage_total_bytes, 0),
                    load1m: toNumber(runtime.load_1m, 0),
                    systemUptimeSeconds: toNumber(runtime.system_uptime_seconds, 0),
                    openclawStatus: String(runtimeOpenClaw.status || "unknown"),
                    openclawUptimeSeconds: toNumber(runtimeOpenClaw.uptime_seconds, 0),
                    heartbeatAgeSeconds: agent.heartbeat_age_seconds === null || agent.heartbeat_age_seconds === undefined
                        ? null
                        : toNumber(agent.heartbeat_age_seconds, 0),
                    checks: runtimeChecks,
                });
                if (agent.primary_model) setSelectedModel(agent.primary_model);

                if (isTransitionalState(newStatus)) {
                    setPollInterval(3000);
                } else {
                    setPollInterval(10000);
                }
            }
        } catch (error) {
            console.warn("Failed to load config");
        }
    }, [agentId]);

    // Load provider key status
    const loadKeyStatus = useCallback(async () => {
        try {
            const res = await authFetch(`/api/agents/${agentId}/config`);
            if (res.ok) {
                const data = await res.json();
                setProviderKeyStatus({
                    anthropic: data.hasAnthropicKey || false,
                    openai: data.hasOpenaiKey || false,
                    openrouter: data.hasOpenrouterKey || false,
                    gemini: data.hasGeminiKey || false,
                    google: data.hasGeminiKey || false,
                    xai: data.hasXaiKey || false,
                    elevenlabs: data.hasElevenLabsKey || false,
                });
            }
        } catch (error) {
            console.warn("Failed to load key status");
        }
    }, [agentId]);

    // Load activity logs
    const loadActivity = useCallback(async () => {
        try {
            const res = await authFetch(`/api/agents/${agentId}/activity?limit=20`);
            if (res.ok) {
                const data = await res.json();
                setActivityLogs(data.logs || []);
            }
        } catch (error) {
            console.warn("Failed to load activity");
        }
    }, [agentId]);

    // Load cron jobs
    const loadCronJobs = useCallback(async () => {
        setIsLoadingCrons(true);
        try {
            const res = await authFetch(`/api/agents/${agentId}/cron`);
            if (res.ok) {
                const data = await res.json();
                setCronJobs(data.jobs || []);
                setSystemCronJobs(data.systemJobs || []);
            }
        } catch (error) {
            console.warn("Failed to load cron jobs");
        }
        setIsLoadingCrons(false);
    }, [agentId]);

    const addCronJob = async () => {
        if (!newCronSchedule || !newCronCommand) return;
        setIsAddingCron(true);
        try {
            const res = await authFetch(`/api/agents/${agentId}/cron`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schedule: newCronSchedule, command: newCronCommand, name: newCronName || "Unnamed task" }),
            });
            if (res.ok) {
                showStatus("success", "Scheduled task added");
                setShowAddCronModal(false);
                setNewCronName("");
                setNewCronSchedule("0 9 * * *");
                setNewCronCommand("");
                loadCronJobs();
            } else {
                const err = await res.json().catch(() => ({}));
                showStatus("error", err.error || "Failed to add task");
            }
        } catch {
            showStatus("error", "Failed to add scheduled task");
        }
        setIsAddingCron(false);
    };

    const deleteCronJob = async (job: { name: string; raw: string }) => {
        setIsDeletingCron(job.raw);
        try {
            const res = await authFetch(`/api/agents/${agentId}/cron`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ raw: job.raw, name: job.name }),
            });
            if (res.ok) {
                showStatus("success", "Scheduled task removed");
                loadCronJobs();
            } else {
                showStatus("error", "Failed to remove task");
            }
        } catch {
            showStatus("error", "Failed to remove scheduled task");
        }
        setIsDeletingCron(null);
    };

    const loadModelsConfig = useCallback(async () => {
        try {
            const res = await authFetch(`/api/agents/${agentId}/files?path=openclaw.json`);
            if (!res.ok) return;

            const data = await res.json();
            const parsed = JSON.parse(data.content || "{}") as Record<string, unknown>;
            const agents = (parsed.agents || {}) as Record<string, unknown>;
            const defaults = (agents.defaults || {}) as Record<string, unknown>;
            const modelConfig = defaults.model;

            if (typeof modelConfig === "string") {
                if (!modelConfig.includes("${") && modelConfig.includes("/")) {
                    setSelectedModel(modelConfig);
                }
                setSecondaryModels([]);
                return;
            }

            if (modelConfig && typeof modelConfig === "object") {
                const modelObject = modelConfig as Record<string, unknown>;
                const primary = typeof modelObject.primary === "string" ? modelObject.primary : "";
                const fallbackValues = Array.isArray(modelObject.fallbacks)
                    ? modelObject.fallbacks.filter((entry): entry is string => typeof entry === "string")
                    : [];

                if (primary && !primary.includes("${") && primary.includes("/")) {
                    setSelectedModel(primary);
                }

                setSecondaryModels(
                    fallbackValues.map((model, index) => ({
                        id: `fallback-${index}-${model}`,
                        model,
                        useCase: "",
                        apiKey: "",
                    }))
                );
            }
        } catch (error) {
            console.warn("Failed to load model config");
        }
    }, [agentId]);

    useEffect(() => {
        loadConfig();
        loadActivity();
        loadKeyStatus();
        setPollCountdown(Math.max(1, Math.floor(pollInterval / 1000)));
        const interval = setInterval(() => {
            loadConfig();
            loadActivity();
            setPollCountdown(Math.max(1, Math.floor(pollInterval / 1000)));
        }, pollInterval);
        return () => clearInterval(interval);
    }, [loadConfig, loadActivity, loadKeyStatus, pollInterval]);

    useEffect(() => {
        setPollCountdown(Math.max(1, Math.floor(pollInterval / 1000)));
        const countdown = setInterval(() => {
            setPollCountdown((previous) => (previous <= 1 ? Math.max(1, Math.floor(pollInterval / 1000)) : previous - 1));
        }, 1000);
        return () => clearInterval(countdown);
    }, [pollInterval]);

    useEffect(() => {
        if (activeTab === "models") {
            loadModelsConfig();
        }
    }, [activeTab, loadModelsConfig]);

    // Restart OpenClaw helper
    const restartOpenClaw = async () => {
        try {
            await authFetch(`/api/agents/${agentId}/actions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "restart_openclaw" }),
            });
        } catch (error) {
            console.warn("Failed to restart OpenClaw");
        }
    };

    // Install a skill
    const installSkillAction = async (skillId: string) => {
        setInstallingSkill(skillId);
        try {
            const res = await authFetch(`/api/agents/${agentId}/actions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "install_skill", skillName: skillId }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.status === "Success") {
                    showStatus("success", `${skillId} installed successfully.`);
                    setAgentConfig((prev: AgentConfig | null) => prev ? ({
                        ...prev,
                        skills: [...prev.skills, skillId]
                    }) : null);
                } else {
                    showStatus("success", `Install queued for ${skillId}. It may take up to a minute.`);
                }
            } else {
                showStatus("error", "Failed to install skill");
            }
        } catch (error) {
            showStatus("error", "Installation failed");
        }
        setInstallingSkill(null);
    };

    // Load file content when file is selected
    const loadFile = useCallback(async (filename: string) => {
        setIsLoadingFile(true);
        setFileContent("");
        try {
            const res = await authFetch(`/api/agents/${agentId}/files?path=${encodeURIComponent(filename)}`);
            if (res.ok) {
                const data = await res.json();
                setFileContent(data.content || "");
            } else {
                const err = await res.json().catch(() => ({}));
                setFileContent(`# Error loading file\n# ${err.error || "Instance may be offline"}`);
            }
        } catch (error) {
            console.error("Failed to load file:", error);
            setFileContent("# Error loading file\n# Network error — is the instance online?");
        }
        setIsLoadingFile(false);
    }, [agentId]);

    // Save file content
    const saveFile = async () => {
        if (!selectedFile) return;
        setIsSavingFile(true);
        try {
            const res = await authFetch(`/api/agents/${agentId}/files?path=${encodeURIComponent(selectedFile)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: fileContent }),
            });
            if (res.ok) {
                const data = await res.json();
                showStatus("success", "File saved to VM");
                // Auto-restart OpenClaw if openclaw.json was saved
                if (selectedFile === "openclaw.json" || data.restartRequired) {
                    await restartOpenClaw();
                    showStatus("success", "File saved & OpenClaw restarting");
                }
            } else {
                showStatus("error", "Failed to save file");
            }
        } catch (error) {
            showStatus("error", "Failed to save file");
        }
        setIsSavingFile(false);
    };

    // Auto-load cron jobs when automation tab opens
    useEffect(() => {
        if (activeTab === "automation") {
            loadCronJobs();
        }
    }, [activeTab, loadCronJobs]);

    // Auto-load file when workspace tab opens
    useEffect(() => {
        if (activeTab === "workspace" && !selectedFile) {
            setSelectedFile("SOUL.md");
        }
    }, [activeTab, selectedFile]);

    // Load file when selected
    useEffect(() => {
        if (selectedFile) {
            loadFile(selectedFile);
        }
    }, [selectedFile, loadFile]);

    const agentName = agentConfig?.agentName || "Atlas";
    const statusDisplay = getStatusDisplay(agentConfig?.status || "offline");

    const messagesCount = agentConfig?.messagesCount || 0;
    const tasksCompleted = agentConfig?.tasksCompleted || 0;
    const apiCost = agentConfig?.apiCostUsd || 0;
    const storageUsedGB = (agentConfig?.storageUsedBytes || 0) / (1024 * 1024 * 1024);
    const storageTotalGB = Math.max((agentConfig?.storageTotalBytes || 0) / (1024 * 1024 * 1024), storageUsedGB, 0);
    const cpuUsage = agentConfig?.cpuUsagePercent || 0;
    const memoryUsed = agentConfig?.memoryUsedMb || 0;
    const memoryTotal = Math.max(agentConfig?.memoryTotalMb || 0, memoryUsed, 0);
    const uptime = formatDuration(agentConfig?.systemUptimeSeconds || 0);
    const heartbeatLabel = formatHeartbeatAge(agentConfig?.heartbeatAgeSeconds ?? null);
    const runtimeChecks = agentConfig?.checks || [];
    const runtimeErrorCount = runtimeChecks.filter((check) => check.status === "error").length;
    const runtimeWarnCount = runtimeChecks.filter((check) => check.status === "warn").length;

    const tabs: { id: TabId; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
        { id: "overview", label: "Overview", icon: <Sparkles className="w-4 h-4" /> },
        { id: "chat", label: "Chat", icon: <MessageCircle className="w-4 h-4" /> },
        { id: "models", label: "Models", icon: <Layers className="w-4 h-4" /> },
        { id: "desktop", label: "Desktop", icon: <Monitor className="w-4 h-4" /> },
        { id: "skills", label: "Skills", icon: <Wrench className="w-4 h-4" /> },
        { id: "automation", label: "Automation", icon: <Zap className="w-4 h-4" /> },
        { id: "configuration", label: "Configuration", icon: <Settings className="w-4 h-4" /> },
        { id: "workspace", label: "Workspace", icon: <FolderOpen className="w-4 h-4" /> },
        { id: "console", label: "Terminal", icon: <TerminalSquare className="w-4 h-4" /> },
    ];

    // Save models config — uses the files route for reliable JSON merge
    const saveModelsConfig = async () => {
        setIsSavingModels(true);
        try {
            const primaryProvider = getProviderForModel(selectedModel);
            if (!primaryProvider) {
                throw new Error("Primary model must be in provider/model format");
            }

            const fallbackModels = Array.from(new Set(
                secondaryModels
                    .filter(m => m.model)
                    .map(m => m.model)
                    .filter(model => model !== selectedModel)
            ));

            const modelProviders = new Set<string>([primaryProvider]);
            fallbackModels.forEach((model) => {
                const provider = getProviderForModel(model);
                if (provider) modelProviders.add(provider);
            });

            const providedKeys: Record<string, string> = {};
            if (primaryModelApiKey.trim()) {
                providedKeys[primaryProvider] = primaryModelApiKey.trim();
            }
            for (const backup of secondaryModels) {
                if (!backup.model || !backup.apiKey?.trim()) continue;
                const provider = getProviderForModel(backup.model);
                if (!provider) continue;
                providedKeys[provider] = backup.apiKey.trim();
            }

            const missingProviders = Array.from(modelProviders).filter((provider) => {
                const hasStoredKey =
                    provider === "google"
                        ? (providerKeyStatus.google || providerKeyStatus.gemini)
                        : providerKeyStatus[provider];
                const hasNewKey = Boolean(providedKeys[provider]);
                return !hasStoredKey && !hasNewKey;
            });

            if (missingProviders.length > 0) {
                const labels = missingProviders.map((provider) => getProviderCatalog(provider)?.label || provider);
                throw new Error(`Missing API key for: ${labels.join(", ")}`);
            }

            // 1. Update DB + provider keys
            const patchBody: Record<string, string> = {
                primaryModel: selectedModel,
            };
            for (const [provider, apiKey] of Object.entries(providedKeys)) {
                const configField = getProviderConfigField(provider);
                if (configField) {
                    patchBody[configField] = apiKey;
                }
            }
            const patchRes = await authFetch(`/api/agents/${agentId}/config`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patchBody),
            });
            if (!patchRes.ok) {
                const err = await patchRes.json().catch(() => ({}));
                throw new Error(err.error || "Failed to save model settings");
            }

            // 2. Read current openclaw.json from instance
            const readRes = await authFetch(`/api/agents/${agentId}/files?path=openclaw.json`);
            let config: Record<string, unknown> = {};
            if (readRes.ok) {
                const readData = await readRes.json();
                try {
                    config = JSON.parse(readData.content || "{}");
                } catch {
                    config = {};
                }
            }

            // 3. Merge model config — keep ${LLM_MODEL} env ref for primary
            if (!config.agents) config.agents = {};
            const agents = config.agents as Record<string, unknown>;
            if (!agents.defaults) agents.defaults = {};
            const defaults = agents.defaults as Record<string, unknown>;
            const existingModelObject = (defaults.model && typeof defaults.model === "object")
                ? defaults.model as Record<string, unknown>
                : {};

            if (fallbackModels.length > 0) {
                defaults.model = {
                    ...existingModelObject,
                    primary: "${LLM_MODEL}",
                    fallbacks: fallbackModels,
                };
            } else {
                defaults.model = "${LLM_MODEL}";
            }

            // 4. Write updated config back
            const writeRes = await authFetch(`/api/agents/${agentId}/files?path=openclaw.json`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: JSON.stringify(config, null, 2) }),
            });
            if (!writeRes.ok) {
                const err = await writeRes.json().catch(() => ({}));
                throw new Error(err.error || "Failed to write openclaw.json");
            }

            // 5. Restart OpenClaw
            await restartOpenClaw();
            setPrimaryModelApiKey("");
            setSecondaryModels((prev) => prev.map((model) => ({ ...model, apiKey: "" })));
            await loadKeyStatus();

            showStatus("success", "Models configuration saved & OpenClaw restarting");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save models configuration";
            showStatus("error", message);
        }
        setIsSavingModels(false);
    };

    const addSecondaryModel = () => {
        if (secondaryModels.length >= 10) {
            showStatus("error", "Maximum 10 models allowed");
            return;
        }
        setSecondaryModels(prev => [...prev, {
            id: crypto.randomUUID(),
            model: "",
            useCase: "",
            apiKey: ""
        }]);
    };

    const removeSecondaryModel = (id: string) => {
        setSecondaryModels(prev => prev.filter(m => m.id !== id));
    };

    const updateSecondaryModel = (id: string, field: keyof SecondaryModel, value: string) => {
        setSecondaryModels(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const createDesktopPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const rotateDesktopPassword = async (newPassword: string, options?: { silent?: boolean }) => {
        try {
            const res = await authFetch(`/api/agents/${agentId}/rotate-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to rotate password");
            }

            setConnectionPassword(newPassword);
            if (!options?.silent) {
                showStatus("success", "Password rotated successfully.");
            }
            return true;
        } catch (error: any) {
            if (!options?.silent) {
                showStatus("error", error.message || "Failed to rotate password");
            }
            return false;
        }
    };

    const generateNewPassword = async () => {
        setIsRotatingPassword(true);
        const newPassword = createDesktopPassword();
        try {
            await rotateDesktopPassword(newPassword);
        } finally {
            setIsRotatingPassword(false);
        }
    };

    const connectDesktop = async () => {
        if (!connectionPassword) {
            setIsRotatingPassword(true);
            const bootstrapPassword = createDesktopPassword();
            const success = await rotateDesktopPassword(bootstrapPassword, { silent: true });
            setIsRotatingPassword(false);
            if (!success) {
                showStatus("error", "Could not initialize desktop password");
                return;
            }
            showStatus("success", "Desktop password initialized.");
        }
        setDesktopConnected(true);
    };

    // Approve Telegram pairing code
    const approvePairing = async () => {
        const code = pairingCode.trim().toUpperCase();
        if (!code) return;
        setIsApprovingPairing(true);
        try {
            const res = await authFetch(`/api/agents/${agentId}/command`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    command: `export HOME=/root && source /root/.openclaw/.env && openclaw pairing approve telegram ${code}`,
                }),
            });
            const data = await res.json();
            if (res.ok && (data.status === "Success" || data.status === "Pending")) {
                if (data.status === "Pending") {
                    showStatus("success", "Pairing command sent! Check Telegram for confirmation.");
                } else {
                    showStatus("success", "Pairing approved! Your Telegram is now connected.");
                }
                setTelegramPaired(true);
                setPairingCode("");
            } else {
                showStatus("error", data.error || data.output || "Failed to approve pairing code");
            }
        } catch (error: any) {
            showStatus("error", error.message || "Failed to approve pairing");
        }
        setIsApprovingPairing(false);
    };

    // Perform agent action (pause, reboot)
    const performAction = async (action: string) => {
        if (!confirm(`Are you sure you want to ${action} this agent?`)) return;
        setIsPerformingAction(true);
        try {
            const res = await authFetch(`/api/agents/${agentId}/actions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (res.ok) {
                const data = await res.json();
                showStatus("success", data.message || `${action} successful`);
                setPollInterval(3000);
                setTimeout(() => loadConfig(), 1000);
            } else {
                const errData = await res.json().catch(() => ({}));
                showStatus("error", errData.error || `Failed to ${action}`);
            }
        } catch (error) {
            showStatus("error", `Failed to ${action}`);
        }
        setIsPerformingAction(false);
    };

    // Delete employee — terminates EC2 + removes from DB
    const handleDelete = async () => {
        if (deleteConfirmText !== "DELETE") return;
        setIsDeleting(true);
        try {
            const res = await authFetch(`/api/agents/${agentId}/actions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete" }),
            });
            if (res.ok) {
                showStatus("success", "Employee deleted");
                router.push("/dashboard");
            } else {
                const errData = await res.json().catch(() => ({}));
                showStatus("error", errData.error || "Failed to delete");
            }
        } catch (error) {
            showStatus("error", "Failed to delete employee");
        }
        setIsDeleting(false);
        setShowDeleteModal(false);
    };

    // Restart OpenClaw button handler
    const handleRestartOpenClaw = async () => {
        if (!confirm("Restart OpenClaw? This will briefly disconnect your agent.")) return;
        setIsPerformingAction(true);
        try {
            await restartOpenClaw();
            showStatus("success", "OpenClaw restarting...");
            setPollInterval(3000);
        } catch {
            showStatus("error", "Failed to restart OpenClaw");
        }
        setIsPerformingAction(false);
    };

    // Open reset wizard
    const openResetWizard = () => {
        setResetModel(selectedModel);
        setResetProvider(getProviderForModel(selectedModel) || "anthropic");
        setResetApiKey("");
        setResetName(agentName);
        setResetPersonality(agentConfig?.personality || "");
        setResetBusinessType("");
        setResetSelectedSkills([]);
        setResetStep(0);
        setShowResetModal(true);
    };

    // Execute reset
    const handleReset = async () => {
        setIsResetting(true);
        try {
            const res = await authFetch(`/api/agents/${agentId}/actions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reset",
                    newModel: resetModel,
                    newProvider: resetProvider,
                    newApiKey: resetApiKey || undefined,
                    newName: resetName,
                    newPersonality: resetPersonality,
                    selectedSkills: resetSelectedSkills,
                }),
            });
            if (res.ok) {
                showStatus("success", "Instance resetting — this may take a few minutes");
                setShowResetModal(false);
                setPollInterval(3000);
                setTimeout(() => loadConfig(), 2000);
            } else {
                const errData = await res.json().catch(() => ({}));
                showStatus("error", errData.error || "Reset failed");
            }
        } catch (error) {
            showStatus("error", "Reset failed");
        }
        setIsResetting(false);
    };

    // Save API key for a provider
    const saveApiKey = async (provider: string) => {
        const keyValue = (apiKeyInputs[provider] || "").trim();
        if (!keyValue) return;
        setSavingProviderId(provider);

        const keyMap: Record<string, string> = {
            anthropic: "anthropicApiKey",
            openai: "openaiApiKey",
            openrouter: "openrouterApiKey",
            gemini: "geminiApiKey",
            google: "geminiApiKey",
            xai: "xaiApiKey",
            elevenlabs: "elevenLabsApiKey",
        };

        const body: Record<string, string> = {};
        body[keyMap[provider] || `${provider}ApiKey`] = keyValue;

        try {
            const res = await authFetch(`/api/agents/${agentId}/config`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const data = await res.json();
                const syncMsg = data.synced ? "saved & synced to instance" : "saved (will apply on restart)";
                showStatus("success", `${provider} API key ${syncMsg}`);
                setApiKeyInputs(prev => ({ ...prev, [provider]: "" }));
                setProviderKeyStatus(prev => ({ ...prev, [provider]: true }));
                setExpandedProvider(null);
                loadKeyStatus();
            } else {
                const err = await res.json().catch(() => ({}));
                showStatus("error", err.error || "Failed to save API key");
            }
        } catch (error) {
            showStatus("error", "Failed to save API key");
        } finally {
            setSavingProviderId(null);
        }
    };

    // Show status message
    const showStatus = (type: "success" | "error", text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage(null), 4000);
    };

    // ========== RENDER FUNCTIONS ==========

    const renderOverview = () => (
        <motion.div
            key="overview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Hero Status Card (Span 2) */}
                <div className="col-span-1 md:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(agentConfig?.status || "offline")}`} />
                                <span className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider">System Status</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1">{statusDisplay.label}</h3>
                            <p className="text-sm text-[var(--text-dim)] font-mono">
                                Uptime: {uptime} &bull; Heartbeat: {heartbeatLabel} &bull; Refresh: {pollCountdown}s
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/30 transition-colors">
                            <Zap className={`w-6 h-6 ${agentConfig?.status === 'running' || agentConfig?.status === 'online' ? 'text-orange-400' : 'text-gray-500'}`} />
                        </div>
                    </div>
                </div>

                {/* Model Card */}
                <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-purple-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Brain</span>
                        <Brain className="w-4 h-4 text-purple-400 opacity-50 group-hover:opacity-100" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white mb-1 truncate">{selectedModel.split("/")[1] || selectedModel}</div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
                            <span className="truncate max-w-[100px]">{selectedModel.split("/")[0]}</span>
                            {secondaryModels.length > 0 && (
                                <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/50">+{secondaryModels.length}</span>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setActiveTab("models")} className="mt-4 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        Configure <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Telegram Card */}
                <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Comms</span>
                        <MessageCircle className="w-4 h-4 text-blue-400 opacity-50 group-hover:opacity-100" />
                    </div>
                    {telegramPaired ? (
                        <div>
                            <div className="text-lg font-bold text-white mb-1">Connected</div>
                            <div className="text-xs text-[var(--text-dim)]">Telegram Bot Active</div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-lg font-bold text-white mb-1">Not Paired</div>
                            <div className="text-xs text-[var(--text-dim)]">Connect Telegram</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3 glass-panel rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider">Realtime Metrics</h3>
                        <span className="text-xs text-[var(--text-dim)]">OpenClaw: {agentConfig?.openclawStatus || "unknown"}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <MetricCard
                            icon={<Gauge className="w-4 h-4" />}
                            label="CPU"
                            value={`${cpuUsage}%`}
                            subtext={`Load 1m: ${toNumber(agentConfig?.load1m, 0).toFixed(2)}`}
                            status={agentConfig?.openclawStatus === "online" ? "online" : "offline"}
                        />
                        <MetricCard
                            icon={<Brain className="w-4 h-4" />}
                            label="Memory"
                            value={`${memoryUsed} MB`}
                            subtext={memoryTotal > 0 ? `of ${memoryTotal} MB` : "total unknown"}
                            status={agentConfig?.openclawStatus === "online" ? "online" : "offline"}
                        />
                        <MetricCard
                            icon={<HardDrive className="w-4 h-4" />}
                            label="Disk"
                            value={`${storageUsedGB.toFixed(1)} GB`}
                            subtext={storageTotalGB > 0 ? `of ${storageTotalGB.toFixed(1)} GB` : "total unknown"}
                            status={agentConfig?.openclawStatus === "online" ? "online" : "offline"}
                        />
                        <MetricCard
                            icon={<Heart className="w-4 h-4" />}
                            label="Heartbeat"
                            value={heartbeatLabel}
                            subtext={agentConfig?.openclawUptimeSeconds ? `Gateway up ${formatDuration(agentConfig.openclawUptimeSeconds)}` : "Gateway uptime unknown"}
                            status={agentConfig?.openclawStatus === "online" ? "online" : "offline"}
                        />
                    </div>
                </div>
                <div className="xl:col-span-2 glass-panel rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider">Health Checks</h3>
                        <span className="text-xs text-[var(--text-dim)]">
                            {runtimeErrorCount} errors • {runtimeWarnCount} warnings
                        </span>
                    </div>
                    {runtimeChecks.length > 0 ? (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                            {runtimeChecks.map((check) => (
                                <div key={`${check.name}-${check.status}-${check.message}`} className="border border-white/10 rounded-xl px-3 py-2 bg-white/5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm text-white font-medium truncate">{check.name.replace(/_/g, " ")}</div>
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${getCheckBadgeStyles(check.status)}`}>
                                            {check.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">{check.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--text-muted)]">
                            No heartbeat checks available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Telegram Pairing (Conditional) */}
            {!telegramPaired && (
                <div className="glass-panel rounded-2xl p-8 border-l-4 border-l-blue-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 text-blue-500">
                            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.323-.913.481-1.302.473-.428-.008-1.252-.241-1.865-.44-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.119.098.152.228.166.33.016.116.031.292.014.535z" />
                        </svg>
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">Connect Neural Interface</h3>
                        <p className="text-[var(--text-muted)] mb-6 text-sm">Link your Telegram account to control {agentName} remotely.</p>

                        {agentConfig?.telegramToken ? (
                            <>
                                {/* Bot already created during onboarding — just need to pair */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">1</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Open your bot on Telegram</p>
                                            <p className="text-xs text-[var(--text-muted)]">Search for your bot username @{agentConfig.agentName.replace(/\s+/g, '')}_bot and tap Start</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">2</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Message the bot</p>
                                            <p className="text-xs text-[var(--text-muted)]">Send a message like "Hello" or "Start" to receive your 6-digit code</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">3</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Enter code below</p>
                                            <p className="text-xs text-[var(--text-muted)]">Paste the pairing code here to link your account</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* No bot token — user needs to create bot first */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0 mt-0.5">1</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Open Telegram &amp; search @BotFather</p>
                                            <p className="text-xs text-[var(--text-muted)]">Official bot creator</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0 mt-0.5">2</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Send <code className="bg-white/10 px-1.5 py-0.5 rounded text-orange-300 text-xs">/newbot</code></p>
                                            <p className="text-xs text-[var(--text-muted)]">Create a new bot user</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0 mt-0.5">3</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Copy bot token</p>
                                            <p className="text-xs text-[var(--text-muted)]">You'll need this later</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0 mt-0.5">4</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Message your new bot</p>
                                            <p className="text-xs text-[var(--text-muted)]">Search standard Telegram for your bot name</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0 mt-0.5">5</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Get pairing code</p>
                                            <p className="text-xs text-[var(--text-muted)]">Bot will reply with 6-char code</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0 mt-0.5">6</div>
                                        <div>
                                            <p className="text-sm text-white font-medium mb-0.5">Enter code below and Link</p>
                                            <p className="text-xs text-[var(--text-muted)]">Connects your account</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={pairingCode}
                                onChange={(e) => setPairingCode(e.target.value)}
                                placeholder="ENTER PAIRING CODE"
                                className="input flex-1 font-mono tracking-widest text-center uppercase"
                            />
                            <button
                                onClick={approvePairing}
                                disabled={!pairingCode || isApprovingPairing}
                                className="btn-primary"
                            >
                                {isApprovingPairing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Link"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Activity Feed */}
            <div className="glass-panel rounded-2xl p-6 min-h-[300px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        Live Neural Activity
                    </h3>
                    <button className="text-xs text-[var(--text-muted)] hover:text-white transition-colors">
                        View Full Logs
                    </button>
                </div>

                {activityLogs.length > 0 ? (
                    <div className="space-y-3">
                        {activityLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                                <div className="w-2 h-2 rounded-full bg-orange-500/50 mt-2 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[var(--text-secondary)] truncate">{log.content}</p>
                                    <p className="text-[10px] text-[var(--text-dim)] font-mono">{new Date(log.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text-muted)] text-sm">Waiting for incoming signals...</p>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderChat = () => (
        <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col"
        >
            <ChatInterface agentId={agentId} agentName={agentName} />
        </motion.div>
    );

    const renderModels = () => {
        const selectedProviderId = getProviderForModel(selectedModel);
        const selectedProvider = getProviderCatalog(selectedProviderId);
        const selectedModelInfo = getModelCatalog(selectedModel);
        const selectedModelInCatalog = Boolean(selectedModelInfo);
        const selectedProviderHasKey = selectedProviderId === "google"
            ? Boolean(providerKeyStatus.google || providerKeyStatus.gemini)
            : Boolean(providerKeyStatus[selectedProviderId]);

        return (
            <motion.div
                key="models"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">Neural Configuration</h2>
                    <p className="text-[var(--text-muted)]">Provider-grouped model catalog with key safety checks</p>
                </div>

                <div className="glass-card p-2 rounded-2xl w-full max-w-xl mx-auto">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setModelsView("catalog")}
                            className={`px-3 py-3 rounded-xl text-left border transition-all ${modelsView === "catalog" ? "bg-white/10 text-white border-white/20" : "text-[var(--text-muted)] border-white/5 hover:text-white hover:bg-white/5"}`}
                        >
                            <div className="text-sm font-semibold">Model Catalog</div>
                            <div className="text-[11px] opacity-80">Pick primary + fallback models</div>
                        </button>
                        <button
                            onClick={() => setModelsView("suggestions")}
                            className={`px-3 py-3 rounded-xl text-left border transition-all ${modelsView === "suggestions" ? "bg-white/10 text-white border-white/20" : "text-[var(--text-muted)] border-white/5 hover:text-white hover:bg-white/5"}`}
                        >
                            <div className="text-sm font-semibold">Suggestions</div>
                            <div className="text-[11px] opacity-80">Budget and use-case presets</div>
                        </button>
                    </div>
                </div>

                {modelsView === "catalog" ? (
                    <>
                        <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] -z-10" />
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <Brain className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Primary Intelligence</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Provider and model refs follow OpenClaw format (`provider/model`).
                                        </p>
                                    </div>

                                    <div className="relative group">
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-10 text-white focus:border-purple-500/50 appearance-none font-mono text-sm transition-all hover:bg-white/10"
                                        >
                                            {!selectedModelInCatalog && (
                                                <option value={selectedModel}>
                                                    Current instance model (custom): {selectedModel}
                                                </option>
                                            )}
                                            {PROVIDER_CATALOG.map((provider) => (
                                                <optgroup key={provider.id} label={provider.label}>
                                                    {provider.models.map((model) => (
                                                        <option key={model.id} value={model.id}>{model.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                                    </div>

                                    <div className="text-xs text-[var(--text-muted)] font-mono bg-white/5 border border-white/10 rounded-lg p-3">
                                        <div className="text-white font-semibold mb-1">{selectedModelInfo?.name || selectedModel}</div>
                                        <div className="mb-1">Model ref: {selectedModel}</div>
                                        <div>Provider key: {selectedProvider?.envKey || "Unknown"}</div>
                                    </div>

                                    {!selectedModelInCatalog && (
                                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                                            Your instance is using a custom or legacy model ref. You can keep it, or switch to a catalog model above.
                                        </div>
                                    )}

                                    <div className={`rounded-lg border p-3 text-sm ${selectedProviderHasKey ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                                        {selectedProviderHasKey
                                            ? `${selectedProvider?.label || "Provider"} API key is configured.`
                                            : `Missing API key for ${selectedProvider?.label || "this provider"} - add it below before saving.`}
                                    </div>

                                    {!selectedProviderHasKey && selectedProvider && (
                                        <div className="space-y-2">
                                            <input
                                                type="password"
                                                value={primaryModelApiKey}
                                                onChange={(e) => setPrimaryModelApiKey(e.target.value)}
                                                placeholder={`Paste ${selectedProvider.envKey} (saved on deploy)`}
                                                className="input w-full font-mono text-sm"
                                            />
                                            <button
                                                onClick={() => setActiveTab("configuration")}
                                                className="text-xs text-amber-200 hover:text-white underline underline-offset-2"
                                            >
                                                Open Configuration to manage all provider keys
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Fallback Models</h3>
                                        <p className="text-xs text-[var(--text-muted)]">Optional backups if the primary model fails</p>
                                    </div>
                                </div>
                                <button
                                    onClick={addSecondaryModel}
                                    disabled={secondaryModels.length >= 10}
                                    className="btn-glass flex items-center gap-2 text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Backup
                                </button>
                            </div>

                            {secondaryModels.length === 0 && (
                                <div className="text-center py-8 text-[var(--text-dim)] text-sm">
                                    No fallback models configured. Click &quot;Add Backup&quot; to add one.
                                </div>
                            )}

                            {secondaryModels.map((sm, idx) => {
                                const fallbackProvider = getProviderForModel(sm.model);
                                const fallbackProviderInfo = getProviderCatalog(fallbackProvider);
                                const fallbackHasKey = fallbackProvider === "google"
                                    ? Boolean(providerKeyStatus.google || providerKeyStatus.gemini)
                                    : Boolean(providerKeyStatus[fallbackProvider]);

                                return (
                                    <div key={sm.id} className="mb-4 bg-white/3 rounded-xl p-4 border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[var(--text-dim)] flex items-center justify-center">
                                                    {String(idx + 1).padStart(2, "0")}
                                                </div>
                                                <div className="text-xs text-[var(--text-muted)]">
                                                    {fallbackProviderInfo?.label || "Backup Model"}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeSecondaryModel(sm.id)}
                                                className="px-2.5 py-1.5 hover:bg-red-500/10 rounded-lg text-red-400/60 hover:text-red-400 text-xs border border-red-500/20"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                            <div className="lg:col-span-5">
                                                <label className="block text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                                                    Backup model
                                                </label>
                                                <select
                                                    value={sm.model}
                                                    onChange={(e) => updateSecondaryModel(sm.id, "model", e.target.value)}
                                                    className="input text-xs py-2 min-w-0 w-full"
                                                >
                                                    <option value="">Select backup model...</option>
                                                    {sm.model && !getModelCatalog(sm.model) && (
                                                        <option value={sm.model}>Current custom model: {sm.model}</option>
                                                    )}
                                                    {PROVIDER_CATALOG.map((provider) => (
                                                        <optgroup key={provider.id} label={provider.label}>
                                                            {provider.models.map((model) => (
                                                                <option key={model.id} value={model.id}>{model.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="lg:col-span-4">
                                                <label className="block text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                                                    Trigger
                                                </label>
                                                <input
                                                    type="text"
                                                    value={sm.useCase}
                                                    onChange={(e) => updateSecondaryModel(sm.id, "useCase", e.target.value)}
                                                    placeholder="e.g. rate_limit, timeout"
                                                    className="input text-xs py-2 min-w-0 w-full"
                                                />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <label className="block text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
                                                    Provider key
                                                </label>
                                                <input
                                                    type="password"
                                                    value={sm.apiKey}
                                                    onChange={(e) => updateSecondaryModel(sm.id, "apiKey", e.target.value)}
                                                    placeholder={
                                                        fallbackProviderInfo
                                                            ? `${fallbackProviderInfo.envKey} (optional)`
                                                            : "Provider API key (optional)"
                                                    }
                                                    className="input text-xs py-2 min-w-0 w-full"
                                                />
                                            </div>
                                        </div>

                                        {sm.model && !fallbackHasKey && !sm.apiKey && (
                                            <p className="text-[11px] text-amber-300">
                                                Missing key for {fallbackProviderInfo?.label || fallbackProvider}. Add one here or in Configuration tab.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Budget Picks</h3>
                            <p className="text-sm text-[var(--text-muted)] mb-4">Choose based on your spend tolerance and orchestration volume.</p>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {BUDGET_RECOMMENDATIONS.map((tier) => (
                                    <div key={tier.budget} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <h4 className="text-white font-semibold mb-1">{tier.title}</h4>
                                        <p className="text-xs text-[var(--text-muted)] mb-3">{tier.summary}</p>
                                        <div className="space-y-2">
                                            {tier.modelIds.map((modelId) => {
                                                const model = getModelCatalog(modelId);
                                                if (!model) return null;
                                                return (
                                                    <button
                                                        key={modelId}
                                                        onClick={() => {
                                                            setSelectedModel(modelId);
                                                            setModelsView("catalog");
                                                        }}
                                                        className="w-full text-left text-xs bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-lg p-2"
                                                    >
                                                        <div className="text-white font-medium">{model.name}</div>
                                                        <div className="text-[var(--text-muted)]">{model.providerLabel}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Use-Case Picks</h3>
                            <p className="text-sm text-[var(--text-muted)] mb-4">Quick defaults for common orchestration scenarios.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {USE_CASE_RECOMMENDATIONS.map((item) => {
                                    const model = getModelCatalog(item.modelId);
                                    if (!model) return null;
                                    return (
                                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="text-white font-semibold mb-1">{item.label}</div>
                                            <div className="text-xs text-[var(--text-muted)] mb-3">{item.summary}</div>
                                            <button
                                                onClick={() => {
                                                    setSelectedModel(item.modelId);
                                                    setModelsView("catalog");
                                                }}
                                                className="btn-glass text-xs px-3 py-2"
                                            >
                                                Use {model.name}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        onClick={saveModelsConfig}
                        disabled={isSavingModels}
                        className="btn-primary flex items-center gap-2"
                    >
                        {isSavingModels ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Deploy Configuration
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderDesktop = () => (
        <motion.div
            key="desktop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full flex flex-col"
        >
            {agentConfig?.status !== "online" && agentConfig?.status !== "running" ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Monitor className="w-10 h-10 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Instance Offline</h3>
                    <p className="text-[var(--text-muted)] max-w-md">
                        The desktop viewer requires the instance to be online. Start or resume your agent to access the desktop.
                    </p>
                </div>
            ) : !desktopConnected ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Monitor className="w-10 h-10 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Remote Desktop</h3>
                    <p className="text-[var(--text-muted)] max-w-md mb-6">
                        View and interact with your agent&apos;s desktop environment via noVNC.
                    </p>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-sm text-[var(--text-muted)]">
                            Password: {connectionPassword ? (
                                <code className="bg-white/10 px-2 py-0.5 rounded font-mono text-white">{connectionPassword}</code>
                            ) : (
                                <span className="text-[var(--text-dim)]">Will be generated on connect</span>
                            )}
                        </div>
                        <button
                            onClick={generateNewPassword}
                            disabled={isRotatingPassword}
                            className="btn-glass px-3 py-1.5 text-xs flex items-center gap-2"
                        >
                            {isRotatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Rotate
                        </button>
                    </div>

                    <button
                        onClick={connectDesktop}
                        disabled={isRotatingPassword}
                        className="btn-primary flex items-center gap-2 disabled:opacity-60"
                    >
                        {isRotatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Monitor className="w-4 h-4" />}
                        Connect to Desktop
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[var(--text-muted)]">Connected to {agentConfig?.ipAddress}:6080</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={generateNewPassword}
                                disabled={isRotatingPassword}
                                className="btn-glass px-3 py-1.5 text-xs flex items-center gap-2"
                            >
                                {isRotatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                                Rotate Password
                            </button>
                            <button
                                onClick={() => setDesktopConnected(false)}
                                className="btn-glass px-3 py-1.5 text-xs flex items-center gap-2 text-red-400"
                            >
                                <X className="w-3.5 h-3.5" /> Disconnect
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 glass-card rounded-xl overflow-hidden min-h-[500px]">
                        <iframe
                            src={`http://${agentConfig?.ipAddress}:6080/vnc.html?autoconnect=true&password=${encodeURIComponent(connectionPassword)}&resize=scale`}
                            className="w-full h-full border-0"
                            allow="clipboard-read; clipboard-write"
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );

    const renderSkills = () => (
        <motion.div
            key="skills"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Neural Skills</h2>
                    <p className="text-[var(--text-muted)] text-sm">Expand {agentName}&apos;s capabilities with new modules</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search skills..."
                        className="input pl-10 w-full bg-white/5 border-white/10 focus:border-orange-500/50"
                    />
                </div>
            </div>

            {/* API Key Guidance */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-l-orange-500 bg-orange-500/5 flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-orange-200 text-sm">Configuration Required</h4>
                    <p className="text-xs text-orange-200/70 mt-1">
                        Some skills require API keys. Configure them in the <button onClick={() => setActiveTab("configuration")} className="underline hover:text-white">Configuration</button> tab.
                        If a skill needs a specific provider key, add it once and it will be synced to your instance.
                    </p>
                </div>
            </div>

            {/* Installed Skills */}
            <div className="space-y-4">
                <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Installed Modules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {universalSkills.map((skill) => (
                        <div key={skill.id} className="glass-card p-4 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
                                    <skill.icon className="w-5 h-5" />
                                </div>
                                <div className="px-2 py-1 rounded text-[10px] font-mono bg-green-500/20 text-green-400 border border-green-500/30">
                                    ACTIVE
                                </div>
                            </div>
                            <h4 className="font-bold text-white mb-1">{skill.name}</h4>
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2">{skill.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Marketplace */}
            <div className="space-y-4">
                <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> Skill Marketplace
                </h3>
                <div className="grid grid-cols-1 gap-8">
                    {Object.entries(CATEGORY_SKILLS_MAP).map(([category, skills]) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-widest pl-1 border-l-2 border-white/10">{category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(skills || []).map((skill) => (
                                    <div key={skill.id} className="glass-card p-5 rounded-xl flex flex-col h-full hover:border-orange-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-[100px] -mr-10 -mt-10 transition-all group-hover:bg-orange-500/10" />
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div className="p-2.5 rounded-xl bg-white/5 text-[var(--text-secondary)] group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-colors">
                                                <skill.icon className="w-5 h-5" />
                                            </div>
                                            {installingSkill === skill.id ? (
                                                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                                            ) : (
                                                <button
                                                    onClick={() => installSkillAction(skill.id)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
                                                    title="Install Skill"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <h4 className="font-bold text-white mb-1 group-hover:text-orange-200 transition-colors">{skill.name}</h4>
                                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{skill.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderWorkspace = () => (
        <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${agentConfig?.status === 'online' || agentConfig?.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="text-[var(--text-muted)]">
                        {agentConfig?.status === 'online' || agentConfig?.status === 'running' ? 'Live Sync Active' : 'Instance Offline — files may not load'}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => selectedFile && loadFile(selectedFile)}
                        disabled={!selectedFile || isLoadingFile}
                        className="btn-glass px-3 py-1.5 text-xs flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFile ? 'animate-spin' : ''}`} /> Reload
                    </button>
                    <button
                        onClick={saveFile}
                        disabled={!selectedFile || isSavingFile}
                        className="btn-primary px-3 py-1.5 text-xs flex items-center gap-2"
                    >
                        {isSavingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-[500px]">
                {/* File Tree */}
                <div className="col-span-3 glass-card rounded-xl p-4 flex flex-col">
                    <h3 className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-white/5 pb-2">File System</h3>
                    <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                        {workspaceFiles.map((file) => (
                            <button
                                key={file.name}
                                onClick={() => setSelectedFile(file.name)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedFile === file.name
                                    ? "bg-orange-500/10 text-orange-200 border border-orange-500/20"
                                    : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span>{file.icon}</span>
                                <div>
                                    <p className="text-sm font-medium leading-none mb-1">{file.name}</p>
                                    <p className="text-[10px] opacity-60 leading-none">{file.description}</p>
                                </div>
                            </button>
                        ))}
                        <div className="my-2 border-t border-white/5" />
                        {configFiles.map((file) => (
                            <button
                                key={file.name}
                                onClick={() => setSelectedFile(file.name)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedFile === file.name
                                    ? "bg-purple-500/10 text-purple-200 border border-purple-500/20"
                                    : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span>{file.icon}</span>
                                <div>
                                    <p className="text-sm font-medium leading-none mb-1">{file.name}</p>
                                    <p className="text-[10px] opacity-60 leading-none">{file.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="col-span-9 glass-card rounded-xl flex flex-col relative overflow-hidden">
                    {selectedFile ? (
                        <>
                            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                                <span className="font-mono text-xs text-[var(--text-secondary)]">{selectedFile}</span>
                                <div className="flex items-center gap-2">
                                    {isLoadingFile && <Loader2 className="w-3 h-3 animate-spin text-orange-400" />}
                                    <span className="text-[10px] text-[var(--text-muted)]">UTF-8</span>
                                </div>
                            </div>
                            <textarea
                                value={fileContent}
                                onChange={(e) => setFileContent(e.target.value)}
                                className="flex-1 bg-[#050505]/50 p-4 text-sm font-mono resize-none focus:outline-none text-[var(--text-secondary)]"
                                spellCheck={!selectedFile.endsWith(".json")}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a file to initiate neural interface</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const renderConsole = () => (
        <motion.div
            key="console"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full flex flex-col"
        >
            <TerminalComponent
                agentId={agentId}
                agentStatus={agentConfig?.status || "unknown"}
                openclawStatus={agentConfig?.openclawStatus || "unknown"}
                heartbeatAgeSeconds={agentConfig?.heartbeatAgeSeconds ?? null}
            />
        </motion.div>
    );

    const cronToHuman = (expr: string): string => {
        const presets: Record<string, string> = {
            "* * * * *": "Every minute",
            "*/5 * * * *": "Every 5 minutes",
            "*/10 * * * *": "Every 10 minutes",
            "*/15 * * * *": "Every 15 minutes",
            "*/30 * * * *": "Every 30 minutes",
            "0 * * * *": "Every hour",
            "0 */2 * * *": "Every 2 hours",
            "0 */6 * * *": "Every 6 hours",
            "0 */12 * * *": "Every 12 hours",
            "0 0 * * *": "Every day at midnight",
            "0 9 * * *": "Every day at 9:00 AM",
            "0 9 * * 1": "Every Monday at 9:00 AM",
            "0 9 * * 1-5": "Weekdays at 9:00 AM",
            "0 0 1 * *": "First day of every month",
        };
        if (presets[expr]) return presets[expr];
        // Try to parse simple patterns
        const parts = expr.split(" ");
        if (parts.length === 5) {
            const [min, hour, dom, mon, dow] = parts;
            if (dom === "*" && mon === "*" && dow === "*" && hour !== "*" && min !== "*") {
                const h = parseInt(hour);
                const m = parseInt(min);
                const ampm = h >= 12 ? "PM" : "AM";
                const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                return `Every day at ${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
            }
        }
        return expr;
    };

    const SCHEDULE_PRESETS = [
        { label: "Every minute", value: "* * * * *" },
        { label: "Every 5 minutes", value: "*/5 * * * *" },
        { label: "Every hour", value: "0 * * * *" },
        { label: "Every day at 9 AM", value: "0 9 * * *" },
        { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
        { label: "Custom", value: "custom" },
    ];

    const [cronPreset, setCronPreset] = useState("0 9 * * *");
    const [customCronInput, setCustomCronInput] = useState("");

    const renderAutomation = () => (
        <motion.div
            key="automation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Scheduled Tasks</h2>
                    <p className="text-[var(--text-muted)] text-sm">Cron jobs running on your agent&apos;s instance</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={loadCronJobs} disabled={isLoadingCrons} className="btn-ghost text-sm flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${isLoadingCrons ? "animate-spin" : ""}`} /> Refresh
                    </button>
                    <button onClick={() => setShowAddCronModal(true)} className="btn-primary text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Task
                    </button>
                </div>
            </div>

            {/* System Jobs */}
            {systemCronJobs.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">System Jobs</h3>
                    <div className="space-y-2">
                        {systemCronJobs.map((job, i) => (
                            <div key={i} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Heart className="w-4 h-4 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{job.name}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">SYSTEM</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-dim)]">{cronToHuman(job.schedule)}</p>
                                    </div>
                                </div>
                                <code className="text-xs text-[var(--text-dim)] bg-white/5 px-2 py-1 rounded max-w-[300px] truncate">{job.command}</code>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Jobs */}
            <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Your Tasks</h3>
                {isLoadingCrons ? (
                    <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-3" />
                        <p className="text-[var(--text-muted)] text-sm">Loading scheduled tasks...</p>
                    </div>
                ) : cronJobs.length === 0 ? (
                    <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Clock className="w-10 h-10 text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Scheduled Tasks</h3>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto mb-4">
                            Add cron jobs to run commands on a schedule — data syncs, reports, backups, and more.
                        </p>
                        <button onClick={() => setShowAddCronModal(true)} className="btn-primary text-sm flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Your First Task
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {cronJobs.map((job, i) => (
                            <div key={i} className="glass-panel p-4 rounded-xl flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-white">{job.name}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-orange-400">{cronToHuman(job.schedule)}</span>
                                            <span className="text-[var(--text-dim)]">·</span>
                                            <code className="text-xs text-[var(--text-dim)] max-w-[300px] truncate">{job.command}</code>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteCronJob(job)}
                                    disabled={isDeletingCron === job.raw}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-dim)] hover:text-red-400"
                                >
                                    {isDeletingCron === job.raw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            <AnimatePresence>
                {showAddCronModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddCronModal(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel rounded-2xl p-6 w-full max-w-lg"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white">Add Scheduled Task</h3>
                                <button onClick={() => setShowAddCronModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-muted)]">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Task Name</label>
                                    <input
                                        type="text"
                                        value={newCronName}
                                        onChange={(e) => setNewCronName(e.target.value)}
                                        placeholder="e.g., Daily backup, Hourly sync"
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Schedule</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        {SCHEDULE_PRESETS.map((preset) => (
                                            <button
                                                key={preset.value}
                                                onClick={() => {
                                                    setCronPreset(preset.value);
                                                    if (preset.value !== "custom") {
                                                        setNewCronSchedule(preset.value);
                                                    }
                                                }}
                                                className={`text-xs py-2 px-3 rounded-lg border transition-all ${cronPreset === preset.value
                                                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                                                        : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                                                    }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                    {cronPreset === "custom" && (
                                        <input
                                            type="text"
                                            value={customCronInput}
                                            onChange={(e) => {
                                                setCustomCronInput(e.target.value);
                                                setNewCronSchedule(e.target.value);
                                            }}
                                            placeholder="e.g., */15 * * * *"
                                            className="input font-mono text-sm"
                                        />
                                    )}
                                    <p className="text-xs text-[var(--text-dim)] mt-1.5">
                                        {cronPreset !== "custom" ? cronToHuman(newCronSchedule) : newCronSchedule ? cronToHuman(newCronSchedule) : "Enter a cron expression (5 fields)"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Command</label>
                                    <textarea
                                        value={newCronCommand}
                                        onChange={(e) => setNewCronCommand(e.target.value)}
                                        placeholder="e.g., cd ~/.openclaw && openclaw run backup"
                                        className="input font-mono text-sm resize-none h-20"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button onClick={() => setShowAddCronModal(false)} className="btn-ghost text-sm">Cancel</button>
                                <button
                                    onClick={addCronJob}
                                    disabled={isAddingCron || !newCronSchedule || !newCronCommand}
                                    className={`btn-primary text-sm flex items-center gap-2 ${(!newCronSchedule || !newCronCommand) ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isAddingCron ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add Task
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    const renderConfiguration = () => (
        <motion.div
            key="configuration"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">System Configuration</h2>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/5">
                    <h3 className="font-bold text-white">API Integrations</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Keys are saved in your account, pushed to instance `.env` over SSM, and applied immediately when possible.
                    </p>
                </div>
                <div className="p-6 space-y-3">
                    {dummyProviders.map((provider) => {
                        const hasKey = providerKeyStatus[provider.id] || false;
                        return (
                            <div key={provider.id}>
                                <div className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl">{provider.icon}</div>
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {provider.name}
                                                {hasKey && (
                                                    <span className="w-2 h-2 rounded-full bg-green-500" title="API key configured" />
                                                )}
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)]">{provider.description}</div>
                                            <div className="text-[10px] text-[var(--text-dim)] font-mono mt-1">{provider.envKey}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasKey && (
                                            <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">CONFIGURED</span>
                                        )}
                                        <button
                                            onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
                                            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${expandedProvider === provider.id ? 'bg-white/10 text-white' : 'text-[var(--text-muted)]'}`}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded API Key Input */}
                                <AnimatePresence>
                                    {expandedProvider === provider.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 ml-4 border-l-2 border-orange-500/30 mt-2">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Key className="w-4 h-4 text-orange-400" />
                                                    <span className="text-sm font-bold text-white">Configure {provider.name}</span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="password"
                                                        placeholder={hasKey ? "••••••••• (enter new key to replace)" : "sk-..."}
                                                        className="input flex-1 font-mono text-sm"
                                                        value={apiKeyInputs[provider.id] || ""}
                                                        onChange={(e) => setApiKeyInputs(prev => ({ ...prev, [provider.id]: e.target.value }))}
                                                    />
                                                    <button
                                                        onClick={() => saveApiKey(provider.id)}
                                                        disabled={!apiKeyInputs[provider.id] || savingProviderId === provider.id}
                                                        className="btn-primary px-4 disabled:opacity-50"
                                                    >
                                                        {savingProviderId === provider.id
                                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                                            : <Save className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-[var(--text-dim)] mt-2">
                                                    Env var: <code className="bg-white/10 px-1 py-0.5 rounded">{provider.envKey}</code> — saved to instance .env &amp; OpenClaw restarts automatically
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );

    // ========== MODALS ==========

    const renderDeleteModal = () => (
        <AnimatePresence>
            {showDeleteModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-card rounded-2xl p-8 max-w-md w-full border border-red-500/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Delete Employee</h3>
                                <p className="text-xs text-[var(--text-muted)]">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-200">
                                This will <strong>permanently destroy</strong> the EC2 instance and remove <strong>{agentName}</strong> from your dashboard. All data, configurations, and conversation history will be lost.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                                Type DELETE to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="input font-mono tracking-widest text-center"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete Forever
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderResetModal = () => {
        const resetSkillsForType = resetBusinessType ? (CATEGORY_SKILLS_MAP[resetBusinessType as keyof typeof CATEGORY_SKILLS_MAP] || []) : [];

        return (
            <AnimatePresence>
                {showResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowResetModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card rounded-2xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <RotateCcw className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Reset Instance</h3>
                                    <p className="text-xs text-[var(--text-muted)]">Telegram connection will be kept</p>
                                </div>
                            </div>

                            {/* Step indicators */}
                            <div className="flex items-center gap-2 mb-6">
                                {["Brain & Key", "Identity", "Skills"].map((label, i) => (
                                    <div key={i} className="flex items-center gap-2 flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${resetStep >= i ? "bg-orange-500 text-white" : "bg-white/10 text-[var(--text-dim)]"}`}>
                                            {i + 1}
                                        </div>
                                        <span className={`text-xs ${resetStep >= i ? "text-white" : "text-[var(--text-dim)]"}`}>{label}</span>
                                        {i < 2 && <div className={`flex-1 h-px ${resetStep > i ? "bg-orange-500" : "bg-white/10"}`} />}
                                    </div>
                                ))}
                            </div>

                            {/* Step 0: Brain & API Key */}
                            {resetStep === 0 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">AI Model</label>
                                        <select
                                            value={resetModel}
                                            onChange={(e) => {
                                                setResetModel(e.target.value);
                                                setResetProvider(getProviderForModel(e.target.value) || "anthropic");
                                            }}
                                            className="input w-full"
                                        >
                                            {PROVIDER_CATALOG.map((provider) => (
                                                <optgroup key={provider.id} label={provider.label}>
                                                    {provider.models.map((model) => (
                                                        <option key={model.id} value={model.id}>{model.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                                            API Key <span className="text-[var(--text-dim)]">(leave blank to keep existing)</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={resetApiKey}
                                            onChange={(e) => setResetApiKey(e.target.value)}
                                            placeholder="sk-... (optional — keeps current key if blank)"
                                            className="input w-full font-mono"
                                        />
                                    </div>
                                    <button onClick={() => setResetStep(1)} className="btn-primary w-full flex items-center justify-center gap-2">
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Step 1: Name & Personality */}
                            {resetStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">Agent Name</label>
                                        <input
                                            type="text"
                                            value={resetName}
                                            onChange={(e) => setResetName(e.target.value)}
                                            placeholder="Atlas"
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">Personality</label>
                                        <textarea
                                            value={resetPersonality}
                                            onChange={(e) => setResetPersonality(e.target.value)}
                                            placeholder="Describe how the AI should behave..."
                                            className="input w-full resize-none h-32"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setResetStep(0)} className="btn-secondary flex-1">Back</button>
                                        <button onClick={() => setResetStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                            Next <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Skills */}
                            {resetStep === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono text-[var(--text-muted)] mb-2 uppercase tracking-wider">Business Type</label>
                                        <select
                                            value={resetBusinessType}
                                            onChange={(e) => {
                                                setResetBusinessType(e.target.value);
                                                // Auto-select recommended skills
                                                const skills = CATEGORY_SKILLS_MAP[e.target.value as keyof typeof CATEGORY_SKILLS_MAP] || [];
                                                setResetSelectedSkills(skills.map(s => s.id));
                                            }}
                                            className="input w-full"
                                        >
                                            <option value="">Start with zero skills</option>
                                            {BUSINESS_TYPES.map(bt => (
                                                <option key={bt.id} value={bt.id}>{bt.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {resetSkillsForType.length > 0 && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {resetSkillsForType.map((skill) => (
                                                <label key={skill.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={resetSelectedSkills.includes(skill.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setResetSelectedSkills(prev => [...prev, skill.id]);
                                                            } else {
                                                                setResetSelectedSkills(prev => prev.filter(s => s !== skill.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded accent-orange-500"
                                                    />
                                                    <div>
                                                        <span className="text-sm text-white">{skill.name}</span>
                                                        <span className="text-xs text-[var(--text-dim)] ml-2">{skill.description}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                                        <p className="text-xs text-amber-200">
                                            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                                            This will wipe all workspace files, skills, and memory. Your Telegram bot connection will be preserved.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setResetStep(1)} className="btn-secondary flex-1">Back</button>
                                        <button
                                            onClick={handleReset}
                                            disabled={isResetting}
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                            Reset Instance
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    // ========== MAIN LAYOUT ==========

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)] selection:bg-orange-500/30 text-[var(--text-primary)] font-sans">
            {/* Top Navigation Header: Identity & Actions */}
            <header className="flex items-center justify-between border-b border-white/5 bg-[var(--bg-surface)] min-h-14 py-2 shrink-0 z-20 px-4 gap-3">
                {/* Left: Back & Identity */}
                <div className="flex items-center gap-3 h-full min-w-[240px]">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 pl-3 border-l border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-purple-600/20 flex items-center justify-center border border-white/10">
                            <Bot className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-sm font-bold leading-tight">{agentName}</h1>
                            <span className="text-[10px] text-[var(--text-dim)] font-mono uppercase tracking-wider flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${agentConfig?.status === 'running' || agentConfig?.status === 'online' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                                {agentConfig?.status || "OFFLINE"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2 text-xs text-[var(--text-dim)] font-mono">
                        <Clock className="w-3.5 h-3.5 text-orange-400/80" />
                        <span>Uptime {uptime} • Sync {pollCountdown}s</span>
                    </div>

                    <div className="px-1 py-1 rounded-xl border border-white/10 bg-white/5 flex items-center gap-1">
                        <button
                            onClick={() => performAction(canResume(agentConfig?.status || "") ? "start" : "stop")}
                            disabled={isPerformingAction}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-xs font-medium min-w-[106px] justify-center ${canResume(agentConfig?.status || "")
                                ? "bg-green-500/10 hover:bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                }`}
                            title={canResume(agentConfig?.status || "") ? "Start instance" : "Pause instance"}
                        >
                            {isPerformingAction ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : canResume(agentConfig?.status || "") ? (
                                <Play className="w-3.5 h-3.5" />
                            ) : (
                                <Pause className="w-3.5 h-3.5" />
                            )}
                            <span>{canResume(agentConfig?.status || "") ? "Start" : "Pause"}</span>
                        </button>

                        <button
                            onClick={() => performAction("reboot")}
                            disabled={isPerformingAction}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors text-xs font-medium min-w-[106px] justify-center"
                            title="Reboot instance (VM)"
                        >
                            <Power className="w-3.5 h-3.5" />
                            <span>Reboot VM</span>
                        </button>

                        <button
                            onClick={handleRestartOpenClaw}
                            disabled={isPerformingAction}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-colors text-xs font-medium min-w-[118px] justify-center"
                            title="Restart OpenClaw service"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Restart App</span>
                        </button>
                    </div>

                    <div className="px-1 py-1 rounded-xl border border-white/10 bg-white/5 flex items-center gap-1">
                        <button
                            onClick={openResetWizard}
                            disabled={isPerformingAction}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors text-xs font-medium min-w-[96px] justify-center"
                            title="Reset instance"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isPerformingAction}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-xs font-medium min-w-[96px] justify-center"
                            title="Delete employee"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Secondary Navigation Bar: Tabs */}
            <div className="border-b border-white/5 bg-[var(--bg-surface)] h-12 shrink-0 z-10 flex items-center shadow-sm">
                <nav className="flex items-center h-full overflow-x-auto no-scrollbar px-4 w-full gap-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                disabled={tab.disabled}
                                className={`flex items-center gap-2 px-4 h-full border-b-2 transition-all whitespace-nowrap group relative ${isActive
                                    ? "border-orange-400 text-white bg-white/[0.02]"
                                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/[0.01]"
                                    } ${tab.disabled ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
                            >
                                <span className={`flex items-center justify-center transition-colors ${isActive ? "text-orange-400" : "text-[var(--text-dim)] group-hover:text-[var(--text-secondary)]"}`}>
                                    {tab.icon}
                                </span>
                                <span className="font-mono text-xs font-medium">{tab.label}</span>
                                {tab.disabled && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-[var(--text-dim)] uppercase tracking-wider border border-white/5">
                                        Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <div className="h-full w-full overflow-y-auto custom-scrollbar p-6">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'chat' && renderChat()}
                            {activeTab === 'models' && renderModels()}
                            {activeTab === 'desktop' && renderDesktop()}
                            {activeTab === 'skills' && renderSkills()}
                            {activeTab === 'workspace' && renderWorkspace()}
                            {activeTab === 'console' && renderConsole()}
                            {activeTab === 'automation' && renderAutomation()}
                            {activeTab === 'configuration' && renderConfiguration()}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {renderDeleteModal()}
            {renderResetModal()}

            {/* Status Toast */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className={`fixed top-6 right-6 px-6 py-4 rounded-xl z-50 shadow-2xl backdrop-blur-xl border flex items-center gap-3 ${statusMessage.type === "success"
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                    >
                        {statusMessage.type === "success" ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        <span className="font-medium">{statusMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Modern Metric Card Component
function MetricCard({
    icon,
    label,
    value,
    subtext,
    status
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    status?: string;
}) {
    return (
        <div className="card-float p-6 relative overflow-hidden group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-2 -right-2 opacity-5 group-hover:opacity-10 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                <div className="text-6xl text-white">
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs uppercase tracking-widest mb-3 font-mono">
                    <span className="text-orange-400/70 group-hover:text-orange-400 transition-colors">
                        {icon}
                    </span>
                    <span className="group-hover:text-[var(--text-secondary)] transition-colors">{label}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                    {status && (
                        <span className={`w-2 h-2 rounded-full ${status === 'running' || status === 'online'
                            ? 'bg-green-500'
                            : status === 'deploying' || status === 'starting'
                                ? 'bg-orange-500 animate-pulse'
                                : 'bg-gray-500'
                            }`} />
                    )}
                    <span className="text-3xl font-bold text-white tracking-tight font-mono">
                        {value}
                    </span>
                </div>
                {subtext && (
                    <div className="text-xs text-[var(--text-dim)] font-mono flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-orange-500/50" />
                        {subtext}
                    </div>
                )}
            </div>
        </div>
    );
}

function TerminalComponent({
    agentId,
    agentStatus,
    openclawStatus,
    heartbeatAgeSeconds,
}: {
    agentId: string;
    agentStatus: string;
    openclawStatus: string;
    heartbeatAgeSeconds: number | null;
}) {
    type TerminalEntry = { cmd: string; out?: string; err?: string };
    type TerminalResponse = {
        id?: string;
        status?: string;
        output?: string;
        error?: string;
        message?: string;
        done?: boolean;
    };

    const [history, setHistory] = useState<TerminalEntry[]>([]);
    const [command, setCommand] = useState("");
    const [executing, setExecuting] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, executing]);

    const heartbeatLabel = heartbeatAgeSeconds === null
        ? "No heartbeat"
        : heartbeatAgeSeconds < 10
            ? "Just now"
            : `${heartbeatAgeSeconds}s ago`;

    const statusBadge = (value: string) => {
        const normalized = value.toLowerCase();
        if (normalized === "online" || normalized === "running" || normalized === "success") {
            return "bg-green-500/15 border-green-500/40 text-green-300";
        }
        if (normalized === "pending" || normalized === "inprogress" || normalized === "starting" || normalized === "deploying") {
            return "bg-orange-500/15 border-orange-500/40 text-orange-300";
        }
        if (normalized === "error" || normalized === "failed" || normalized === "offline" || normalized === "stopped") {
            return "bg-red-500/15 border-red-500/40 text-red-300";
        }
        return "bg-white/10 border-white/20 text-[var(--text-secondary)]";
    };

    const pollCommand = useCallback(async (commandId: string): Promise<TerminalResponse> => {
        const maxPolls = 45;
        for (let i = 0; i < maxPolls; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const res = await authFetch(`/api/agents/${agentId}/command?commandId=${encodeURIComponent(commandId)}`);
            const data = await res.json().catch(() => ({} as TerminalResponse));
            if (!res.ok) {
                return { error: data.error || "Failed to poll command status", status: "Failed", done: true, id: commandId };
            }
            if (data.done) {
                return data;
            }
        }
        return {
            id: commandId,
            status: "TimedOut",
            error: "Command is still running. Try again with a shorter command or check logs via PM2.",
            done: true,
        };
    }, [agentId]);

    const executeCommand = useCallback(async (cmd: string) => {
        if (!cmd.trim() || executing) return;

        const trimmedCommand = cmd.trim();
        if (command.trim() === trimmedCommand) {
            setCommand("");
        }
        setExecuting(true);
        setHistory((prev) => [...prev, { cmd: trimmedCommand }]);

        try {
            const res = await authFetch(`/api/agents/${agentId}/command`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: trimmedCommand }),
            });
            const data = await res.json().catch(() => ({} as TerminalResponse));

            let finalData = data;
            if (res.ok && data.id && !data.done) {
                finalData = await pollCommand(data.id);
            }

            setHistory((prev) => {
                const newHist = [...prev];
                const last = newHist[newHist.length - 1];
                if (last?.cmd === trimmedCommand) {
                    const statusText = finalData.status ? `[${finalData.status}]` : "";
                    last.out = finalData.output || finalData.message || statusText || "";
                    last.err = finalData.error;
                }
                return newHist;
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to execute command";
            setHistory((prev) => {
                const newHist = [...prev];
                const last = newHist[newHist.length - 1];
                if (last?.cmd === trimmedCommand) {
                    last.err = message;
                }
                return newHist;
            });
        } finally {
            setExecuting(false);
        }
    }, [agentId, command, executing, pollCommand]);

    const runCommand = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!command.trim() || executing) return;
        await executeCommand(command);
    };

    const runPreset = async (presetCommand: string) => {
        await executeCommand(presetCommand);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-250px)] glass-card rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="px-4 py-3 border-b border-white/5 bg-black/40 backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        <span className="ml-2 opacity-50">root@agent-instance:~</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-dim)] border border-white/5 px-2 py-0.5 rounded bg-white/5 font-mono uppercase tracking-wider">
                        SSM ENCRYPTED
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded border ${statusBadge(agentStatus)}`}>
                        Agent: {agentStatus}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${statusBadge(openclawStatus)}`}>
                        OpenClaw: {openclawStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded border border-white/20 text-[var(--text-secondary)] bg-white/10">
                        Heartbeat: {heartbeatLabel}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-white/5 bg-black/30 text-[10px] font-mono">
                <button
                    type="button"
                    onClick={() => runPreset("pm2 status")}
                    disabled={executing}
                    className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                >
                    pm2 status
                </button>
                <button
                    type="button"
                    onClick={() => runPreset("pm2 logs openclaw --lines 40 --nostream")}
                    disabled={executing}
                    className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                >
                    recent openclaw logs
                </button>
                <button
                    type="button"
                    onClick={() => runPreset("cat /root/.openclaw/stats.json")}
                    disabled={executing}
                    className="px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                >
                    heartbeat stats
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6 font-mono text-sm space-y-4 bg-black/20 backdrop-blur-sm scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="text-[var(--text-dim)] mb-4 select-none">
                    Last login: {new Date().toLocaleString()} on ttys001
                    <br />
                    OpenClaw Agent Terminal v1.1
                </div>
                {history.map((entry, i) => (
                    <div key={i} className="space-y-2 group">
                        <div className="flex items-start gap-2">
                            <span className="text-orange-400 font-bold select-none">➜</span>
                            <span className="text-cyan-400 select-none">~</span>
                            <span className="text-[var(--text-primary)]">{entry.cmd}</span>
                        </div>
                        {entry.out && (
                            <div className="whitespace-pre-wrap text-[var(--text-secondary)] pl-4 border-l border-white/10 group-hover:border-white/20 transition-colors">
                                {entry.out}
                            </div>
                        )}
                        {entry.err && (
                            <div className="whitespace-pre-wrap text-red-400 pl-4 border-l border-red-500/30 bg-red-500/5 p-2 rounded-r">
                                {entry.err}
                            </div>
                        )}
                    </div>
                ))}

                {executing && (
                    <div className="flex items-center gap-2 text-orange-400 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Running command...</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <form onSubmit={runCommand} className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-bold animate-pulse">➜</span>
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/20 font-mono text-sm"
                        placeholder={executing ? "Wait for command..." : "Enter command..."}
                        disabled={executing}
                        autoFocus
                    />
                </div>
            </form>
        </div>
    );
}
