"use client";

import { NutritionLog, UserGoals, MealLog } from "@/app/progress/actions";
import { CalorieChart } from "./calorie-chart";
import { CircularProgress } from "./circular-progress";
import { MacroBars } from "./macro-bars";
import { MealsList } from "./meals-list";
import { StreakDisplay } from "./streak-display";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, TrendingUp, Target } from "lucide-react";

interface CalorieDashboardProps {
    weeklyLogs: NutritionLog[];
    todayLog: NutritionLog | null;
    goals: UserGoals;
    streak: number;
}

export function CalorieDashboard({ weeklyLogs, todayLog, goals, streak }: CalorieDashboardProps) {
    // Données d'aujourd'hui (ou valeurs par défaut)
    const today = {
        calories: todayLog?.calories_consumed || 0,
        protein: todayLog?.protein_consumed || 0,
        carbs: todayLog?.carbs_consumed || 0,
        fat: todayLog?.fat_consumed || 0,
        meals: (todayLog?.meals_logged as MealLog[]) || [],
    };

    const caloriePercentage = Math.round((today.calories / goals.daily_calories) * 100);

    return (
        <div className="space-y-6">
            {/* Streak Display */}
            <StreakDisplay streak={streak} />

            {/* Today's Summary */}
            <Card className="bg-card border-input">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-white">Aujourd'hui</h3>
                        <span className="ml-auto text-sm text-muted-foreground">
                            {caloriePercentage}% de l'objectif
                        </span>
                    </div>

                    {/* Circular Progress for Calories */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <CircularProgress
                            value={today.calories}
                            max={goals.daily_calories}
                            size={160}
                            strokeWidth={12}
                            label="Calories"
                            unit=" kcal"
                        />

                        {/* Macro Bars */}
                        <div className="flex-1 w-full">
                            <MacroBars
                                protein={{ consumed: today.protein, goal: goals.daily_protein }}
                                carbs={{ consumed: today.carbs, goal: goals.daily_carbs }}
                                fat={{ consumed: today.fat, goal: goals.daily_fat }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Progress Chart */}
            <Card className="bg-card border-input">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-white">Progression Hebdomadaire</h3>
                    </div>
                    <CalorieChart data={weeklyLogs} goalCalories={goals.daily_calories} />
                </CardContent>
            </Card>

            {/* Today's Meals */}
            <Card className="bg-card border-input">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Utensils className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-white">Repas du jour</h3>
                        <span className="ml-auto text-sm text-muted-foreground">
                            {today.meals.length} repas
                        </span>
                    </div>
                    <MealsList meals={today.meals} />
                </CardContent>
            </Card>

            {/* Info Card */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                <p className="text-sm text-primary">
                    Pour ajouter un repas, va sur une recette et clique sur <strong>"Ajouter au suivi"</strong>
                </p>
            </div>
        </div>
    );
}
