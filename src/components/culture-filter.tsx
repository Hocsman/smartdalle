"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CULTURES = [
    { value: "all", label: "Tout", emoji: "🌍" },
    { value: "Africaine", label: "Africaine", emoji: "🌍" },
    { value: "Antillaise", label: "Antillaise", emoji: "🏝️" },
    { value: "Maghrébine", label: "Maghrébine", emoji: "🧆" },
    { value: "Française", label: "Française", emoji: "🥖" },
    { value: "Créole", label: "Créole", emoji: "🌶️" },
    { value: "Healthy", label: "Healthy", emoji: "🥗" },
] as const;

interface CultureFilterProps {
    selectedCulture: string;
    onCultureChange: (culture: string) => void;
}

export function CultureFilter({ selectedCulture, onCultureChange }: CultureFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {CULTURES.map((culture) => (
                <Badge
                    key={culture.value}
                    variant={selectedCulture === culture.value ? "default" : "outline"}
                    className={cn(
                        "cursor-pointer px-4 py-2 text-sm font-bold transition-all duration-200",
                        selectedCulture === culture.value
                            ? "bg-primary text-black hover:bg-primary/90 border-primary"
                            : "bg-card/50 text-muted-foreground hover:bg-card hover:text-white hover:border-primary/50"
                    )}
                    onClick={() => onCultureChange(culture.value)}
                >
                    <span className="mr-1">{culture.emoji}</span>
                    {culture.label}
                </Badge>
            ))}
        </div>
    );
}

// Wrapper component that handles state and filtering
interface RecipeFilterWrapperProps {
    children: React.ReactNode;
    recipes: any[];
    onFilter: (filtered: any[]) => void;
}

export function useCultureFilter(recipes: any[]) {
    const [selectedCulture, setSelectedCulture] = useState("all");

    const filteredRecipes = selectedCulture === "all"
        ? recipes
        : recipes.filter((recipe) =>
            recipe.culture?.toLowerCase().includes(selectedCulture.toLowerCase())
        );

    return {
        selectedCulture,
        setSelectedCulture,
        filteredRecipes,
    };
}
