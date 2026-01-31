import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import WeightTracker from "@/components/weight-tracker";

// Force dynamic because we fetch fresh data
export const dynamic = "force-dynamic";

export default async function ProgressPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch Weight Logs (Latest first)
    const { data: logs } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    return (
        <div className="min-h-screen bg-background p-6 md:p-10 pb-24">
            <div className="max-w-xl mx-auto space-y-8">

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

                <WeightTracker logs={logs || []} />

            </div>
        </div>
    );
}
