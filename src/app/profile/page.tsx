import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signOut, updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, User, Headphones } from "lucide-react";
import { AvatarUpload } from "@/components/avatar-upload";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { SupportForm } from "@/components/support-form";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
    searchParams?: { updated?: string };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
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
                        <User className="text-primary h-6 w-6" /> Mon Profil
                    </h1>
                </header>

                {searchParams?.updated ? (
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 px-4 py-3 text-sm font-semibold">
                        Profil mis à jour ✅
                    </div>
                ) : null}

                <section className="bg-card/40 border border-input rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white">Avatar</h2>
                    <AvatarUpload userId={user.id} avatarUrl={profile?.avatar_url} />
                </section>

                <form action={updateProfile} className="space-y-6 bg-card/40 border border-input rounded-2xl p-6">
                    <div className="space-y-2">
                        <Label className="text-white">Email</Label>
                        <Input value={user.email || ""} readOnly className="bg-secondary/60 border-white/10 text-white" />
                    </div>

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
                                name="objectif"
                                defaultValue={profile?.objectif || "maintain"}
                                className="w-full h-12 rounded-xl bg-secondary/60 border border-white/10 text-white px-3"
                            >
                                <option value="perte_poids">Perte de poids</option>
                                <option value="maintain">Maintien</option>
                                <option value="prise_masse">Prise de masse</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Budget</Label>
                            <select
                                name="budget_level"
                                defaultValue={profile?.budget_level || "standard"}
                                className="w-full h-12 rounded-xl bg-secondary/60 border border-white/10 text-white px-3"
                            >
                                <option value="eco">Éco</option>
                                <option value="standard">Standard</option>
                                <option value="confort">Confort</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white">Culture culinaire</Label>
                            <select
                                name="culture"
                                defaultValue={profile?.culture || "mix"}
                                className="w-full h-12 rounded-xl bg-secondary/60 border border-white/10 text-white px-3"
                            >
                                <option value="africaine">Africaine</option>
                                <option value="antillaise">Antillaise</option>
                                <option value="maghrebine">Maghrébine</option>
                                <option value="francaise">Française</option>
                                <option value="classique">Classique</option>
                                <option value="mix">Mix</option>
                            </select>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white">Taille (cm)</Label>
                            <Input
                                name="height"
                                type="number"
                                min="120"
                                max="230"
                                defaultValue={profile?.height || ""}
                                placeholder="ex: 178"
                                className="bg-secondary/60 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Tranche d’âge</Label>
                            <select
                                name="age_range"
                                defaultValue={profile?.age_range || ""}
                                className="w-full h-12 rounded-xl bg-secondary/60 border border-white/10 text-white px-3"
                            >
                                <option value="">Non précisé</option>
                                <option value="16-29">16-29</option>
                                <option value="30-49">30-49</option>
                                <option value="50-69">50-69</option>
                                <option value="70+">70+</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-primary text-black font-bold hover:bg-primary/90"
                    >
                        Sauvegarder mon profil
                    </Button>
                </form>

                <section className="bg-card/40 border border-input rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Headphones className="h-5 w-5 text-primary" />
                        Support
                    </h2>
                    <SupportForm
                        isPremium={profile?.is_premium === true}
                        userEmail={user.email || ""}
                    />
                </section>

                <section className="bg-card/40 border border-red-500/20 rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white">Zone danger</h2>
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <form action={signOut}>
                            <Button type="submit" variant="destructive" className="w-full md:w-auto">
                                Se déconnecter
                            </Button>
                        </form>
                        {profile?.stripe_customer_id && <ManageSubscriptionButton />}
                    </div>
                </section>
            </div>
        </div>
    );
}
