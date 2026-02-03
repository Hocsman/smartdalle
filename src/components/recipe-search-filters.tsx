"use client";

import { Search, Clock, ChefHat, Leaf, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RecipeSearchFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    prepTimeFilter: string;
    onPrepTimeChange: (value: string) => void;
    difficultyFilter: string;
    onDifficultyChange: (value: string) => void;
    dietFilter: string;
    onDietChange: (value: string) => void;
}

const prepTimeOptions = [
    { value: "all", label: "Tous" },
    { value: "quick", label: "< 20 min" },
    { value: "medium", label: "20-40 min" },
    { value: "long", label: "> 40 min" },
];

const difficultyOptions = [
    { value: "all", label: "Tous" },
    { value: "facile", label: "Facile" },
    { value: "moyen", label: "Moyen" },
    { value: "difficile", label: "Difficile" },
];

const dietOptions = [
    { value: "all", label: "Tous" },
    { value: "vegetarien", label: "Végétarien" },
    { value: "vegan", label: "Végan" },
    { value: "sans_gluten", label: "Sans gluten" },
    { value: "sans_lactose", label: "Sans lactose" },
    { value: "halal", label: "Halal" },
    { value: "keto", label: "Keto" },
    { value: "healthy", label: "Healthy" },
];

export function RecipeSearchFilters({
    searchQuery,
    onSearchChange,
    prepTimeFilter,
    onPrepTimeChange,
    difficultyFilter,
    onDifficultyChange,
    dietFilter,
    onDietChange,
}: RecipeSearchFiltersProps) {
    const hasActiveFilters =
        searchQuery ||
        prepTimeFilter !== "all" ||
        difficultyFilter !== "all" ||
        dietFilter !== "all";

    const clearAllFilters = () => {
        onSearchChange("");
        onPrepTimeChange("all");
        onDifficultyChange("all");
        onDietChange("all");
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Rechercher une recette..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-card/50 border-input text-white placeholder:text-muted-foreground"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3">
                {/* Prep Time Filter */}
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <select
                        value={prepTimeFilter}
                        onChange={(e) => onPrepTimeChange(e.target.value)}
                        className="bg-card/50 border border-input rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {prepTimeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    <select
                        value={difficultyFilter}
                        onChange={(e) => onDifficultyChange(e.target.value)}
                        className="bg-card/50 border border-input rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {difficultyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Diet Filter */}
                <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <select
                        value={dietFilter}
                        onChange={(e) => onDietChange(e.target.value)}
                        className="bg-card/50 border border-input rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {dietOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear All Button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                        Effacer
                    </button>
                )}
            </div>
        </div>
    );
}
