"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    CheckCircle2,
    Cog,
    Globe,
    Laptop,
    Loader2,
    Lock,
    Save,
    SlidersHorizontal,
    XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SETTINGS_STORAGE_KEY = "ghostclaw_dashboard_settings_v1";

type PreferredProvider = "anthropic" | "openai" | "google" | "xai" | "openrouter";
type SyncCadence = "fast" | "balanced" | "conservative";

interface DashboardSettings {
    autoRefresh: boolean;
    confirmDestructiveActions: boolean;
    showAdvancedModelRefs: boolean;
    compactCards: boolean;
    heartbeatAlerts: boolean;
    costSpikeAlerts: boolean;
    weeklySummaryEmail: boolean;
    preferredProvider: PreferredProvider;
    syncCadence: SyncCadence;
}

interface ToastState {
    type: "success" | "error" | "info";
    message: string;
}

const DEFAULT_SETTINGS: DashboardSettings = {
    autoRefresh: true,
    confirmDestructiveActions: true,
    showAdvancedModelRefs: false,
    compactCards: false,
    heartbeatAlerts: true,
    costSpikeAlerts: true,
    weeklySummaryEmail: false,
    preferredProvider: "anthropic",
    syncCadence: "balanced",
};

function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                aria-pressed={checked}
                className={`relative w-12 h-7 rounded-full transition-colors ${checked ? "bg-green-500/70" : "bg-white/15"}`}
            >
                <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
                />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
    const [persistedSettings, setPersistedSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || "GhostClaw Operator";
    const userEmail = user?.email || "No email available";
    const userInitial = userName.charAt(0).toUpperCase();

    const isDirty = useMemo(
        () => JSON.stringify(settings) !== JSON.stringify(persistedSettings),
        [settings, persistedSettings]
    );

    const showToast = (type: ToastState["type"], message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2800);
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!raw) {
                setPersistedSettings(DEFAULT_SETTINGS);
                setSettings(DEFAULT_SETTINGS);
                return;
            }
            const parsed = JSON.parse(raw) as Partial<DashboardSettings>;
            const merged: DashboardSettings = {
                ...DEFAULT_SETTINGS,
                ...parsed,
            };
            setSettings(merged);
            setPersistedSettings(merged);
        } catch {
            setSettings(DEFAULT_SETTINGS);
            setPersistedSettings(DEFAULT_SETTINGS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const update = <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            setPersistedSettings(settings);
            showToast("success", "Settings saved.");
        } catch {
            showToast("error", "Could not save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        setPersistedSettings(DEFAULT_SETTINGS);
        showToast("info", "Settings reset to defaults.");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)] p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Settings</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Configure dashboard behavior, alerts, and account preferences.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetSettings}
                            className="btn-glass text-sm px-4 py-2"
                        >
                            Reset Defaults
                        </button>
                        <button
                            onClick={saveSettings}
                            disabled={!isDirty || isSaving}
                            className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-5 md:p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-200 font-bold">
                            {userInitial}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{userName}</p>
                            <p className="text-xs text-[var(--text-muted)]">{userEmail}</p>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                        Profile/auth settings are managed by your login provider. Dashboard preferences below are saved locally for now.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-5 md:p-6 border border-white/10 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <SlidersHorizontal className="w-4 h-4 text-orange-300" />
                            <h2 className="text-lg font-bold text-white">Dashboard Behavior</h2>
                        </div>

                        <ToggleRow
                            label="Auto-refresh instance data"
                            description="Continuously refresh status and metrics on dashboard pages."
                            checked={settings.autoRefresh}
                            onChange={(value) => update("autoRefresh", value)}
                        />
                        <ToggleRow
                            label="Confirm destructive actions"
                            description="Require explicit confirmation for reset/delete operations."
                            checked={settings.confirmDestructiveActions}
                            onChange={(value) => update("confirmDestructiveActions", value)}
                        />
                        <ToggleRow
                            label="Show advanced model refs"
                            description="Display provider/model IDs in UI for technical workflows."
                            checked={settings.showAdvancedModelRefs}
                            onChange={(value) => update("showAdvancedModelRefs", value)}
                        />
                        <ToggleRow
                            label="Use compact cards"
                            description="Reduce whitespace density for data-heavy screens."
                            checked={settings.compactCards}
                            onChange={(value) => update("compactCards", value)}
                        />

                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <label className="block text-xs uppercase tracking-wider text-[var(--text-dim)] mb-2">
                                Preferred Primary Provider
                            </label>
                            <select
                                value={settings.preferredProvider}
                                onChange={(e) => update("preferredProvider", e.target.value as PreferredProvider)}
                                className="input w-full"
                            >
                                <option value="anthropic">Anthropic</option>
                                <option value="openai">OpenAI</option>
                                <option value="google">Google</option>
                                <option value="xai">xAI</option>
                                <option value="openrouter">OpenRouter</option>
                            </select>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <label className="block text-xs uppercase tracking-wider text-[var(--text-dim)] mb-2">
                                Sync Cadence
                            </label>
                            <select
                                value={settings.syncCadence}
                                onChange={(e) => update("syncCadence", e.target.value as SyncCadence)}
                                className="input w-full"
                            >
                                <option value="fast">Fast (3s)</option>
                                <option value="balanced">Balanced (10s)</option>
                                <option value="conservative">Conservative (30s)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card rounded-2xl p-5 md:p-6 border border-white/10 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Bell className="w-4 h-4 text-orange-300" />
                                <h2 className="text-lg font-bold text-white">Alerts & Notifications</h2>
                            </div>

                            <ToggleRow
                                label="Heartbeat outage alerts"
                                description="Notify when an instance heartbeat goes stale."
                                checked={settings.heartbeatAlerts}
                                onChange={(value) => update("heartbeatAlerts", value)}
                            />
                            <ToggleRow
                                label="Cost spike alerts"
                                description="Warn when model spend rises unexpectedly."
                                checked={settings.costSpikeAlerts}
                                onChange={(value) => update("costSpikeAlerts", value)}
                            />
                            <ToggleRow
                                label="Weekly summary emails"
                                description="Receive a weekly operational snapshot and usage summary."
                                checked={settings.weeklySummaryEmail}
                                onChange={(value) => update("weeklySummaryEmail", value)}
                            />
                        </div>

                        <div className="glass-card rounded-2xl p-5 md:p-6 border border-amber-500/20 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock className="w-4 h-4 text-amber-300" />
                                <h2 className="text-lg font-bold text-white">Locked Features (Roadmap)</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">
                                Disabled intentionally in this scope until backend support is production ready.
                            </p>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <Globe className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">Social Channel Orchestration</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">
                                            Discord/WhatsApp control plane remains disabled for now.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                    Coming Soon
                                </span>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <Laptop className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-white">Local Run Mode</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">
                                            Local-run workflow is disabled until packaging/runtime parity is finalized.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                    Disabled
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -16, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -16, x: 20 }}
                        className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 ${toast.type === "success"
                            ? "bg-green-500/10 border-green-500/25 text-green-300"
                            : toast.type === "error"
                                ? "bg-red-500/10 border-red-500/25 text-red-300"
                                : "bg-blue-500/10 border-blue-500/25 text-blue-300"
                            }`}
                    >
                        {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : toast.type === "error" ? <XCircle className="w-4 h-4" /> : <Cog className="w-4 h-4" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
