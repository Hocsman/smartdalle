import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Crown, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const features = [
    { name: "Accès aux recettes de base", free: true, pro: true },
    { name: "Suivi de poids", free: true, pro: true },
    { name: "Menu du jour", free: true, pro: true },
    { name: "Générateur IA Illimité", free: false, pro: true },
    { name: "Liste de courses auto", free: false, pro: true },
    { name: "Recettes personnalisées", free: false, pro: true },
    { name: "Support Prioritaire", free: false, pro: true },
];

export default async function PremiumPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();

    const isPremium = profile?.is_premium === true;

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 relative overflow-hidden">
            {/* Subtle Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Back Button */}
                <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-white mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Dashboard
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <Badge className="bg-primary text-black font-bold mb-4">
                        <Crown className="w-3 h-3 mr-1" /> OFFRE PREMIUM
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white uppercase italic mb-4">
                        Passe au niveau <span className="text-primary">Supérieur</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Débloque le Chef IA et génère des recettes uniques adaptées à ton profil, sans limite.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <Card className="bg-card border-input relative">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold text-white">Gratuit</CardTitle>
                            <div className="text-4xl font-extrabold text-white mt-4">0€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-4">
                                {features.map((feature) => (
                                    <li key={feature.name} className="flex items-center gap-3">
                                        {feature.free ? (
                                            <Check className="w-5 h-5 text-green-400 shrink-0" />
                                        ) : (
                                            <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                                        )}
                                        <span className={feature.free ? "text-white" : "text-muted-foreground/50"}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Button variant="outline" className="w-full mt-8 border-input text-muted-foreground" disabled>
                                Plan Actuel
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="bg-gradient-to-b from-primary/20 to-card border-primary border-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAIRE
                        </div>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                                <Crown className="w-5 h-5" /> SmartDalle Pro
                            </CardTitle>
                            <div className="text-4xl font-extrabold text-white mt-4">4.99€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-4">
                                {features.map((feature) => (
                                    <li key={feature.name} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span className="text-white">{feature.name}</span>
                                    </li>
                                ))}
                            </ul>
                            {isPremium ? (
                                <Button className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold" disabled>
                                    <Check className="w-4 h-4 mr-2" /> Tu es déjà Pro !
                                </Button>
                            ) : (
                                <Button className="w-full mt-8 bg-primary hover:bg-primary/90 text-black font-bold text-lg cursor-pointer">
                                    <Sparkles className="w-4 h-4 mr-2" /> Passer Pro
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Note */}
                <p className="text-center text-muted-foreground text-sm mt-12">
                    Paiement sécurisé via Stripe. Annulation possible à tout moment.
                </p>
            </div>
        </div>
    );
}
