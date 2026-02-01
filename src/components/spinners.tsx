"use client";

import { Loader2 } from "lucide-react";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-10 w-10"
    };

    return (
        <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
    );
}

export function FullPageSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center gradient-bg">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    {/* Spinner */}
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">
                    Chargement...
                </p>
            </div>
        </div>
    );
}

export function AISpinner() {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                {/* Outer pulse */}
                <div className="absolute inset-[-8px] rounded-full bg-primary/10 animate-pulse" />
                {/* Middle glow */}
                <div className="absolute inset-[-4px] rounded-full bg-primary/20 animate-ping" />
                {/* Core spinner */}
                <div className="relative w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-white font-bold">Le Chef réfléchit...</p>
                <p className="text-muted-foreground text-sm">Génération de ta recette IA</p>
            </div>
        </div>
    );
}
