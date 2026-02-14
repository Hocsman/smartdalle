"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAndAwardBadges } from "@/app/actions/badges";

// Types pour le suivi nutritionnel
export interface NutritionLog {
    id: string;
    date: string;
    calories_consumed: number;
    calories_goal: number;
    protein_consumed: number;
    protein_goal: number;
    carbs_consumed: number;
    carbs_goal: number;
    fat_consumed: number;
    fat_goal: number;
    meals_logged: MealLog[];
}

export interface MealLog {
    recipe_id: string;
    recipe_name: string;
    meal_type: "breakfast" | "lunch" | "dinner" | "snack";
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    logged_at: string;
}

export interface UserGoals {
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fat: number;
    target_weight?: number;
    current_weight?: number;
}

// Récupérer les logs nutritionnels des derniers jours
export async function getNutritionLogs(days: number = 7): Promise<NutritionLog[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

    if (error) {
        console.error("Erreur récupération logs:", error);
        return [];
    }

    return data || [];
}

// Récupérer le log d'aujourd'hui
export async function getTodayLog(): Promise<NutritionLog | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

    return data;
}

// Récupérer les objectifs utilisateur
export async function getUserGoals(): Promise<UserGoals> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            daily_calories: 2000,
            daily_protein: 100,
            daily_carbs: 250,
            daily_fat: 65
        };
    }

    const { data } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!data) {
        return {
            daily_calories: 2000,
            daily_protein: 100,
            daily_carbs: 250,
            daily_fat: 65
        };
    }

    return {
        daily_calories: data.daily_calories,
        daily_protein: data.daily_protein,
        daily_carbs: data.daily_carbs,
        daily_fat: data.daily_fat,
        target_weight: data.target_weight,
        current_weight: data.current_weight
    };
}

// Enregistrer un repas
export async function logMeal(
    recipeId: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack",
    nutrition: { calories: number; protein: number; carbs: number; fat: number; name: string }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const today = new Date().toISOString().split("T")[0];
    const goals = await getUserGoals();

    // Récupérer ou créer le log du jour
    const { data: existingLog } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

    const newMeal: MealLog = {
        recipe_id: recipeId,
        recipe_name: nutrition.name,
        meal_type: mealType,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        logged_at: new Date().toISOString()
    };

    if (existingLog) {
        // Mettre à jour le log existant
        const currentMeals = existingLog.meals_logged || [];
        const updatedMeals = [...currentMeals, newMeal];

        const { error } = await supabase
            .from("nutrition_logs")
            .update({
                calories_consumed: existingLog.calories_consumed + nutrition.calories,
                protein_consumed: existingLog.protein_consumed + nutrition.protein,
                carbs_consumed: existingLog.carbs_consumed + nutrition.carbs,
                fat_consumed: existingLog.fat_consumed + nutrition.fat,
                meals_logged: updatedMeals,
                updated_at: new Date().toISOString()
            })
            .eq("id", existingLog.id);

        if (error) throw new Error("Erreur mise à jour log");
    } else {
        // Créer un nouveau log
        const { error } = await supabase
            .from("nutrition_logs")
            .insert({
                user_id: user.id,
                date: today,
                calories_consumed: nutrition.calories,
                calories_goal: goals.daily_calories,
                protein_consumed: nutrition.protein,
                protein_goal: goals.daily_protein,
                carbs_consumed: nutrition.carbs,
                carbs_goal: goals.daily_carbs,
                fat_consumed: nutrition.fat,
                fat_goal: goals.daily_fat,
                meals_logged: [newMeal]
            });

        if (error) throw new Error("Erreur création log");
    }

    revalidatePath("/progress");
    revalidatePath("/dashboard");

    // Vérifier les badges après chaque repas loggé
    await checkAndAwardBadges().catch(() => {});
}

// Mettre à jour les objectifs utilisateur
export async function updateUserGoals(goals: Partial<UserGoals>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { data: existing } = await supabase
        .from("user_goals")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (existing) {
        const { error } = await supabase
            .from("user_goals")
            .update({
                ...goals,
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

        if (error) throw new Error("Erreur mise à jour objectifs");
    } else {
        const { error } = await supabase
            .from("user_goals")
            .insert({
                user_id: user.id,
                daily_calories: goals.daily_calories || 2000,
                daily_protein: goals.daily_protein || 100,
                daily_carbs: goals.daily_carbs || 250,
                daily_fat: goals.daily_fat || 65,
                target_weight: goals.target_weight,
                current_weight: goals.current_weight
            });

        if (error) throw new Error("Erreur création objectifs");
    }

    revalidatePath("/progress");
}

// Calculer le streak actuel
export async function getUserStreak(): Promise<number> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    // Utiliser la fonction SQL
    const { data, error } = await supabase.rpc("calculate_user_streak", {
        p_user_id: user.id
    });

    if (error) {
        console.error("Erreur calcul streak:", error);
        // Fallback: calculer côté client
        return 0;
    }

    return data || 0;
}

// Supprimer un repas du log
export async function removeMealFromLog(mealIndex: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const today = new Date().toISOString().split("T")[0];

    const { data: log } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

    if (!log) throw new Error("Log non trouvé");

    const meals: MealLog[] = log.meals_logged || [];
    const mealToRemove = meals[mealIndex];

    if (!mealToRemove) throw new Error("Repas non trouvé");

    const updatedMeals = meals.filter((_, index) => index !== mealIndex);

    const { error } = await supabase
        .from("nutrition_logs")
        .update({
            calories_consumed: Math.max(0, log.calories_consumed - mealToRemove.calories),
            protein_consumed: Math.max(0, log.protein_consumed - mealToRemove.protein),
            carbs_consumed: Math.max(0, log.carbs_consumed - mealToRemove.carbs),
            fat_consumed: Math.max(0, log.fat_consumed - mealToRemove.fat),
            meals_logged: updatedMeals,
            updated_at: new Date().toISOString()
        })
        .eq("id", log.id);

    if (error) throw new Error("Erreur suppression repas");

    revalidatePath("/progress");
}
