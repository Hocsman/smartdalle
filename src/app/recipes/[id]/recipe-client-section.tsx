"use client";

import { CookingTimer } from "@/components/cooking-timer";
import { ShareButtons } from "@/components/share-buttons";
import { Card, CardContent } from "@/components/ui/card";

interface RecipeClientSectionProps {
    recipeName: string;
}

export function RecipeClientSection({ recipeName }: RecipeClientSectionProps) {
    return (
        <div className="space-y-6">
            {/* Cooking Timer */}
            <CookingTimer defaultMinutes={20} />

            {/* Share Section */}
            <Card className="bg-card border-input">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Partager cette recette</h3>
                    <ShareButtons title={recipeName} />
                </CardContent>
            </Card>
        </div>
    );
}
