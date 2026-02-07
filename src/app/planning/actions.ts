"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Get Monday of the week containing the given date
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Format date as YYYY-MM-DD (local timezone to avoid UTC issues)
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get array of 7 dates starting from Monday
function getWeekDates(weekStart: Date): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        dates.push(formatDate(d));
    }
    return dates;
}

export async function getWeeklyPlans(weekOffset: number = 0) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { plans: [], weekDates: [], weekStart: "" };

    // Calculate week start
    const today = new Date();
    const weekStart = getWeekStart(today);
    weekStart.setDate(weekStart.getDate() + (weekOffset * 7));
    const weekDates = getWeekDates(weekStart);

    // Fetch plans for the week
    const { data: plans } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", weekDates[0])
        .lte("date", weekDates[6])
        .order("date", { ascending: true });

    // Get all unique recipe IDs
    const recipeIds = new Set<string>();
    plans?.forEach(plan => {
        if (plan.breakfast_recipe_id) recipeIds.add(plan.breakfast_recipe_id);
        if (plan.lunch_recipe_id) recipeIds.add(plan.lunch_recipe_id);
        if (plan.dinner_recipe_id) recipeIds.add(plan.dinner_recipe_id);
        if (plan.snack_recipe_id) recipeIds.add(plan.snack_recipe_id);
    });

    // Fetch recipes
    let recipes: Record<string, { id: string; name: string; calories: number; protein: number; price_estimated: number; image_url: string | null }> = {};
    if (recipeIds.size > 0) {
        const { data: recipeData } = await supabase
            .from("recipes")
            .select("id, name, calories, protein, price_estimated, image_url")
            .in("id", Array.from(recipeIds));

        if (recipeData) {
            recipes = Object.fromEntries(recipeData.map(r => [r.id, r]));
        }
    }

    // Map plans to week structure
    const weekPlans = weekDates.map(date => {
        const plan = plans?.find(p => p.date === date);
        return {
            date,
            planId: plan?.id || null,
            breakfast: plan?.breakfast_recipe_id ? (recipes[plan.breakfast_recipe_id] ?? null) : null,
            lunch: plan?.lunch_recipe_id ? (recipes[plan.lunch_recipe_id] ?? null) : null,
            dinner: plan?.dinner_recipe_id ? (recipes[plan.dinner_recipe_id] ?? null) : null,
            snack: plan?.snack_recipe_id ? (recipes[plan.snack_recipe_id] ?? null) : null,
        };
    });

    return {
        plans: weekPlans,
        weekDates,
        weekStart: formatDate(weekStart),
    };
}

export async function generateWeeklyPlan() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Get user profile for budget (use maybeSingle to avoid errors)
    const { data: profile } = await supabase
        .from("profiles")
        .select("budget_level")
        .eq("id", user.id)
        .maybeSingle();

    const isEco = profile?.budget_level === "eco";

    // Fetch recipes
    let query = supabase.from("recipes").select("id, price_estimated");
    if (isEco) {
        query = query.lt("price_estimated", 4.0);
    }

    const { data: recipes } = await query;
    let recipesToPick = recipes || [];

    if (recipesToPick.length < 4) {
        const { data: fallbackRecipes } = await supabase.from("recipes").select("id, price_estimated");
        recipesToPick = fallbackRecipes || [];
    }

    if (recipesToPick.length < 4) {
        throw new Error("Not enough recipes to generate a weekly plan");
    }

    // Calculate week dates
    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekDates = getWeekDates(weekStart);

    // Track used recipes to avoid too much repetition
    const usedRecipes = new Map<string, number>();

    // Generate plan for each day
    for (const date of weekDates) {
        // Shuffle and select recipes, preferring less-used ones
        const shuffled = recipesToPick
            .map(r => ({ ...r, useCount: usedRecipes.get(r.id) || 0 }))
            .sort((a, b) => {
                if (a.useCount !== b.useCount) return a.useCount - b.useCount;
                return Math.random() - 0.5;
            });

        const selected = shuffled.slice(0, 4);

        // Track usage
        selected.forEach(r => {
            usedRecipes.set(r.id, (usedRecipes.get(r.id) || 0) + 1);
        });

        // Check if plan exists
        const { data: existingPlan } = await supabase
            .from("daily_plans")
            .select("id")
            .eq("user_id", user.id)
            .eq("date", date)
            .maybeSingle();

        if (existingPlan) {
            await supabase
                .from("daily_plans")
                .update({
                    breakfast_recipe_id: selected[0].id,
                    lunch_recipe_id: selected[1].id,
                    dinner_recipe_id: selected[2].id,
                    snack_recipe_id: selected[3].id,
                })
                .eq("id", existingPlan.id);
        } else {
            await supabase.from("daily_plans").insert({
                user_id: user.id,
                date,
                breakfast_recipe_id: selected[0].id,
                lunch_recipe_id: selected[1].id,
                dinner_recipe_id: selected[2].id,
                snack_recipe_id: selected[3].id,
            });
        }
    }

    revalidatePath("/planning");
    revalidatePath("/dashboard");
}

export async function updateMealSlot(
    date: string,
    slot: "breakfast" | "lunch" | "dinner" | "snack",
    recipeId: string | null
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const slotColumn = `${slot}_recipe_id`;

    // Check if plan exists for this date
    const { data: existingPlan, error: selectError } = await supabase
        .from("daily_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();

    if (selectError) {
        console.error("Error checking existing plan:", selectError);
        throw new Error("Failed to check existing plan");
    }

    if (existingPlan) {
        // Update existing plan
        const { error: updateError } = await supabase
            .from("daily_plans")
            .update({ [slotColumn]: recipeId })
            .eq("id", existingPlan.id);

        if (updateError) {
            console.error("Error updating plan:", updateError);
            throw new Error("Failed to update meal slot");
        }
    } else {
        // Create new plan for this date
        const { error: insertError } = await supabase.from("daily_plans").insert({
            user_id: user.id,
            date,
            [slotColumn]: recipeId,
        });

        if (insertError) {
            console.error("Error inserting plan:", insertError);
            throw new Error("Failed to create meal slot");
        }
    }

    revalidatePath("/planning");
    revalidatePath("/dashboard");
}

export async function swapMeals(
    fromDate: string,
    fromSlot: string,
    toDate: string,
    toSlot: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Get both plans
    const { data: plans } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", user.id)
        .in("date", [fromDate, toDate]);

    const fromPlan = plans?.find(p => p.date === fromDate);
    const toPlan = plans?.find(p => p.date === toDate);

    const fromColumn = `${fromSlot}_recipe_id` as keyof typeof fromPlan;
    const toColumn = `${toSlot}_recipe_id` as keyof typeof toPlan;

    const fromRecipeId = fromPlan?.[fromColumn] || null;
    const toRecipeId = toPlan?.[toColumn] || null;

    // Swap the recipes
    if (fromPlan) {
        await supabase
            .from("daily_plans")
            .update({ [fromColumn]: toRecipeId })
            .eq("id", fromPlan.id);
    }

    if (toPlan) {
        await supabase
            .from("daily_plans")
            .update({ [toColumn]: fromRecipeId })
            .eq("id", toPlan.id);
    } else if (fromRecipeId) {
        // Create new plan if it doesn't exist
        await supabase.from("daily_plans").insert({
            user_id: user.id,
            date: toDate,
            [toColumn]: fromRecipeId,
        });
    }

    revalidatePath("/planning");
}
