"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Crown, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { createCheckoutSession } from "./actions";
import Link from "next/link";

export default function PremiumPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // Call server action to create session
            const { url } = await createCheckoutSession();

            if (url) {
                window.location.href = url;
            } else {
                console.error("No checkout URL returned");
            }
        } catch (error) {
            console.error("Upgrade failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl mb-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-muted-foreground hover:text-white text-sm transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
                </Link>
            </div>

            <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                    Smart<span className="text-primary">Dalle</span> <span className="bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">PREMIUM</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Passe au niveau supérieur. Débloque l'IA et toutes les fonctionnalités pour gérer ta nutrition comme un chef.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">

                {/* Free Plan */}
                <Card className="bg-card/30 border-input backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">Starter</CardTitle>
                        <CardDescription>Pour démarrer tranquillement</CardDescription>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-white">0€</span>
                            <span className="text-muted-foreground"> / mois</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-white"><Check className="h-4 w-4 text-primary" /> Génération de menus (limité)</li>
                            <li className="flex items-center gap-2 text-sm text-white"><Check className="h-4 w-4 text-primary" /> Liste de courses</li>
                            <li className="flex items-center gap-2 text-sm text-white"><Check className="h-4 w-4 text-primary" /> Export PDF</li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4" /> Photos IA des plats</li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4" /> Historique illimité</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full font-bold" disabled>
                            Plan Actuel
                        </Button>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className="bg-card border-primary/50 relative overflow-hidden shadow-2xl shadow-primary/10 scale-105 border-2">
                    <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                        POPULAIRE
                    </div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>

                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Crown className="h-6 w-6 text-primary fill-primary" />
                            Elite
                        </CardTitle>
                        <CardDescription>Tout SmartDalle. Sans limites.</CardDescription>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-white">9,99€</span>
                            <span className="text-muted-foreground"> / mois</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 font-medium text-white"><Check className="h-5 w-5 text-green-500" /> Tout ce qu'il y a dans Starter</li>
                            <li className="flex items-center gap-2 font-medium text-white"><Sparkles className="h-5 w-5 text-primary" /> Photos IA (DALL-E 3)</li>
                            <li className="flex items-center gap-2 font-medium text-white"><Check className="h-5 w-5 text-green-500" /> Générations illimitées</li>
                            <li className="flex items-center gap-2 font-medium text-white"><Check className="h-5 w-5 text-green-500" /> Support prioritaire</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-primary text-black hover:bg-primary/90 font-bold text-lg h-12 shadow-lg shadow-primary/25 cursor-pointer"
                            onClick={handleUpgrade}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Crown className="mr-2 h-5 w-5" />
                            )}
                            Passer Premium
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
