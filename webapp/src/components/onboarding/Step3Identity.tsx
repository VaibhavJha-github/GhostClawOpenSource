import { User, Sparkles } from "lucide-react";
import { AgentConfig } from "@/lib/agent-config";

interface Step3IdentityProps {
    config: AgentConfig;
    updateConfig: (updates: Partial<AgentConfig>) => void;
}

const personalities = [
    { id: "professional", name: "Atlas", description: "Professional, concise, and results-oriented. Perfect for business tasks." },
    { id: "friendly", name: "Nova", description: "Warm, empathetic, and engaging. Great for customer support." },
    { id: "witty", name: "Max", description: "Creative, witty, and energetic. Ideal for marketing and social media." },
    { id: "formal", name: "Sage", description: "Highly formal, detailed, and precise. Best for legal or technical work." },
];

export default function Step3Identity({ config, updateConfig }: Step3IdentityProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Identity</h2>
                <p className="text-[var(--text-secondary)]">Give your AI employee a name and personality.</p>
            </div>

            <div className="grid gap-6">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--text-dim)]">
                        Employee Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dim)]" />
                        <input
                            type="text"
                            value={config.name}
                            onChange={(e) => updateConfig({ name: e.target.value })}
                            placeholder="e.g., Sarah, Alex, GhostClaw Bot"
                            className="w-full bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-600"
                        />
                    </div>
                </div>

                {/* Personality Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-[var(--text-dim)]">
                        Personality Archetype
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                        {personalities.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => updateConfig({ personality: p.id as any })}
                                className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${config.personality === p.id
                                        ? "bg-primary-600/10 border-primary-600"
                                        : "bg-[var(--bg-card)] border-[var(--border-light)] hover:border-primary-600/50"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className={`w-4 h-4 ${config.personality === p.id ? "text-primary-600" : "text-[var(--text-dim)]"}`} />
                                    <span className={`font-semibold ${config.personality === p.id ? "text-white" : "text-[var(--text-secondary)]"}`}>
                                        {p.name}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                                    {p.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
