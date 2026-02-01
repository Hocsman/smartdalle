import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, Utensils } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch all past plans for this user, ordered by date descending
    const { data: plans } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30); // Last 30 days max

    // Get all unique recipe IDs from plans
    const allRecipeIds = plans?.flatMap((p) => [
        p.breakfast_recipe_id,
        p.lunch_recipe_id,
        p.dinner_recipe_id,
        p.snack_recipe_id,
    ]) || [];

    const uniqueRecipeIds = [...new Set(allRecipeIds)];

    // Fetch all recipes at once
    const { data: recipes } = await supabase
        .from("recipes")
        .select("id, name, culture, calories, protein")
        .in("id", uniqueRecipeIds);

    const recipesMap = new Map(recipes?.map((r) => [r.id, r]));

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        if (dateStr === today) return "Aujourd'hui";
        if (dateStr === yesterday) return "Hier";

        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 mb-20 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <header className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button size="icon" variant="secondary" className="rounded-full cursor-pointer">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white uppercase italic flex items-center gap-2">
                            <Calendar className="h-8 w-8 text-primary" />
                            Historique
                        </h1>
                        <p className="text-muted-foreground mt-1">Tes menus des derniers jours</p>
                    </div>
                </header>

                {/* Plans List */}
                {plans && plans.length > 0 ? (
                    <div className="space-y-6">
                        {plans.map((plan) => (
                            <Card key={plan.id} className="bg-card border-input">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 capitalize">
                                        {formatDate(plan.date)}
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <MealSlot
                                            label="Petit-déj"
                                            emoji="🌅"
                                            recipe={recipesMap.get(plan.breakfast_recipe_id)}
                                        />
                                        <MealSlot
                                            label="Déjeuner"
                                            emoji="☀️"
                                            recipe={recipesMap.get(plan.lunch_recipe_id)}
                                        />
                                        <MealSlot
                                            label="Dîner"
                                            emoji="🌙"
                                            recipe={recipesMap.get(plan.dinner_recipe_id)}
                                        />
                                        <MealSlot
                                            label="Snack"
                                            emoji="🍎"
                                            recipe={recipesMap.get(plan.snack_recipe_id)}
                                        />
                                    </div>

                                    {/* Daily totals */}
                                    <div className="mt-4 pt-4 border-t border-input flex gap-6 text-sm">
                                        <span className="text-muted-foreground">
                                            Total:{" "}
                                            <span className="text-white font-bold">
                                                {[
                                                    recipesMap.get(plan.breakfast_recipe_id)?.calories,
                                                    recipesMap.get(plan.lunch_recipe_id)?.calories,
                                                    recipesMap.get(plan.dinner_recipe_id)?.calories,
                                                    recipesMap.get(plan.snack_recipe_id)?.calories,
                                                ].reduce((a, b) => (a || 0) + (b || 0), 0)} kcal
                                            </span>
                                        </span>
                                        <span className="text-muted-foreground">
                                            Protéines:{" "}
                                            <span className="text-primary font-bold">
                                                {[
                                                    recipesMap.get(plan.breakfast_recipe_id)?.protein,
                                                    recipesMap.get(plan.lunch_recipe_id)?.protein,
                                                    recipesMap.get(plan.dinner_recipe_id)?.protein,
                                                    recipesMap.get(plan.snack_recipe_id)?.protein,
                                                ].reduce((a, b) => (a || 0) + (b || 0), 0)}g
                                            </span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-card border-input">
                        <CardContent className="p-12 text-center">
                            <Utensils className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Aucun historique</h3>
                            <p className="text-muted-foreground mb-6">
                                Génère ton premier menu pour commencer ton historique
                            </p>
                            <Link href="/dashboard">
                                <Button className="bg-primary text-black font-bold cursor-pointer">
                                    Générer un menu
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

interface MealSlotProps {
    label: string;
    emoji: string;
    recipe?: {
        id: string;
        name: string;
        culture: string;
        calories: number;
        protein: number;
    };
}

function MealSlot({ label, emoji, recipe }: MealSlotProps) {
    if (!recipe) {
        return (
            <div className="bg-secondary/20 rounded-lg p-3 border border-dashed border-input">
                <div className="text-xs text-muted-foreground font-bold uppercase mb-1">
                    {emoji} {label}
                </div>
                <p className="text-sm text-muted-foreground/50">Non défini</p>
            </div>
        );
    }

    return (
        <Link href={`/recipes/${recipe.id}`}>
            <div className="bg-secondary/20 rounded-lg p-3 border border-input hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="text-xs text-muted-foreground font-bold uppercase mb-1">
                    {emoji} {label}
                </div>
                <p className="text-sm text-white font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    {recipe.name}
                </p>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{recipe.calories} kcal</span>
                    <span className="text-primary">{recipe.protein}g prot</span>
                </div>
            </div>
        </Link>
    );
}
