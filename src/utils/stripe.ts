import Stripe from "stripe";

let cachedStripe: Stripe | null = null;

export function getStripeClient() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (!cachedStripe) {
        cachedStripe = new Stripe(apiKey, {
            apiVersion: "2025-01-27.acacia" as any,
            typescript: true,
        });
    }
    return cachedStripe;
}

export const getStripeSession = async (priceId: string, userId: string, userEmail: string) => {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer_email: userEmail,
        metadata: {
            userId: userId,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?payment=cancelled`,
    });

    return session;
};
