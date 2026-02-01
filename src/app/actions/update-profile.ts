"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const allowedGoals = new Set(["perte_poids", "maintain", "prise_masse"]);
const allowedBudgets = new Set(["eco", "standard", "confort"]);

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const username = (formData.get("username") as string | null)?.trim() || null;
    const goal = (formData.get("goal") as string | null) || null;
    const budget = (formData.get("budget") as string | null) || null;
    const caloriesTargetRaw = (formData.get("calories_target") as string | null) || null;
    const caloriesTarget = caloriesTargetRaw ? Number.parseInt(caloriesTargetRaw, 10) : null;

    const payload: Record<string, unknown> = {
        username,
        calories_target: Number.isFinite(caloriesTarget) ? caloriesTarget : null,
    };

    if (goal && allowedGoals.has(goal)) {
        payload.objectif = goal;
    }
    if (budget && allowedBudgets.has(budget)) {
        payload.budget_level = budget;
    }

    const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

    if (error) {
        console.error("Profile update failed:", error);
        throw new Error("Profile update failed");
    }

    revalidatePath("/dashboard");
    revalidatePath("/settings");
}

export async function updateAvatarUrl(avatarUrl: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

    if (error) {
        console.error("Avatar update failed:", error);
        throw new Error("Avatar update failed");
    }

    revalidatePath("/dashboard");
    revalidatePath("/settings");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
