"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToShoppingList(recipeId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Vous devez être connecté");
    }

    // Fetch recipe with ingredients
    const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .select("id, ingredients")
        .eq("id", recipeId)
        .single();

    if (recipeError || !recipe) {
        throw new Error("Recette introuvable");
    }

    // Parse ingredients
    let ingredientsList: string[] = [];
    try {
        ingredientsList = typeof recipe.ingredients === 'string'
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients;
    } catch {
        throw new Error("Format d'ingrédients invalide");
    }

    if (!Array.isArray(ingredientsList) || ingredientsList.length === 0) {
        throw new Error("Aucun ingrédient à ajouter");
    }

    // Fetch user's pantry items for auto-exclusion
    const { data: pantryItems } = await supabase
        .from("pantry_items")
        .select("ingredient_name")
        .eq("user_id", user.id);

    const pantryNames = (pantryItems || []).map((p) => p.ingredient_name.toLowerCase());

    // Filter out ingredients already in the pantry (fuzzy match)
    const filteredIngredients = pantryNames.length > 0
        ? ingredientsList.filter((ingredient) => {
            const lower = ingredient.toLowerCase();
            const nameOnly = lower.replace(/\d+\s*(?:g|kg|ml|l|cl|pièces?|tranches?)/gi, "").trim();
            return !pantryNames.some((pantryName) =>
                nameOnly.includes(pantryName) || pantryName.includes(nameOnly)
            );
        })
        : ingredientsList;

    const ingredientsToAdd = filteredIngredients.length > 0 ? filteredIngredients : ingredientsList;
    const excludedCount = ingredientsList.length - ingredientsToAdd.length;

    // Create shopping items from ingredients
    const shoppingItems = ingredientsToAdd.map((ingredient) => {
        // Try to extract quantity from ingredient string (e.g., "Poulet 150g" -> quantity: "150g", name: "Poulet")
        const quantityMatch = ingredient.match(/(\d+\s*(?:g|kg|ml|L|cl|pièces?|tranches?)?)/i);
        const quantity = quantityMatch ? quantityMatch[1] : null;
        const ingredientName = quantityMatch
            ? ingredient.replace(quantityMatch[0], "").trim()
            : ingredient;

        return {
            user_id: user.id,
            ingredient_name: ingredientName || ingredient,
            quantity: quantity,
            recipe_id: recipeId,
            is_checked: false,
        };
    });

    // Insert all items
    const { error: insertError } = await supabase
        .from("shopping_items")
        .insert(shoppingItems);

    if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Erreur lors de l'ajout à la liste");
    }

    revalidatePath("/shopping-list");
    return { success: true, count: shoppingItems.length, excludedCount };
}

export async function toggleShoppingItem(itemId: string, isChecked: boolean) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Vous devez être connecté");
    }

    const { error } = await supabase
        .from("shopping_items")
        .update({ is_checked: isChecked })
        .eq("id", itemId)
        .eq("user_id", user.id);

    if (error) {
        throw new Error("Erreur lors de la mise à jour");
    }

    revalidatePath("/shopping-list");
    return { success: true };
}

export async function deleteShoppingItem(itemId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Vous devez être connecté");
    }

    const { error } = await supabase
        .from("shopping_items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id);

    if (error) {
        throw new Error("Erreur lors de la suppression");
    }

    revalidatePath("/shopping-list");
    return { success: true };
}

export async function clearShoppingList() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Vous devez être connecté");
    }

    const { error } = await supabase
        .from("shopping_items")
        .delete()
        .eq("user_id", user.id);

    if (error) {
        throw new Error("Erreur lors de la suppression");
    }

    revalidatePath("/shopping-list");
    return { success: true };
}

export async function getShoppingItems() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return [];
    }

    const { data: items, error } = await supabase
        .from("shopping_items")
        .select("*, recipes(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch error:", error);
        return [];
    }

    return items || [];
}
