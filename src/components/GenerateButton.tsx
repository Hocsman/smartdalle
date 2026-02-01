"use client";

import { useState } from "react";
import { generateRecipe, type GeneratedRecipe } from "@/app/actions/generate-recipe";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "error" | "success";

export function GenerateButton() {
    const [status, setStatus] = useState<Status>("idle");
    const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleGenerate = async () => {
        setStatus("loading");
        setErrorMessage(null);
        try {
            const result = await generateRecipe();
            setRecipe(result);
            setStatus("success");
        } catch (error) {
            console.error(error);
            setStatus("error");
            setErrorMessage("Le chef est en PLS. Réessaie dans un instant.");
        }
    };

    return (
        <div className="space-y-4">
            <Button
                onClick={handleGenerate}
                disabled={status === "loading"}
                className="bg-[#FFD300] text-black hover:bg-[#FFD300]/90 font-extrabold text-base px-6 py-5 rounded-xl shadow-sm shadow-yellow-400/30"
            >
                {status === "loading" ? "Le chef réfléchit... 🍳" : "Générer un repas Fresh ✨"}
            </Button>

            {status === "error" && (
                <div className="text-sm text-red-400 font-semibold">{errorMessage}</div>
            )}

            {recipe && status === "success" && (
                <div className="bg-card/60 border border-yellow-500/30 rounded-2xl p-6 space-y-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">{recipe.emoji}</div>
                        <div>
                            <h3 className="text-2xl font-extrabold text-white">{recipe.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Prix estimé: <span className="text-white font-bold">{recipe.prix_estime}€</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase">Protéines</p>
                            <p className="text-xl font-black text-primary">{recipe.macros.protein}g</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase">Glucides</p>
                            <p className="text-lg font-bold text-white">{recipe.macros.carbs}g</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase">Lipides</p>
                            <p className="text-lg font-bold text-white">{recipe.macros.fat}g</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase">Calories</p>
                            <p className="text-lg font-bold text-white">{recipe.macros.calories} kcal</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-bold text-white">Ingrédients</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {recipe.ingredients.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-bold text-white">Instructions</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {recipe.instructions}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
