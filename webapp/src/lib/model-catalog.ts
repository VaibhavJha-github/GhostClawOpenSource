export type ModelProviderId = "anthropic" | "openai" | "google" | "xai" | "openrouter";
export type BudgetTier = "cheap" | "moderate" | "expensive";
export type ModelUseCase =
  | "general"
  | "coding"
  | "reasoning"
  | "web_search"
  | "multilingual"
  | "speed";

export interface CatalogModel {
  id: string; // OpenClaw model ref: provider/model
  name: string;
  provider: ModelProviderId;
  providerLabel: string;
  budget: BudgetTier;
  useCases: ModelUseCase[];
  description: string;
}

export interface ProviderCatalog {
  id: ModelProviderId;
  label: string;
  description: string;
  envKey: string;
  configField: "anthropicApiKey" | "openaiApiKey" | "geminiApiKey" | "xaiApiKey" | "openrouterApiKey";
  models: CatalogModel[];
}

const ANTHROPIC_MODELS: CatalogModel[] = [
  {
    id: "anthropic/claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    providerLabel: "Anthropic",
    budget: "expensive",
    useCases: ["general", "coding", "reasoning"],
    description: "Top-tier quality for complex coding and agent planning.",
  },
  {
    id: "anthropic/claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    providerLabel: "Anthropic",
    budget: "moderate",
    useCases: ["general", "coding", "reasoning"],
    description: "Strong default choice for quality, speed, and cost balance.",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    providerLabel: "Anthropic",
    budget: "moderate",
    useCases: ["general", "coding"],
    description: "Reliable everyday model for production workflows.",
  },
  {
    id: "anthropic/claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    providerLabel: "Anthropic",
    budget: "cheap",
    useCases: ["speed", "general"],
    description: "Fast and cost-efficient for high-volume automation.",
  },
];

const OPENAI_MODELS: CatalogModel[] = [
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    provider: "openai",
    providerLabel: "OpenAI",
    budget: "expensive",
    useCases: ["general", "coding", "reasoning"],
    description: "Flagship OpenAI model for demanding multi-step tasks.",
  },
  {
    id: "openai/o3",
    name: "o3",
    provider: "openai",
    providerLabel: "OpenAI",
    budget: "expensive",
    useCases: ["reasoning", "coding"],
    description: "Strong reasoning model for difficult task decomposition.",
  },
  {
    id: "openai/o4-mini",
    name: "o4-mini",
    provider: "openai",
    providerLabel: "OpenAI",
    budget: "moderate",
    useCases: ["reasoning", "speed"],
    description: "Reasoning-optimized with lower cost and latency.",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 mini",
    provider: "openai",
    providerLabel: "OpenAI",
    budget: "cheap",
    useCases: ["speed", "general", "coding"],
    description: "Low-cost generalist for high throughput workloads.",
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 nano",
    provider: "openai",
    providerLabel: "OpenAI",
    budget: "cheap",
    useCases: ["speed"],
    description: "Ultra-cheap model for lightweight tasks and routing.",
  },
];

const GOOGLE_MODELS: CatalogModel[] = [
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    providerLabel: "Google",
    budget: "expensive",
    useCases: ["general", "reasoning", "coding"],
    description: "High-capability Gemini model for complex tasks.",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    providerLabel: "Google",
    budget: "cheap",
    useCases: ["speed", "general"],
    description: "Fast and cost-efficient for real-time automation.",
  },
];

const XAI_MODELS: CatalogModel[] = [
  {
    id: "xai/grok-4",
    name: "Grok 4",
    provider: "xai",
    providerLabel: "xAI",
    budget: "expensive",
    useCases: ["general", "reasoning", "web_search"],
    description: "High-end Grok model for broad tasks and live-web heavy workflows.",
  },
  {
    id: "xai/grok-4-fast-reasoning",
    name: "Grok 4 Fast Reasoning",
    provider: "xai",
    providerLabel: "xAI",
    budget: "moderate",
    useCases: ["reasoning", "web_search", "speed"],
    description: "Faster Grok reasoning variant for web-research loops.",
  },
  {
    id: "xai/grok-4-fast-non-reasoning",
    name: "Grok 4 Fast",
    provider: "xai",
    providerLabel: "xAI",
    budget: "cheap",
    useCases: ["speed", "web_search"],
    description: "Low-latency Grok variant for quick response systems.",
  },
];

const OPENROUTER_MODELS: CatalogModel[] = [
  {
    id: "openrouter/deepseek/deepseek-r1",
    name: "DeepSeek R1 (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "cheap",
    useCases: ["reasoning", "coding"],
    description: "Strong reasoning value pick via OpenRouter.",
  },
  {
    id: "openrouter/deepseek/deepseek-chat",
    name: "DeepSeek Chat (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "cheap",
    useCases: ["general", "speed"],
    description: "Low-cost chat model for bulk conversational traffic.",
  },
  {
    id: "openrouter/meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "moderate",
    useCases: ["general", "coding"],
    description: "Balanced open model option for general production use.",
  },
  {
    id: "openrouter/meta-llama/llama-4-scout",
    name: "Llama 4 Scout (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "cheap",
    useCases: ["speed", "general"],
    description: "Cheap and fast open model for utility tasks.",
  },
  {
    id: "openrouter/mistralai/mistral-large-latest",
    name: "Mistral Large (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "moderate",
    useCases: ["general", "coding"],
    description: "Strong multilingual quality model through OpenRouter.",
  },
  {
    id: "openrouter/qwen/qwen3-coder",
    name: "Qwen3 Coder (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "cheap",
    useCases: ["coding", "multilingual", "speed"],
    description: "Cost-effective coding model with strong Chinese/English support.",
  },
  {
    id: "openrouter/qwen/qwen3-235b-a22b",
    name: "Qwen3 235B A22B (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "moderate",
    useCases: ["general", "reasoning", "multilingual"],
    description: "Large Qwen model for multilingual agent workloads.",
  },
  {
    id: "openrouter/moonshotai/kimi-k2",
    name: "Kimi K2 (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "moderate",
    useCases: ["reasoning", "coding", "multilingual"],
    description: "Moonshot model with strong long-context and coding performance.",
  },
  {
    id: "openrouter/z-ai/glm-4.5-air",
    name: "GLM 4.5 Air (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "cheap",
    useCases: ["multilingual", "general", "speed"],
    description: "Fast, multilingual GLM variant.",
  },
  {
    id: "openrouter/minimax/minimax-m1",
    name: "MiniMax M1 (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "moderate",
    useCases: ["general", "multilingual"],
    description: "General-purpose MiniMax model with broad language support.",
  },
  {
    id: "openrouter/baidu/ernie-4.5-vl-28b-a3b",
    name: "ERNIE 4.5 VL (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "moderate",
    useCases: ["multilingual", "reasoning"],
    description: "Baidu ERNIE multimodal model available through OpenRouter.",
  },
  {
    id: "openrouter/xiaomi/mi-4",
    name: "Xiaomi Mi 4 (OpenRouter)",
    provider: "openrouter",
    providerLabel: "OpenRouter",
    budget: "cheap",
    useCases: ["general", "multilingual", "speed"],
    description: "Low-cost Xiaomi model for practical multilingual routing.",
  },
];

export const PROVIDER_CATALOG: ProviderCatalog[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Claude family models",
    envKey: "ANTHROPIC_API_KEY",
    configField: "anthropicApiKey",
    models: ANTHROPIC_MODELS,
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT and reasoning series",
    envKey: "OPENAI_API_KEY",
    configField: "openaiApiKey",
    models: OPENAI_MODELS,
  },
  {
    id: "google",
    label: "Google",
    description: "Gemini models",
    envKey: "GEMINI_API_KEY",
    configField: "geminiApiKey",
    models: GOOGLE_MODELS,
  },
  {
    id: "xai",
    label: "xAI",
    description: "Grok models",
    envKey: "XAI_API_KEY",
    configField: "xaiApiKey",
    models: XAI_MODELS,
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    description: "Multi-provider route (incl. Chinese ecosystems)",
    envKey: "OPENROUTER_API_KEY",
    configField: "openrouterApiKey",
    models: OPENROUTER_MODELS,
  },
];

export const ALL_MODELS: CatalogModel[] = PROVIDER_CATALOG.flatMap((provider) => provider.models);
export const ALL_MODEL_IDS = new Set(ALL_MODELS.map((model) => model.id));

export interface BudgetRecommendation {
  budget: BudgetTier;
  title: string;
  summary: string;
  modelIds: string[];
}

export const BUDGET_RECOMMENDATIONS: BudgetRecommendation[] = [
  {
    budget: "cheap",
    title: "Lean Budget",
    summary: "Prioritize throughput and low cost for bulk orchestration tasks.",
    modelIds: [
      "anthropic/claude-haiku-4-5",
      "openai/gpt-5-mini",
      "google/gemini-2.5-flash",
      "openrouter/deepseek/deepseek-chat",
      "openrouter/qwen/qwen3-coder",
    ],
  },
  {
    budget: "moderate",
    title: "Balanced Budget",
    summary: "Good quality/cost ratio for day-to-day production agents.",
    modelIds: [
      "anthropic/claude-sonnet-4-5",
      "openai/o4-mini",
      "xai/grok-4-fast-reasoning",
      "openrouter/moonshotai/kimi-k2",
      "openrouter/qwen/qwen3-235b-a22b",
    ],
  },
  {
    budget: "expensive",
    title: "Premium Quality",
    summary: "Use for critical workflows where quality matters most.",
    modelIds: [
      "anthropic/claude-opus-4-6",
      "openai/gpt-5",
      "google/gemini-2.5-pro",
      "xai/grok-4",
      "openai/o3",
    ],
  },
];

export interface UseCaseRecommendation {
  id: string;
  label: string;
  summary: string;
  modelId: string;
}

export const USE_CASE_RECOMMENDATIONS: UseCaseRecommendation[] = [
  {
    id: "all_rounder",
    label: "All-Rounder",
    summary: "Best single default for most SaaS and ops assistants.",
    modelId: "anthropic/claude-sonnet-4-5",
  },
  {
    id: "web_search",
    label: "Web Search Heavy",
    summary: "Strong fit when your workflows depend on web-aware reasoning.",
    modelId: "xai/grok-4-fast-reasoning",
  },
  {
    id: "low_cost_automation",
    label: "Cheap Automation",
    summary: "Ideal for high-volume cron jobs and repetitive ops.",
    modelId: "openrouter/deepseek/deepseek-chat",
  },
  {
    id: "coding",
    label: "Code Generation",
    summary: "Solid coding quality while staying cost-aware.",
    modelId: "openrouter/qwen/qwen3-coder",
  },
  {
    id: "multilingual",
    label: "Multilingual",
    summary: "Good coverage for Chinese/English mixed business workflows.",
    modelId: "openrouter/moonshotai/kimi-k2",
  },
];

export function normalizeProvider(provider?: string): ModelProviderId | "" {
  if (!provider) return "";
  if (provider === "gemini") return "google";
  if (provider === "anthropic" || provider === "openai" || provider === "google" || provider === "xai" || provider === "openrouter") {
    return provider;
  }
  return "";
}

export function getProviderForModel(modelRef: string): ModelProviderId | "" {
  const [rawProvider] = modelRef.split("/");
  return normalizeProvider(rawProvider);
}

export function getProviderCatalog(provider: string): ProviderCatalog | undefined {
  const normalized = normalizeProvider(provider);
  if (!normalized) return undefined;
  return PROVIDER_CATALOG.find((entry) => entry.id === normalized);
}

export function getModelCatalog(modelRef: string): CatalogModel | undefined {
  return ALL_MODELS.find((model) => model.id === modelRef);
}

export function getProviderEnvKeys(provider: string): string[] {
  const normalized = normalizeProvider(provider);
  if (!normalized) return [];
  if (normalized === "google") {
    // Keep GOOGLE_API_KEY alias for backwards compatibility on existing instances.
    return ["GEMINI_API_KEY", "GOOGLE_API_KEY"];
  }
  const providerConfig = getProviderCatalog(normalized);
  return providerConfig ? [providerConfig.envKey] : [];
}

export function getProviderConfigField(provider: string): ProviderCatalog["configField"] | null {
  const providerConfig = getProviderCatalog(provider);
  return providerConfig?.configField ?? null;
}

