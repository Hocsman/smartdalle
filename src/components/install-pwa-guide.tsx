"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Share, MoreVertical, Plus, Check } from "lucide-react";

type DeviceType = "ios" | "android" | "desktop";

function getDeviceType(): DeviceType {
    if (typeof navigator === "undefined") return "desktop";
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    return "desktop";
}

function isStandalone(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
}

interface InstallGuideProps {
    onClose: () => void;
}

function InstallGuide({ onClose }: InstallGuideProps) {
    const device = getDeviceType();

    return (
        <Card className="bg-card border-input">
            <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Download className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Installer SmartDalle</h3>
                            <p className="text-sm text-muted-foreground">Ajouter sur ton écran d'accueil</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Benefits */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-bold text-primary">Pourquoi installer ?</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Accès rapide depuis l'écran d'accueil</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Mode plein écran sans barre de navigateur</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Notifications push pour tes rappels repas</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Fonctionne hors ligne</li>
                    </ul>
                </div>

                {/* iOS Instructions */}
                {(device === "ios" || device === "desktop") && (
                    <div className="space-y-4">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <span className="text-xl">🍎</span> iPhone / iPad
                        </h4>
                        <div className="space-y-3">
                            <Step
                                number={1}
                                icon={<Share className="h-4 w-4" />}
                                title="Ouvrir dans Safari"
                                description="SmartDalle doit être ouvert dans Safari (pas Chrome)"
                            />
                            <Step
                                number={2}
                                icon={<Share className="h-4 w-4" />}
                                title="Appuyer sur Partager"
                                description="L'icône en bas de l'écran (carré avec une flèche vers le haut)"
                            />
                            <Step
                                number={3}
                                icon={<Plus className="h-4 w-4" />}
                                title={`"Sur l'écran d'accueil"`}
                                description="Faire défiler et appuyer sur cette option"
                            />
                            <Step
                                number={4}
                                icon={<Check className="h-4 w-4" />}
                                title="Confirmer"
                                description={`Appuyer sur "Ajouter" en haut à droite`}
                            />
                        </div>
                    </div>
                )}

                {/* Separator */}
                {device === "desktop" && (
                    <div className="border-t border-input" />
                )}

                {/* Android Instructions */}
                {(device === "android" || device === "desktop") && (
                    <div className="space-y-4">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <span className="text-xl">🤖</span> Android
                        </h4>
                        <div className="space-y-3">
                            <Step
                                number={1}
                                icon={<MoreVertical className="h-4 w-4" />}
                                title="Ouvrir dans Chrome"
                                description="SmartDalle doit être ouvert dans Chrome"
                            />
                            <Step
                                number={2}
                                icon={<MoreVertical className="h-4 w-4" />}
                                title="Menu (3 points)"
                                description="Appuyer sur les 3 points en haut à droite"
                            />
                            <Step
                                number={3}
                                icon={<Download className="h-4 w-4" />}
                                title={`"Ajouter à l'écran d'accueil"`}
                                description="Ou bien 'Installer l'application'"
                            />
                            <Step
                                number={4}
                                icon={<Check className="h-4 w-4" />}
                                title="Confirmer"
                                description={`Appuyer sur "Installer" ou "Ajouter"`}
                            />
                        </div>
                    </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                    Une fois installé, SmartDalle apparaitra comme une app native !
                </p>
            </CardContent>
        </Card>
    );
}

function Step({ number, icon, title, description }: {
    number: number;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">{number}</span>
            </div>
            <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                    {icon} {title}
                </p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

// Header button
export function InstallPWAButton() {
    const [showGuide, setShowGuide] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        setIsInstalled(isStandalone());
    }, []);

    // Don't show if already installed
    if (isInstalled) return null;

    if (showGuide) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <InstallGuide onClose={() => setShowGuide(false)} />
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowGuide(true)}
            className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]"
            title="Installer l'app"
        >
            <Download className="h-5 w-5 text-primary" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Installer</span>
        </button>
    );
}
