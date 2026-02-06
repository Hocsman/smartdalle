"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

interface ShareRecipeMiniProps {
    recipeId: string;
    recipeName: string;
}

export function ShareRecipeMini({ recipeId, recipeName }: ShareRecipeMiniProps) {
    const [shared, setShared] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const recipeUrl = `${window.location.origin}/recipes/${recipeId}`;
        const shareText = `Decouvre ${recipeName} sur SmartDalle!`;

        // Try native share first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipeName,
                    text: shareText,
                    url: recipeUrl,
                });
                return;
            } catch {
                // User cancelled or error, fall through to copy
            }
        }

        // Fallback: copy link
        try {
            await navigator.clipboard.writeText(recipeUrl);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        } catch {
            // Last fallback
            const textArea = document.createElement("textarea");
            textArea.value = recipeUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
                shared
                    ? "bg-green-500 text-white"
                    : "bg-black/50 text-white hover:bg-black/70 hover:text-primary"
            }`}
            title={shared ? "Lien copie !" : "Partager"}
        >
            <Share2 className="h-4 w-4" />
        </button>
    );
}
