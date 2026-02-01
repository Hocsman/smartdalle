import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Wallet, Calendar } from "lucide-react";
import ShoppingListView from "@/components/shopping-list-view";

export const dynamic = "force-dynamic";

export default async function ShoppingListPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch Today's Plan
    const today = new Date().toISOString().split("T")[0];
    const { data: dailyPlan } = await supabase
        .from("daily_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

    let allIngredients: string[] = [];
    let totalCost = 0;
    let recipeNames: string[] = [];

    if (dailyPlan) {
        const { data: recipes } = await supabase
            .from("recipes")
            .select("name, ingredients, price_estimated")
            .in("id", [
                dailyPlan.breakfast_recipe_id,
                dailyPlan.lunch_recipe_id,
                dailyPlan.dinner_recipe_id,
                dailyPlan.snack_recipe_id,
            ]);

        if (recipes) {
            recipes.forEach((r) => {
                // Get recipe name
                recipeNames.push(r.name);

                // Add to total cost
                totalCost += r.price_estimated || 0;

                // Parse ingredients
                let list = [];
                try {
                    list = typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients;
                } catch (e) { }
                if (Array.isArray(list)) {
                    allIngredients = [...allIngredients, ...list];
                }
            });
        }
    }

    const formattedDate = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <div className="min-h-screen gradient-bg p-6 pb-24 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/dashboard">
                            <Button size="icon" variant="secondary" className="rounded-full cursor-pointer">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>

                        {totalCost > 0 && (
                            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-bold">
                                <Wallet className="h-4 w-4" />
                                Budget estimé: ~{totalCost.toFixed(0)}€
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <ShoppingBag className="text-primary h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white uppercase italic">
                                Liste de <span className="text-primary">Courses</span>
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4" />
                                <span className="capitalize">{formattedDate}</span>
                            </p>
                        </div>
                    </div>

                    {/* Recipe summary */}
                    {recipeNames.length > 0 && (
                        <div className="mt-4 p-3 bg-card/50 rounded-lg border border-input">
                            <p className="text-sm text-muted-foreground">
                                <span className="text-white font-bold">Menu du jour:</span>{" "}
                                {recipeNames.join(" • ")}
                            </p>
                        </div>
                    )}
                </header>

                <ShoppingListView ingredients={allIngredients} />

            </div>
        </div>
    );
}
