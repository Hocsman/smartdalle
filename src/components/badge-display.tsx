"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { BADGES, getBadgeByKey, TIER_COLORS, TIER_BORDER } from "@/lib/badges";

interface BadgeDisplayProps {
    earnedBadgeKeys: string[];
    compact?: boolean;
}

export function BadgeDisplay({ earnedBadgeKeys, compact = false }: BadgeDisplayProps) {
    const earnedSet = new Set(earnedBadgeKeys);

    if (compact) {
        // Mode dashboard : scroll horizontal, badges débloqués uniquement
        const earnedBadges = BADGES.filter((b) => earnedSet.has(b.key));
        if (earnedBadges.length === 0) return null;

        return (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {earnedBadges.map((badge, i) => (
                    <motion.div
                        key={badge.key}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        className={`
                            shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl
                            bg-gradient-to-b ${TIER_COLORS[badge.tier]}
                            border ${TIER_BORDER[badge.tier]}
                            min-w-[80px]
                        `}
                    >
                        <span className="text-2xl">{badge.emoji}</span>
                        <span className="text-[10px] font-bold text-white text-center leading-tight">
                            {badge.name}
                        </span>
                    </motion.div>
                ))}
            </div>
        );
    }

    // Mode complet : grille avec badges verrouillés
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {BADGES.map((badge) => {
                const isEarned = earnedSet.has(badge.key);

                return (
                    <motion.div
                        key={badge.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                            relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center
                            ${isEarned
                                ? `bg-gradient-to-b ${TIER_COLORS[badge.tier]} ${TIER_BORDER[badge.tier]}`
                                : "bg-secondary/20 border-input opacity-50"
                            }
                        `}
                    >
                        {!isEarned && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                        <span className="text-3xl">{badge.emoji}</span>
                        <span className="text-xs font-bold text-white leading-tight">
                            {badge.name}
                        </span>
                        <span className="text-[10px] text-white/70 leading-tight">
                            {badge.description}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}
