"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellOff, Check, Clock, X, Loader2, Send } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { sendTestNotification, updateNotificationPreferences } from "@/app/api/push/actions";

const MEAL_TIMES = [
    { key: "breakfast", label: "Petit-déjeuner", emoji: "🌅", defaultTime: "08:00", dbField: "breakfast_time" },
    { key: "lunch", label: "Déjeuner", emoji: "☀️", defaultTime: "12:30", dbField: "lunch_time" },
    { key: "dinner", label: "Dîner", emoji: "🌙", defaultTime: "19:30", dbField: "dinner_time" },
    { key: "snack", label: "Snack", emoji: "🍎", defaultTime: "16:00", dbField: "snack_time" },
] as const;

interface NotificationSettingsProps {
    onClose?: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
    const {
        isSupported,
        isLoading: isPushLoading,
        isSubscribed,
        subscribe,
        unsubscribe,
        error: pushError,
    } = usePushNotifications();

    const [mealReminders, setMealReminders] = useState<Record<string, { enabled: boolean; time: string }>>(() => {
        if (typeof window === "undefined") return {};
        const saved = localStorage.getItem("mealReminders");
        if (saved) return JSON.parse(saved);
        return Object.fromEntries(
            MEAL_TIMES.map((m) => [m.key, { enabled: false, time: m.defaultTime }])
        );
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testSuccess, setTestSuccess] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");

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

    const handleSubscribe = async () => {
        const success = await subscribe();
        if (success) {
            setPermission("granted");
        }
    };

    const handleUnsubscribe = async () => {
        await unsubscribe();
    };

    const toggleMeal = async (mealKey: string) => {
        const newState = {
            ...mealReminders,
            [mealKey]: {
                ...mealReminders[mealKey],
                enabled: !mealReminders[mealKey]?.enabled,
            },
        };
        setMealReminders(newState);

        // Save to database if subscribed
        if (isSubscribed) {
            setIsSaving(true);
            try {
                await updateNotificationPreferences({
                    notify_meals: Object.values(newState).some(m => m.enabled),
                });
            } catch {
                console.error("Erreur sauvegarde");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const updateTime = async (mealKey: string, time: string) => {
        setMealReminders((prev) => ({
            ...prev,
            [mealKey]: {
                ...prev[mealKey],
                time,
            },
        }));

        // Save to database if subscribed
        if (isSubscribed) {
            const meal = MEAL_TIMES.find(m => m.key === mealKey);
            if (meal) {
                try {
                    await updateNotificationPreferences({
                        [meal.dbField]: time,
                    });
                } catch {
                    console.error("Erreur sauvegarde horaire");
                }
            }
        }
    };

    const handleTestNotification = async () => {
        setIsTesting(true);
        setTestSuccess(false);
        try {
            await sendTestNotification();
            setTestSuccess(true);
            setTimeout(() => setTestSuccess(false), 3000);
        } catch {
            console.error("Erreur test notification");
        } finally {
            setIsTesting(false);
        }
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
                            <h3 className="text-lg font-bold text-white">Notifications Push</h3>
                            <p className="text-sm text-muted-foreground">
                                {isSubscribed
                                    ? `${enabledCount} rappel(s) activé(s)`
                                    : "Active les notifications"}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Support Check */}
                {!isSupported && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">
                            Ton navigateur ne supporte pas les notifications push.
                            Essaie avec Chrome, Firefox, ou Edge.
                        </p>
                    </div>
                )}

                {/* Push Error */}
                {pushError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{pushError}</p>
                    </div>
                )}

                {/* Push Subscription Status */}
                {isSupported && !isSubscribed && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <BellOff className="h-5 w-5 text-orange-500" />
                            <div className="flex-1">
                                <p className="text-white font-bold">Notifications désactivées</p>
                                <p className="text-sm text-muted-foreground">
                                    Active les push pour recevoir tes rappels même quand l&apos;app est fermée
                                </p>
                            </div>
                            <Button
                                onClick={handleSubscribe}
                                disabled={isPushLoading}
                                className="bg-primary text-black font-bold cursor-pointer"
                            >
                                {isPushLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Activer"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {isSubscribed && (
                    <>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-green-400 text-sm font-bold">Push activées</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleTestNotification}
                                    disabled={isTesting}
                                    className="text-xs cursor-pointer"
                                >
                                    {isTesting ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : testSuccess ? (
                                        <Check className="h-3 w-3 mr-1 text-green-500" />
                                    ) : (
                                        <Send className="h-3 w-3 mr-1" />
                                    )}
                                    {testSuccess ? "Envoyé !" : "Tester"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleUnsubscribe}
                                    disabled={isPushLoading}
                                    className="text-xs text-muted-foreground hover:text-red-400 cursor-pointer"
                                >
                                    Désactiver
                                </Button>
                            </div>
                        </div>

                        {/* Meal Time Toggles */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                Rappels de repas
                                {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                            </h4>
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
                    </>
                )}

                {!isSubscribed && permission === "denied" && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">
                            Les notifications sont bloquées. Va dans les paramètres de ton navigateur pour les autoriser.
                        </p>
                    </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                    {isSubscribed
                        ? "Tu recevras tes rappels même quand l'app est fermée"
                        : "Les notifications push fonctionnent en arrière-plan"}
                </p>
            </CardContent>
        </Card>
    );
}

// Simple notification button for header
export function NotificationButton() {
    const [showSettings, setShowSettings] = useState(false);
    const { isSubscribed, isSupported } = usePushNotifications();

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
            className="flex flex-col items-center bg-card border border-input p-2 rounded-lg cursor-pointer hover:border-primary transition-colors min-w-[60px]"
            title="Notifications Push"
        >
            {isSubscribed ? (
                <Bell className="h-5 w-5 text-primary" />
            ) : (
                <BellOff className={`h-5 w-5 ${isSupported ? "text-orange-500" : "text-muted-foreground"}`} />
            )}
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Rappels</span>
        </button>
    );
}
