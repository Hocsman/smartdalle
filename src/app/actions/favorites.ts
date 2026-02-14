"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAndAwardBadges } from "@/app/actions/badges";

export async function toggleFavorite(recipeId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Check if already favorited
    const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId)
        .single();

    if (existing) {
        // Remove from favorites
        const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("id", existing.id);

        if (error) throw new Error("Failed to remove favorite");

        revalidatePath("/dashboard");
        revalidatePath(`/recipes/${recipeId}`);
        return { isFavorite: false };
    } else {
        // Add to favorites
        const { error } = await supabase
            .from("favorites")
            .insert({
                user_id: user.id,
                recipe_id: recipeId,
            });

        if (error) throw new Error("Failed to add favorite");

        revalidatePath("/dashboard");
        revalidatePath(`/recipes/${recipeId}`);

        // Vérifier les badges après ajout d'un favori
        await checkAndAwardBadges().catch(() => {});

        return { isFavorite: true };
    }
}

export async function getFavoriteIds() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from("favorites")
        .select("recipe_id")
        .eq("user_id", user.id);

    return data?.map((f) => f.recipe_id) || [];
}
