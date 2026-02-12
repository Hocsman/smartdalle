"use server";

import { createClient } from "@/utils/supabase/server";
import { getOpenAIClient } from "@/lib/openai";
import { checkRateLimit, incrementRateLimit, formatRateLimitError } from "@/lib/rate-limit";

export type GeneratedRecipe = {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
        calories: number;
    };
    prix_estime: number;
    emoji: string;
};

export type GenerateRecipeResult =
    | { error: "premium_required" }
    | { error: "rate_limit"; message: string }
    | { recipe: GeneratedRecipe };

type AiResponse = {
    name?: string;
    nom?: string;
    ingredients: string[] | string;
    instructions: string;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
        calories: number;
    };
    prix_estime?: number | string;
    price_estimated?: number | string;
    emoji: string;
};

export async function generateRecipe(): Promise<GenerateRecipeResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("budget_level, objectif, is_premium")
        .eq("id", user.id)
        .single();

    if (!profile?.is_premium) {
        return { error: "premium_required" };
    }

    // Rate limit check
    const rateLimit = await checkRateLimit(supabase, user.id, 'recipe_generation', true);
    if (!rateLimit.allowed) {
        return { error: "rate_limit", message: formatRateLimitError(rateLimit.resetAt) };
    }

    const budget =
        profile?.budget_level === "eco"
            ? "très économique"
            : profile?.budget_level === "confort"
                ? "confortable"
                : "standard";
    const objectif = profile?.objectif || "maintien";

    const systemPrompt = `Tu es un chef expert en nutrition à petit budget.
Règles DATA strictes :
1. PRIX : Base tes estimations sur les prix moyens en France (ex: Poulet ~10€/kg, Riz ~2€/kg, Oeuf ~0.30€/u). Si le budget user est 'ECO', interdiction d'utiliser des ingrédients de luxe (Saumon, Avocat, Bœuf noble).
2. MACROS : Sois précis sur les protéines. Priorise les sources économiques (Oeufs, Thon, Lentilles, Dinde).
3. FORMAT : Retourne un JSON strict (nom, ingredients, instructions, macros, price_estimated, emoji).
Contrainte profil : objectif ${objectif}, budget ${budget}.
Le JSON doit être strict. Les champs macros et price_estimated doivent être des nombres (sans "g" ni "kcal").
Ton : Motivant, tutoiement, style urbain.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Crée une recette unique et réaliste." },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("OPENAI_NO_CONTENT");
    }

    let parsed: AiResponse;
    try {
        parsed = JSON.parse(content) as AiResponse;
    } catch (error) {
        throw new Error("OPENAI_BAD_JSON");
    }

    const ingredients = Array.isArray(parsed.ingredients)
        ? parsed.ingredients
        : typeof parsed.ingredients === "string"
            ? [parsed.ingredients]
            : [];

    const name = parsed.name || parsed.nom;
    if (!name) {
        throw new Error("OPENAI_MISSING_NAME");
    }

    const toNumber = (value: unknown) => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
            const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
            const num = Number.parseFloat(cleaned);
            return Number.isFinite(num) ? num : 0;
        }
        return 0;
    };

    const macros = {
        protein: toNumber(parsed.macros?.protein),
        carbs: toNumber(parsed.macros?.carbs),
        fat: toNumber(parsed.macros?.fat),
        calories: toNumber(parsed.macros?.calories),
    };

    const prixEstime = toNumber(parsed.price_estimated ?? parsed.prix_estime);

    const { data: insertedRecipe, error } = await supabase
        .from("recipes")
        .insert({
            name,
            culture: "IA",
            image_url: null,
            price_estimated: prixEstime || null,
            calories: macros.calories || null,
            protein: macros.protein || null,
            carbs: macros.carbs || null,
            fat: macros.fat || null,
            ingredients,
            instructions: parsed.instructions,
        })
        .select("id")
        .single();

    if (error || !insertedRecipe) {
        console.error("DB insert error:", error);
        throw new Error("DB_INSERT_FAILED");
    }

    // Increment rate limit après succès
    await incrementRateLimit(supabase, user.id, 'recipe_generation');

    return {
        recipe: {
            id: insertedRecipe.id,
            name,
            ingredients,
            instructions: parsed.instructions,
            macros,
            prix_estime: prixEstime,
            emoji: parsed.emoji || "🍽️",
        },
    };
}
