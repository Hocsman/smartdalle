"use server";

import { createClient } from "@/utils/supabase/server";
import { getStripeClient } from "@/utils/stripe";

export async function createPortalSession() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

    if (!profile?.stripe_customer_id) {
        throw new Error("MISSING_STRIPE_CUSTOMER");
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.VERCEL_URL ||
        "";
    const returnUrl = baseUrl.startsWith("http") ? `${baseUrl}/profile` : `https://${baseUrl}/profile`;

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: returnUrl,
    });

    return { url: session.url };
}
