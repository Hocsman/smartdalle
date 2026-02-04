import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generatePlan } from "./actions";
import { DailyPlanView } from "@/components/daily-plan-view";
import { Sparkles, Crown, History, User, ShoppingCart, Heart, Scale, Refrigerator } from "lucide-react";
import Link from "next/link";
import { AiGeneratorButton } from "@/components/ai-generator-button";
import { DashboardRecipesClient } from "@/components/dashboard-recipes-client";
import { getFavoriteIds } from "@/app/actions/favorites";
import { getUserStreak } from "@/app/progress/actions";
import { NotificationButton } from "@/components/notification-settings";
import { GenerateButton } from "@/components/GenerateButton";
import { InstallPWAButton } from "@/components/install-pwa-guide";

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

    // Fetch User's Streak
    let streak = 0;
    try {
        streak = await getUserStreak();
    } catch {
        // Fallback if table doesn't exist yet
        streak = 0;
    }

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 mb-20 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10">

                {/* Header Bar */}
                <header className="flex flex-col gap-4">
                    {/* Top Row: Logo + Nav + Buttons */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Logo */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase italic shrink-0">
                            Smart<span className="text-primary">Dalle</span>
                        </h1>

                        {/* Nav Icons + Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Navigation Icons */}
                            <InstallPWAButton />
                            <NotificationButton />
                            <Link href="/shopping-list">
                                <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]">
                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Courses</span>
                                </div>
                            </Link>
                            <Link href="/pantry">
                                <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]">
                                    <Refrigerator className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Frigo</span>
                                </div>
                            </Link>
                            <Link href="/favorites">
                                <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]">
                                    <Heart className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Favoris</span>
                                </div>
                            </Link>
                            <Link href="/profile">
                                <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]">
                                    <User className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Profil</span>
                                </div>
                            </Link>
                            <Link href="/history">
                                <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]">
                                    <History className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Historique</span>
                                </div>
                            </Link>
                            <Link href="/progress">
                                <div className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]">
                                    <Scale className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Suivi</span>
                                </div>
                            </Link>

                            {/* Divider */}
                            <div className="hidden lg:block w-px h-10 bg-input mx-1" />

                            {/* Action Buttons */}
                            {!dailyPlan && (
                                <form action={generatePlan}>
                                    <Button size="default" className="bg-primary text-black font-bold hover:bg-primary/90 shadow-sm shadow-primary/20 cursor-pointer">
                                        <Sparkles className="mr-2 h-4 w-4" /> Générer mon Menu
                                    </Button>
                                </form>
                            )}
                            <AiGeneratorButton isPremium={isPremium} />

                            {/* CTA Premium - Only for free users */}
                            {!isPremium && (
                                <Link href="/premium">
                                    <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-yellow-500/25 animate-pulse hover:animate-none">
                                        <Crown className="h-4 w-4 mr-1 md:mr-2" />
                                        <span className="text-xs md:text-sm">Go Pro</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Greeting Row */}
                    <p className="text-muted-foreground text-base md:text-lg">
                        Wesh <span className="text-white font-bold capitalize">{pseudo}</span>
                        {isPremium && (
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-xs font-black px-2 py-0.5 rounded-full mx-2">
                                <Crown className="w-3 h-3" /> PRO
                            </span>
                        )}
                        {!isPremium && <span>, </span>}
                        voici ton fuel pour aujourd&apos;hui 🔥
                        {dailyPlan && (
                            <Link href="/shopping-list" className="ml-4 text-sm text-primary hover:text-white underline underline-offset-4 font-bold transition-colors">
                                → Voir ma liste de courses
                            </Link>
                        )}
                    </p>
                </header>

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-8 bg-yellow-400 rounded-sm inline-block"></span>
                        <h2 className="text-2xl font-bold text-white">Recette IA du Jour</h2>
                    </div>
                    <GenerateButton isPremium={isPremium} />
                </section>

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
