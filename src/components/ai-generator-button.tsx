"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import { generateAiRecipe } from "@/app/actions/ai-recipe";
import { useRouter } from "next/navigation";

export function AiGeneratorButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const recipeId = await generateAiRecipe();
            router.push(`/recipes/${recipeId}`);
        } catch (e) {
            console.error(e);
            alert("Erreur: Le Chef n'a pas pu créer la recette.");
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="secondary"
            className="w-full sm:w-auto font-bold bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Le Chef réfléchit...
                </>
            ) : (
                <>
                    <Bot className="mr-2 h-4 w-4 text-primary" />
                    Générer une recette IA ✨
                </>
            )}
        </Button>
    );
}
