import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { FavoritesClient } from "./favorites-client";
import { getCollections } from "@/app/actions/collections";

export const dynamic = "force-dynamic";

type Recipe = {
    id: string;
    name: string;
    culture: string;
    image_url: string | null;
    price_estimated: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export default async function FavoritesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch favorites and collections in parallel
    const [favoritesResult, collections] = await Promise.all([
        supabase
            .from("favorites")
            .select("recipe_id, recipes(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        getCollections().catch(() => []),
    ]);

    type FavoriteRow = {
        recipe_id: string;
        recipes: Recipe | null;
    };

    const recipes = ((favoritesResult.data || []) as unknown as FavoriteRow[])
        .map((item) => item.recipes)
        .filter(Boolean) as Recipe[];

    // Fetch collection recipes map
    const collectionRecipeMap: Record<string, string[]> = {};

    if (collections.length > 0) {
        const { data: collectionRecipes } = await supabase
            .from("collection_recipes")
            .select("collection_id, recipe_id")
            .in("collection_id", collections.map((c) => c.id));

        if (collectionRecipes) {
            for (const cr of collectionRecipes) {
                if (!collectionRecipeMap[cr.collection_id]) {
                    collectionRecipeMap[cr.collection_id] = [];
                }
                collectionRecipeMap[cr.collection_id].push(cr.recipe_id);
            }
        }
    }

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                <header className="flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white pl-0">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                        <Heart className="text-primary h-6 w-6" /> Mes Favoris
                    </h1>
                </header>

                <FavoritesClient
                    allRecipes={recipes}
                    collections={collections}
                    collectionRecipeMap={collectionRecipeMap}
                />
            </div>
        </div>
    );
}
