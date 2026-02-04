"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Leaf, Lock, Loader2, Check, ShoppingBag, Clock, Zap, ChevronRight,
} from "lucide-react";
import { suggestAntiWasteRecipes, saveAntiWasteSuggestion, SuggestedRecipe } from "@/app/actions/ai-anti-waste";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AntiWasteSuggestionsProps {
    isPremium: boolean;
    hasPantryItems: boolean;
}

export default function AntiWasteSuggestions({ isPremium, hasPantryItems }: AntiWasteSuggestionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<SuggestedRecipe[] | null>(null);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [savedIds, setSavedIds] = useState<Record<number, string>>({});
    const [error, setError] = useState<string | null>(null);

    const handleSuggest = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null);
        try {
            const result = await suggestAntiWasteRecipes();
            if ("error" in result) {
                if (result.error === "premium_required") {
                    router.push("/premium");
                    return;
                }
                if (result.error === "no_items") {
                    setError("Ajoute d'abord des ingrédients dans ton frigo !");
                    return;
                }
            } else {
                setSuggestions(result.suggestions);
            }
        } catch {
            setError("Erreur lors de la génération. Réessaie !");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (suggestion: SuggestedRecipe, index: number) => {
        setSavingIndex(index);
        try {
            const recipeId = await saveAntiWasteSuggestion(suggestion);
            setSavedIds((prev) => ({ ...prev, [index]: recipeId }));
        } catch {
            setError("Erreur lors de la sauvegarde");
        } finally {
            setSavingIndex(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* CTA Button */}
            {!suggestions && (
                <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                    <CardContent className="p-6 text-center">
                        <Leaf className="h-10 w-10 mx-auto text-green-400 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">Anti-Gaspillage IA</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Notre chef IA te suggère des recettes avec les ingrédients de ton frigo
                        </p>
                        <Button
                            onClick={handleSuggest}
                            disabled={isLoading || !hasPantryItems || !isPremium}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold cursor-pointer"
                        >
                            {!isPremium ? (
                                <>
                                    <Lock className="h-4 w-4 mr-2" /> Pro requis
                                </>
                            ) : isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Le chef réfléchit...
                                </>
                            ) : (
                                <>
                                    <Leaf className="h-4 w-4 mr-2" /> Que faire avec mon frigo ?
                                </>
                            )}
                        </Button>
                        {!isPremium && (
                            <p className="text-xs text-muted-foreground mt-2">
                                <Link href="/premium" className="text-primary underline">Passe Pro</Link> pour débloquer les suggestions IA
                            </p>
                        )}
                        {!hasPantryItems && isPremium && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Ajoute d&apos;abord des ingrédients ci-dessus
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
                    {error}
                </div>
            )}

            {/* Suggestions */}
            {suggestions && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-green-400" />
                            Suggestions anti-gaspi
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSuggest}
                            disabled={isLoading}
                            className="text-muted-foreground hover:text-white cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Regénérer"
                            )}
                        </Button>
                    </div>

                    {suggestions.map((suggestion, index) => {
                        const savedId = savedIds[index];
                        const isSaving = savingIndex === index;

                        return (
                            <Card key={index} className="bg-card border-input overflow-hidden">
                                <CardContent className="p-4 space-y-3">
                                    {/* Header */}
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{suggestion.name}</h4>
                                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-3 text-sm">
                                        <span className="flex items-center gap-1 text-green-400">
                                            <Clock className="h-3.5 w-3.5" /> {suggestion.estimated_time}
                                        </span>
                                        <span className="flex items-center gap-1 text-primary">
                                            <Zap className="h-3.5 w-3.5" /> {suggestion.calories} kcal
                                        </span>
                                        <span className="text-blue-400">
                                            {suggestion.protein}g prot
                                        </span>
                                    </div>

                                    {/* Ingredients from pantry */}
                                    <div>
                                        <p className="text-xs font-bold text-green-400 uppercase mb-1.5">
                                            De ton frigo
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {suggestion.ingredients_used.map((ing, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1"
                                                >
                                                    <Check className="h-3 w-3" /> {ing}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Extra ingredients to buy */}
                                    {suggestion.ingredients_extra.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-orange-400 uppercase mb-1.5">
                                                A acheter
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {suggestion.ingredients_extra.map((ing, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1"
                                                    >
                                                        <ShoppingBag className="h-3 w-3" /> {ing}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Save Button */}
                                    <div className="pt-2">
                                        {savedId ? (
                                            <Link href={`/recipes/${savedId}`}>
                                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold cursor-pointer">
                                                    <Check className="h-4 w-4 mr-2" /> Voir la recette
                                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                onClick={() => handleSave(suggestion, index)}
                                                disabled={isSaving}
                                                className="w-full bg-primary text-black font-bold cursor-pointer"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Création en cours...
                                                    </>
                                                ) : (
                                                    "Sauvegarder la recette"
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
