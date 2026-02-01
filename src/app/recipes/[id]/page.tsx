import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Utensils } from "lucide-react";
import { RecipeClientSection } from "./recipe-client-section";

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
    } catch {
        ingredientsList = ["Ingrédients non disponibles"];
    }

    // Parse instructions into steps
    const instructionSteps = recipe.instructions
        ? recipe.instructions.split(/\d+\.\s*/).filter(Boolean)
        : [];

    return (
        <div className="min-h-screen gradient-bg pb-20 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Hero Image */}
            <div className="relative h-[40vh] w-full overflow-hidden z-10">
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Utensils className="w-20 h-20 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                <Link href="/dashboard" className="absolute top-6 left-6">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg cursor-pointer">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Main Info */}
                    <div className="flex-1 space-y-6 w-full">
                        {/* Title & Badges */}
                        <div>
                            <div className="flex gap-2 mb-3 flex-wrap">
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

                        {/* Macros Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <MacroCard label="Protéines" value={`${recipe.protein}g`} color="text-primary" />
                            <MacroCard label="Glucides" value={`${recipe.carbs}g`} color="text-blue-400" />
                            <MacroCard label="Lipides" value={`${recipe.fat}g`} color="text-orange-400" />
                            <MacroCard label="Prix Est." value={`${recipe.price_estimated}€`} color="text-green-400" />
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Utensils className="h-6 w-6 text-primary" /> Préparation
                            </h2>

                            {instructionSteps.length > 0 ? (
                                <div className="space-y-3">
                                    {instructionSteps.map((step: string, index: number) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 bg-card/30 p-4 rounded-xl border border-input group hover:border-primary/30 transition-colors"
                                        >
                                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-black font-bold rounded-lg flex items-center justify-center text-sm">
                                                {index + 1}
                                            </span>
                                            <p className="text-muted-foreground text-lg leading-relaxed pt-1">
                                                {step.trim()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none text-muted-foreground text-lg leading-relaxed bg-card/30 p-6 rounded-xl border border-input">
                                    {recipe.instructions || "Aucune instruction fournie."}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-6">
                        {/* Ingredients */}
                        <Card className="bg-card border-input">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Ingrédients</h3>
                                <ul className="space-y-3">
                                    {ingredientsList.map((ing, i) => (
                                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                            <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                            <span>{ing}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Timer & Share (Client Components) */}
                        <RecipeClientSection recipeName={recipe.name} />
                    </div>

                </div>
            </div>
        </div>
    );
}

function MacroCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <Card className="bg-card/50 border-input hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground uppercase">{label}</span>
            </CardContent>
        </Card>
    );
}
