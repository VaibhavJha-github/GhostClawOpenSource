// Shared provider options used by onboarding and add-employee wizard
export const PROVIDER_OPTIONS = [
    { id: "anthropic", name: "Anthropic (Claude)", icon: "/icons/claude_icon.png", defaultModel: "anthropic/claude-sonnet-4-5" },
    { id: "openai", name: "OpenAI (GPT)", icon: "/icons/chatgpt_icon.png", defaultModel: "openai/gpt-5-mini" },
    { id: "google", name: "Google (Gemini)", icon: "/icons/gemini_icons.png", defaultModel: "google/gemini-2.5-flash" },
    { id: "xai", name: "xAI (Grok)", icon: "/icons/chatgpt_icon.png", defaultModel: "xai/grok-4-fast-reasoning" },
    { id: "openrouter", name: "OpenRouter", icon: "/icons/claude_icon.png", defaultModel: "openrouter/deepseek/deepseek-chat" },
] as const;

// Shared AgentConfig type used by onboarding step components
export type AgentConfig = {
    // Identity
    name: string;
    personality: "professional" | "friendly" | "witty" | "formal";

    // Brain
    llmProvider: "anthropic" | "openai" | "google" | "xai" | "openrouter" | "";
    llmModel: string;
    llmApiKey: string;

    // Connection
    telegramBotToken: string;
    telegramUserId?: string;

    // Skills
    useCase: string;
    skills: string[];

    // Legacy
    role?: string;
    customInstructions?: string;
    preset?: string;
    skillKeys?: Record<string, string>;
};
