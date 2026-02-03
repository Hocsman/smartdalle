"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Flame } from "lucide-react";
import WeightTracker from "@/components/weight-tracker";
import { CalorieDashboard } from "@/components/progress/calorie-dashboard";
import { NutritionLog, UserGoals } from "./actions";

interface WeightLog {
    id?: string;
    date: string;
    weight: number;
}

interface ProgressTabsProps {
    weightLogs: WeightLog[];
    nutritionLogs: NutritionLog[];
    todayLog: NutritionLog | null;
    goals: UserGoals;
    streak: number;
}

export function ProgressTabs({ weightLogs, nutritionLogs, todayLog, goals, streak }: ProgressTabsProps) {
    const [activeTab, setActiveTab] = useState("calories");

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-card border border-input h-14 p-1 rounded-xl mb-6">
                <TabsTrigger
                    value="calories"
                    className="flex items-center gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-full transition-all"
                >
                    <Flame className="h-4 w-4" />
                    Calories
                </TabsTrigger>
                <TabsTrigger
                    value="weight"
                    className="flex items-center gap-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-black rounded-lg h-full transition-all"
                >
                    <Scale className="h-4 w-4" />
                    Poids
                </TabsTrigger>
            </TabsList>

            <TabsContent value="calories" className="mt-0">
                <CalorieDashboard
                    weeklyLogs={nutritionLogs}
                    todayLog={todayLog}
                    goals={goals}
                    streak={streak}
                />
            </TabsContent>

            <TabsContent value="weight" className="mt-0">
                <WeightTracker logs={weightLogs} />
            </TabsContent>
        </Tabs>
    );
}
