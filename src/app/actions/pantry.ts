"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { categorizeIngredient } from "@/utils/categories";

export interface PantryItem {
    id: string;
    ingredient_name: string;
    quantity: string | null;
    category: string;
    expiry_date: string | null;
    created_at: string;
}

export async function getPantryItems(): Promise<PantryItem[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .eq("user_id", user.id)
        .order("category", { ascending: true })
        .order("expiry_date", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Fetch pantry error:", error);
        return [];
    }

    return data || [];
}

export async function addPantryItem(formData: {
    ingredient_name: string;
    quantity?: string;
    expiry_date?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const category = categorizeIngredient(formData.ingredient_name);

    const { error } = await supabase
        .from("pantry_items")
        .insert({
            user_id: user.id,
            ingredient_name: formData.ingredient_name.trim(),
            quantity: formData.quantity?.trim() || null,
            category,
            expiry_date: formData.expiry_date || null,
        });

    if (error) {
        console.error("Insert pantry error:", error);
        throw new Error("Erreur lors de l'ajout");
    }

    revalidatePath("/pantry");
    return { success: true };
}

export async function updatePantryItem(
    itemId: string,
    formData: {
        ingredient_name?: string;
        quantity?: string;
        expiry_date?: string | null;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const updateData: Record<string, unknown> = {};

    if (formData.ingredient_name !== undefined) {
        updateData.ingredient_name = formData.ingredient_name.trim();
        updateData.category = categorizeIngredient(formData.ingredient_name);
    }
    if (formData.quantity !== undefined) {
        updateData.quantity = formData.quantity.trim() || null;
    }
    if (formData.expiry_date !== undefined) {
        updateData.expiry_date = formData.expiry_date || null;
    }

    const { error } = await supabase
        .from("pantry_items")
        .update(updateData)
        .eq("id", itemId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Update pantry error:", error);
        throw new Error("Erreur lors de la mise à jour");
    }

    revalidatePath("/pantry");
    return { success: true };
}

export async function deletePantryItem(itemId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { error } = await supabase
        .from("pantry_items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Delete pantry error:", error);
        throw new Error("Erreur lors de la suppression");
    }

    revalidatePath("/pantry");
    return { success: true };
}

export async function getPantryIngredientNames(): Promise<string[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from("pantry_items")
        .select("ingredient_name")
        .eq("user_id", user.id);

    return data?.map((item) => item.ingredient_name.toLowerCase()) || [];
}
