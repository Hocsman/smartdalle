import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: '2025-01-27.acacia' as any,
    typescript: true,
});

export const getStripeSession = async (priceId: string, userId: string, userEmail: string) => {
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
