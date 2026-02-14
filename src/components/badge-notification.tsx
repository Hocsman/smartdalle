"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getBadgeByKey } from "@/lib/badges";

interface BadgeNotificationProps {
    newBadgeKeys: string[];
}

export function BadgeNotification({ newBadgeKeys }: BadgeNotificationProps) {
    useEffect(() => {
        if (newBadgeKeys.length === 0) return;

        // Afficher un toast pour chaque nouveau badge avec un délai
        newBadgeKeys.forEach((key, i) => {
            const badge = getBadgeByKey(key);
            if (!badge) return;

            setTimeout(() => {
                toast.success(`${badge.emoji} Badge débloqué !`, {
                    description: `${badge.name} — ${badge.description}`,
                    duration: 5000,
                });
            }, i * 1500);
        });
    }, [newBadgeKeys]);

    return null;
}
