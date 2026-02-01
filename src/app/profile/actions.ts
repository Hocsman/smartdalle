"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedObjectifs = new Set(["perte_poids", "maintain", "prise_masse"]);
const allowedBudgets = new Set(["eco", "standard", "confort"]);
const allowedCultures = new Set([
    "africaine",
    "antillaise",
    "maghrebine",
    "francaise",
    "classique",
    "mix",
]);
const allowedAgeRanges = new Set(["16-29", "30-49", "50-69", "70+"]);

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const username = (formData.get("username") as string | null)?.trim() || null;
    const objectifRaw = (formData.get("objectif") as string | null) || null;
    const budgetRaw = (formData.get("budget_level") as string | null) || null;
    const cultureRaw = (formData.get("culture") as string | null) || null;
    const caloriesTargetRaw = (formData.get("calories_target") as string | null) || null;
    const heightRaw = (formData.get("height") as string | null) || null;
    const ageRangeRaw = (formData.get("age_range") as string | null) || null;

    const caloriesTarget = caloriesTargetRaw ? Number.parseInt(caloriesTargetRaw, 10) : null;
    const height = heightRaw ? Number.parseInt(heightRaw, 10) : null;

    const payload: Record<string, unknown> = {
        username,
        calories_target: Number.isFinite(caloriesTarget) ? caloriesTarget : null,
        height: Number.isFinite(height) ? height : null,
    };

    if (objectifRaw && allowedObjectifs.has(objectifRaw)) {
        payload.objectif = objectifRaw;
    }
    if (budgetRaw && allowedBudgets.has(budgetRaw)) {
        payload.budget_level = budgetRaw;
    }
    if (cultureRaw && allowedCultures.has(cultureRaw)) {
        payload.culture = cultureRaw;
    }
    if (ageRangeRaw && allowedAgeRanges.has(ageRangeRaw)) {
        payload.age_range = ageRangeRaw;
    }

    const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

    if (error) {
        console.error("Profile update failed:", error);
        throw new Error("Profile update failed");
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    redirect("/profile?updated=1");
}
