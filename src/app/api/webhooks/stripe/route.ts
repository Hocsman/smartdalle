import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripeClient } from "@/utils/stripe";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;
    const stripe = getStripeClient();

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error("Webhook signature verification failed.", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (userId) {
                    // Update user profile to premium
                    await supabase
                        .from("profiles")
                        .update({
                            is_premium: true,
                            stripe_customer_id: session.customer as string
                        })
                        .eq("id", userId);

                    console.log(`User ${userId} upgraded to premium.`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by stripe_customer_id and revoke premium
                await supabase
                    .from("profiles")
                    .update({ is_premium: false })
                    .eq("stripe_customer_id", customerId);

                console.log(`Subscription deleted for customer ${customerId}. Premium revoked.`);
                break;
            }
            // Add other events like invoice.payment_failed if needed
        }
    } catch (error: any) {
        console.error("Error processing webhook:", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
