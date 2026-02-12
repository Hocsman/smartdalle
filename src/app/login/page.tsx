"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, UserPlus, Sparkles, Eye, EyeOff, Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type Mode = "login" | "signup";

const REMEMBER_EMAIL_KEY = "smartdalle_remember_email";

// Error and success messages
const ERROR_MESSAGES: Record<string, string> = {
    email_not_confirmed: "Tu dois d'abord confirmer ton email. Vérifie ta boîte mail (et les spams).",
    invalid_credentials: "Email ou mot de passe incorrect.",
    already_registered: "Cet email est déjà utilisé. Connecte-toi ou utilise un autre email.",
    auth_failed: "Erreur d'authentification. Réessaie.",
    signup_failed: "Erreur lors de l'inscription. Réessaie.",
    server: "Erreur serveur. Réessaie plus tard.",
};

const SUCCESS_MESSAGES: Record<string, { title: string; message: string }> = {
    signup: {
        title: "Inscription réussie !",
        message: "Un email de confirmation t'a été envoyé. Clique sur le lien pour activer ton compte.",
    },
};

// Wrapper component to handle Suspense for useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageSkeleton />}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageSkeleton() {
    return (
        <div className="flex min-h-screen items-center justify-center gradient-bg">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );
}

function LoginPageContent() {
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<Mode>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberEmail, setRememberEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; terms?: string }>({});

    // Get error/success from URL params
    const errorCode = searchParams.get("error");
    const successCode = searchParams.get("success");
    const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "Une erreur est survenue." : null;
    const successInfo = successCode ? SUCCESS_MESSAGES[successCode] : null;

    // Load remembered email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    // Handle remember email toggle
    const handleRememberEmailChange = (checked: boolean) => {
        setRememberEmail(checked);
        if (!checked) {
            localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
    };

    // Validate signup form
    const validateSignup = (): boolean => {
        const newErrors: { password?: string; terms?: string } = {};

        if (password !== confirmPassword) {
            newErrors.password = "Les mots de passe ne correspondent pas";
        }

        if (password.length < 6) {
            newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
        }

        if (!acceptTerms) {
            newErrors.terms = "Tu dois accepter les conditions d'utilisation";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (formData: FormData) => {
        // Save email if remember is checked
        if (rememberEmail && email) {
            localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        }

        if (mode === "signup") {
            if (!validateSignup()) {
                return;
            }
        }

        // Call the appropriate action
        if (mode === "login") {
            await login(formData);
        } else {
            await signup(formData);
        }
    };

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
                    <div className="flex gap-2 mb-6 bg-secondary/50 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => { setMode("login"); setErrors({}); }}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${mode === "login"
                                ? "bg-primary text-black shadow-lg"
                                : "text-muted-foreground hover:text-white"
                                }`}
                        >
                            <LogIn className="w-4 h-4" />
                            Connexion
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode("signup"); setErrors({}); }}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${mode === "signup"
                                ? "bg-primary text-black shadow-lg"
                                : "text-muted-foreground hover:text-white"
                                }`}
                        >
                            <UserPlus className="w-4 h-4" />
                            Inscription
                        </button>
                    </div>

                    {/* Success Message (after signup) */}
                    {successInfo && (
                        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-green-500/20">
                                    <Mail className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-green-400 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {successInfo.title}
                                    </p>
                                    <p className="text-sm text-green-300/80 mt-1">
                                        {successInfo.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">
                                    {errorMessage}
                                    {errorCode === "email_not_confirmed" && (
                                        <span className="block mt-2 text-xs text-red-300/70">
                                            Pas reçu ? Vérifie tes spams ou{" "}
                                            <button
                                                type="button"
                                                className="text-primary underline cursor-pointer"
                                                onClick={() => setMode("signup")}
                                            >
                                                réinscris-toi
                                            </button>
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form action={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-secondary/70 border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20 transition-all"
                                placeholder="ton@email.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white text-sm font-medium">Mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-secondary/70 border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20 transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field (Signup only) */}
                        {mode === "signup" && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                                    Confirmer le mot de passe
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`bg-secondary/70 border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20 transition-all pr-12 ${errors.password ? "border-red-500" : ""
                                            }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>
                        )}

                        {/* Remember Email (Login only) */}
                        {mode === "login" && (
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="rememberEmail"
                                    checked={rememberEmail}
                                    onCheckedChange={handleRememberEmailChange}
                                />
                                <Label
                                    htmlFor="rememberEmail"
                                    className="text-sm text-muted-foreground cursor-pointer"
                                >
                                    Se souvenir de mon email
                                </Label>
                            </div>
                        )}

                        {/* Terms Checkbox (Signup only) */}
                        {mode === "signup" && (
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="acceptTerms"
                                        checked={acceptTerms}
                                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                                        className={errors.terms ? "border-red-500" : ""}
                                    />
                                    <Label
                                        htmlFor="acceptTerms"
                                        className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                                    >
                                        J&apos;accepte les{" "}
                                        <Link href="/cgu" className="text-primary hover:underline">
                                            conditions d&apos;utilisation
                                        </Link>{" "}
                                        et la{" "}
                                        <Link href="/confidentialite" className="text-primary hover:underline">
                                            politique de confidentialité
                                        </Link>
                                    </Label>
                                </div>
                                {errors.terms && (
                                    <p className="text-red-400 text-xs">{errors.terms}</p>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        {mode === "login" ? (
                            <Button
                                type="submit"
                                className="w-full font-bold text-md cursor-pointer h-12 rounded-xl bg-primary text-black hover:bg-primary/90 transition-all btn-glow"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Se connecter
                            </Button>
                        ) : (
                            <Button
                                type="submit"
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
                                    type="button"
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
                                    type="button"
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
