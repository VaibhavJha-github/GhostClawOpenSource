import { Rocket, Check, Brain, MessageSquare, User, Layers } from "lucide-react";
import { AgentConfig } from "@/lib/agent-config";

interface Step5ReviewProps {
    config: AgentConfig;
}

export default function Step5Review({ config }: Step5ReviewProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Launch?</h2>
                <p className="text-[var(--text-secondary)]">Review your agent configuration before deployment.</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl overflow-hidden divide-y divide-[var(--border-light)]">
                {/* Identity */}
                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-[var(--text-dim)] uppercase tracking-wider mb-1">Identity</h3>
                        <p className="text-white font-semibold text-lg">{config.name}</p>
                        <p className="text-[var(--text-secondary)] text-sm capitalize">{config.personality} Personality</p>
                    </div>
                </div>

                {/* Brain */}
                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-[var(--text-dim)] uppercase tracking-wider mb-1">Intelligence</h3>
                        <p className="text-white font-semibold text-lg capitalize">{config.llmProvider}</p>
                        <p className="text-[var(--text-secondary)] text-sm font-mono">{config.llmModel}</p>
                    </div>
                </div>

                {/* Connection */}
                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-[var(--text-dim)] uppercase tracking-wider mb-1">Channels</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-medium">Telegram Bot</span>
                            {config.telegramUserId && <Check className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs font-mono mt-1 opacity-50 truncate w-64">
                            Token: {config.telegramBotToken.slice(0, 10)}...
                        </p>
                    </div>
                </div>

                {/* Skills */}
                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-[var(--text-dim)] uppercase tracking-wider mb-1">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {config.skills.slice(0, 5).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-md text-xs text-[var(--text-secondary)]">
                                    {skill}
                                </span>
                            ))}
                            {config.skills.length > 5 && (
                                <span className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-md text-xs text-[var(--text-secondary)]">
                                    +{config.skills.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-primary-600/5 border border-primary-600/20 rounded-xl p-4 text-sm text-[var(--text-secondary)] flex gap-3">
                <Rocket className="w-5 h-5 text-primary-600 shrink-0" />
                <p>
                    Clicking "Launch" will provision a dedicated Amazon EC2 instance (~2 mins).
                    Your agent will be live on Telegram immediately after.
                </p>
            </div>
        </div>
    );
}
