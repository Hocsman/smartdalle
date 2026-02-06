import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getWeeklyPlans } from "./actions";
import { WeeklyPlanClient } from "@/components/weekly-plan-client";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Get user profile for premium check
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, budget_level")
        .eq("id", user.id)
        .single();

    const isPremium = profile?.is_premium === true;

    // Get current week's plans
    const { plans, weekDates, weekStart } = await getWeeklyPlans(0);

    // Get all recipes for the recipe picker
    const { data: allRecipes } = await supabase
        .from("recipes")
        .select("id, name, calories, protein, price_estimated, image_url, culture")
        .order("name", { ascending: true });

    return (
        <div className="min-h-screen gradient-bg p-4 md:p-6 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <WeeklyPlanClient
                    initialPlans={plans}
                    initialWeekStart={weekStart}
                    initialWeekDates={weekDates}
                    allRecipes={allRecipes || []}
                    isPremium={isPremium}
                />
            </div>
        </div>
    );
}
