export const CATEGORIES = [
    { name: "Viandes & Poissons", emoji: "🥩", keywords: ["poulet", "boeuf", "poisson", "saumon", "thon", "crevette", "viande", "steak", "dinde", "agneau", "porc", "merguez", "kefta"] },
    { name: "Fruits & Légumes", emoji: "🥬", keywords: ["tomate", "oignon", "ail", "citron", "avocat", "banane", "pomme", "carotte", "courgette", "poivron", "salade", "épinard", "mangue", "concombre", "aubergine", "haricot", "petit pois", "coriandre", "persil", "menthe", "gingembre", "patate", "igname", "plantain", "gombo", "chou", "brocoli"] },
    { name: "Féculents & Céréales", emoji: "🍚", keywords: ["riz", "pâte", "semoule", "couscous", "pain", "quinoa", "avoine", "blé", "maïs", "farine", "boulgour", "manioc", "fonio", "attieke"] },
    { name: "Produits Laitiers", emoji: "🧀", keywords: ["lait", "fromage", "yaourt", "crème", "beurre", "oeuf", "feta", "mozzarella"] },
    { name: "Épices & Condiments", emoji: "🌶️", keywords: ["sel", "poivre", "cumin", "paprika", "curry", "piment", "ras el hanout", "harissa", "curcuma", "cannelle", "huile", "vinaigre", "moutarde", "sauce", "bouillon", "épice", "herbe"] },
    { name: "Légumineuses", emoji: "🫘", keywords: ["lentille", "pois chiche", "haricot rouge", "haricot blanc", "fève"] },
    { name: "Autres", emoji: "📦", keywords: [] },
];

export function categorizeIngredient(ingredient: string): string {
    const lower = ingredient.toLowerCase();
    for (const cat of CATEGORIES) {
        if (cat.keywords.some((kw) => lower.includes(kw))) {
            return cat.name;
        }
    }
    return "Autres";
}

export function getCategoryInfo(ingredient: string): { name: string; emoji: string } {
    const lower = ingredient.toLowerCase();
    for (const cat of CATEGORIES) {
        if (cat.keywords.some((kw) => lower.includes(kw))) {
            return { name: cat.name, emoji: cat.emoji };
        }
    }
    return { name: "Autres", emoji: "📦" };
}
