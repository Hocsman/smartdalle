"use client";

import { useState } from "react";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, Sparkles } from "lucide-react";
import Link from "next/link";

type Mode = "login" | "signup";

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("login");

    return (
        <div className="flex min-h-screen items-center justify-center gradient-bg px-4 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />

            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Back to Home Link */}
                <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-white mb-6 text-sm transition-colors">
                    ← Retour à l&apos;accueil
                </Link>

                {/* Login Card */}
                <div className="glass-card rounded-2xl p-8 glow-border">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black uppercase text-white mb-2">
                            Smart<span className="text-primary">Dalle</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {mode === "login"
                                ? "Connecte-toi pour générer tes repas."
                                : "Crée ton compte et commence ton parcours !"}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 bg-secondary/50 p-1 rounded-xl">
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${mode === "login"
                                    ? "bg-primary text-black shadow-lg"
                                    : "text-muted-foreground hover:text-white"
                                }`}
                        >
                            <LogIn className="w-4 h-4" />
                            Connexion
                        </button>
                        <button
                            onClick={() => setMode("signup")}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${mode === "signup"
                                    ? "bg-primary text-black shadow-lg"
                                    : "text-muted-foreground hover:text-white"
                                }`}
                        >
                            <UserPlus className="w-4 h-4" />
                            Inscription
                        </button>
                    </div>

                    {/* Form */}
                    <form className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="bg-secondary/70 border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                                placeholder="ton@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white text-sm font-medium">Mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-secondary/70 border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {mode === "login" ? (
                            <Button
                                formAction={login}
                                className="w-full font-bold text-md cursor-pointer h-12 rounded-xl bg-primary text-black hover:bg-primary/90 transition-all btn-glow"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Se connecter
                            </Button>
                        ) : (
                            <Button
                                formAction={signup}
                                className="w-full font-bold text-md cursor-pointer h-12 rounded-xl bg-primary text-black hover:bg-primary/90 transition-all btn-glow"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Créer mon compte
                            </Button>
                        )}
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {mode === "login" ? (
                            <>
                                Pas encore de compte ?{" "}
                                <button
                                    onClick={() => setMode("signup")}
                                    className="text-primary hover:underline font-bold cursor-pointer"
                                >
                                    Inscris-toi
                                </button>
                            </>
                        ) : (
                            <>
                                Déjà un compte ?{" "}
                                <button
                                    onClick={() => setMode("login")}
                                    className="text-primary hover:underline font-bold cursor-pointer"
                                >
                                    Connecte-toi
                                </button>
                            </>
                        )}
                    </p>
                </div>

                {/* Security Note */}
                <p className="text-center text-xs text-muted-foreground/50 mt-6">
                    🔒 Connexion sécurisée via Supabase
                </p>
            </div>
        </div>
    );
}
