"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { NutritionLog } from "@/app/progress/actions";

interface CalorieChartProps {
    data: NutritionLog[];
    goalCalories: number;
}

export function CalorieChart({ data, goalCalories }: CalorieChartProps) {
    // Formater les données pour le graphique
    const chartData = data.map((log) => {
        const date = new Date(log.date);
        return {
            date: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
            calories: log.calories_consumed,
            goal: goalCalories,
            percentage: Math.round((log.calories_consumed / goalCalories) * 100),
        };
    });

    // Si pas de données, afficher des données vides pour les 7 derniers jours
    if (chartData.length === 0) {
        const emptyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            emptyData.push({
                date: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
                calories: 0,
                goal: goalCalories,
                percentage: 0,
            });
        }
        return (
            <div className="w-full h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                <p>Commence à tracker tes repas pour voir ta progression !</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: "#888", fontSize: 12 }}
                        axisLine={{ stroke: "#333" }}
                    />
                    <YAxis
                        tick={{ fill: "#888", fontSize: 12 }}
                        axisLine={{ stroke: "#333" }}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        itemStyle={{ color: "#22c55e" }}
                        formatter={(value: number) => [`${value} kcal`, "Calories"]}
                    />
                    <ReferenceLine
                        y={goalCalories}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        label={{ value: "Objectif", fill: "#f59e0b", fontSize: 12 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#colorCalories)"
                        dot={{ fill: "#22c55e", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#22c55e" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
