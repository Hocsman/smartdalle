"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logMeal } from "@/app/progress/actions";
import { Plus, Check, Loader2, Coffee, Sun, Moon, Cookie } from "lucide-react";

interface LogMealButtonProps {
    recipeId: string;
    recipeName: string;
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

const mealTypes = [
    { value: "breakfast" as const, label: "Petit-déj", icon: Coffee },
    { value: "lunch" as const, label: "Déjeuner", icon: Sun },
    { value: "dinner" as const, label: "Dîner", icon: Moon },
    { value: "snack" as const, label: "Snack", icon: Cookie },
];

export function LogMealButton({ recipeId, recipeName, nutrition }: LogMealButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleLogMeal = async (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
        setIsLoading(true);
        try {
            await logMeal(recipeId, mealType, {
                ...nutrition,
                name: recipeName,
            });
            setSuccess(true);
            setIsOpen(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Button
                className="w-full h-14 bg-green-500 text-white font-bold text-lg hover:bg-green-500 cursor-default"
                disabled
            >
                <Check className="mr-2 h-5 w-5" />
                Ajouté au suivi !
            </Button>
        );
    }

    if (isOpen) {
        return (
            <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                    Quel repas ?
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {mealTypes.map((meal) => {
                        const Icon = meal.icon;
                        return (
                            <button
                                key={meal.value}
                                onClick={() => handleLogMeal(meal.value)}
                                disabled={isLoading}
                                className="flex flex-col items-center gap-1 p-3 bg-card hover:bg-primary/20 border border-input hover:border-primary/50 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                ) : (
                                    <Icon className="h-5 w-5 text-primary" />
                                )}
                                <span className="text-xs text-white font-medium">{meal.label}</span>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-sm text-muted-foreground hover:text-white transition-colors"
                >
                    Annuler
                </button>
            </div>
        );
    }

    return (
        <Button
            onClick={() => setIsOpen(true)}
            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg hover:from-green-400 hover:to-emerald-500 cursor-pointer"
        >
            <Plus className="mr-2 h-5 w-5" />
            Ajouter au suivi
        </Button>
    );
}
