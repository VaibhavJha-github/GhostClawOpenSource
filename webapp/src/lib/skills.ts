import {
    Mail,
    Phone,
    Calendar,
    ListTodo,
    Search,
    FileText,
    MessageSquare,
    BarChart3,
    ShoppingCart,
    TrendingUp,
    Package,
    Star,
    Users,
    Target,
    LineChart,
    Layers,
    FileSearch,
    Shield,
    Clock,
    Zap,
    Sparkles,
    Send,
    Database,
    Globe,
    Cpu,
    Briefcase,
    Brain,
    RefreshCw,
    Wrench,
    DollarSign,
    type LucideIcon
} from "lucide-react";
import type { BusinessType } from "@/components/BusinessTypePopup";

// Icons needed but not imported above (defined as consts to avoid JSX in .ts file)
const HardDrive = Database;
const Cloud = Zap; // Fallback
const Video = Zap; // Fallback
const Code = Cpu;

// =========================================
// REAL CLAWHUB SKILL — with install commands
// =========================================
export interface Skill {
    id: string;          // owner/slug — used as the install identifier
    name: string;
    description: string;
    installCommand: string;
    url: string;
    icon: LucideIcon;
    categories?: string[]; // Added for compatibility with page.tsx
}

// =========================================
// DEFAULT / CORE SKILLS (installed for everyone)
// =========================================
export const DEFAULT_SKILLS: Skill[] = [
    {
        id: "JimLiuxinghai/find-skills",
        name: "Find Skills",
        description: "Helps discover and install agent skills. Use when you ask 'how do I do X'.",
        installCommand: "clawhub install JimLiuxinghai/find-skills",
        url: "https://clawhub.ai/JimLiuxinghai/find-skills",
        icon: Search,
    },
    {
        id: "pskoett/self-improving-agent",
        name: "Self-Improving Agent",
        description: "Captures learnings, errors, and corrections to enable continuous improvement.",
        installCommand: "clawhub install pskoett/self-improving-agent",
        url: "https://clawhub.ai/pskoett/self-improving-agent",
        icon: Brain,
    },
    {
        id: "steipete/gog",
        name: "Gog (Google CLI)",
        description: "Google Workspace CLI for Gmail, Calendar, Drive, Docs.",
        installCommand: "clawhub install steipete/gog",
        url: "https://clawhub.ai/steipete/gog",
        icon: Globe,
    },
    {
        id: "steipete/slack",
        name: "Slack",
        description: "Control Slack from your agent (react, pin/unpin messages).",
        installCommand: "clawhub install steipete/slack",
        url: "https://clawhub.ai/steipete/slack",
        icon: MessageSquare,
    },
    {
        id: "TheSethRose/agent-browser",
        name: "Agent Browser",
        description: "Headless browser automation CLI for navigating and snapping pages.",
        installCommand: "clawhub install TheSethRose/agent-browser",
        url: "https://clawhub.ai/TheSethRose/agent-browser",
        icon: Globe,
    },
    {
        id: "steipete/summarize",
        name: "Summarize",
        description: "Summarize URLs or files (web, PDFs, images, audio).",
        installCommand: "clawhub install steipete/summarize",
        url: "https://clawhub.ai/steipete/summarize",
        icon: FileText,
    },
    {
        id: "steipete/weather",
        name: "Weather",
        description: "Simple weather tool for getting current conditions and forecasts.",
        installCommand: "clawhub install steipete/weather",
        url: "https://clawhub.ai/steipete/weather",
        icon: Cloud,
    },
    {
        id: "halthelobster/proactive-agent",
        name: "Proactive Agent",
        description: "Transform agent into a proactive partner with autonomous crons.",
        installCommand: "clawhub install halthelobster/proactive-agent",
        url: "https://clawhub.ai/halthelobster/proactive-agent",
        icon: Zap,
    },
    {
        id: "moltbro/humanize-ai-text",
        name: "Humanize AI Text",
        description: "Rewrites AI text to sound natural and bypass detection.",
        installCommand: "clawhub install moltbro/humanize-ai-text",
        url: "https://clawhub.ai/moltbro/humanize-ai-text",
        icon: Sparkles,
    },
    {
        id: "steipete/obsidian",
        name: "Obsidian",
        description: "Automate Obsidian vaults via obsidian-cli.",
        installCommand: "clawhub install steipete/obsidian",
        url: "https://clawhub.ai/steipete/obsidian",
        icon: FileText,
    },
    {
        id: "maximeprades/auto-updater",
        name: "Auto-Updater",
        description: "Automatically update your agent and all installed skills daily.",
        installCommand: "clawhub install maximeprades/auto-updater",
        url: "https://clawhub.ai/maximeprades/auto-updater",
        icon: RefreshCw,
    },
    {
        id: "steipete/brave-search",
        name: "Brave Search",
        description: "Web search API integration (cheaper alternative to Google).",
        installCommand: "clawhub install steipete/brave-search",
        url: "https://clawhub.ai/steipete/brave-search",
        icon: Search,
    },
    {
        id: "NicholasSpisak/clawddocs",
        name: "Documentation Expert",
        description: "Expert tool for navigating and searching agent documentation.",
        installCommand: "clawhub install NicholasSpisak/clawddocs",
        url: "https://clawhub.ai/NicholasSpisak/clawddocs",
        icon: FileSearch,
    },
    {
        id: "steipete/model-usage",
        name: "Model Usage",
        description: "Summarize per-model usage costs to track spending.",
        installCommand: "clawhub install steipete/model-usage",
        url: "https://clawhub.ai/steipete/model-usage",
        icon: BarChart3,
    },
    {
        id: "TheSethRose/marketing-mode",
        name: "Marketing Mode",
        description: "23 comprehensive marketing skills (SEO, copywriting, ads).",
        installCommand: "clawhub install TheSethRose/marketing-mode",
        url: "https://clawhub.ai/TheSethRose/marketing-mode",
        icon: Target,
    },
    {
        id: "ThomasLWang/moltguard",
        name: "MoltGuard",
        description: "Security: prompt sanitization + injection detection.",
        installCommand: "clawhub install ThomasLWang/moltguard",
        url: "https://clawhub.ai/ThomasLWang/moltguard",
        icon: Shield,
    },
    {
        id: "steipete/clawdhub",
        name: "ClawdHub",
        description: "CLI to search, install, update, and publish agent skills.",
        installCommand: "clawhub install steipete/clawdhub",
        url: "https://clawhub.ai/steipete/clawdhub",
        icon: Package,
    },
    {
        id: "seojoonkim/prompt-guard",
        name: "Prompt Guard",
        description: "Prompt injection defense to protect your agent.",
        installCommand: "clawhub install seojoonkim/prompt-guard",
        url: "https://clawhub.ai/seojoonkim/prompt-guard",
        icon: Shield,
    },
    {
        id: "zats/perplexity",
        name: "Perplexity",
        description: "Web search via Perplexity with citations.",
        installCommand: "clawhub install zats/perplexity",
        url: "https://clawhub.ai/zats/perplexity",
        icon: Search,
    },
    {
        id: "steipete/openai-image-gen",
        name: "OpenAI Image Gen",
        description: "Batch-generate images via OpenAI API.",
        installCommand: "clawhub install steipete/openai-image-gen",
        url: "https://clawhub.ai/steipete/openai-image-gen",
        icon: Sparkles,
    },
    {
        id: "peterokase42/save-money",
        name: "Save Money",
        description: "Routes tasks to cheaper models when possible.",
        installCommand: "clawhub install peterokase42/save-money",
        url: "https://clawhub.ai/peterokase42/save-money",
        icon: DollarSign,
    },
    {
        id: "Michael-laffin/pdf-text-extractor",
        name: "PDF Extractor",
        description: "Extract text from PDFs with OCR.",
        installCommand: "clawhub install Michael-laffin/pdf-text-extractor",
        url: "https://clawhub.ai/Michael-laffin/pdf-text-extractor",
        icon: FileText,
    },
    {
        id: "chindden/skill-creator",
        name: "Skill Creator",
        description: "Guide for creating effective custom skills.",
        installCommand: "clawhub install chindden/skill-creator",
        url: "https://clawhub.ai/chindden/skill-creator",
        icon: Wrench,
    },
    {
        id: "steipete/wacli",
        name: "WhatsApp CLI",
        description: "Send WhatsApp messages via CLI.",
        installCommand: "clawhub install steipete/wacli",
        url: "https://clawhub.ai/steipete/wacli",
        icon: MessageSquare,
    },
    {
        id: "lamelas/himalaya",
        name: "Himalaya (Email)",
        description: "CLI to manage emails via IMAP/SMTP.",
        installCommand: "clawhub install lamelas/himalaya",
        url: "https://clawhub.ai/lamelas/himalaya",
        icon: Mail,
    },
    {
        id: "annettemekuro30/x-twitter",
        name: "X/Twitter",
        description: "Interact with Twitter/X (post, search).",
        installCommand: "clawhub install annettemekuro30/x-twitter",
        url: "https://clawhub.ai/annettemekuro30/x-twitter",
        icon: MessageSquare,
    },
    {
        id: "victorcavero14/upload-post",
        name: "Upload Post",
        description: "Upload content to social media platforms.",
        installCommand: "clawhub install victorcavero14/upload-post",
        url: "https://clawhub.ai/victorcavero14/upload-post",
        icon: Send,
    },
    {
        id: "steipete/frontend-design",
        name: "Frontend Design",
        description: "Create production-grade frontend interfaces.",
        installCommand: "clawhub install steipete/frontend-design",
        url: "https://clawhub.ai/steipete/frontend-design",
        icon: Layers,
    },
];

// =========================================
// SAAS-SPECIFIC SKILLS
// =========================================
export const SAAS_SKILLS: Skill[] = [
    {
        id: "emilioacc/atxp",
        name: "ATXP",
        description: "Access paid API tools for search, image, music, video.",
        installCommand: "clawhub install emilioacc/atxp",
        url: "https://clawhub.ai/emilioacc/atxp",
        icon: Zap,
    },
    {
        id: "steipete/github",
        name: "GitHub",
        description: "Interact with GitHub issues, PRs, and CI.",
        installCommand: "clawhub install steipete/github",
        url: "https://clawhub.ai/steipete/github",
        icon: Code,
    },
    {
        id: "steipete/nano-banana-pro",
        name: "Nano Banana Pro",
        description: "Generate/edit images with Gemini 3 Pro.",
        installCommand: "clawhub install steipete/nano-banana-pro",
        url: "https://clawhub.ai/steipete/nano-banana-pro",
        icon: Sparkles,
    },
    {
        id: "byungkyu/stripe-api",
        name: "Stripe",
        description: "Manage billing, subscriptions, and payments.",
        installCommand: "clawhub install byungkyu/stripe-api",
        url: "https://clawhub.ai/byungkyu/stripe-api",
        icon: DollarSign,
    },
    {
        id: "byungkyu/salesforce-api",
        name: "Salesforce",
        description: "CRM operations: SOQL, sObjects.",
        installCommand: "clawhub install byungkyu/salesforce-api",
        url: "https://clawhub.ai/byungkyu/salesforce-api",
        icon: Users,
    },
    {
        id: "byungkyu/mailchimp",
        name: "Mailchimp",
        description: "Email marketing and audience management.",
        installCommand: "clawhub install byungkyu/mailchimp",
        url: "https://clawhub.ai/byungkyu/mailchimp",
        icon: Mail,
    },
    {
        id: "byungkyu/klaviyo",
        name: "Klaviyo",
        description: "Ecommerce marketing automation.",
        installCommand: "clawhub install byungkyu/klaviyo",
        url: "https://clawhub.ai/byungkyu/klaviyo",
        icon: Mail,
    },
    {
        id: "byungkyu/google-ads-api",
        name: "Google Ads",
        description: "Manage ad campaigns and metrics.",
        installCommand: "clawhub install byungkyu/google-ads-api",
        url: "https://clawhub.ai/byungkyu/google-ads-api",
        icon: Target,
    },
    {
        id: "dowands/reddit-insights",
        name: "Reddit Insights",
        description: "Analyze Reddit for market research.",
        installCommand: "clawhub install dowands/reddit-insights",
        url: "https://clawhub.ai/dowands/reddit-insights",
        icon: MessageSquare,
    },
    {
        id: "stopmoclay/supabase",
        name: "Supabase",
        description: "Database and vector search operations.",
        installCommand: "clawhub install stopmoclay/supabase",
        url: "https://clawhub.ai/stopmoclay/supabase",
        icon: Database,
    },
    {
        id: "bjesuiter/prd",
        name: "PRD",
        description: "Create Product Requirements Documents.",
        installCommand: "clawhub install bjesuiter/prd",
        url: "https://clawhub.ai/bjesuiter/prd",
        icon: FileText,
    },
    {
        id: "buddyh/veo",
        name: "Veo (Video Gen)",
        description: "Generate video using Google Veo.",
        installCommand: "clawhub install buddyh/veo",
        url: "https://clawhub.ai/buddyh/veo",
        icon: Video,
    },
];

// =========================================
// ECOMMERCE SKILLS
// =========================================
export const ECOMMERCE_SKILLS: Skill[] = [
    {
        id: "byungkyu/shopify",
        name: "Shopify",
        description: "Manage products, orders, customers.",
        installCommand: "clawhub install byungkyu/shopify",
        url: "https://clawhub.ai/byungkyu/shopify",
        icon: ShoppingCart,
    },
    {
        id: "byungkyu/woocommerce",
        name: "WooCommerce",
        description: "WordPress store integration.",
        installCommand: "clawhub install byungkyu/woocommerce",
        url: "https://clawhub.ai/byungkyu/woocommerce",
        icon: ShoppingCart,
    },
    {
        id: "byungkyu/stripe-api",
        name: "Stripe",
        description: "Payments and subscriptions.",
        installCommand: "clawhub install byungkyu/stripe-api",
        url: "https://clawhub.ai/byungkyu/stripe-api",
        icon: DollarSign,
    },
    {
        id: "byungkyu/klaviyo",
        name: "Klaviyo",
        description: "Email marketing for ecommerce.",
        installCommand: "clawhub install byungkyu/klaviyo",
        url: "https://clawhub.ai/byungkyu/klaviyo",
        icon: Mail,
    },
    {
        id: "dowands/reddit-insights",
        name: "Reddit Insights",
        description: "Market research on Reddit.",
        installCommand: "clawhub install dowands/reddit-insights",
        url: "https://clawhub.ai/dowands/reddit-insights",
        icon: MessageSquare,
    },
    {
        id: "byungkyu/mailchimp",
        name: "Mailchimp",
        description: "Email marketing campaigns.",
        installCommand: "clawhub install byungkyu/mailchimp",
        url: "https://clawhub.ai/byungkyu/mailchimp",
        icon: Mail,
    },
    {
        id: "byungkyu/google-ads-api",
        name: "Google Ads",
        description: "Manage ad campaigns.",
        installCommand: "clawhub install byungkyu/google-ads-api",
        url: "https://clawhub.ai/byungkyu/google-ads-api",
        icon: Target,
    },
    {
        id: "buddyh/veo",
        name: "Veo (Video Gen)",
        description: "Generate product videos.",
        installCommand: "clawhub install buddyh/veo",
        url: "https://clawhub.ai/buddyh/veo",
        icon: Video,
    },
    {
        id: "steipete/nano-banana-pro",
        name: "Nano Banana Pro",
        description: "Generate product images.",
        installCommand: "clawhub install steipete/nano-banana-pro",
        url: "https://clawhub.ai/steipete/nano-banana-pro",
        icon: Sparkles,
    },
    {
        id: "byungkyu/google-analytics",
        name: "Google Analytics",
        description: "Track traffic and conversions.",
        installCommand: "clawhub install byungkyu/google-analytics",
        url: "https://clawhub.ai/byungkyu/google-analytics",
        icon: BarChart3,
    },
    {
        id: "byungkyu/google-merchant",
        name: "Google Merchant",
        description: "Manage product feeds.",
        installCommand: "clawhub install byungkyu/google-merchant",
        url: "https://clawhub.ai/byungkyu/google-merchant",
        icon: ShoppingCart,
    },
];

// =========================================
// BUSINESS PHYSICAL / LOCAL SKILLS
// =========================================
export const LOCAL_SKILLS: Skill[] = [
    {
        id: "byungkyu/google-meet",
        name: "Google Meet",
        description: "Manage meetings.",
        installCommand: "clawhub install byungkyu/google-meet",
        url: "https://clawhub.ai/byungkyu/google-meet",
        icon: Video,
    },
    {
        id: "byungkyu/fathom-api",
        name: "Fathom",
        description: "Meeting summaries.",
        installCommand: "clawhub install byungkyu/fathom-api",
        url: "https://clawhub.ai/byungkyu/fathom-api",
        icon: FileText,
    },
    {
        id: "byungkyu/trello-api",
        name: "Trello",
        description: "Project management.",
        installCommand: "clawhub install byungkyu/trello-api",
        url: "https://clawhub.ai/byungkyu/trello-api",
        icon: ListTodo,
    },
    {
        id: "byungkyu/google-workspace-admin",
        name: "Google Workspace Admin",
        description: "Manage users and domain.",
        installCommand: "clawhub install byungkyu/google-workspace-admin",
        url: "https://clawhub.ai/byungkyu/google-workspace-admin",
        icon: Users,
    },
    {
        id: "biostartechnology/linkedin",
        name: "LinkedIn",
        description: "Networking automation.",
        installCommand: "clawhub install biostartechnology/linkedin",
        url: "https://clawhub.ai/biostartechnology/linkedin",
        icon: Briefcase,
    },
    {
        id: "byungkyu/google-calendar-api",
        name: "Google Calendar",
        description: "Manage events and scheduling.",
        installCommand: "clawhub install byungkyu/google-calendar-api",
        url: "https://clawhub.ai/byungkyu/google-calendar-api",
        icon: Calendar,
    },
    {
        id: "byungkyu/google-contacts",
        name: "Google Contacts",
        description: "Manage address books.",
        installCommand: "clawhub install byungkyu/google-contacts",
        url: "https://clawhub.ai/byungkyu/google-contacts",
        icon: Users,
    },
    {
        id: "byungkyu/outlook-api",
        name: "Outlook",
        description: "Email and calendar.",
        installCommand: "clawhub install byungkyu/outlook-api",
        url: "https://clawhub.ai/byungkyu/outlook-api",
        icon: Mail,
    },
    {
        id: "byungkyu/whatsapp-business",
        name: "WhatsApp Business",
        description: "Customer messaging.",
        installCommand: "clawhub install byungkyu/whatsapp-business",
        url: "https://clawhub.ai/byungkyu/whatsapp-business",
        icon: MessageSquare,
    },
    {
        id: "byungkyu/calendly-api",
        name: "Calendly",
        description: "Scheduling links.",
        installCommand: "clawhub install byungkyu/calendly-api",
        url: "https://clawhub.ai/calendly-api",
        icon: Calendar,
    },
];

// =========================================
// CRYPTO / STOCKS / TRADER SKILLS
// =========================================
export const CRYPTO_SKILLS: Skill[] = [
    {
        id: "udiedrichsen/stock-analysis",
        name: "Stock Analysis",
        description: "Market analysis and trends.",
        installCommand: "clawhub install udiedrichsen/stock-analysis",
        url: "https://clawhub.ai/udiedrichsen/stock-analysis",
        icon: TrendingUp,
    },
    {
        id: "kys42/stock-market-pro",
        name: "Stock Market Pro",
        description: "Real-time market data.",
        installCommand: "clawhub install kys42/stock-market-pro",
        url: "https://clawhub.ai/kys42/stock-market-pro",
        icon: BarChart3,
    },
    {
        id: "evgyur/crypto-price",
        name: "Crypto Price",
        description: "Token prices and charts.",
        installCommand: "clawhub install evgyur/crypto-price",
        url: "https://clawhub.ai/evgyur/crypto-price",
        icon: DollarSign,
    },
    {
        id: "anton-roos/finance",
        name: "Finance",
        description: "Track stocks/crypto/FX.",
        installCommand: "clawhub install anton-roos/finance",
        url: "https://clawhub.ai/anton-roos/finance",
        icon: LineChart,
    },
    {
        id: "adlai88/simmer-weather",
        name: "Polymarket Weather",
        description: "Trade weather markets.",
        installCommand: "clawhub install adlai88/simmer-weather",
        url: "https://clawhub.ai/adlai88/simmer-weather",
        icon: Cloud,
    },
    {
        id: "adlai88/simmer",
        name: "Simmer (Polymarket)",
        description: "Predictions markets.",
        installCommand: "clawhub install adlai88/simmer",
        url: "https://clawhub.ai/adlai88/simmer",
        icon: TrendingUp,
    },
    {
        id: "kesslerio/finance-news",
        name: "Finance News",
        description: "Market news summaries.",
        installCommand: "clawhub install kesslerio/finance-news",
        url: "https://clawhub.ai/kesslerio/finance-news",
        icon: FileText,
    },
    {
        id: "deanpress/polymarket-odds",
        name: "Polymarket Odds",
        description: "Query market odds.",
        installCommand: "clawhub install deanpress/polymarket-odds",
        url: "https://clawhub.ai/deanpress/polymarket-odds",
        icon: BarChart3,
    },
    {
        id: "Andretuta/polymarket-agent",
        name: "Polymarket Agent",
        description: "Analyze and trade on Polymarket.",
        installCommand: "clawhub install Andretuta/polymarket-agent",
        url: "https://clawhub.ai/Andretuta/polymarket-agent",
        icon: Brain,
    },
];

// =========================================
// AGENCY SKILLS
// =========================================
export const AGENCY_SKILLS: Skill[] = [
    {
        id: "TheSethRose/marketing-mode",
        name: "Marketing Mode",
        description: "Marketing skills suite.",
        installCommand: "clawhub install TheSethRose/marketing-mode",
        url: "https://clawhub.ai/TheSethRose/marketing-mode",
        icon: Target,
    },
    {
        id: "jchopard69/marketing-skills",
        name: "Marketing Skills",
        description: "CRO, SEO, Copywriting.",
        installCommand: "clawhub install jchopard69/marketing-skills",
        url: "https://clawhub.ai/jchopard69/marketing-skills",
        icon: Target,
    },
    {
        id: "byungkyu/google-ads-api",
        name: "Google Ads",
        description: "Ad campaigns.",
        installCommand: "clawhub install byungkyu/google-ads-api",
        url: "https://clawhub.ai/byungkyu/google-ads-api",
        icon: Target,
    },
    {
        id: "dowands/reddit-insights",
        name: "Reddit Insights",
        description: "Market research.",
        installCommand: "clawhub install dowands/reddit-insights",
        url: "https://clawhub.ai/dowands/reddit-insights",
        icon: MessageSquare,
    },
    {
        id: "steipete/nano-banana-pro",
        name: "Nano Banana Pro",
        description: "Marketing image gen.",
        installCommand: "clawhub install steipete/nano-banana-pro",
        url: "https://clawhub.ai/steipete/nano-banana-pro",
        icon: Sparkles,
    },
    {
        id: "buddyh/veo",
        name: "Veo (Video Gen)",
        description: "Marketing video gen.",
        installCommand: "clawhub install buddyh/veo",
        url: "https://clawhub.ai/buddyh/veo",
        icon: Video,
    },
    {
        id: "byungkyu/mailchimp",
        name: "Mailchimp",
        description: "Email marketing.",
        installCommand: "clawhub install byungkyu/mailchimp",
        url: "https://clawhub.ai/byungkyu/mailchimp",
        icon: Mail,
    },
    {
        id: "annettemekuro30/x-twitter",
        name: "X/Twitter",
        description: "Social media management.",
        installCommand: "clawhub install annettemekuro30/x-twitter",
        url: "https://clawhub.ai/annettemekuro30/x-twitter",
        icon: MessageSquare,
    },
    {
        id: "victorcavero14/upload-post",
        name: "Upload Post",
        description: "Cross-platform social posting.",
        installCommand: "clawhub install victorcavero14/upload-post",
        url: "https://clawhub.ai/victorcavero14/upload-post",
        icon: Send,
    },
    {
        id: "biostartechnology/linkedin",
        name: "LinkedIn",
        description: "Outreach automation.",
        installCommand: "clawhub install biostartechnology/linkedin",
        url: "https://clawhub.ai/biostartechnology/linkedin",
        icon: Briefcase,
    },
    {
        id: "byungkyu/salesforce-api",
        name: "Salesforce",
        description: "CRM management.",
        installCommand: "clawhub install byungkyu/salesforce-api",
        url: "https://clawhub.ai/byungkyu/salesforce-api",
        icon: Users,
    },
];

// =========================================
// PROFESSIONAL SERVICES SKILLS
// =========================================
export const PROFESSIONAL_SKILLS: Skill[] = [
    {
        id: "byungkyu/google-meet",
        name: "Google Meet",
        description: "Meetings.",
        installCommand: "clawhub install byungkyu/google-meet",
        url: "https://clawhub.ai/byungkyu/google-meet",
        icon: Video,
    },
    {
        id: "byungkyu/fathom-api",
        name: "Fathom",
        description: "Recording summaries.",
        installCommand: "clawhub install byungkyu/fathom-api",
        url: "https://clawhub.ai/byungkyu/fathom-api",
        icon: FileText,
    },
    {
        id: "byungkyu/google-workspace-admin",
        name: "Google Workspace Admin",
        description: "Admin.",
        installCommand: "clawhub install byungkyu/google-workspace-admin",
        url: "https://clawhub.ai/byungkyu/google-workspace-admin",
        icon: Users,
    },
    {
        id: "byungkyu/salesforce-api",
        name: "Salesforce",
        description: "CRM.",
        installCommand: "clawhub install byungkyu/salesforce-api",
        url: "https://clawhub.ai/byungkyu/salesforce-api",
        icon: Users,
    },
    {
        id: "byungkyu/outlook-api",
        name: "Outlook",
        description: "Email/Calendar.",
        installCommand: "clawhub install byungkyu/outlook-api",
        url: "https://clawhub.ai/byungkyu/outlook-api",
        icon: Mail,
    },
    {
        id: "byungkyu/trello-api",
        name: "Trello",
        description: "Project management.",
        installCommand: "clawhub install byungkyu/trello-api",
        url: "https://clawhub.ai/byungkyu/trello-api",
        icon: ListTodo,
    },
    {
        id: "byungkyu/google-sheets",
        name: "Google Sheets",
        description: "Spreadsheets.",
        installCommand: "clawhub install byungkyu/google-sheets",
        url: "https://clawhub.ai/byungkyu/google-sheets",
        icon: FileText,
    },
    {
        id: "byungkyu/google-drive",
        name: "Google Drive",
        description: "Files.",
        installCommand: "clawhub install byungkyu/google-drive",
        url: "https://clawhub.ai/byungkyu/google-drive",
        icon: HardDrive,
    },
    {
        id: "byungkyu/microsoft-excel",
        name: "Microsoft Excel",
        description: "Spreadsheets.",
        installCommand: "clawhub install byungkyu/microsoft-excel",
        url: "https://clawhub.ai/byungkyu/microsoft-excel",
        icon: FileText,
    },
    {
        id: "byungkyu/calendly-api",
        name: "Calendly",
        description: "Scheduling.",
        installCommand: "clawhub install byungkyu/calendly-api",
        url: "https://clawhub.ai/byungkyu/calendly-api",
        icon: Calendar,
    },
    {
        id: "biostartechnology/linkedin",
        name: "LinkedIn",
        description: "Networking.",
        installCommand: "clawhub install biostartechnology/linkedin",
        url: "https://clawhub.ai/biostartechnology/linkedin",
        icon: Briefcase,
    },
];

// =========================================
// CATEGORY → SKILLS MAPPING
// =========================================
export const CATEGORY_SKILLS_MAP: Record<BusinessType, Skill[]> = {
    ecommerce: ECOMMERCE_SKILLS,
    saas: SAAS_SKILLS,
    agency: AGENCY_SKILLS,
    local: LOCAL_SKILLS,
    professional: PROFESSIONAL_SKILLS,
    custom: [],
};

// Aliases for backward compatibility
export const universalSkills = DEFAULT_SKILLS;
// Flatmapped category skills with category label injected
export const categorySkills = Object.entries(CATEGORY_SKILLS_MAP).flatMap(([cat, skills]) =>
    skills.map(s => ({ ...s, categories: [cat] }))
);

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Get ALL skills for selected business types (default + category-specific, deduplicated)
 */
export function getSkillsForCategories(categories: BusinessType[]): Skill[] {
    const allSkills = [...DEFAULT_SKILLS];
    const seen = new Set(allSkills.map(s => s.id));

    for (const cat of categories) {
        const catSkills = CATEGORY_SKILLS_MAP[cat] || [];
        for (const skill of catSkills) {
            if (!seen.has(skill.id)) {
                allSkills.push(skill);
                seen.add(skill.id);
            }
        }
    }

    return allSkills;
}

/**
 * Get just the category-specific skills (without defaults), deduplicated
 */
export function getCategoryOnlySkills(categories: BusinessType[]): Skill[] {
    const seen = new Set<string>();
    const result: Skill[] = [];

    for (const cat of categories) {
        const catSkills = CATEGORY_SKILLS_MAP[cat] || [];
        for (const skill of catSkills) {
            if (!seen.has(skill.id)) {
                result.push(skill);
                seen.add(skill.id);
            }
        }
    }

    return result;
}

// =========================================
// COMPAT: Aliases used by onboarding page
// =========================================
export type CategorySkill = Skill;
export const getUniqueSkillsForCategories = getSkillsForCategories;
