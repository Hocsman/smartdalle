import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { ProgressTabs } from "./progress-tabs";
import { getNutritionLogs, getTodayLog, getUserGoals, getUserStreak } from "./actions";

// Force dynamic because we fetch fresh data
export const dynamic = "force-dynamic";

export default async function ProgressPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch all data in parallel
    const [weightLogsResult, nutritionLogs, todayLog, goals] = await Promise.all([
        supabase
            .from("weight_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false }),
        getNutritionLogs(7).catch(() => []),
        getTodayLog().catch(() => null),
        getUserGoals().catch(() => ({
            daily_calories: 2000,
            daily_protein: 100,
            daily_carbs: 250,
            daily_fat: 65,
        })),
    ]);

    // Calculate streak (fallback if SQL function doesn't exist)
    let streak = 0;
    try {
        streak = await getUserStreak();
    } catch {
        // Fallback: count consecutive days with logs
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toISOString().split("T")[0];
            const hasLog = nutritionLogs.some((log) => log.date === dateStr && log.calories_consumed > 0);
            if (hasLog) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
    }

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 pb-24 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-xl mx-auto space-y-8 relative z-10">

                <header className="flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white pl-0">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-primary h-6 w-6" /> Mon Évolution
                    </h1>
                </header>

                <ProgressTabs
                    weightLogs={weightLogsResult.data || []}
                    nutritionLogs={nutritionLogs}
                    todayLog={todayLog}
                    goals={goals}
                    streak={streak}
                />

            </div>
        </div>
    );
}
