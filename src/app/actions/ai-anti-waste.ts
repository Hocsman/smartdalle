"use server";

import { createClient } from "@/utils/supabase/server";
import { getOpenAIClient } from "@/lib/openai";

export interface SuggestedRecipe {
    name: string;
    description: string;
    ingredients_used: string[];
    ingredients_extra: string[];
    estimated_time: string;
    calories: number;
    protein: number;
}

export async function suggestAntiWasteRecipes(): Promise<
    | { error: "premium_required" }
    | { error: "no_items" }
    | { suggestions: SuggestedRecipe[] }
> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    // Premium guard + profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, budget_level, objectif")
        .eq("id", user.id)
        .single();

    if (!profile?.is_premium) {
        return { error: "premium_required" };
    }

    // Fetch pantry items, prioritize by expiry
    const { data: pantryItems } = await supabase
        .from("pantry_items")
        .select("ingredient_name, quantity, expiry_date")
        .eq("user_id", user.id)
        .order("expiry_date", { ascending: true, nullsFirst: false });

    if (!pantryItems || pantryItems.length === 0) {
        return { error: "no_items" };
    }

    // Build ingredient list with expiry urgency
    const ingredientList = pantryItems
        .map((item) => {
            let urgency = "";
            if (item.expiry_date) {
                const days = Math.ceil(
                    (new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                if (days <= 0) urgency = " (PERIME - utiliser en priorité absolue!)";
                else if (days <= 2) urgency = " (URGENT - expire dans " + days + " jour(s))";
                else if (days <= 7) urgency = " (expire bientôt)";
            }
            const qty = item.quantity ? ` (${item.quantity})` : "";
            return `- ${item.ingredient_name}${qty}${urgency}`;
        })
        .join("\n");

    const systemPrompt = `Tu es un chef anti-gaspillage expert en street food healthy.
L'utilisateur a ces ingrédients dans son frigo :

${ingredientList}

Profil : budget ${profile.budget_level || "standard"}, objectif ${profile.objectif || "santé"}.

MISSION : Suggère exactement 3 recettes qui utilisent AU MAXIMUM les ingrédients disponibles,
en PRIORITISANT ceux qui expirent bientôt ou sont périmés.
Les recettes doivent être réalistes, rapides et healthy.

Retourne un JSON valide avec cette structure exacte :
{
  "suggestions": [
    {
      "name": "Nom de la recette",
      "description": "Description courte et motivante (1-2 phrases)",
      "ingredients_used": ["ingrédient du frigo 1", "ingrédient du frigo 2"],
      "ingredients_extra": ["ingrédient à acheter si nécessaire"],
      "estimated_time": "20 min",
      "calories": 450,
      "protein": 30
    }
  ]
}`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Suggère-moi 3 recettes anti-gaspi avec mon frigo !" },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Pas de réponse IA");

    const parsed = JSON.parse(content);
    return { suggestions: parsed.suggestions };
}

export async function saveAntiWasteSuggestion(suggestion: SuggestedRecipe): Promise<string> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Non autorisé");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, budget_level, objectif")
        .eq("id", user.id)
        .single();

    if (!profile?.is_premium) throw new Error("PREMIUM_REQUIRED");

    const allIngredients = [...suggestion.ingredients_used, ...suggestion.ingredients_extra];

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `Tu es un chef cuisinier street food healthy expert.
Génère une recette COMPLÈTE en JSON avec cette structure exacte :
{
  "name": "Nom",
  "culture": "Anti-gaspi",
  "price_estimated": 5.0,
  "calories": ${suggestion.calories},
  "protein": ${suggestion.protein},
  "carbs": 40,
  "fat": 15,
  "ingredients": ["Ingrédient 1 avec quantité", "Ingrédient 2 avec quantité"],
  "instructions": "1. Étape 1\\n2. Étape 2\\n..."
}
Objectif : ${profile.objectif || "santé"}. Budget : ${profile.budget_level || "standard"}.`,
            },
            {
                role: "user",
                content: `Recette : "${suggestion.name}". Ingrédients : ${allIngredients.join(", ")}. ${suggestion.description}`,
            },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Pas de réponse IA");

    const recipeData = JSON.parse(content);

    // Save to recipes table
    const { data: recipe, error } = await supabase
        .from("recipes")
        .insert({
            name: recipeData.name || suggestion.name,
            culture: recipeData.culture || "Anti-gaspi",
            price_estimated: recipeData.price_estimated || 5,
            calories: recipeData.calories || suggestion.calories,
            protein: recipeData.protein || suggestion.protein,
            carbs: recipeData.carbs || 40,
            fat: recipeData.fat || 15,
            ingredients: JSON.stringify(recipeData.ingredients || allIngredients),
            instructions: recipeData.instructions || "",
        })
        .select("id")
        .single();

    if (error || !recipe) {
        console.error("Save recipe error:", error);
        throw new Error("Erreur lors de la sauvegarde");
    }

    return recipe.id;
}
