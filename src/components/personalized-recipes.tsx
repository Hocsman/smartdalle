"use client";

import { RecipeCard } from "@/components/recipe-card";

interface Recipe {
    id: string;
    name: string;
    culture: string;
    image_url: string | null;
    price_estimated: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface PersonalizedRecipesProps {
    recipes: Recipe[];
    favoriteIds: string[];
}

export function PersonalizedRecipes({ recipes, favoriteIds }: PersonalizedRecipesProps) {
    if (recipes.length === 0) return null;

    const favoriteSet = new Set(favoriteIds);

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible">
            {recipes.map((recipe) => (
                <div key={recipe.id} className="min-w-[260px] sm:min-w-0">
                    <RecipeCard
                        recipe={recipe}
                        isFavorite={favoriteSet.has(recipe.id)}
                    />
                </div>
            ))}
        </div>
    );
}
