// Configuration des liens d'affiliation supermarchés
// Remplace les IDs par tes vrais IDs d'affilié une fois inscrit

export const STORES = [
    {
        id: "carrefour",
        name: "Carrefour",
        logo: "🥕",
        color: "#004E9E",
        searchUrl: "https://www.carrefour.fr/s",
        searchParam: "q",
        // Awin affiliate ID - à remplacer par ton vrai ID
        affiliateTag: process.env.NEXT_PUBLIC_CARREFOUR_AFFILIATE_ID || "",
        affiliateParam: "awc",
    },
    {
        id: "leclerc",
        name: "E.Leclerc",
        logo: "🛒",
        color: "#E30613",
        searchUrl: "https://www.e.leclerc/recherche",
        searchParam: "q",
        affiliateTag: process.env.NEXT_PUBLIC_LECLERC_AFFILIATE_ID || "",
        affiliateParam: "affiliate",
    },
    {
        id: "auchan",
        name: "Auchan",
        logo: "🏪",
        color: "#E20714",
        searchUrl: "https://www.auchan.fr/recherche",
        searchParam: "text",
        affiliateTag: process.env.NEXT_PUBLIC_AUCHAN_AFFILIATE_ID || "",
        affiliateParam: "affiliate",
    },
] as const;

export type StoreId = (typeof STORES)[number]["id"];

/**
 * Génère le lien de recherche affilié pour un supermarché
 */
export function buildStoreSearchUrl(
    storeId: StoreId,
    ingredients: string[]
): string {
    const store = STORES.find((s) => s.id === storeId);
    if (!store) return "#";

    // Nettoyer les noms d'ingrédients (enlever quantités)
    const cleanIngredients = ingredients.map((ing) =>
        ing
            .replace(/\d+\s*(?:g|kg|ml|l|cl|pièces?|tranches?|càs|càc|cs|cc)\b/gi, "")
            .replace(/\s+/g, " ")
            .trim()
    );

    // Construire la query de recherche
    const query = cleanIngredients.join(" ");

    const url = new URL(store.searchUrl);
    url.searchParams.set(store.searchParam, query);

    // Ajouter le tag affilié s'il existe
    if (store.affiliateTag) {
        url.searchParams.set(store.affiliateParam, store.affiliateTag);
    }

    return url.toString();
}

/**
 * Génère un lien pour un ingrédient spécifique
 */
export function buildSingleItemUrl(
    storeId: StoreId,
    ingredient: string
): string {
    return buildStoreSearchUrl(storeId, [ingredient]);
}
