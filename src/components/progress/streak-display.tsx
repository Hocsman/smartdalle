"use client";

import { Flame } from "lucide-react";

interface StreakDisplayProps {
    streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
    const getMessage = () => {
        if (streak === 0) return "Commence ton suivi !";
        if (streak === 1) return "Premier jour !";
        if (streak < 7) return "Continue comme ça !";
        if (streak < 14) return "Une semaine ! Bravo !";
        if (streak < 30) return "Tu es en feu !";
        return "Incroyable discipline !";
    };

    const getFlameSize = () => {
        if (streak < 7) return "h-8 w-8";
        if (streak < 14) return "h-10 w-10";
        if (streak < 30) return "h-12 w-12";
        return "h-14 w-14";
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
            <div className="relative">
                <Flame
                    className={`${getFlameSize()} text-orange-500 ${streak > 0 ? "animate-pulse" : "opacity-30"}`}
                />
                {streak >= 7 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">
                            {streak >= 30 ? "🔥" : streak >= 14 ? "⭐" : "✓"}
                        </span>
                    </div>
                )}
            </div>
            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{streak}</span>
                    <span className="text-muted-foreground">jour{streak !== 1 ? "s" : ""}</span>
                </div>
                <p className="text-sm text-orange-400">{getMessage()}</p>
            </div>
        </div>
    );
}
