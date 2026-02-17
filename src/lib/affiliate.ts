// Configuration des liens d'affiliation supermarchés

export interface Store {
    id: string;
    name: string;
    logo: string;
    searchUrl: string;
    searchParam: string;
    // Awin deep link (si applicable)
    awinMid?: string;
    awinAffId?: string;
}

export const STORES: Store[] = [
    {
        id: "lidl",
        name: "Lidl",
        logo: "🟡",
        searchUrl: "https://www.lidl.fr/q/search",
        searchParam: "query",
        awinMid: "62745",
        awinAffId: "2771822",
    },
    {
        id: "carrefour",
        name: "Carrefour",
        logo: "🥕",
        searchUrl: "https://www.carrefour.fr/s",
        searchParam: "q",
    },
    {
        id: "leclerc",
        name: "E.Leclerc",
        logo: "🛒",
        searchUrl: "https://www.e.leclerc/recherche",
        searchParam: "q",
    },
    {
        id: "auchan",
        name: "Auchan",
        logo: "🏪",
        searchUrl: "https://www.auchan.fr/recherche",
        searchParam: "text",
    },
];

export type StoreId = string;

/**
 * Nettoie un nom d'ingrédient (enlève quantités)
 */
function cleanIngredient(ingredient: string): string {
    return ingredient
        .replace(/\d+\s*(?:g|kg|ml|l|cl|pièces?|tranches?|càs|càc|cs|cc)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Génère le lien affilié pour un ingrédient sur un supermarché
 */
export function buildIngredientUrl(store: Store, ingredient: string): string {
    const clean = cleanIngredient(ingredient);

    // Construire l'URL de recherche
    const searchUrl = new URL(store.searchUrl);
    searchUrl.searchParams.set(store.searchParam, clean);

    // Si Awin, wrapper dans le redirect Awin
    if (store.awinMid && store.awinAffId) {
        return `https://www.awin1.com/cread.php?awinmid=${store.awinMid}&awinaffid=${store.awinAffId}&ued=${encodeURIComponent(searchUrl.toString())}`;
    }

    return searchUrl.toString();
}
