"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import Link from "next/link";

interface DashboardStreakProps {
    streak: number;
}

export function DashboardStreak({ streak }: DashboardStreakProps) {
    const getMessage = () => {
        if (streak === 0) return "Commence ton suivi !";
        if (streak === 1) return "Premier jour !";
        if (streak < 7) return "Continue comme ça !";
        if (streak < 14) return "Une semaine ! Bravo !";
        if (streak < 30) return "Tu es en feu !";
        return "Incroyable discipline !";
    };

    const getGlowIntensity = () => {
        if (streak === 0) return "shadow-none";
        if (streak < 7) return "shadow-orange-500/20 shadow-lg";
        if (streak < 14) return "shadow-orange-500/30 shadow-xl";
        if (streak < 30) return "shadow-orange-500/40 shadow-xl";
        return "shadow-orange-500/50 shadow-2xl";
    };

    const getFlameSize = () => {
        if (streak < 7) return "h-8 w-8";
        if (streak < 14) return "h-10 w-10";
        if (streak < 30) return "h-12 w-12";
        return "h-14 w-14";
    };

    return (
        <Link href="/progress">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`
                    flex items-center gap-4 p-4 rounded-xl border cursor-pointer
                    transition-all hover:scale-[1.02]
                    ${streak > 0
                        ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30"
                        : "bg-card border-input"
                    }
                    ${getGlowIntensity()}
                `}
            >
                {/* Flame avec glow */}
                <div className="relative">
                    <motion.div
                        animate={streak > 0 ? {
                            scale: [1, 1.15, 1],
                        } : {}}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Flame
                            className={`${getFlameSize()} ${streak > 0 ? "text-orange-500" : "text-muted-foreground/30"}`}
                        />
                    </motion.div>

                    {/* Badge indicator */}
                    {streak >= 7 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
                        >
                            <span className="text-[10px]">
                                {streak >= 30 ? "👑" : streak >= 14 ? "⭐" : "✓"}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Streak count */}
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <motion.span
                            key={streak}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-2xl font-black text-white"
                        >
                            {streak}
                        </motion.span>
                        <span className="text-sm text-muted-foreground">
                            jour{streak !== 1 ? "s" : ""} de streak
                        </span>
                    </div>
                    <p className="text-xs text-orange-400">{getMessage()}</p>
                </div>

                {/* Chevron */}
                <span className="text-muted-foreground text-sm">{">"}</span>
            </motion.div>
        </Link>
    );
}
