import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generatePlan } from "./actions";
import { DailyPlanView } from "@/components/daily-plan-view";
import { Sparkles, Crown, History } from "lucide-react";
import Link from "next/link";
import { AiGeneratorButton } from "@/components/ai-generator-button";
import { DashboardRecipesClient } from "@/components/dashboard-recipes-client";
import { getFavoriteIds } from "@/app/actions/favorites";
import { NotificationButton } from "@/components/notification-settings";

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
    const isPremium = profile?.is_premium === true;

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

    // Fetch ALL Recipes for browsing
    const { data: recipes } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });

    // Fetch User's Favorites
    const favoriteIds = await getFavoriteIds();

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 mb-20 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between items-start w-full">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase italic">
                                    Smart<span className="text-primary">Dalle</span>
                                </h1>
                                <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
                                    Wesh <span className="text-white font-bold capitalize">{pseudo}</span>
                                    {isPremium && (
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-xs font-black px-2 py-0.5 rounded-full">
                                            <Crown className="w-3 h-3" /> PRO
                                        </span>
                                    )}
                                    , voici ton fuel pour aujourd&apos;hui 🔥
                                </p>
                            </div>

                            {/* Gamification Streak & History Link */}
                            <div className="flex gap-3">
                                <NotificationButton />
                                <Link href="/history">
                                    <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                        <History className="h-5 w-5 text-primary" />
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Historique</span>
                                    </div>
                                </Link>
                                <Link href="/progress">
                                    <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                        <div className="flex items-center gap-1 text-orange-500 font-black text-xl">
                                            <span className="text-2xl">🔥</span> 3
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Série</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

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
                            <AiGeneratorButton isPremium={isPremium} />
                        </div>
                    )}
                    {dailyPlan && (
                        <div className="mt-4 md:mt-0">
                            <AiGeneratorButton isPremium={isPremium} />
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
                ) : null}

                {/* Recipe Discovery Section */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-primary rounded-sm inline-block"></span>
                        {dailyPlan ? "Découvrir d'autres recettes" : "À la une"}
                    </h2>

                    {recipes && recipes.length > 0 ? (
                        <DashboardRecipesClient
                            recipes={recipes}
                            favoriteIds={favoriteIds}
                        />
                    ) : (
                        <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-input">
                            <p className="text-muted-foreground">Aucune recette trouvée. (As-tu lancé le script de seed ?)</p>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
