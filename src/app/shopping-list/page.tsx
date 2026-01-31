import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
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

    if (dailyPlan) {
        const { data: recipes } = await supabase
            .from("recipes")
            .select("ingredients")
            .in("id", [
                dailyPlan.breakfast_recipe_id,
                dailyPlan.lunch_recipe_id,
                dailyPlan.dinner_recipe_id,
                dailyPlan.snack_recipe_id,
            ]);

        if (recipes) {
            recipes.forEach((r) => {
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

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">

                <header className="flex items-center justify-between mb-8">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white pl-0">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-primary h-6 w-6" /> Liste de Courses
                    </h1>
                </header>

                <ShoppingListView ingredients={allIngredients} />

            </div>
        </div>
    );
}
