"use server";

import { createClient } from "@/utils/supabase/server";
import { getOpenAIClient } from "@/lib/openai";

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
    prix_estime: number;
    emoji: string;
};

export async function generateRecipe(): Promise<GeneratedRecipe> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("budget_level, objectif")
        .eq("id", user.id)
        .single();

    const budget =
        profile?.budget_level === "eco"
            ? "très économique"
            : profile?.budget_level === "confort"
                ? "confortable"
                : "standard";
    const objectif = profile?.objectif || "maintien";

    const systemPrompt = `Tu es un chef street-food expert en nutrition sportive. Génère une recette pour un profil ${objectif} avec un budget ${budget}.
Format de réponse : JSON strict avec ces clés EXACTES (name, ingredients, instructions, macros, prix_estime, emoji).
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

    const prixEstime = toNumber(parsed.prix_estime);

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

    return {
        id: insertedRecipe.id,
        name,
        ingredients,
        instructions: parsed.instructions,
        macros,
        prix_estime: prixEstime,
        emoji: parsed.emoji || "🍽️",
    };
}
