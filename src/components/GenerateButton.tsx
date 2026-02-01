"use client";

import { useState } from "react";
import { generateRecipe, type GeneratedRecipe } from "@/app/actions/generate-recipe";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

type Status = "idle" | "loading" | "error" | "success";

interface GenerateButtonProps {
    isPremium?: boolean;
}

export function GenerateButton({ isPremium = false }: GenerateButtonProps) {
    const [status, setStatus] = useState<Status>("idle");
    const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!isPremium) {
            router.push("/premium");
            return;
        }
        setStatus("loading");
        setErrorMessage(null);
        try {
            const result = await generateRecipe();
            if ("error" in result && result.error === "premium_required") {
                router.push("/premium");
                return;
            }
            if ("recipe" in result) {
                setRecipe(result.recipe);
                setStatus("success");
                return;
            }
            throw new Error("Unexpected response");
        } catch (error) {
            console.error(error);
            setStatus("error");
            setErrorMessage("Le chef est en PLS. Réessaie dans un instant.");
        }
    };

    const formatSteps = (text: string) => {
        const normalized = text.replace(/\r\n/g, "\n").trim();
        if (!normalized) return [];

        if (/\n\d+[\).\s]/.test(normalized)) {
            return normalized
                .split(/\n\d+[\).\s]+/)
                .map((step) => step.trim())
                .filter(Boolean);
        }

        if (/\d+[\).\s]/.test(normalized)) {
            return normalized
                .split(/\d+[\).\s]+/)
                .map((step) => step.trim())
                .filter(Boolean);
        }

        return normalized
            .split(".")
            .map((step) => step.trim())
            .filter(Boolean);
    };

    return (
        <div className="space-y-4">
            <Button
                onClick={handleGenerate}
                disabled={status === "loading"}
                className="bg-[#FFD300] text-black hover:bg-[#FFD300]/90 font-extrabold text-base px-6 py-5 rounded-xl shadow-sm shadow-yellow-400/30"
            >
                {status === "loading" ? (
                    "Le chef réfléchit... 🍳"
                ) : isPremium ? (
                    "Générer un repas Fresh ✨"
                ) : (
                    <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Générer un repas Fresh
                    </span>
                )}
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
                            <p className="text-xl font-black text-primary">
                                {recipe.macros.protein ? `${recipe.macros.protein}g` : "—"}
                            </p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase">Glucides</p>
                            <p className="text-lg font-bold text-white">
                                {recipe.macros.carbs ? `${recipe.macros.carbs}g` : "—"}
                            </p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase">Lipides</p>
                            <p className="text-lg font-bold text-white">
                                {recipe.macros.fat ? `${recipe.macros.fat}g` : "—"}
                            </p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase">Calories</p>
                            <p className="text-lg font-bold text-white">
                                {recipe.macros.calories ? `${recipe.macros.calories} kcal` : "—"}
                            </p>
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
                        {formatSteps(recipe.instructions).length > 1 ? (
                            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                                {formatSteps(recipe.instructions).map((step, index) => (
                                    <li key={`${step}-${index}`}>{step}</li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {recipe.instructions}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
