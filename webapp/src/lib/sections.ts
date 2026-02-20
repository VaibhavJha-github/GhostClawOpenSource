import type { BusinessType } from "@/components/BusinessTypePopup";
import type { LucideIcon } from "lucide-react";
import {
    ShoppingCart,
    TrendingUp,
    Package,
    Store,
    Calendar,
    Users,
    Target,
    LineChart,
    Layers,
    Sparkles,
    BarChart3,
    FileSearch,
    Send,
    Zap,
    NotebookPen,
    Calculator,
    Handshake,
    Plane,
    Briefcase,
    Headset,
    Megaphone,
    Video,
    Search,
    Shield,
    Globe,
    CreditCard,
    Cpu,
    Database,
    PenTool
} from "lucide-react";

// =========================================
// DYNAMIC SECTIONS - injected based on user selection
// =========================================

export interface HomepageSection {
    id: string;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    features: string[]; // These can be bullet points or just descriptive text split by periods if needed
    ctaText: string;
    categories: BusinessType[]; // Which categories trigger this section
    priority: number; // Lower = higher priority (shown first)
}

export const homepageSections: HomepageSection[] = [
    // --- E-COMMERCE ---
    {
        id: "ecommerce-marketing",
        title: "Amplify Your Reach with Smart Marketing",
        subtitle: "Effortlessly schedule and post promotions across dozens of social and chat platforms. Drive traffic and engage customers without manual updates.",
        icon: Megaphone,
        features: ["Schedule across 28+ channels", "Drive traffic automatically", "Engage customers instantly"],
        ctaText: "Start Promoting",
        categories: ["ecommerce"],
        priority: 1,
    },
    {
        id: "ecommerce-competition",
        title: "Outsmart the Competition",
        subtitle: "Dive deep into market insights across sales and fintech. Analyze competitors' strategies in real-time to refine your product lineup.",
        icon: TrendingUp,
        features: ["Real-time competitor analysis", "Refine pricing strategies", "optimize product lineup"],
        ctaText: "Analyze Market",
        categories: ["ecommerce"],
        priority: 2,
    },
    {
        id: "ecommerce-trends",
        title: "Ride the Wave of Trends",
        subtitle: "Quickly research the hottest topics from the past month on social media. Spot emerging customer preferences and viral products.",
        icon: LineChart,
        features: ["Spot viral products", "Analyze social trends", "Stock what's in demand"],
        ctaText: "Spot Trends",
        categories: ["ecommerce"],
        priority: 3,
    },
    {
        id: "ecommerce-finance",
        title: "Streamline Your Finances",
        subtitle: "Get expert guidance on US taxes and expense tracking tailored for e-commerce. Optimize your bottom line and avoid pitfalls.",
        icon: Calculator,
        features: ["US Tax guidance", "Expense tracking", "Optimize revenue"],
        ctaText: "Optimize Finances",
        categories: ["ecommerce"],
        priority: 4,
    },

    // --- LOCAL BUSINESS ---
    {
        id: "local-opportunities",
        title: "Discover Local Opportunities",
        subtitle: "Browse nearby places, ratings, and hours to find suppliers or partners. Attract more customers by tying into your community's vibe.",
        icon: Store,
        features: ["Find local partners", "Browse suppliers", "Connect with community"],
        ctaText: "Explore Local",
        categories: ["local"],
        priority: 1,
    },
    {
        id: "local-taxes",
        title: "Master Your Taxes",
        subtitle: "Receive comprehensive US tax advice with multi-state filing. Simplify compliance for your shop or gym.",
        icon: Calculator,
        features: ["Multi-state filing", "Deduction optimization", "Simplify compliance"],
        ctaText: "Manage Taxes",
        categories: ["local"],
        priority: 2,
    },
    {
        id: "local-promo",
        title: "Promote Like a Pro",
        subtitle: "Schedule targeted posts across social and chat channels for local events. Draw in foot traffic and build buzz effortlessly.",
        icon: Megaphone,
        features: ["Targeted local posts", "Build event buzz", "Increase foot traffic"],
        ctaText: "Boost Traffic",
        categories: ["local"],
        priority: 3,
    },
    {
        id: "local-market",
        title: "Analyze Your Market",
        subtitle: "Gain intelligence on local competitors in retail or fitness. Use scenarios to refine your strategies and stand out.",
        icon: Target,
        features: ["Competitor intelligence", "Refine strategies", "Stand out locally"],
        ctaText: "Analyze Competitors",
        categories: ["local"],
        priority: 4,
    },

    // --- SAAS ---
    {
        id: "saas-competitive",
        title: "Competitive Edge Analyzer",
        subtitle: "Explore B2B landscapes in sales and fintech. Uncover rival strategies to innovate your features and capture market share.",
        icon: TrendingUp,
        features: ["B2B landscape analysis", "Uncover rival strategies", "Capture market share"],
        ctaText: "Analyze Edge",
        categories: ["saas"],
        priority: 1,
    },
    {
        id: "saas-ideas",
        title: "Idea Exploration Engine",
        subtitle: "Launch sessions to brainstorm and refine product concepts. Turn vague thoughts into actionable features that solve real problems.",
        icon: Sparkles,
        features: ["Brainstorm concepts", "Refine features", "Solve user problems"],
        ctaText: "Explore Ideas",
        categories: ["saas"],
        priority: 2,
    },
    {
        id: "saas-reasoning",
        title: "Advanced Reasoning Tools",
        subtitle: "Apply causal inference for outcome predictions in analytics. Forecast user behavior and optimize your SaaS for growth.",
        icon: Cpu,
        features: ["Causal inference", "Forecast behavior", "Optimize growth"],
        ctaText: "Predict Outcomes",
        categories: ["saas"],
        priority: 3,
    },
    {
        id: "saas-data",
        title: "Structured Data Mastery",
        subtitle: "Use knowledge graphs for organized memory and insights. Streamline data handling to make your platform intelligent.",
        icon: Database,
        features: ["Knowledge graphs", "Organized memory", "Intelligent insights"],
        ctaText: "Master Data",
        categories: ["saas"],
        priority: 4,
    },

    // --- AGENCY ---
    {
        id: "agency-scheduling",
        title: "Campaign Scheduling Powerhouse",
        subtitle: "Plan and post across 28+ channels for seamless client promotions. Save time and amplify reach to deliver results.",
        icon: Calendar,
        features: ["Multi-channel scheduling", "Amplify client reach", "Save time"],
        ctaText: "Schedule Campaigns",
        categories: ["agency"],
        priority: 1,
    },
    {
        id: "agency-strategy",
        title: "Market Strategy Intel",
        subtitle: "Access competitive scenarios in sales and ops. Craft data-backed strategies to position clients ahead of the curve.",
        icon: LineChart,
        features: ["Competitive scenarios", "Data-backed strategies", "Position clients"],
        ctaText: "Get Intel",
        categories: ["agency"],
        priority: 2,
    },
    {
        id: "agency-trends",
        title: "Trend Research Accelerator",
        subtitle: "Pull recent insights from social and web. Fuel campaigns with fresh ideas that resonate and convert.",
        icon: Search,
        features: ["Social insights", "Fresh ideas", "High conversion"],
        ctaText: "Research Trends",
        categories: ["agency"],
        priority: 3,
    },
    {
        id: "agency-content",
        title: "Content Creation Automator",
        subtitle: "Plan and produce videos or summaries for ads. Streamline creative workflows to meet deadlines.",
        icon: Video,
        features: ["Produce videos", "Streamline workflows", "Meet deadlines"],
        ctaText: "Automate Content",
        categories: ["agency"],
        priority: 4,
    },

    // --- PROFESSIONAL ---
    {
        id: "pro-tax",
        title: "Tax Expertise at Your Fingertips",
        subtitle: "Optimize deductions, filings, and tracking for US taxes. Focus on client value while handling finances with confidence.",
        icon: Calculator,
        features: ["Optimize deductions", "Handle filings", "Financial confidence"],
        ctaText: "Manage Taxes",
        categories: ["professional"],
        priority: 1,
    },
    {
        id: "pro-intel",
        title: "Industry Intelligence",
        subtitle: "Analyze markets in HR and fintech. Deliver informed consultations that drive client success.",
        icon: Briefcase,
        features: ["Market analysis", "Informed consultations", "Client success"],
        ctaText: "Get Intelligence",
        categories: ["professional"],
        priority: 2,
    },
    {
        id: "pro-research",
        title: "Idea and Research Launcher",
        subtitle: "Explore concepts and recent trends from web and social. Build compelling reports backed by fresh data.",
        icon: FileSearch,
        features: ["Explore concepts", "Build reports", "Fresh data"],
        ctaText: "Launch Research",
        categories: ["professional"],
        priority: 3,
    },
    {
        id: "pro-reasoning",
        title: "Predictive Reasoning",
        subtitle: "Use causal inference to forecast outcomes. Provide clients with proactive advice that anticipates challenges.",
        icon: Cpu,
        features: ["Forecast outcomes", "Proactive advice", "Anticipate challenges"],
        ctaText: "Predict Now",
        categories: ["professional"],
        priority: 4,
    },

    // --- CUSTOM (Generic Fallback) ---
    {
        id: "custom-automation",
        title: "Automate Your Workflow",
        subtitle: "Custom AI agents tailored to your specific business needs.",
        icon: Sparkles,
        features: ["Custom workflows", "Tailored AI", "Efficiency boost"],
        ctaText: "Build Custom Agent",
        categories: ["custom"],
        priority: 1,
    }
];

// =========================================
// FIXED SECTIONS - "Explore More" Hub
// =========================================

export interface HubItem {
    id: string;
    title: string; // Button text
    description: string; // Expandable text
    icon: LucideIcon;
}

export const hubSections: Record<string, HubItem[]> = {
    ecommerce: [
        { id: "crypto", title: "Crypto Payments", description: "Securely handle transfers, swaps, and portfolio tracking on EVM chains. Accept crypto from customers and monitor transactions seamlessly.", icon: CreditCard },
        { id: "partner", title: "Partner Discovery", description: "Find funded web3 teams and connect via Telegram for collaborations. Expand your network and uncover partnership opportunities.", icon: Users },
        { id: "video", title: "Video Creator", description: "Automate planning for product demo videos. Create engaging ads or tutorials quickly to showcase your items.", icon: Video },
        { id: "collab", title: "Collaboration Hub", description: "Integrate with Trello, Slack, and Asana for order tracking and team alerts. Keep operations running smoothly.", icon: Layers },
        { id: "chat", title: "Chat Mastery", description: "Send messages via WhatsApp or iMessage for instant support. Build loyalty with personalized follow-ups.", icon: Headset },
        { id: "backup", title: "Data Backup", description: "Generate secure backup scripts for your store's data. Protect customer info and orders from loss.", icon: Database },
        { id: "hiring", title: "Hiring Helper", description: "Create custom interviews for recruiting marketers or ops staff. Find the right talent to scale.", icon: Briefcase },
        { id: "memory", title: "Memory Vault", description: "Organize order history and customer data. Recall insights instantly to personalize experiences.", icon: Shield },
    ],
    local: [
        { id: "vehicle", title: "Vehicle Maintenance", description: "Keep tabs on fleet or delivery vehicles. Schedule upkeep to avoid downtime in your daily hustle.", icon: SettingsIcon(Package) },
        { id: "fitness", title: "Fitness Coaching", description: "Connect with cycling or activity tools for personalized coaching. Enhance gym offerings and retain members.", icon: SettingsIcon(Zap) },
        { id: "events", title: "Event Planner", description: "Suggest smart activities based on weather or games. Host engaging events to bring in crowds.", icon: Calendar },
        { id: "network", title: "Network Control", description: "Manage firewalls for your shop's devices. Protect customer data and ensure safe transactions.", icon: Shield },
        { id: "schedule", title: "Team Scheduling", description: "Use calendars and tasks from Google/Microsoft integrations. Coordinate shifts effortlessly.", icon: Users },
        { id: "trends", title: "Trend Spotter", description: "Research recent local buzz. Adapt your offerings to what's hot in your neighborhood.", icon: TrendingUp },
        { id: "training", title: "Training Videos", description: "Summarize or plan videos for staff training. Create content that motivates and informs.", icon: Video },
        { id: "messaging", title: "Customer Messaging", description: "Handle inquiries via WhatsApp or iMessage. Provide quick bookings to keep locals coming back.", icon: Headset },
    ],
    saas: [
        { id: "analytics", title: "Autonomous Analytics", description: "Run stock predictions and backtests. Integrate finance tools to enhance data-driven decisions.", icon: BarChart3 },
        { id: "project", title: "Project OS", description: "Govern planning with tasks and dependencies. Keep dev teams aligned for faster releases.", icon: Layers },
        { id: "collab", title: "Collaboration", description: "Connect Slack, Trello, or Asana for real-time tracking. Boost productivity across your team.", icon: Users },
        { id: "docs", title: "Document Hub", description: "Access Google Workspace or Microsoft 365. Manage ops without switching apps.", icon: FileSearch },
        { id: "backup", title: "Data Protection", description: "Generate backups for cloud or local storage. Safeguard your SaaS data against disruptions.", icon: Database },
        { id: "update", title: "Auto-Updater", description: "Keep your tools and bots current automatically. Maintain peak performance with minimal effort.", icon: Zap },
        { id: "security", title: "Security Checker", description: "Scan skills before install for safety. Ensure your ecosystem remains secure.", icon: Shield },
        { id: "hiring", title: "Talent Interview", description: "Create hiring interviews for devs or staff. Build your dream team to accelerate innovation.", icon: Briefcase },
    ],
    agency: [
        { id: "lite", title: "Quick Insights", description: "Get lightweight research for fast campaign tweaks. Stay agile in a fast-paced market.", icon: Zap },
        { id: "collab", title: "Collaboration", description: "Integrate Google/Microsoft for docs and tasks. Keep client projects organized.", icon: Layers },
        { id: "team", title: "Team Comms", description: "Control Slack, Trello, or Asana for updates. Enhance internal and client coordination.", icon: Users },
        { id: "chat", title: "Client Messaging", description: "Use WhatsApp or iMessage for direct chats. Build stronger relationships with instant feedback.", icon: Headset },
        { id: "hiring", title: "Freelancer Hiring", description: "Generate interviews for new talent. Scale your agency with the right creative minds.", icon: Briefcase },
        { id: "journal", title: "Campaign Journal", description: "Track progress with standardized logs. Review and refine strategies for wins.", icon: PenTool },
        { id: "predict", title: "Outcome Predictor", description: "Apply causal reasoning to forecast campaign results. Optimize for higher ROI.", icon: LineChart },
        { id: "data", title: "Client Data", description: "Use memory graphs or vaults for histories. Personalize pitches and retain clients longer.", icon: Database },
    ],
    professional: [
        { id: "knowledge", title: "Knowledge Organizer", description: "Build typed graphs for case memory. Access insights quickly for better consultations.", icon: Database },
        { id: "productivity", title: "Productivity", description: "Connect Google/Microsoft for emails and files. Streamline daily workflows.", icon: Zap },
        { id: "tasks", title: "Task Manager", description: "Use Slack, Trello, or Asana for projects. Coordinate with ease.", icon: Layers },
        { id: "tracker", title: "Progress Tracker", description: "Journal logs for consult tracking. Review and improve processes.", icon: LineChart },
        { id: "backup", title: "Secure Backup", description: "Create scripts for cloud backups. Protect sensitive client info reliably.", icon: Shield },
        { id: "firewall", title: "Network Firewall", description: "Control security for your devices. Maintain privacy in professional settings.", icon: Globe },
        { id: "security", title: "Skill Security", description: "Check tools before use. Ensure compliance and safety in your practice.", icon: Shield },
        { id: "hiring", title: "Hiring Interview", description: "Generate custom interviews for firm growth. Bring in top talent.", icon: Briefcase },
    ],
    // Default fallback
    custom: [
        { id: "search", title: "Web Search", description: "Browse the web for information.", icon: Globe },
        { id: "tasks", title: "Tas Management", description: "Organize your to-dos.", icon: Layers }
    ]
};

// Helper to handle icon assignment roughly
function SettingsIcon(Icon: LucideIcon): LucideIcon {
    return Icon;
}


// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Get sections relevant to the user's selected business types
 * Sorted by priority (lower number = shown first)
 */
export function getSectionsForCategories(categories: BusinessType[]): HomepageSection[] {
    return homepageSections
        .filter((section) => section.categories.some((cat) => categories.includes(cat)))
        .sort((a, b) => a.priority - b.priority);
}

/**
 * Get unique sections (deduplicated)
 */
export function getUniqueSectionsForCategories(categories: BusinessType[]): HomepageSection[] {
    const seen = new Set<string>();
    return getSectionsForCategories(categories).filter((section) => {
        if (seen.has(section.id)) return false;
        seen.add(section.id);
        return true;
    });
}
