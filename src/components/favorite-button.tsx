"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";

interface FavoriteButtonProps {
    recipeId: string;
    initialFavorite?: boolean;
    size?: "sm" | "md";
}

export function FavoriteButton({ recipeId, initialFavorite = false, size = "md" }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite);
    const [isPending, startTransition] = useTransition();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to recipe page
        e.stopPropagation();

        startTransition(async () => {
            try {
                const result = await toggleFavorite(recipeId);
                setIsFavorite(result.isFavorite);
            } catch (error) {
                console.error("Failed to toggle favorite:", error);
            }
        });
    };

    const sizeClasses = size === "sm"
        ? "h-8 w-8"
        : "h-10 w-10";

    const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`${sizeClasses} rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${isFavorite
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                    : "bg-black/50 backdrop-blur-md text-white hover:bg-red-500/80 hover:text-white"
                } ${isPending ? "opacity-50 animate-pulse" : ""}`}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart className={`${iconSize} ${isFavorite ? "fill-white" : ""}`} />
        </button>
    );
}
