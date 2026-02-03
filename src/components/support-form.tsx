"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendSupportEmail } from "@/app/profile/support-action";
import { Loader2, Send, CheckCircle, Crown, Clock } from "lucide-react";

interface SupportFormProps {
    isPremium: boolean;
    userEmail: string;
}

export function SupportForm({ isPremium, userEmail }: SupportFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await sendSupportEmail(formData);

        setIsLoading(false);

        if (result.success) {
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } else {
            setError(result.error || "Une erreur est survenue");
        }
    };

    if (success) {
        return (
            <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Message envoy&eacute; !</h3>
                <p className="text-muted-foreground text-sm">
                    {isPremium
                        ? "Notre \u00e9quipe te r\u00e9pondra sous 24h maximum."
                        : "Notre \u00e9quipe te r\u00e9pondra sous 72h."}
                </p>
                <Button
                    variant="outline"
                    onClick={() => setSuccess(false)}
                    className="mt-4"
                >
                    Envoyer un autre message
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* SLA Badge */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${isPremium
                ? "bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30"
                : "bg-card border border-input"
                }`}>
                {isPremium ? (
                    <>
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <div>
                            <p className="text-sm font-bold text-white">Support Prioritaire</p>
                            <p className="text-xs text-yellow-500/80">R&eacute;ponse garantie sous 24h</p>
                        </div>
                    </>
                ) : (
                    <>
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-bold text-white">Support Standard</p>
                            <p className="text-xs text-muted-foreground">R&eacute;ponse sous 72h</p>
                        </div>
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-white">Email de r&eacute;ponse</Label>
                    <Input
                        value={userEmail}
                        readOnly
                        className="bg-secondary/60 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Sujet</Label>
                    <Input
                        name="subject"
                        required
                        placeholder="Ex: Probl\u00e8me avec la g\u00e9n\u00e9ration de menu"
                        className="bg-secondary/60 border-white/10 text-white placeholder:text-muted-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Message</Label>
                    <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="D\u00e9cris ton probl\u00e8me ou ta question en d\u00e9tail..."
                        className="w-full rounded-xl bg-secondary/60 border border-white/10 text-white px-3 py-2 placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {error && (
                    <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-12 font-bold ${isPremium
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500"
                        : "bg-primary text-black hover:bg-primary/90"
                        }`}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-5 w-5" />
                    )}
                    Envoyer le message
                </Button>
            </form>
        </div>
    );
}
