"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function saveProfile(formData: {
    objective: string;
    budget: string;
    weight: number;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    // Basic calorie estimation logic (simple formula for MVP)
    // Harris-Benedict simplified or just rough estimates
    // Maintien: Poids * 30-32
    // Perte: Poids * 25
    // Masse: Poids * 35+
    let calorieTarget = 2000;
    if (formData.objective === "perte_poids") calorieTarget = formData.weight * 25;
    if (formData.objective === "maintain") calorieTarget = formData.weight * 30;
    if (formData.objective === "prise_masse") calorieTarget = formData.weight * 35;

    const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        objectif: formData.objective,
        budget_level: formData.budget,
        calories_target: Math.round(calorieTarget),
        updated_at: new Date().toISOString(),
    });

    if (error) {
        console.error("Error saving profile:", error);
        // Don't crash, just log. 
        // In real app might want to show error.
    }

    redirect("/dashboard");
}
