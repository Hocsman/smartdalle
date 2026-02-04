"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserGoals, updateUserGoals } from "@/app/progress/actions";
import { Settings, Check, Loader2, X, Flame, Drumstick, Wheat, Droplets, Weight } from "lucide-react";

interface GoalsFormProps {
    currentGoals: UserGoals;
}

const PRESETS = [
    {
        label: "Perte de poids",
        emoji: "🔥",
        goals: { daily_calories: 1500, daily_protein: 120, daily_carbs: 150, daily_fat: 50 },
    },
    {
        label: "Maintien",
        emoji: "⚖️",
        goals: { daily_calories: 2000, daily_protein: 100, daily_carbs: 250, daily_fat: 65 },
    },
    {
        label: "Prise de masse",
        emoji: "💪",
        goals: { daily_calories: 2800, daily_protein: 150, daily_carbs: 350, daily_fat: 80 },
    },
];

export function GoalsForm({ currentGoals }: GoalsFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [calories, setCalories] = useState(currentGoals.daily_calories);
    const [protein, setProtein] = useState(currentGoals.daily_protein);
    const [carbs, setCarbs] = useState(currentGoals.daily_carbs);
    const [fat, setFat] = useState(currentGoals.daily_fat);
    const [targetWeight, setTargetWeight] = useState(currentGoals.target_weight || "");
    const [currentWeight, setCurrentWeight] = useState(currentGoals.current_weight || "");

    const handlePreset = (preset: typeof PRESETS[number]) => {
        setCalories(preset.goals.daily_calories);
        setProtein(preset.goals.daily_protein);
        setCarbs(preset.goals.daily_carbs);
        setFat(preset.goals.daily_fat);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateUserGoals({
                daily_calories: calories,
                daily_protein: protein,
                daily_carbs: carbs,
                daily_fat: fat,
                target_weight: targetWeight ? Number(targetWeight) : undefined,
                current_weight: currentWeight ? Number(currentWeight) : undefined,
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setIsOpen(false);
            }, 1500);
        } catch (error) {
            console.error("Erreur sauvegarde objectifs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-card border border-input rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-white text-sm">Mes objectifs</p>
                        <p className="text-xs text-muted-foreground">
                            {calories} kcal • {protein}g P • {carbs}g G • {fat}g L
                        </p>
                    </div>
                </div>
                <span className="text-xs text-primary font-bold">Modifier</span>
            </button>
        );
    }

    return (
        <Card className="bg-card border-input">
            <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Mes objectifs
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Presets */}
                <div>
                    <p className="text-sm text-muted-foreground mb-3">Presets rapides</p>
                    <div className="grid grid-cols-3 gap-2">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handlePreset(preset)}
                                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                                    calories === preset.goals.daily_calories
                                        ? "bg-primary/20 border-primary/50"
                                        : "bg-secondary/20 border-input hover:border-primary/30"
                                }`}
                            >
                                <span className="text-xl block mb-1">{preset.emoji}</span>
                                <span className="text-xs font-bold text-white">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calories */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Calories par jour
                    </label>
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(Number(e.target.value))}
                            min={800}
                            max={6000}
                            className="bg-background border-input text-2xl font-bold h-14 text-center"
                        />
                        <span className="text-muted-foreground font-bold whitespace-nowrap">kcal</span>
                    </div>
                    <input
                        type="range"
                        min={800}
                        max={5000}
                        step={50}
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                    />
                </div>

                {/* Macros */}
                <div className="space-y-4">
                    <p className="text-sm font-bold text-white">Macronutriments</p>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Drumstick className="h-3 w-3 text-blue-500" />
                                Protéines
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={protein}
                                    onChange={(e) => setProtein(Number(e.target.value))}
                                    min={20}
                                    max={400}
                                    className="bg-background border-input text-center font-bold pr-8"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Wheat className="h-3 w-3 text-yellow-500" />
                                Glucides
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={carbs}
                                    onChange={(e) => setCarbs(Number(e.target.value))}
                                    min={20}
                                    max={600}
                                    className="bg-background border-input text-center font-bold pr-8"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Droplets className="h-3 w-3 text-purple-500" />
                                Lipides
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={fat}
                                    onChange={(e) => setFat(Number(e.target.value))}
                                    min={10}
                                    max={300}
                                    className="bg-background border-input text-center font-bold pr-8"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
                            </div>
                        </div>
                    </div>

                    {/* Macro summary */}
                    <div className="bg-secondary/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">
                            Total macros : <span className="text-white font-bold">{protein * 4 + carbs * 4 + fat * 9} kcal</span>
                            {Math.abs((protein * 4 + carbs * 4 + fat * 9) - calories) > 100 && (
                                <span className="text-orange-400 ml-2">
                                    ({(protein * 4 + carbs * 4 + fat * 9) > calories ? "+" : ""}{(protein * 4 + carbs * 4 + fat * 9) - calories} kcal vs objectif)
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Weight Goals */}
                <div className="space-y-3">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Weight className="h-4 w-4 text-primary" />
                        Objectif poids (optionnel)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Poids actuel</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={currentWeight}
                                    onChange={(e) => setCurrentWeight(e.target.value)}
                                    placeholder="75.0"
                                    className="bg-background border-input text-center font-bold pr-8"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Objectif</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={targetWeight}
                                    onChange={(e) => setTargetWeight(e.target.value)}
                                    placeholder="70.0"
                                    className="bg-background border-input text-center font-bold pr-8"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    disabled={isLoading || calories < 800}
                    className="w-full h-12 bg-primary text-black font-bold text-lg hover:bg-primary/90 cursor-pointer"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : success ? (
                        <>
                            <Check className="mr-2 h-5 w-5" />
                            Sauvegardé !
                        </>
                    ) : (
                        "Sauvegarder"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
