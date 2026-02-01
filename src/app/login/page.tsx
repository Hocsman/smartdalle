"use client";

import { useState } from "react";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "login" | "signup";

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("login");

    return (
        <div className="flex h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border-input bg-card/50">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-extrabold uppercase italic text-white">
                        Smart<span className="text-primary">Dalle</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {mode === "login" ? "Connecte-toi pour générer tes repas." : "Crée ton compte et commence !"}
                    </CardDescription>
                </CardHeader>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pb-4">
                    <button
                        onClick={() => setMode("login")}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${mode === "login"
                                ? "bg-primary text-black"
                                : "bg-secondary text-muted-foreground hover:text-white"
                            }`}
                    >
                        Connexion
                    </button>
                    <button
                        onClick={() => setMode("signup")}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${mode === "signup"
                                ? "bg-primary text-black"
                                : "bg-secondary text-muted-foreground hover:text-white"
                            }`}
                    >
                        Inscription
                    </button>
                </div>

                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="bg-secondary border-input text-white"
                                placeholder="ton@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-secondary border-input text-white"
                                placeholder="********"
                            />
                        </div>

                        {mode === "login" ? (
                            <Button
                                formAction={login}
                                className="w-full font-bold text-md cursor-pointer hover:bg-primary/90"
                            >
                                Se connecter
                            </Button>
                        ) : (
                            <Button
                                formAction={signup}
                                className="w-full font-bold text-md cursor-pointer bg-primary text-black hover:bg-primary/90"
                            >
                                Créer mon compte
                            </Button>
                        )}
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {mode === "login" ? (
                            <>Pas encore de compte ? <button onClick={() => setMode("signup")} className="text-primary hover:underline font-bold cursor-pointer">Inscris-toi</button></>
                        ) : (
                            <>Déjà un compte ? <button onClick={() => setMode("login")} className="text-primary hover:underline font-bold cursor-pointer">Connecte-toi</button></>
                        )}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
