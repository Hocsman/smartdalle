import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { WeeklyPlanClient } from "@/components/weekly-plan-client";

export const dynamic = "force-dynamic";

// Get Monday of the week containing the given date
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Format date as YYYY-MM-DD (local timezone to avoid UTC issues)
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get array of 7 dates starting from Monday
function getWeekDates(weekStart: Date): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        dates.push(formatDate(d));
    }
    return dates;
}

export default async function PlanningPage() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return redirect("/login");

        // Get user profile for premium check (use maybeSingle to avoid errors)
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_premium, budget_level")
            .eq("id", user.id)
            .maybeSingle();

        // If no profile exists, redirect to onboarding
        if (!profile) {
            return redirect("/onboarding");
        }

        const isPremium = profile?.is_premium === true;

        // Calculate week dates
        const today = new Date();
        const weekStart = getWeekStart(today);
        const weekDates = getWeekDates(weekStart);

        // Fetch plans for the week
        const { data: plans, error: plansError } = await supabase
            .from("daily_plans")
            .select("*")
            .eq("user_id", user.id)
            .gte("date", weekDates[0])
            .lte("date", weekDates[6])
            .order("date", { ascending: true });

        if (plansError) {
            console.error("Error fetching plans:", plansError);
        }

        // Get all unique recipe IDs
        const recipeIds = new Set<string>();
        (plans || []).forEach(plan => {
            if (plan.breakfast_recipe_id) recipeIds.add(plan.breakfast_recipe_id);
            if (plan.lunch_recipe_id) recipeIds.add(plan.lunch_recipe_id);
            if (plan.dinner_recipe_id) recipeIds.add(plan.dinner_recipe_id);
            if (plan.snack_recipe_id) recipeIds.add(plan.snack_recipe_id);
        });

        // Fetch recipes used in plans
        type RecipeData = { id: string; name: string; calories: number; protein: number; price_estimated: number; image_url: string | null };
        let planRecipes: Record<string, RecipeData> = {};
        if (recipeIds.size > 0) {
            const { data: recipeData } = await supabase
                .from("recipes")
                .select("id, name, calories, protein, price_estimated, image_url")
                .in("id", Array.from(recipeIds));

            if (recipeData) {
                planRecipes = Object.fromEntries(recipeData.map(r => [r.id, r]));
            }
        }

        // Map plans to week structure with safe lookups
        // Note: Supabase returns date as string "YYYY-MM-DD" for DATE columns
        const weekPlans = weekDates.map(date => {
            // Handle both string and Date formats from Supabase
            const plan = (plans || []).find(p => {
                const planDate = typeof p.date === 'string' ? p.date : formatDate(new Date(p.date));
                return planDate === date;
            });
            return {
                date,
                planId: plan?.id ?? null,
                breakfast: plan?.breakfast_recipe_id && planRecipes[plan.breakfast_recipe_id] ? planRecipes[plan.breakfast_recipe_id] : null,
                lunch: plan?.lunch_recipe_id && planRecipes[plan.lunch_recipe_id] ? planRecipes[plan.lunch_recipe_id] : null,
                dinner: plan?.dinner_recipe_id && planRecipes[plan.dinner_recipe_id] ? planRecipes[plan.dinner_recipe_id] : null,
                snack: plan?.snack_recipe_id && planRecipes[plan.snack_recipe_id] ? planRecipes[plan.snack_recipe_id] : null,
            };
        });

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
                        initialPlans={weekPlans}
                        initialWeekStart={formatDate(weekStart)}
                        initialWeekDates={weekDates}
                        allRecipes={allRecipes || []}
                        isPremium={isPremium}
                    />
                </div>
            </div>
        );
    } catch (error) {
        console.error("Planning page error:", error);
        // Return a fallback UI instead of crashing
        const today = new Date();
        const weekStart = getWeekStart(today);
        const weekDates = getWeekDates(weekStart);
        const emptyPlans = weekDates.map(date => ({
            date,
            planId: null,
            breakfast: null,
            lunch: null,
            dinner: null,
            snack: null,
        }));

        return (
            <div className="min-h-screen gradient-bg p-4 md:p-6 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <WeeklyPlanClient
                        initialPlans={emptyPlans}
                        initialWeekStart={formatDate(weekStart)}
                        initialWeekDates={weekDates}
                        allRecipes={[]}
                        isPremium={false}
                    />
                </div>
            </div>
        );
    }
}
