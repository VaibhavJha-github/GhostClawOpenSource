import { useState } from "react";
import { MessageSquare, Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AgentConfig } from "@/lib/agent-config";

interface Step2ConnectionProps {
    config: AgentConfig;
    updateConfig: (updates: Partial<AgentConfig>) => void;
}

export default function Step2Connection({ config, updateConfig }: Step2ConnectionProps) {
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");
    const [botName, setBotName] = useState("");

    const validateToken = async () => {
        if (!config.telegramBotToken) return;

        setIsValidating(true);
        setValidationStatus("idle");

        try {
            const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/getMe`);
            const data = await response.json();

            if (data.ok) {
                setValidationStatus("success");
                setBotName(data.result.first_name);
                updateConfig({ telegramUserId: data.result.id.toString() }); // Save ID for webhook security later
            } else {
                setValidationStatus("error");
            }
        } catch (error) {
            console.error(error);
            setValidationStatus("error");
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Connection</h2>
                <p className="text-[var(--text-secondary)]">Connect your agent to the world.</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-4 text-blue-400 mb-2">
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-semibold text-lg">Telegram Bot</span>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-[var(--text-dim)]">
                        Bot Token (from @BotFather)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={config.telegramBotToken}
                            onChange={(e) => {
                                updateConfig({ telegramBotToken: e.target.value });
                                setValidationStatus("idle");
                            }}
                            placeholder="123456789:ABCdef..."
                            className="flex-1 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                        />
                        <button
                            onClick={validateToken}
                            disabled={!config.telegramBotToken || isValidating}
                            className={`px-4 py-2 rounded-xl border font-medium flex items-center gap-2 transition-all ${validationStatus === "success"
                                    ? "bg-green-500/10 border-green-500 text-green-500"
                                    : validationStatus === "error"
                                        ? "bg-red-500/10 border-red-500 text-red-500"
                                        : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isValidating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : validationStatus === "success" ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Verified
                                </>
                            ) : (
                                "Verify"
                            )}
                        </button>
                    </div>

                    {/* Feedback Messages */}
                    {validationStatus === "success" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-green-400 text-sm flex items-center gap-2 bg-green-500/10 p-3 rounded-lg"
                        >
                            <Check className="w-4 h-4" />
                            Connected to <strong>{botName}</strong>
                        </motion.div>
                    )}

                    {validationStatus === "error" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 p-3 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                            Invalid Token. Please check @BotFather.
                        </motion.div>
                    )}

                    <div className="text-xs text-[var(--text-dim)] bg-[var(--bg-base)] p-4 rounded-xl">
                        <strong>How to get a token:</strong>
                        <ol className="list-decimal ml-4 mt-2 space-y-1">
                            <li>Open Telegram and search for <strong>@BotFather</strong></li>
                            <li>Send command <code>/newbot</code></li>
                            <li>Name your bot (e.g., "My Business AI")</li>
                            <li>Choose a username ending in "bot"</li>
                            <li>Copy the API Token provided</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
