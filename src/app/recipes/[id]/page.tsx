import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Utensils, Flame, Euro } from "lucide-react";
import { AiGeneratorButton } from "@/components/ai-generator-button";
import { RecipeTabsSection } from "./recipe-tabs-section";
import { FavoriteButton } from "@/components/favorite-button";

interface RecipePageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: RecipePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Check Premium Status
    const { data: { user } } = await supabase.auth.getUser();
    let isPremium = false;
    if (user) {
        const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single();
        isPremium = profile?.is_premium || false;
    }
    let isFavorite = false;
    if (user) {
        const { data: favoriteRows } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("recipe_id", id)
            .limit(1);
        isFavorite = !!favoriteRows && favoriteRows.length > 0;
    }

    const { data: recipe } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

    if (!recipe) {
        notFound();
    }

    // Parse JSON/Text ingredients
    let ingredientsList: string[] = [];
    try {
        ingredientsList = typeof recipe.ingredients === 'string'
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients;
    } catch {
        ingredientsList = ["Ingrédients non disponibles"];
    }

    // Parse instructions into steps
    const instructionSteps = recipe.instructions
        ? recipe.instructions.split(/\d+\.\s*/).filter(Boolean)
        : [];

    return (
        <div className="min-h-screen gradient-bg pb-32 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Hero Image */}
            <div className="relative h-[35vh] sm:h-[40vh] w-full overflow-hidden z-10 group">
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Utensils className="w-20 h-20 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* Back Button */}
                <Link href="/dashboard" className="absolute top-6 left-6 z-20">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg cursor-pointer">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                {/* AI Generator Button (Top Right) */}
                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    <AiGeneratorButton
                        recipeId={recipe.id}
                        recipeName={recipe.name}
                        isPremium={isPremium}
                    />
                    {user ? (
                        <FavoriteButton recipeId={recipe.id} initialFavorite={isFavorite} />
                    ) : null}
                </div>

                {/* Title over Hero */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge className="bg-primary text-black font-bold border-none hover:bg-primary">
                            {recipe.culture}
                        </Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white uppercase italic leading-tight drop-shadow-lg">
                        {recipe.name}
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">

                {/* Stats Bar (Macros) */}
                <div className="grid grid-cols-3 gap-3 -mt-8">
                    <StatCard
                        icon={<span className="text-xl font-black">P</span>}
                        value={`${recipe.protein}g`}
                        label="Protéines"
                        colorClass="bg-primary/20 text-primary border-primary/30"
                    />
                    <StatCard
                        icon={<Flame className="h-5 w-5" />}
                        value={`${recipe.calories}`}
                        label="Calories"
                        colorClass="bg-orange-500/20 text-orange-400 border-orange-500/30"
                    />
                    <StatCard
                        icon={<Euro className="h-5 w-5" />}
                        value={`${recipe.price_estimated}€`}
                        label="Prix"
                        colorClass="bg-green-500/20 text-green-400 border-green-500/30"
                    />
                </div>

                {/* Tabs Section (Ingrédients / Préparation) */}
                <RecipeTabsSection
                    recipeId={recipe.id}
                    ingredients={ingredientsList}
                    instructionSteps={instructionSteps}
                />

            </div>
        </div>
    );
}

function StatCard({
    icon,
    value,
    label,
    colorClass
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
    colorClass: string;
}) {
    return (
        <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border backdrop-blur-md ${colorClass}`}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xl sm:text-2xl font-black">{value}</span>
            </div>
            <span className="text-xs uppercase opacity-80">{label}</span>
        </div>
    );
}
