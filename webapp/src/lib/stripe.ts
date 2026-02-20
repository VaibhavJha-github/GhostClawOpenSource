import Stripe from "stripe";
import { BILLING_ENABLED } from "@/lib/open-source-mode";

const DEFAULT_PRICES = {
    starter: { id: "starter-plan", amount: 49 },
    pro: { id: "professional-plan", amount: 99 },
    enterprise: { id: "enterprise-plan", amount: 219 },
    business: { id: "enterprise-plan", amount: 219 },
};

export const getStripePrices = async () => {
    if (!BILLING_ENABLED || !process.env.STRIPE_SECRET_KEY) {
        return DEFAULT_PRICES;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });

    try {
        const starterId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || process.env.STRIPE_PRICE_STARTER || "";
        const proId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO || "";
        const businessId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || process.env.STRIPE_PRICE_ENTERPRISE || "";

        const [starter, pro, business] = await Promise.all([
            starterId ? stripe.prices.retrieve(starterId).catch(() => null) : Promise.resolve(null),
            proId ? stripe.prices.retrieve(proId).catch(() => null) : Promise.resolve(null),
            businessId ? stripe.prices.retrieve(businessId).catch(() => null) : Promise.resolve(null),
        ]);

        return {
            starter: starter ? { id: starter.id, amount: (starter.unit_amount || 4900) / 100 } : DEFAULT_PRICES.starter,
            pro: pro ? { id: pro.id, amount: (pro.unit_amount || 9900) / 100 } : DEFAULT_PRICES.pro,
            enterprise: business ? { id: business.id, amount: (business.unit_amount || 21900) / 100 } : DEFAULT_PRICES.enterprise,
            business: business ? { id: business.id, amount: (business.unit_amount || 21900) / 100 } : DEFAULT_PRICES.business,
        };
    } catch (error) {
        console.error("Failed to fetch Stripe prices:", error);
        return DEFAULT_PRICES;
    }
};
