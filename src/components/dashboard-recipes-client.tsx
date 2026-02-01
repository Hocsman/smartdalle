"use client";

import { useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { CultureFilter } from "@/components/culture-filter";
import { StaggerGrid, MotionItem } from "@/components/ui/motion-wrapper";
import { Heart } from "lucide-react";

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

interface DashboardRecipesClientProps {
    recipes: Recipe[];
    favoriteIds?: string[];
}

export function DashboardRecipesClient({ recipes, favoriteIds = [] }: DashboardRecipesClientProps) {
    const [selectedCulture, setSelectedCulture] = useState("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Filter by culture
    let filteredRecipes = selectedCulture === "all"
        ? recipes
        : recipes.filter((recipe) =>
            recipe.culture?.toLowerCase().includes(selectedCulture.toLowerCase())
        );

    // Filter by favorites if enabled
    if (showFavoritesOnly) {
        filteredRecipes = filteredRecipes.filter((recipe) => favoriteIds.includes(recipe.id));
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CultureFilter
                    selectedCulture={selectedCulture}
                    onCultureChange={setSelectedCulture}
                />

                {/* Favorites Toggle */}
                {favoriteIds.length > 0 && (
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${showFavoritesOnly
                                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                : "bg-card/50 text-muted-foreground border border-input hover:border-red-500/50 hover:text-red-400"
                            }`}
                    >
                        <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-red-400" : ""}`} />
                        Mes Favoris ({favoriteIds.length})
                    </button>
                )}
            </div>

            {/* Recipe Grid */}
            {filteredRecipes.length > 0 ? (
                <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <MotionItem key={recipe.id}>
                            <RecipeCard
                                recipe={recipe}
                                isFavorite={favoriteIds.includes(recipe.id)}
                            />
                        </MotionItem>
                    ))}
                </StaggerGrid>
            ) : (
                <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-input">
                    <p className="text-muted-foreground">
                        {showFavoritesOnly
                            ? "Aucun favori dans cette catégorie"
                            : "Aucune recette trouvée pour cette culture"}
                    </p>
                </div>
            )}
        </div>
    );
}
