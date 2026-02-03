"use server";

import webpush from "web-push";
import { createClient } from "@/utils/supabase/server";

// Configuration VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@smartdalle.fr";

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// Types
export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
}

// Sauvegarder une subscription
export async function savePushSubscription(subscription: PushSubscription) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { error } = await supabase
        .from("push_subscriptions")
        .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: "user_id,endpoint",
        });

    if (error) {
        console.error("Erreur sauvegarde subscription:", error);
        throw new Error("Erreur sauvegarde abonnement");
    }

    return { success: true };
}

// Supprimer une subscription
export async function removePushSubscription(endpoint: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { error } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("endpoint", endpoint);

    if (error) {
        console.error("Erreur suppression subscription:", error);
        throw new Error("Erreur suppression abonnement");
    }

    return { success: true };
}

// Mettre à jour les préférences de notification
export async function updateNotificationPreferences(preferences: {
    notify_meals?: boolean;
    notify_streak?: boolean;
    notify_weekly_report?: boolean;
    breakfast_time?: string;
    lunch_time?: string;
    dinner_time?: string;
    snack_time?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { error } = await supabase
        .from("push_subscriptions")
        .update({
            ...preferences,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

    if (error) {
        console.error("Erreur mise à jour préférences:", error);
        throw new Error("Erreur mise à jour préférences");
    }

    return { success: true };
}

// Récupérer les subscriptions de l'utilisateur
export async function getUserSubscriptions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", user.id);

    return data || [];
}

// Envoyer une notification à un utilisateur spécifique
export async function sendPushNotification(
    userId: string,
    notification: NotificationPayload
) {
    const supabase = await createClient();

    const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", userId);

    if (!subscriptions || subscriptions.length === 0) {
        return { success: false, reason: "no_subscription" };
    }

    const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || "/icon-192x192.png",
        badge: notification.badge || "/badge-72x72.png",
        url: notification.url || "/dashboard",
        tag: notification.tag,
    });

    const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    },
                    payload
                );
                return { success: true, endpoint: sub.endpoint };
            } catch (error: unknown) {
                const err = error as { statusCode?: number };
                // Si l'abonnement est expiré, le supprimer
                if (err.statusCode === 410) {
                    await supabase
                        .from("push_subscriptions")
                        .delete()
                        .eq("endpoint", sub.endpoint);
                }
                return { success: false, endpoint: sub.endpoint, error };
            }
        })
    );

    return { success: true, results };
}

// Envoyer un rappel de repas
export async function sendMealReminder(
    userId: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
) {
    const mealMessages = {
        breakfast: {
            title: "Petit-déjeuner 🌅",
            body: "N'oublie pas de tracker ton petit-déj !",
        },
        lunch: {
            title: "Déjeuner ☀️",
            body: "C'est l'heure du déj ! Pense à tracker ton repas.",
        },
        dinner: {
            title: "Dîner 🌙",
            body: "Bon appétit ! N'oublie pas de tracker ton dîner.",
        },
        snack: {
            title: "Snack 🍎",
            body: "Un petit encas ? Track-le pour maintenir ton streak !",
        },
    };

    return sendPushNotification(userId, {
        ...mealMessages[mealType],
        url: "/progress",
        tag: `meal-${mealType}`,
    });
}

// Envoyer un rappel de streak
export async function sendStreakReminder(userId: string, currentStreak: number) {
    return sendPushNotification(userId, {
        title: `🔥 Streak en danger !`,
        body: currentStreak > 0
            ? `Tu as ${currentStreak} jour(s) de streak. Track un repas pour continuer !`
            : "Commence ton streak aujourd'hui !",
        url: "/progress",
        tag: "streak-reminder",
    });
}

// Test notification
export async function sendTestNotification() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    return sendPushNotification(user.id, {
        title: "Test SmartDalle 🔥",
        body: "Les notifications push fonctionnent parfaitement !",
        url: "/dashboard",
    });
}
