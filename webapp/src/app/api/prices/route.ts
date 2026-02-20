import { NextResponse } from "next/server";
import { getStripePrices } from "@/lib/stripe";
import { BILLING_ENABLED } from "@/lib/open-source-mode";

export async function GET() {
    const prices = await getStripePrices();
    return NextResponse.json({
        ...prices,
        billingEnabled: BILLING_ENABLED,
    });
}
