import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Refrigerator } from "lucide-react";
import PantryClient from "@/components/pantry-client";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch pantry items and premium status in parallel
    const [pantryResult, profileResult] = await Promise.all([
        supabase
            .from("pantry_items")
            .select("*")
            .eq("user_id", user.id)
            .order("category", { ascending: true })
            .order("expiry_date", { ascending: true, nullsFirst: false }),
        supabase
            .from("profiles")
            .select("is_premium")
            .eq("id", user.id)
            .single(),
    ]);

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <header className="flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white pl-0">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                        </Button>
                    </Link>
                    <div className="text-right">
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                            <Refrigerator className="text-primary h-6 w-6" /> Mon Frigo
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {(pantryResult.data || []).length} ingrédient{(pantryResult.data || []).length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </header>

                <PantryClient
                    items={pantryResult.data || []}
                    isPremium={profileResult.data?.is_premium ?? false}
                />
            </div>
        </div>
    );
}
