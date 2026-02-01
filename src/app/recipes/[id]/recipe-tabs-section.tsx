"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ChefHat, UtensilsCrossed, Loader2, Check } from "lucide-react";
import { addToShoppingList } from "@/app/actions/add-to-shopping-list";

interface RecipeTabsSectionProps {
    recipeId: string;
    ingredients: string[];
    instructionSteps: string[];
}

export function RecipeTabsSection({ recipeId, ingredients, instructionSteps }: RecipeTabsSectionProps) {
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);

    const toggleIngredient = (index: number) => {
        const next = new Set(checkedIngredients);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        setCheckedIngredients(next);
    };

    const handleAddToShoppingList = () => {
        startTransition(async () => {
            try {
                await addToShoppingList(recipeId);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 3000);
            } catch (error) {
                console.error("Erreur:", error);
            }
        });
    };

    return (
        <>
            <Tabs defaultValue="ingredients" className="w-full">
                <TabsList>
                    <TabsTrigger value="ingredients" className="gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        Ingrédients
                    </TabsTrigger>
                    <TabsTrigger value="preparation" className="gap-2">
                        <ChefHat className="h-4 w-4" />
                        Préparation
                    </TabsTrigger>
                </TabsList>

                {/* Onglet Ingrédients */}
                <TabsContent value="ingredients">
                    <Card className="bg-card border-input">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground">
                                    {checkedIngredients.size}/{ingredients.length} déjà en stock
                                </p>
                            </div>
                            <ul className="space-y-3">
                                {ingredients.map((ing, i) => {
                                    const isChecked = checkedIngredients.has(i);
                                    return (
                                        <li
                                            key={i}
                                            onClick={() => toggleIngredient(i)}
                                            className={`
                                                flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200
                                                ${isChecked
                                                    ? "bg-primary/10 border-primary/30"
                                                    : "bg-secondary/20 border-input hover:border-primary/50"
                                                }
                                            `}
                                        >
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() => toggleIngredient(i)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className={`flex-1 ${isChecked ? "line-through text-muted-foreground" : "text-white"}`}>
                                                {ing}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Onglet Préparation */}
                <TabsContent value="preparation">
                    <Card className="bg-card border-input">
                        <CardContent className="p-4 sm:p-6">
                            {instructionSteps.length > 0 ? (
                                <div className="space-y-4">
                                    {instructionSteps.map((step, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 p-4 rounded-xl bg-secondary/30 border border-input hover:border-primary/30 transition-colors"
                                        >
                                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-black font-bold rounded-lg flex items-center justify-center text-sm">
                                                {index + 1}
                                            </span>
                                            <p className="text-muted-foreground text-base leading-relaxed pt-1">
                                                {step.trim()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    Aucune instruction disponible.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 left-0 right-0 z-50 px-6">
                <div className="max-w-lg mx-auto">
                    <Button
                        size="lg"
                        onClick={handleAddToShoppingList}
                        disabled={isPending || isAdded}
                        className={`
                            w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/30 cursor-pointer transition-all duration-300
                            ${isAdded
                                ? "bg-green-500 hover:bg-green-500 text-white"
                                : "bg-primary text-black hover:bg-primary/90"
                            }
                        `}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Ajout en cours...
                            </>
                        ) : isAdded ? (
                            <>
                                <Check className="h-5 w-5 mr-2" />
                                Ajouté !
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Ajouter à ma liste
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </>
    );
}
