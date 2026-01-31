"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generatePlan() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Fetch User Profile to get Budget
    const { data: profile } = await supabase
        .from("profiles")
        .select("budget_level")
        .eq("id", user.id)
        .single();

    const isEco = profile?.budget_level === 'eco';

    // 2. Fetch recipes (filtered if Eco)
    let query = supabase.from("recipes").select("id, price_estimated");

    if (isEco) {
        // "Eco" Mode: Only recipes under 4€
        query = query.lt('price_estimated', 4.0);
    }

    const { data: recipes } = await query;

    let recipesToPick = recipes || [];

    if (!recipesToPick || recipesToPick.length < 4) {
        // Fallback: If not enough cheap recipes, fetch all to avoid crash
        console.warn("Not enough recipes for budget filter, falling back to all.");
        const { data: fallbackRecipes } = await supabase.from("recipes").select("id, price_estimated");
        if (!fallbackRecipes || fallbackRecipes.length < 4) {
            throw new Error("Not enough recipes found to generate a plan");
        }
        recipesToPick = fallbackRecipes;
    }

    // 3. Random Selection (Simple Shuffle)
    const shuffled = recipesToPick.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    // 4. Insert new plan for Today
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { error } = await supabase.from("daily_plans").insert({
        user_id: user.id,
        date: today,
        breakfast_recipe_id: selected[0].id,
        lunch_recipe_id: selected[1].id,
        dinner_recipe_id: selected[2].id,
        snack_recipe_id: selected[3].id,
    });

    if (error) {
        console.error("Plan creation failed:", error);
        throw new Error("Failed to create plan");
    }

    revalidatePath("/dashboard");
}
