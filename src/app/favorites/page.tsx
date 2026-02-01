import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RecipeCard } from "@/components/recipe-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

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
type FavoriteRow = {
    recipe: Recipe | null;
};

export default async function FavoritesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: favoritesData } = await supabase
        .from("favorites")
        .select("recipe:recipes(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const favorites = (favoritesData || []) as FavoriteRow[];
    const recipes = favorites
        .map((item) => item.recipe)
        .filter(Boolean) as Recipe[];

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
                        <Heart className="text-primary h-6 w-6" /> Mes Recettes Préférées ❤️
                    </h1>
                </header>

                {recipes.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} isFavorite />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-input">
                        <p className="text-muted-foreground">
                            Pas encore de kiff ? Va générer des recettes !
                        </p>
                        <div className="mt-6">
                            <Link href="/dashboard">
                                <Button className="bg-primary text-black font-bold hover:bg-primary/90">
                                    Aller au dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
