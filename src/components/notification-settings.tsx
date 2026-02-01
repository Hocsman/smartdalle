"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellOff, Check, Clock, X } from "lucide-react";

const MEAL_TIMES = [
    { key: "breakfast", label: "Petit-déjeuner", emoji: "🌅", defaultTime: "08:00" },
    { key: "lunch", label: "Déjeuner", emoji: "☀️", defaultTime: "12:30" },
    { key: "dinner", label: "Dîner", emoji: "🌙", defaultTime: "19:30" },
    { key: "snack", label: "Snack", emoji: "🍎", defaultTime: "16:00" },
] as const;

interface NotificationSettingsProps {
    onClose?: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [mealReminders, setMealReminders] = useState<Record<string, { enabled: boolean; time: string }>>(() => {
        if (typeof window === "undefined") return {};
        const saved = localStorage.getItem("mealReminders");
        if (saved) return JSON.parse(saved);
        return Object.fromEntries(
            MEAL_TIMES.map((m) => [m.key, { enabled: false, time: m.defaultTime }])
        );
    });

    useEffect(() => {
        if (typeof Notification !== "undefined") {
            setPermission(Notification.permission);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("mealReminders", JSON.stringify(mealReminders));
        }
    }, [mealReminders]);

    const requestPermission = async () => {
        if (typeof Notification === "undefined") return;

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
            new Notification("SmartDalle 🔥", {
                body: "Les notifications sont activées ! Tu seras rappelé pour tes repas.",
                icon: "/icon.png",
            });
        }
    };

    const toggleMeal = (mealKey: string) => {
        setMealReminders((prev) => ({
            ...prev,
            [mealKey]: {
                ...prev[mealKey],
                enabled: !prev[mealKey]?.enabled,
            },
        }));
    };

    const updateTime = (mealKey: string, time: string) => {
        setMealReminders((prev) => ({
            ...prev,
            [mealKey]: {
                ...prev[mealKey],
                time,
            },
        }));
    };

    const enabledCount = Object.values(mealReminders).filter((m) => m.enabled).length;

    return (
        <Card className="bg-card border-input">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Rappels repas</h3>
                            <p className="text-sm text-muted-foreground">
                                {enabledCount > 0 ? `${enabledCount} rappel(s) activé(s)` : "Aucun rappel activé"}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Permission Status */}
                {permission !== "granted" && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <BellOff className="h-5 w-5 text-orange-500" />
                            <div className="flex-1">
                                <p className="text-white font-bold">Notifications désactivées</p>
                                <p className="text-sm text-muted-foreground">Active les notifications pour recevoir tes rappels</p>
                            </div>
                            <Button
                                onClick={requestPermission}
                                className="bg-primary text-black font-bold cursor-pointer"
                            >
                                Activer
                            </Button>
                        </div>
                    </div>
                )}

                {permission === "granted" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-400 text-sm font-bold">Notifications activées</span>
                    </div>
                )}

                {/* Meal Time Toggles */}
                <div className="space-y-3">
                    {MEAL_TIMES.map((meal) => (
                        <div
                            key={meal.key}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${mealReminders[meal.key]?.enabled
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-secondary/20 border-input"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{meal.emoji}</span>
                                <span className="font-bold text-white">{meal.label}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {mealReminders[meal.key]?.enabled && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="time"
                                            value={mealReminders[meal.key]?.time || meal.defaultTime}
                                            onChange={(e) => updateTime(meal.key, e.target.value)}
                                            className="bg-transparent text-white border border-input rounded px-2 py-1 text-sm focus:border-primary outline-none"
                                        />
                                    </div>
                                )}
                                <button
                                    onClick={() => toggleMeal(meal.key)}
                                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${mealReminders[meal.key]?.enabled ? "bg-primary" : "bg-secondary"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${mealReminders[meal.key]?.enabled ? "left-7" : "left-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                    Les rappels fonctionnent quand l&apos;app est ouverte en arrière-plan
                </p>
            </CardContent>
        </Card>
    );
}

// Simple notification button for header
export function NotificationButton() {
    const [showSettings, setShowSettings] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof Notification !== "undefined") {
            setPermission(Notification.permission);
        }
    }, []);

    if (showSettings) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-md">
                    <NotificationSettings onClose={() => setShowSettings(false)} />
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowSettings(true)}
            className={`flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${permission === "granted" ? "" : ""
                }`}
            title="Rappels repas"
        >
            {permission === "granted" ? (
                <Bell className="h-5 w-5 text-primary" />
            ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Rappels</span>
        </button>
    );
}
