export interface BadgeDefinition {
    key: string;
    name: string;
    description: string;
    emoji: string;
    tier: "bronze" | "silver" | "gold" | "legendary";
    category: "streak" | "meals" | "discovery";
}

export const BADGES: BadgeDefinition[] = [
    // Streak
    {
        key: "streak_3",
        name: "Démarrage",
        description: "3 jours consécutifs de suivi",
        emoji: "🔥",
        tier: "bronze",
        category: "streak",
    },
    {
        key: "streak_7",
        name: "Semaine Parfaite",
        description: "7 jours consécutifs de suivi",
        emoji: "⭐",
        tier: "silver",
        category: "streak",
    },
    {
        key: "streak_14",
        name: "Deux Semaines",
        description: "14 jours consécutifs de suivi",
        emoji: "💪",
        tier: "gold",
        category: "streak",
    },
    {
        key: "streak_30",
        name: "Machine",
        description: "30 jours consécutifs de suivi",
        emoji: "👑",
        tier: "legendary",
        category: "streak",
    },

    // Repas
    {
        key: "first_meal",
        name: "Premier Repas",
        description: "Premier repas enregistré",
        emoji: "🍽️",
        tier: "bronze",
        category: "meals",
    },
    {
        key: "meals_10",
        name: "Régulier",
        description: "10 repas enregistrés",
        emoji: "📊",
        tier: "silver",
        category: "meals",
    },
    {
        key: "meals_50",
        name: "Cuisinier Confirmé",
        description: "50 repas enregistrés",
        emoji: "👨‍🍳",
        tier: "gold",
        category: "meals",
    },
    {
        key: "meals_100",
        name: "Chef Étoilé",
        description: "100 repas enregistrés",
        emoji: "🏆",
        tier: "legendary",
        category: "meals",
    },

    // Découverte
    {
        key: "first_favorite",
        name: "Coup de Coeur",
        description: "Première recette en favori",
        emoji: "❤️",
        tier: "bronze",
        category: "discovery",
    },
    {
        key: "favorites_10",
        name: "Collectionneur",
        description: "10 recettes en favoris",
        emoji: "💎",
        tier: "silver",
        category: "discovery",
    },
    {
        key: "cultures_3",
        name: "Voyageur",
        description: "3 cultures culinaires essayées",
        emoji: "🌍",
        tier: "silver",
        category: "discovery",
    },
    {
        key: "cultures_all",
        name: "Globe-Trotter",
        description: "Toutes les cultures culinaires essayées",
        emoji: "🗺️",
        tier: "legendary",
        category: "discovery",
    },
];

export function getBadgeByKey(key: string): BadgeDefinition | undefined {
    return BADGES.find((b) => b.key === key);
}

export const TIER_COLORS = {
    bronze: "from-orange-700 to-orange-900",
    silver: "from-gray-300 to-gray-500",
    gold: "from-yellow-400 to-amber-600",
    legendary: "from-purple-500 to-pink-600",
} as const;

export const TIER_BORDER = {
    bronze: "border-orange-700/50",
    silver: "border-gray-400/50",
    gold: "border-yellow-500/50",
    legendary: "border-purple-500/50",
} as const;
