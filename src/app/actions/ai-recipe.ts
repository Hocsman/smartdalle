"use server";

import { createClient } from "@/utils/supabase/server";
import { OpenAI } from "openai";

export async function generateAiRecipe() {
    // Initialize OpenAI lazily to prevent crashes on missing API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
    }
    const openai = new OpenAI({ apiKey });

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch User Preferences AND Premium Status
    const { data: profile } = await supabase
        .from("profiles")
        .select("budget_level, objectif, culture, is_premium")
        .eq("id", user.id)
        .single();

    // Premium Guard
    if (!profile?.is_premium) {
        throw new Error("PREMIUM_REQUIRED");
    }

    const budgetState = profile?.budget_level === 'eco' ? 'très économique (moins de 3 euros)' : 'standard';
    const objectiveState = profile?.objectif || 'santé';
    const cultureState = profile?.culture || 'mix';

    // Map culture to cuisine style
    const cultureMap: Record<string, string> = {
        'africaine': 'Africaine (Mafé, Yassa, Thieboudienne...)',
        'antillaise': 'Antillaise/Créole (Colombo, Accras, Gratin...)',
        'maghrebine': 'Maghrébine (Tajine, Couscous, Shakshuka...)',
        'francaise': 'Française (Blanquette, Quiche, Bourguignon...)',
        'classique': 'Fusion Healthy internationale',
        'mix': 'Mix de toutes les cultures'
    };
    const cultureDescription = cultureMap[cultureState] || 'Mix de toutes les cultures';

    // Strict System Prompt
    const systemPrompt = `
    Tu es un chef cuisinier "Street Food Healthy" expert pour les jeunes urbains.
    Ton but : Inventer une recette UNIQUE, créative, et adaptée au profil.
    
    PROFIL UTILISATEUR :
    - Budget : ${budgetState}
    - Objectif : ${objectiveState}
    - Culture culinaire préférée : ${cultureDescription}
    
    Ton : Fun, direct, motivant (style street).
    
    IMPORTANT: Tu dois répondre UNIQUEMENT avec un JSON valide respectant cette structure EXACTE :
    {
      "name": "Nom de la recette (Fun et court)",
      "culture": "La culture de la recette (ex: Africaine, Maghrébine, Antillaise, Française, Créole, Healthy)",
      "price_estimated": number (prix estimé en euros, float),
      "calories": number (int),
      "protein": number (int),
      "carbs": number (int),
      "fat": number (int),
      "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité"...],
      "instructions": "Texte complet des instructions, formaté avec des numéros d'étapes, sur un ton motivant."
    }
    
    Adapte la recette à la culture préférée de l'utilisateur. Donne des valeurs réalistes pour les macros.
  `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Efficient and fast model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Invente une nouvelle recette, surprends-moi !" }
            ],
            response_format: { type: "json_object" },
            temperature: 0.9 // High creativity
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content from AI");

        const recipeData = JSON.parse(content);

        // Save to Database
        const { data: insertedRecipe, error } = await supabase
            .from("recipes")
            .insert({
                name: recipeData.name,
                culture: recipeData.culture,
                price_estimated: recipeData.price_estimated,
                calories: recipeData.calories,
                protein: recipeData.protein,
                carbs: recipeData.carbs,
                fat: recipeData.fat,
                ingredients: JSON.stringify(recipeData.ingredients),
                instructions: recipeData.instructions,
                image_url: null, // Placeholder or allow client to fetch an image later
            })
            .select()
            .single();

        if (error) {
            console.error("DB Error:", error);
            throw new Error("Failed to save recipe");
        }

        // Return the ID to redirect the user
        return insertedRecipe.id;

    } catch (err) {
        console.error("AI Generation Error:", err);
        // Fallback or re-throw
        throw new Error("Le Chef est fatigué, réessaie !");
    }
}
