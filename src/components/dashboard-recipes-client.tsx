"use client";

import { useState, useMemo } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { CultureFilter } from "@/components/culture-filter";
import { RecipeSearchFilters } from "@/components/recipe-search-filters";
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
    prep_time?: number | null;
    difficulty?: string | null;
    diet_tags?: string[] | null;
}

interface DashboardRecipesClientProps {
    recipes: Recipe[];
    favoriteIds?: string[];
}

export function DashboardRecipesClient({ recipes, favoriteIds = [] }: DashboardRecipesClientProps) {
    // Existing filters
    const [selectedCulture, setSelectedCulture] = useState("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // New filters
    const [searchQuery, setSearchQuery] = useState("");
    const [prepTimeFilter, setPrepTimeFilter] = useState("all");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [dietFilter, setDietFilter] = useState("all");

    // Memoized filtered recipes for performance
    const filteredRecipes = useMemo(() => {
        let result = recipes;

        // Search by name
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((recipe) =>
                recipe.name.toLowerCase().includes(query)
            );
        }

        // Filter by culture
        if (selectedCulture !== "all") {
            result = result.filter((recipe) =>
                recipe.culture?.toLowerCase().includes(selectedCulture.toLowerCase())
            );
        }

        // Filter by prep time
        if (prepTimeFilter !== "all") {
            result = result.filter((recipe) => {
                const time = recipe.prep_time;
                if (!time) return true;
                switch (prepTimeFilter) {
                    case "quick":
                        return time < 20;
                    case "medium":
                        return time >= 20 && time <= 40;
                    case "long":
                        return time > 40;
                    default:
                        return true;
                }
            });
        }

        // Filter by difficulty
        if (difficultyFilter !== "all") {
            result = result.filter((recipe) =>
                recipe.difficulty === difficultyFilter
            );
        }

        // Filter by diet tags
        if (dietFilter !== "all") {
            result = result.filter((recipe) =>
                recipe.diet_tags?.includes(dietFilter)
            );
        }

        // Filter by favorites
        if (showFavoritesOnly) {
            result = result.filter((recipe) => favoriteIds.includes(recipe.id));
        }

        return result;
    }, [recipes, searchQuery, selectedCulture, prepTimeFilter, difficultyFilter, dietFilter, showFavoritesOnly, favoriteIds]);

    const activeFiltersCount = [
        searchQuery,
        selectedCulture !== "all",
        prepTimeFilter !== "all",
        difficultyFilter !== "all",
        dietFilter !== "all",
        showFavoritesOnly,
    ].filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <RecipeSearchFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                prepTimeFilter={prepTimeFilter}
                onPrepTimeChange={setPrepTimeFilter}
                difficultyFilter={difficultyFilter}
                onDifficultyChange={setDifficultyFilter}
                dietFilter={dietFilter}
                onDietChange={setDietFilter}
            />

            {/* Culture Filter & Favorites Toggle */}
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

            {/* Results Count */}
            {activeFiltersCount > 0 && (
                <p className="text-sm text-muted-foreground">
                    {filteredRecipes.length} recette{filteredRecipes.length > 1 ? "s" : ""} trouvée{filteredRecipes.length > 1 ? "s" : ""}
                </p>
            )}

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
                        {searchQuery
                            ? `Aucune recette trouvée pour "${searchQuery}"`
                            : showFavoritesOnly
                                ? "Aucun favori avec ces filtres"
                                : "Aucune recette trouvée avec ces filtres"}
                    </p>
                </div>
            )}
        </div>
    );
}
