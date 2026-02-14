"use server";

import { createClient } from "@/utils/supabase/server";

const ALL_CULTURES_COUNT = 7;

/**
 * Vérifie et attribue les badges mérités.
 * Retourne les clés des badges nouvellement débloqués.
 */
export async function checkAndAwardBadges(): Promise<string[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Badges déjà obtenus
    const { data: existingBadges } = await supabase
        .from("user_badges")
        .select("badge_key")
        .eq("user_id", user.id);
    const earned = new Set((existingBadges || []).map((b) => b.badge_key));

    // 2. Récupérer les stats en parallèle
    const [streakResult, logsResult, favoritesResult, culturesResult] =
        await Promise.all([
            supabase.rpc("calculate_user_streak", { p_user_id: user.id }),
            supabase
                .from("nutrition_logs")
                .select("meals_logged")
                .eq("user_id", user.id),
            supabase
                .from("favorites")
                .select("recipe_id")
                .eq("user_id", user.id),
            supabase
                .from("favorites")
                .select("recipes(culture)")
                .eq("user_id", user.id),
        ]);

    const streak = (streakResult.data as number) || 0;

    // Compter tous les repas loggés (JSONB arrays)
    let totalMeals = 0;
    if (logsResult.data) {
        for (const log of logsResult.data) {
            const meals = log.meals_logged;
            if (Array.isArray(meals)) totalMeals += meals.length;
        }
    }

    const totalFavorites = favoritesResult.data?.length || 0;

    // Cultures distinctes depuis les favoris
    const cultureSet = new Set<string>();
    if (culturesResult.data) {
        for (const fav of culturesResult.data) {
            const recipe = fav.recipes as { culture?: string } | null;
            if (recipe?.culture) cultureSet.add(recipe.culture);
        }
    }
    const distinctCultures = cultureSet.size;

    // 3. Évaluer les conditions
    const conditions: Record<string, boolean> = {
        streak_3: streak >= 3,
        streak_7: streak >= 7,
        streak_14: streak >= 14,
        streak_30: streak >= 30,
        first_meal: totalMeals >= 1,
        meals_10: totalMeals >= 10,
        meals_50: totalMeals >= 50,
        meals_100: totalMeals >= 100,
        first_favorite: totalFavorites >= 1,
        favorites_10: totalFavorites >= 10,
        cultures_3: distinctCultures >= 3,
        cultures_all: distinctCultures >= ALL_CULTURES_COUNT,
    };

    const newBadges: string[] = [];
    for (const [key, condition] of Object.entries(conditions)) {
        if (condition && !earned.has(key)) {
            newBadges.push(key);
        }
    }

    // 4. Insérer les nouveaux badges
    if (newBadges.length > 0) {
        await supabase.from("user_badges").insert(
            newBadges.map((key) => ({
                user_id: user.id,
                badge_key: key,
            }))
        );
    }

    return newBadges;
}

/**
 * Retourne toutes les clés de badges débloqués par l'utilisateur.
 */
export async function getUserBadges(): Promise<string[]> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("user_badges")
        .select("badge_key")
        .eq("user_id", user.id);

    return (data || []).map((b) => b.badge_key);
}
