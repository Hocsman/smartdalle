"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Collection {
    id: string;
    name: string;
    emoji: string;
    created_at: string;
    recipe_count: number;
}

// Récupérer toutes les collections de l'utilisateur
export async function getCollections(): Promise<Collection[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: collections } = await supabase
        .from("collections")
        .select("*, collection_recipes(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (!collections) return [];

    return collections.map((c) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        created_at: c.created_at,
        recipe_count: (c.collection_recipes as unknown as { count: number }[])?.[0]?.count || 0,
    }));
}

// Créer une collection
export async function createCollection(name: string, emoji: string = "📁") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { data, error } = await supabase
        .from("collections")
        .insert({ user_id: user.id, name, emoji })
        .select()
        .single();

    if (error) {
        if (error.code === "23505") throw new Error("Cette collection existe déjà");
        throw new Error("Erreur création collection");
    }

    revalidatePath("/favorites");
    return data;
}

// Supprimer une collection
export async function deleteCollection(collectionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collectionId)
        .eq("user_id", user.id);

    if (error) throw new Error("Erreur suppression collection");

    revalidatePath("/favorites");
}

// Ajouter une recette à une collection
export async function addToCollection(collectionId: string, recipeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    // Vérifier que la collection appartient à l'utilisateur
    const { data: collection } = await supabase
        .from("collections")
        .select("id")
        .eq("id", collectionId)
        .eq("user_id", user.id)
        .single();

    if (!collection) throw new Error("Collection non trouvée");

    const { error } = await supabase
        .from("collection_recipes")
        .upsert(
            { collection_id: collectionId, recipe_id: recipeId },
            { onConflict: "collection_id,recipe_id" }
        );

    if (error) throw new Error("Erreur ajout à la collection");

    revalidatePath("/favorites");
}

// Retirer une recette d'une collection
export async function removeFromCollection(collectionId: string, recipeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { error } = await supabase
        .from("collection_recipes")
        .delete()
        .eq("collection_id", collectionId)
        .eq("recipe_id", recipeId);

    if (error) throw new Error("Erreur retrait de la collection");

    revalidatePath("/favorites");
}

// Récupérer les recettes d'une collection
export async function getCollectionRecipes(collectionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from("collection_recipes")
        .select("recipe_id, recipes(*)")
        .eq("collection_id", collectionId);

    if (!data) return [];

    return data
        .map((item) => (item.recipes as unknown))
        .filter(Boolean);
}

// Récupérer les collections d'une recette (pour savoir dans quelles collections elle est)
export async function getRecipeCollections(recipeId: string): Promise<string[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from("collection_recipes")
        .select("collection_id")
        .eq("recipe_id", recipeId);

    return data?.map((item) => item.collection_id) || [];
}
