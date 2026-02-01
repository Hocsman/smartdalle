import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile, signOut } from "@/app/actions/update-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { AvatarUpload } from "@/components/avatar-upload";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username, objectif, budget_level, calories_target, avatar_url")
        .eq("id", user.id)
        .single();

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                <header className="flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white pl-0">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="text-primary h-6 w-6" /> Mon Profil ⚙️
                    </h1>
                </header>

                <section className="bg-card/40 border border-input rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white">Avatar</h2>
                    <AvatarUpload userId={user.id} avatarUrl={profile?.avatar_url} />
                </section>

                <form action={updateProfile} className="space-y-6 bg-card/40 border border-input rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white">Réglages</h2>

                    <div className="space-y-2">
                        <Label className="text-white">Pseudo</Label>
                        <Input
                            name="username"
                            defaultValue={profile?.username || ""}
                            placeholder="Ton pseudo"
                            className="bg-secondary/60 border-white/10 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white">Objectif</Label>
                            <select
                                name="goal"
                                defaultValue={profile?.objectif || "maintain"}
                                className="w-full h-12 rounded-xl bg-secondary/60 border border-white/10 text-white px-3"
                            >
                                <option value="perte_poids">Sèche</option>
                                <option value="maintain">Maintien</option>
                                <option value="prise_masse">Masse</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Budget</Label>
                            <select
                                name="budget"
                                defaultValue={profile?.budget_level || "standard"}
                                className="w-full h-12 rounded-xl bg-secondary/60 border border-white/10 text-white px-3"
                            >
                                <option value="eco">Éco</option>
                                <option value="standard">Standard</option>
                                <option value="confort">Confort</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white">Objectif calories (kcal)</Label>
                        <Input
                            name="calories_target"
                            type="number"
                            min="800"
                            max="6000"
                            defaultValue={profile?.calories_target || ""}
                            placeholder="ex: 2200"
                            className="bg-secondary/60 border-white/10 text-white"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-primary text-black font-bold hover:bg-primary/90"
                    >
                        Sauvegarder les modifications
                    </Button>
                </form>

                <section className="bg-card/40 border border-red-500/20 rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white">Zone danger</h2>
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <form action={signOut}>
                            <Button type="submit" variant="destructive" className="w-full md:w-auto">
                                Se déconnecter
                            </Button>
                        </form>
                        <Link href="/premium" className="text-sm text-muted-foreground hover:text-white underline">
                            Gérer mon abonnement
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
