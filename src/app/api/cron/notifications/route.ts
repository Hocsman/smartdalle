import { NextRequest, NextResponse } from "next/server";
import * as webpush from "web-push";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Configuration VAPID (lazy)
let vapidConfigured = false;
function ensureVapidConfigured() {
    if (vapidConfigured) return;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@smartdalle.fr";
    if (vapidPublicKey && vapidPrivateKey) {
        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        vapidConfigured = true;
    }
}

// Client Supabase admin (lazy initialization)
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }
    return _supabaseAdmin;
}

// Vérifier que la requête vient de Vercel Cron
function isValidCronRequest(request: NextRequest): boolean {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
        return true;
    }
    // En dev, autoriser sans secret
    if (process.env.NODE_ENV === "development") {
        return true;
    }
    return false;
}

// Envoyer une notification push
async function sendPush(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: { title: string; body: string; url?: string; tag?: string }
) {
    ensureVapidConfigured();
    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                },
            },
            JSON.stringify({
                title: payload.title,
                body: payload.body,
                icon: "/icon-192x192.png",
                badge: "/badge-72x72.png",
                url: payload.url || "/dashboard",
                tag: payload.tag || "smartdalle",
            })
        );
        return { success: true };
    } catch (error: unknown) {
        const err = error as { statusCode?: number };
        // Subscription expirée - la supprimer
        if (err.statusCode === 410 || err.statusCode === 404) {
            await getSupabaseAdmin()
                .from("push_subscriptions")
                .delete()
                .eq("endpoint", subscription.endpoint);
        }
        return { success: false, error };
    }
}

// ============================================
// RAPPELS DE REPAS (toutes les minutes)
// ============================================
async function processMealReminders() {
    const now = new Date();
    const currentHour = now.getUTCHours() + 1; // France = UTC+1 (ou +2 en été)
    const currentMinute = now.getUTCMinutes();
    const currentTime = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

    const mealTypes = [
        { field: "breakfast_time", type: "breakfast", emoji: "🌅", label: "petit-déj" },
        { field: "lunch_time", type: "lunch", emoji: "☀️", label: "déjeuner" },
        { field: "snack_time", type: "snack", emoji: "🍎", label: "snack" },
        { field: "dinner_time", type: "dinner", emoji: "🌙", label: "dîner" },
    ];

    let totalSent = 0;

    for (const meal of mealTypes) {
        // Trouver les users dont l'heure de repas = maintenant
        const { data: subscriptions } = await getSupabaseAdmin()
            .from("push_subscriptions")
            .select("endpoint, p256dh, auth, user_id")
            .eq("notify_meals", true)
            .eq(meal.field, currentTime);

        if (!subscriptions || subscriptions.length === 0) continue;

        // Récupérer les recettes du jour pour ces users
        const userIds = subscriptions.map((s) => s.user_id);
        const today = now.toISOString().split("T")[0];
        const dayOfWeek = now.getDay(); // 0 = dimanche

        interface DailyPlan {
            user_id: string;
            breakfast_recipe_id: string | null;
            lunch_recipe_id: string | null;
            snack_recipe_id: string | null;
            dinner_recipe_id: string | null;
        }

        const { data: dailyPlans } = await getSupabaseAdmin()
            .from("daily_plans")
            .select("user_id, breakfast_recipe_id, lunch_recipe_id, snack_recipe_id, dinner_recipe_id")
            .in("user_id", userIds)
            .eq("week_start_date", getWeekStartDate(today))
            .eq("day_of_week", dayOfWeek);

        const plans = (dailyPlans || []) as DailyPlan[];

        // Fonction pour obtenir le recipe_id selon le type de repas
        const getRecipeId = (plan: DailyPlan, mealType: string): string | null => {
            switch (mealType) {
                case "breakfast": return plan.breakfast_recipe_id;
                case "lunch": return plan.lunch_recipe_id;
                case "snack": return plan.snack_recipe_id;
                case "dinner": return plan.dinner_recipe_id;
                default: return null;
            }
        };

        // Récupérer les recipe IDs pour ce type de repas
        const recipeIds = plans
            .map((p) => getRecipeId(p, meal.type))
            .filter((id): id is string => !!id);

        // Récupérer les noms des recettes
        let recipeNames = new Map<string, string>();
        if (recipeIds.length > 0) {
            const { data: recipes } = await getSupabaseAdmin()
                .from("recipes")
                .select("id, name")
                .in("id", recipeIds);
            recipeNames = new Map(recipes?.map((r) => [r.id, r.name]) || []);
        }

        const plansByUser = new Map(plans.map((p) => [p.user_id, p]));

        for (const sub of subscriptions) {
            const plan = plansByUser.get(sub.user_id);
            const recipeId = plan ? getRecipeId(plan, meal.type) : null;
            const recipeName = recipeId ? recipeNames.get(recipeId) : undefined;

            const body = recipeName
                ? `C'est l'heure du ${meal.label} ! Ta recette : ${recipeName}`
                : `C'est l'heure du ${meal.label} ! Consulte tes recettes.`;

            await sendPush(sub, {
                title: `${meal.emoji} ${meal.label.charAt(0).toUpperCase() + meal.label.slice(1)}`,
                body,
                url: "/dashboard",
                tag: `meal-${meal.type}`,
            });
            totalSent++;
        }
    }

    return { type: "meals", sent: totalSent };
}

// ============================================
// INGRÉDIENTS QUI EXPIRENT (1x/jour à 9h)
// ============================================
async function processExpiryReminders() {
    const today = new Date().toISOString().split("T")[0];
    const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Trouver les ingrédients qui expirent bientôt, groupés par user
    const { data: expiringItems } = await getSupabaseAdmin()
        .from("pantry_items")
        .select("user_id, ingredient_name, expiry_date")
        .lte("expiry_date", inTwoDays)
        .gte("expiry_date", today)
        .order("expiry_date", { ascending: true });

    if (!expiringItems || expiringItems.length === 0) {
        return { type: "expiry", sent: 0 };
    }

    // Grouper par utilisateur
    const itemsByUser = new Map<string, typeof expiringItems>();
    for (const item of expiringItems) {
        const existing = itemsByUser.get(item.user_id) || [];
        existing.push(item);
        itemsByUser.set(item.user_id, existing);
    }

    let totalSent = 0;

    for (const [userId, items] of Array.from(itemsByUser)) {
        // Récupérer les subscriptions de cet utilisateur
        const { data: subscriptions } = await getSupabaseAdmin()
            .from("push_subscriptions")
            .select("endpoint, p256dh, auth")
            .eq("user_id", userId);

        if (!subscriptions || subscriptions.length === 0) continue;

        const todayItems = items.filter((i) => i.expiry_date === today);
        const soonItems = items.filter((i) => i.expiry_date !== today);

        let body: string;
        if (todayItems.length > 0) {
            const names = todayItems.slice(0, 3).map((i) => i.ingredient_name).join(", ");
            body = `⚠️ ${todayItems.length} ingrédient(s) expire(nt) aujourd'hui : ${names}`;
        } else {
            const names = soonItems.slice(0, 3).map((i) => i.ingredient_name).join(", ");
            body = `${names} expire(nt) dans les 2 prochains jours.`;
        }

        for (const sub of subscriptions) {
            await sendPush(sub, {
                title: "🥕 Garde-manger : produits à utiliser",
                body,
                url: "/pantry",
                tag: "expiry-reminder",
            });
            totalSent++;
        }
    }

    return { type: "expiry", sent: totalSent };
}

// ============================================
// RAPPEL DE STREAK (1x/jour à 20h)
// ============================================
async function processStreakReminders() {
    const today = new Date().toISOString().split("T")[0];

    // Trouver les utilisateurs qui n'ont pas encore tracké aujourd'hui
    const { data: subscriptions } = await getSupabaseAdmin()
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth, user_id")
        .eq("notify_streak", true);

    if (!subscriptions || subscriptions.length === 0) {
        return { type: "streak", sent: 0 };
    }

    let totalSent = 0;

    for (const sub of subscriptions) {
        // Vérifier si l'utilisateur a tracké aujourd'hui
        const { data: todayLogs } = await getSupabaseAdmin()
            .from("nutrition_logs")
            .select("id")
            .eq("user_id", sub.user_id)
            .eq("date", today)
            .limit(1);

        // Si déjà tracké, ne pas envoyer
        if (todayLogs && todayLogs.length > 0) continue;

        // Calculer le streak actuel
        const { data: recentLogs } = await getSupabaseAdmin()
            .from("nutrition_logs")
            .select("date")
            .eq("user_id", sub.user_id)
            .order("date", { ascending: false })
            .limit(30);

        let streak = 0;
        if (recentLogs && recentLogs.length > 0) {
            const dates = Array.from(new Set(recentLogs.map((l) => l.date)));
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];

            if (dates[0] === yesterday) {
                streak = 1;
                for (let i = 1; i < dates.length; i++) {
                    const expectedDate = new Date(
                        Date.now() - (i + 1) * 24 * 60 * 60 * 1000
                    )
                        .toISOString()
                        .split("T")[0];
                    if (dates[i] === expectedDate) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        const body =
            streak > 0
                ? `Tu as ${streak} jour(s) de streak ! Track un repas pour continuer 💪`
                : "Tu n'as pas encore tracké aujourd'hui. Lance-toi !";

        await sendPush(sub, {
            title: streak > 0 ? "🔥 Streak en danger !" : "📊 Track ta journée",
            body,
            url: "/progress",
            tag: "streak-reminder",
        });
        totalSent++;
    }

    return { type: "streak", sent: totalSent };
}

// Helper : obtenir le lundi de la semaine
function getWeekStartDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split("T")[0];
}

// ============================================
// ROUTE HANDLER
// ============================================
export async function GET(request: NextRequest) {
    // Vérifier l'authentification
    if (!isValidCronRequest(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    try {
        let result;

        switch (type) {
            case "meals":
                result = await processMealReminders();
                break;
            case "expiry":
                result = await processExpiryReminders();
                break;
            case "streak":
                result = await processStreakReminders();
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid type. Use: meals, expiry, or streak" },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Cron notification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
