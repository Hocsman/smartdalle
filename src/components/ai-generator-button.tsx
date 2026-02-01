"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AiGeneratorButtonProps {
    recipeId?: string; // Optional if we just generate for fun, but usually attached to recipe
    recipeName?: string;
    isPremium: boolean;
    onImageGenerated?: (url: string) => void;
}

export function AiGeneratorButton({ recipeId, recipeName, isPremium, onImageGenerated }: AiGeneratorButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!isPremium) {
            router.push("/premium");
            return;
        }

        if (!recipeName) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/generate-image", {
                method: "POST",
                body: JSON.stringify({ recipeName, recipeId }),
            });

            if (!res.ok) throw new Error("Generation failed");

            const data = await res.json();
            if (onImageGenerated) onImageGenerated(data.url);

            router.refresh(); // Refresh to show new image if server rendered
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la génération. Vérifie ta connexion ou réessaie plus tard.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleGenerate}
            disabled={isLoading}
            variant={isPremium ? "default" : "secondary"}
            className={`
                font-bold shadow-lg transition-all 
                ${isPremium ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" : "cursor-pointer"}
            `}
            size="sm"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isPremium ? (
                <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
            ) : (
                <Lock className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Magie en cours..." : "Générer Photo IA"}
        </Button>
    );
}
