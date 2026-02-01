import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Clock, Flame, Utensils, Wallet } from "lucide-react";

interface RecipePageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: RecipePageProps) {
    const { id } = await params;
    const supabase = await createClient();

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
    } catch (e) {
        ingredientsList = ["Ingrédients non disponibles"];
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Image */}
            <div className="relative h-[40vh] w-full overflow-hidden">
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                <Link href="/dashboard" className="absolute top-6 left-6">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Main Info */}
                    <div className="flex-1 space-y-6 w-full">
                        <div>
                            <div className="flex gap-2 mb-2">
                                <Badge className="bg-primary text-black font-bold border-none hover:bg-primary">
                                    {recipe.culture}
                                </Badge>
                                <Badge variant="outline" className="text-white border-white/20 bg-background/50 backdrop-blur-md">
                                    {recipe.calories} kcal
                                </Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white uppercase italic leading-tight">
                                {recipe.name}
                            </h1>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MacroCard label="Protéines" value={`${recipe.protein}g`} color="text-primary" />
                            <MacroCard label="Glucides" value={`${recipe.carbs}g`} color="text-white" />
                            <MacroCard label="Lipides" value={`${recipe.fat}g`} color="text-white" />
                            <MacroCard label="Prix Est." value={`${recipe.price_estimated}€`} color="text-green-400" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Utensils className="h-6 w-6 text-primary" /> Préparation
                            </h2>
                            <div className="prose prose-invert max-w-none text-muted-foreground text-lg leading-relaxed bg-card/30 p-6 rounded-xl border border-input">
                                {recipe.instructions || "Aucune instruction fournie."}
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Sidebar */}
                    <div className="w-full md:w-80 space-y-6">
                        <Card className="bg-card border-input sticky top-6">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Ingrédients</h3>
                                <ul className="space-y-3">
                                    {ingredientsList.map((ing, i) => (
                                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                            <span>{ing}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}

function MacroCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <Card className="bg-card/50 border-input">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground uppercase">{label}</span>
            </CardContent>
        </Card>
    );
}
