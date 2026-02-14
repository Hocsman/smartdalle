"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Retourne les recettes personnalisées selon les goûts de l'utilisateur.
 * Algorithme : favoris (poids 3x) + repas loggés (2x) + préférences profil (1x)
 */
export async function getPersonalizedRecipes(limit: number = 6) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch en parallèle
    const [profileResult, favoritesResult, logsResult, allRecipesResult] =
        await Promise.all([
            supabase
                .from("profiles")
                .select("culture, objectif, budget_level")
                .eq("id", user.id)
                .single(),
            supabase
                .from("favorites")
                .select("recipe_id, recipes(*)")
                .eq("user_id", user.id),
            supabase
                .from("nutrition_logs")
                .select("meals_logged")
                .eq("user_id", user.id)
                .order("date", { ascending: false })
                .limit(30),
            supabase.from("recipes").select("*"),
        ]);

    const profile = profileResult.data;
    const favorites = favoritesResult.data || [];
    const logs = logsResult.data || [];
    const allRecipes = allRecipesResult.data || [];

    if (allRecipes.length === 0) return [];

    // Construire le profil de goût
    const cultureScores: Record<string, number> = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalPrice = 0;
    let dataPoints = 0;
    const knownRecipeIds = new Set<string>();

    // Favoris (poids 3)
    for (const fav of favorites) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recipe = (fav as any).recipes;
        if (!recipe) continue;
        knownRecipeIds.add(fav.recipe_id);
        cultureScores[recipe.culture] =
            (cultureScores[recipe.culture] || 0) + 3;
        totalCalories += recipe.calories * 3;
        totalProtein += recipe.protein * 3;
        totalPrice += (recipe.price_estimated || 4) * 3;
        dataPoints += 3;
    }

    // Repas loggés (poids 2)
    for (const log of logs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meals = log.meals_logged as any[];
        if (!Array.isArray(meals)) continue;
        for (const meal of meals) {
            if (meal.recipe_id) {
                knownRecipeIds.add(meal.recipe_id);
                const recipe = allRecipes.find((r) => r.id === meal.recipe_id);
                if (recipe) {
                    cultureScores[recipe.culture] =
                        (cultureScores[recipe.culture] || 0) + 2;
                    totalCalories += recipe.calories * 2;
                    totalProtein += recipe.protein * 2;
                    totalPrice += (recipe.price_estimated || 4) * 2;
                    dataPoints += 2;
                }
            }
        }
    }

    // Préférences profil (fallback)
    const cultureMap: Record<string, string> = {
        africaine: "Africaine",
        antillaise: "Antillaise",
        maghrebine: "Maghrébine",
        francaise: "Française",
        classique: "Classique",
    };
    if (profile?.culture && profile.culture !== "mix") {
        const mapped = cultureMap[profile.culture] || profile.culture;
        cultureScores[mapped] = (cultureScores[mapped] || 0) + 5;
    }

    // Moyennes (avec defaults)
    const avgCalories = dataPoints > 0 ? totalCalories / dataPoints : 500;
    const avgProtein = dataPoints > 0 ? totalProtein / dataPoints : 30;

    const priceCeilingMap: Record<string, number> = {
        eco: 4.0,
        standard: 6.0,
        confort: 99,
    };
    const priceCeiling =
        priceCeilingMap[profile?.budget_level || "standard"] || 6.0;

    // Top cultures
    const topCultures = Object.entries(cultureScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([culture]) => culture);

    // Scorer chaque recette
    const scored = allRecipes.map((recipe) => {
        let score = 0;

        // Culture match (0-30)
        if (topCultures.includes(recipe.culture)) {
            const rank = topCultures.indexOf(recipe.culture);
            score += 30 - rank * 8;
        }

        // Proximité calories (0-20)
        const calDiff = Math.abs(recipe.calories - avgCalories);
        score += Math.max(0, 20 - calDiff / 30);

        // Proximité protéines (0-20)
        const protDiff = Math.abs(recipe.protein - avgProtein);
        score += Math.max(0, 20 - protDiff);

        // Prix (0-15)
        if ((recipe.price_estimated || 4) <= priceCeiling) {
            score += 15 - ((recipe.price_estimated || 4) / priceCeiling) * 5;
        }

        // Bonus nouveauté (0-15) — recettes pas encore essayées
        if (!knownRecipeIds.has(recipe.id)) {
            score += 15;
        }

        return { ...recipe, _score: score };
    });

    // Trier par score et retourner le top
    scored.sort((a, b) => b._score - a._score);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return scored.slice(0, limit).map(({ _score, ...recipe }) => recipe);
}
