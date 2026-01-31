import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RecipeCard } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { generatePlan } from "./actions";
import { DailyPlanView } from "@/components/daily-plan-view";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { StaggerGrid, MotionItem } from "@/components/ui/motion-wrapper";
import { AiGeneratorButton } from "@/components/ai-generator-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const pseudo = profile?.username || user.email?.split("@")[0] || "Street Chef";

    // Check for User's Plan for TODAY
    const today = new Date().toISOString().split("T")[0];
    const { data: dailyPlan } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

    let plannedRecipes = null;
    if (dailyPlan) {
        // Fetch the actual recipe details
        const { data: recipes } = await supabase
            .from("recipes")
            .select("*")
            .in("id", [
                dailyPlan.breakfast_recipe_id,
                dailyPlan.lunch_recipe_id,
                dailyPlan.dinner_recipe_id,
                dailyPlan.snack_recipe_id,
            ]);

        if (recipes) {
            // Map recipes to their slots safely
            plannedRecipes = {
                breakfast: recipes.find(r => r.id === dailyPlan.breakfast_recipe_id),
                lunch: recipes.find(r => r.id === dailyPlan.lunch_recipe_id),
                dinner: recipes.find(r => r.id === dailyPlan.dinner_recipe_id),
                snack: recipes.find(r => r.id === dailyPlan.snack_recipe_id),
            };
        }
    }

    // Fetch Suggestions (Fallback / "A la une")
    const { data: recipes } = await supabase.from("recipes").select("*").limit(6);

    return (
        <div className="min-h-screen bg-background p-6 md:p-10 mb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase italic">
                            Smart<span className="text-primary">Dalle</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Yo <span className="text-white font-bold capitalize">{pseudo}</span>, prêt à manger propre ?
                        </p>
                        {dailyPlan && (
                            <Link href="/shopping-list" className="inline-block mt-4 text-sm text-primary hover:text-white underline underline-offset-4 font-bold transition-colors">
                                → Voir ma liste de courses
                            </Link>
                        )}
                    </div>

                    {!dailyPlan && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <form action={generatePlan}>
                                <Button size="lg" className="bg-primary text-black font-bold text-lg hover:bg-primary/90 px-8 shadow-sm shadow-primary/20 cursor-pointer">
                                    <Sparkles className="mr-2 h-5 w-5" /> Générer mon Menu
                                </Button>
                            </form>
                            <AiGeneratorButton />
                        </div>
                    )}
                    {dailyPlan && (
                        <div className="mt-4 md:mt-0">
                            <AiGeneratorButton />
                        </div>
                    )}
                </header>

                {dailyPlan && plannedRecipes ? (
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-2 h-8 bg-green-500 rounded-sm inline-block"></span>
                            <h2 className="text-2xl font-bold text-white">Ton Plan du Jour</h2>
                        </div>
                        <DailyPlanView plan={dailyPlan} recipes={plannedRecipes} />
                    </section>
                ) : (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-primary rounded-sm inline-block"></span>
                            À la une
                        </h2>

                        {recipes && recipes.length > 0 ? (
                            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recipes.map((recipe) => (
                                    <MotionItem key={recipe.id}>
                                        <RecipeCard recipe={recipe} />
                                    </MotionItem>
                                ))}
                            </StaggerGrid>
                        ) : (
                            <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-input">
                                <p className="text-muted-foreground">Aucune recette trouvée. (As-tu lancé le script de seed ?)</p>
                            </div>
                        )}
                    </section>
                )}

            </div>
        </div>
    );
}
