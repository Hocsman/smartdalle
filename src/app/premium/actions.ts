"use server";

import { createClient } from "@/utils/supabase/server";
import { getStripeSession } from "@/utils/stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    // Replace with your actual Stripe Price ID from Dashboard
    const PRICE_ID = "price_1Q..."; // TODO: User needs to put real price ID here

    // Temporarily using a hardcoded placeholder or env var if available
    const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;

    if (!STRIPE_PRICE_ID) {
        console.error("Missing STRIPE_PRICE_ID in env");
        // For now, return error or mock
        throw new Error("Stripe configuration missing");
    }

    const session = await getStripeSession(STRIPE_PRICE_ID, user.id, user.email || "");

    if (!session.url) {
        throw new Error("Could not create checkout session");
    }

    return { url: session.url };
}
