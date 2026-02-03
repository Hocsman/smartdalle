"use client";

import { useState } from "react";
import { MealLog } from "@/app/progress/actions";
import { removeMealFromLog } from "@/app/progress/actions";
import { Coffee, Sun, Moon, Cookie, Trash2, Loader2 } from "lucide-react";

interface MealsListProps {
    meals: MealLog[];
}

const mealTypeConfig = {
    breakfast: {
        icon: Coffee,
        label: "Petit-déjeuner",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
    },
    lunch: {
        icon: Sun,
        label: "Déjeuner",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    dinner: {
        icon: Moon,
        label: "Dîner",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    snack: {
        icon: Cookie,
        label: "Snack",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
};

export function MealsList({ meals }: MealsListProps) {
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    const handleDelete = async (index: number) => {
        setDeletingIndex(index);
        try {
            await removeMealFromLog(index);
        } catch {
            console.error("Erreur suppression repas");
        } finally {
            setDeletingIndex(null);
        }
    };

    if (meals.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                <p>Aucun repas enregistré aujourd'hui</p>
                <p className="mt-1 text-xs">Va sur une recette et clique sur "Ajouter au suivi"</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {meals.map((meal, index) => {
                const config = mealTypeConfig[meal.meal_type];
                const Icon = config.icon;

                return (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-input"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white line-clamp-1">
                                    {meal.recipe_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {config.label} • {meal.calories} kcal
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(index)}
                            disabled={deletingIndex === index}
                            className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {deletingIndex === index ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
