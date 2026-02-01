"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Lock } from "lucide-react";
import { generateAiRecipe } from "@/app/actions/ai-recipe";
import { useRouter } from "next/navigation";

interface AiGeneratorButtonProps {
    isPremium?: boolean;
}

export function AiGeneratorButton({ isPremium = false }: AiGeneratorButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        // If not premium, redirect to pricing page
        if (!isPremium) {
            router.push("/premium");
            return;
        }

        // Premium user: generate recipe
        setLoading(true);
        try {
            const recipeId = await generateAiRecipe();
            router.push(`/recipes/${recipeId}`);
        } catch (e: any) {
            console.error(e);
            if (e.message === "PREMIUM_REQUIRED") {
                router.push("/premium");
            } else {
                alert("Erreur: Le Chef n'a pas pu créer la recette.");
            }
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            variant="secondary"
            className={`w-full sm:w-auto font-bold border cursor-pointer ${isPremium
                    ? "bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700"
                    : "bg-zinc-900 text-muted-foreground hover:bg-zinc-800 border-zinc-800"
                }`}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Le Chef réfléchit...
                </>
            ) : isPremium ? (
                <>
                    <Bot className="mr-2 h-4 w-4 text-primary" />
                    Générer une recette IA ✨
                </>
            ) : (
                <>
                    <Lock className="mr-2 h-4 w-4 text-primary" />
                    Générer une recette IA 🔒
                </>
            )}
        </Button>
    );
}
