"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Search,
    Download,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    Loader2,
    Package,
    Terminal,
    Info,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ALL_SKILLS, type Skill } from "@/lib/skills-data";
import { installSkillToVM } from "./actions";

// Category tabs for filtering
const CATEGORIES = [
    "All",
    "Productivity",
    "Development",
    "Communication",
    "AI & ML",
    "Automation",
    "Research",
    "Data",
    "Media",
    "Finance",
    "Marketing",
    "System",
];

// Simple keyword-based categorization for the 500 skills
function getSkillCategory(skill: Skill): string {
    const slug = skill.slug.toLowerCase();
    const name = skill.name.toLowerCase();
    const combined = `${slug} ${name} ${skill.description.toLowerCase()}`;

    if (/stock|finance|crypto|trade|market|binance|polymarket|portfolio/.test(combined)) return "Finance";
    if (/browser|search|scraper|crawl|web-search|exa|perplexity|google-search|duckduckgo/.test(combined)) return "Research";
    if (/slack|discord|telegram|whatsapp|email|imap|smtp|gmail|outlook|sms|bluesky/.test(combined)) return "Communication";
    if (/github|git|docker|ssh|kubernetes|deploy|code|debug|test|nextjs|react|sql|api-dev/.test(combined)) return "Development";
    if (/image|video|audio|tts|whisper|music|camera|ffmpeg|youtube|spotify|media|photo|ppt/.test(combined)) return "Media";
    if (/marketing|seo|ad|linkedin|x-twitter|reddit|content|post|campaign|humaniz/.test(combined)) return "Marketing";
    if (/sheets|drive|excel|pdf|csv|data|analytics|supabase|airtable|notion/.test(combined)) return "Data";
    if (/automat|n8n|cron|workflow|schedule|todoist|reminder|calendar|booking/.test(combined)) return "Automation";
    if (/ai|ml|gemini|openai|claude|model|agent|self-improving|memory|prompt/.test(combined)) return "AI & ML";
    if (/system|security|backup|monitor|health|admin|updater|audit/.test(combined)) return "System";
    if (/task|time|focus|plann|memo|note|obsidian|bear|summary|research/.test(combined)) return "Productivity";

    return "Productivity"; // fallback
}

interface AgentInfo {
    id: string;
    name: string;
    instance_id: string;
    status: string;
}

export default function SkillsStorePage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [installingSkills, setInstallingSkills] = useState<Set<string>>(new Set());
    const [installedSkills, setInstalledSkills] = useState<Set<string>>(new Set());
    const [agents, setAgents] = useState<AgentInfo[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<string>("");
    const [showInstructions, setShowInstructions] = useState(false);
    const [loadingAgents, setLoadingAgents] = useState(true);

    // Load user's agents
    const loadAgents = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from("agents")
                .select("id, name, instance_id, status")
                .eq("user_id", user.id);

            if (data && data.length > 0) {
                setAgents(data as AgentInfo[]);
                // Auto-select first running agent
                const running = data.find((a: any) => a.status === "online" || a.status === "running");
                if (running) setSelectedAgent(running.id);
                else setSelectedAgent(data[0].id);
            }
        } catch (err) {
            console.error("Failed to load agents:", err);
        } finally {
            setLoadingAgents(false);
        }
    }, [user]);

    useEffect(() => {
        loadAgents();
    }, [loadAgents]);

    // Filtered skills
    const filteredSkills = useMemo(() => {
        let skills = ALL_SKILLS;

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            skills = skills.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.slug.toLowerCase().includes(q) ||
                    s.owner.toLowerCase().includes(q) ||
                    s.description.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (selectedCategory !== "All") {
            skills = skills.filter((s) => getSkillCategory(s) === selectedCategory);
        }

        return skills;
    }, [searchQuery, selectedCategory]);

    // Install skill
    const handleInstall = async (skill: Skill) => {
        const agent = agents.find((a) => a.id === selectedAgent);
        if (!agent?.instance_id) {
            alert("Please select a running agent with an active instance.");
            return;
        }

        setInstallingSkills((prev) => new Set(prev).add(skill.slug));

        try {
            const result = await installSkillToVM(
                agent.id,
                agent.instance_id,
                `${skill.owner}/${skill.slug}`
            );

            if (result.success) {
                if (result.status === "Success") {
                    setInstalledSkills((prev) => new Set(prev).add(skill.slug));
                } else {
                    alert("Install command queued. It may take up to a minute to complete on the VM.");
                }
            } else {
                alert(`Failed to install: ${result.error}`);
            }
        } catch (err) {
            console.error("Install error:", err);
            alert("Failed to install skill. Please try again.");
        } finally {
            setInstallingSkills((prev) => {
                const next = new Set(prev);
                next.delete(skill.slug);
                return next;
            });
        }
    };

    const getButtonState = (skill: Skill) => {
        if (installedSkills.has(skill.slug)) return "installed";
        if (installingSkills.has(skill.slug)) return "installing";
        return "available";
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30 flex items-center justify-center">
                        <Package className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-mono">Skills</h1>
                        <p className="text-sm text-[var(--text-dim)]">
                            {installedSkills.size} installed
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Agent selector */}
                    {agents.length > 0 && (
                        <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500/50"
                        >
                            {agents.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name} ({a.status})
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={loadAgents}
                        className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-white hover:border-orange-500/30 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ClawHub Marketplace Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-lg">🐾</span>
                    <h2 className="text-lg font-bold text-white font-mono">ClawHub Marketplace</h2>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 font-mono">
                        {ALL_SKILLS.length} skills
                    </span>
                </div>
                <a
                    href="https://clawhub.ai/skills"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-orange-400 transition-colors font-mono"
                >
                    Browse all <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[var(--text-dim)] focus:outline-none focus:border-orange-500/50 transition-colors font-mono"
                />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all font-mono ${selectedCategory === cat
                            ? "bg-white text-black shadow-lg"
                            : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-light)] hover:text-white hover:border-white/20"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Skills Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {filteredSkills.map((skill) => {
                    const state = getButtonState(skill);
                    return (
                        <div
                            key={skill.slug}
                            className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 hover:border-white/10 transition-all group"
                        >
                            {/* Skill Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white text-sm truncate font-mono">
                                            {skill.name}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-[var(--text-dim)] mt-0.5 font-mono">
                                        by {skill.owner}
                                    </p>
                                </div>
                                <a
                                    href={skill.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-md text-[var(--text-dim)] hover:text-orange-400 hover:bg-orange-500/5 transition-colors opacity-0 group-hover:opacity-100"
                                    title="View on ClawHub"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 min-h-[2rem]">
                                {skill.description}
                            </p>

                            {/* Install Button */}
                            <button
                                onClick={() => handleInstall(skill)}
                                disabled={state !== "available" || !selectedAgent}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all font-mono ${state === "installed"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                                    : state === "installing"
                                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 cursor-wait"
                                        : "bg-white/5 text-[var(--text-muted)] border border-[var(--border-light)] hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-[0.98]"
                                    }`}
                            >
                                {state === "installed" ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Installed
                                    </>
                                ) : state === "installing" ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Installing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5" />
                                        Install to VM
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* No results */}
            {filteredSkills.length === 0 && (
                <div className="text-center py-16 text-[var(--text-dim)]">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-mono">No skills found</p>
                    <p className="text-sm mt-2">Try a different search term or category.</p>
                </div>
            )}

            {/* Browse More + Manual Install Instructions */}
            <div className="border border-[var(--border-light)] rounded-xl overflow-hidden">
                {/* Browse More Banner */}
                <div className="bg-gradient-to-r from-orange-500/5 to-amber-600/5 p-6 border-b border-[var(--border-light)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                <span className="text-lg">🔍</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white font-mono">
                                    Can&apos;t find what you need?
                                </h3>
                                <p className="text-xs text-[var(--text-dim)] mt-1">
                                    Browse 6,000+ skills on ClawHub and install them manually via SSH terminal.
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://clawhub.ai/skills"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm font-semibold transition-colors border border-orange-500/20 font-mono whitespace-nowrap"
                        >
                            Browse ClawHub <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                {/* Collapsible Manual Instructions */}
                <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-[var(--text-dim)]" />
                        <span className="text-sm text-[var(--text-muted)] font-mono">
                            How to install skills manually via SSH
                        </span>
                    </div>
                    {showInstructions ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-dim)]" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-dim)]" />
                    )}
                </button>

                {showInstructions && (
                    <div className="px-6 pb-6 space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-300/80">
                                You can install any skill from ClawHub using the dashboard Terminal (&quot;Workspace&quot; tab on your agent).
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">1</span>
                                <div>
                                    <p className="text-sm text-white font-mono">Find the skill on ClawHub</p>
                                    <p className="text-xs text-[var(--text-dim)] mt-1">
                                        Go to <a href="https://clawhub.ai/skills" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">clawhub.ai/skills</a> and search for the skill you want.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">2</span>
                                <div>
                                    <p className="text-sm text-white font-mono">Copy the install command</p>
                                    <p className="text-xs text-[var(--text-dim)] mt-1">
                                        Each skill page shows the command, e.g.:
                                    </p>
                                    <code className="block mt-2 px-3 py-2 bg-black/40 rounded-lg text-xs text-emerald-400 font-mono border border-white/5">
                                        clawhub install author/skill-name
                                    </code>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">3</span>
                                <div>
                                    <p className="text-sm text-white font-mono">Run it in your agent&apos;s terminal</p>
                                    <p className="text-xs text-[var(--text-dim)] mt-1">
                                        Open the &quot;Workspace&quot; tab on your agent page, paste the command, and press Enter.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">4</span>
                                <div>
                                    <p className="text-sm text-white font-mono">Restart the agent</p>
                                    <p className="text-xs text-[var(--text-dim)] mt-1">
                                        After installing, restart your agent so it picks up the new skill.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
