import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import ShoppingListDb from "@/components/shopping-list-db";

export const dynamic = "force-dynamic";

export default async function ShoppingListPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    // Fetch shopping items from database
    const { data: shoppingItems } = await supabase
        .from("shopping_items")
        .select("*, recipes(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const items = shoppingItems || [];

    return (
        <div className="min-h-screen gradient-bg p-6 pb-24 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/dashboard">
                            <Button size="icon" variant="secondary" className="rounded-full cursor-pointer">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <ShoppingBag className="text-primary h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white uppercase italic">
                                Liste de <span className="text-primary">Courses</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {items.length} article{items.length !== 1 ? "s" : ""} dans ta liste
                            </p>
                        </div>
                    </div>
                </header>

                <ShoppingListDb items={items} />

            </div>
        </div>
    );
}
