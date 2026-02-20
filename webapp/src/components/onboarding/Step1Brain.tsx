import { Brain, Key, Check } from "lucide-react";
import { motion } from "framer-motion";
import { AgentConfig } from "@/lib/agent-config";

const providers = [
    { id: "anthropic", name: "Anthropic", models: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229"] },
    { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4-turbo"] },
    { id: "google", name: "Google", models: ["gemini-1.5-pro"] },
    { id: "xai", name: "X.AI", models: ["grok-beta"] },
    { id: "openrouter", name: "OpenRouter", models: ["auto", "anthropic/claude-3.5-sonnet", "openai/gpt-4o"] },
];

interface Step1BrainProps {
    config: AgentConfig;
    updateConfig: (updates: Partial<AgentConfig>) => void;
}

export default function Step1Brain({ config, updateConfig }: Step1BrainProps) {
    const selectedProvider = providers.find(p => p.id === config.llmProvider);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">The Brain</h2>
                <p className="text-[var(--text-secondary)]">Choose the intelligence behind your agent.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Provider Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-[var(--text-dim)]">AI Provider</label>
                    <div className="grid grid-cols-1 gap-3">
                        {providers.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => updateConfig({ llmProvider: p.id as any, llmModel: p.models[0] })}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${config.llmProvider === p.id
                                        ? "bg-primary-600/10 border-primary-600 text-white"
                                        : "bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-primary-600/50"
                                    }`}
                            >
                                <span className="font-medium">{p.name}</span>
                                {config.llmProvider === p.id && <Check className="w-5 h-5 text-primary-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Model & Key */}
                <div className="space-y-6">
                    {config.llmProvider && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {/* Model Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">Model</label>
                                <select
                                    value={config.llmModel}
                                    onChange={(e) => updateConfig({ llmModel: e.target.value })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-600"
                                >
                                    {selectedProvider?.models.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* API Key Input */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-dim)] mb-2">
                                    API Key (Stored Securely)
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dim)]" />
                                    <input
                                        type="password"
                                        value={config.llmApiKey}
                                        onChange={(e) => updateConfig({ llmApiKey: e.target.value })}
                                        placeholder={`sk-... (${selectedProvider?.name} Key)`}
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-600"
                                    />
                                </div>
                                <p className="text-xs text-[var(--text-dim)] mt-2">
                                    We encrypt this key. It is never shared.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {!config.llmProvider && (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)] border-2 border-dashed border-[var(--border-light)] rounded-xl p-6">
                            <Brain className="w-12 h-12 mb-4 opacity-50" />
                            <p>Select a provider to configure</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
