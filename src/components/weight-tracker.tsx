"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { logWeight } from "@/app/actions/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingDown, TrendingUp, Minus, Target, Scale, Flame, Trophy, Trash2 } from "lucide-react";

interface WeightLog {
    id?: string;
    date: string;
    weight: number;
}

interface WeightTrackerProps {
    logs: WeightLog[];
    targetWeight?: number;
}

export default function WeightTracker({ logs, targetWeight }: WeightTrackerProps) {
    const [weight, setWeight] = useState("");
    const [loading, setLoading] = useState(false);

    // Format data for chart (chronological order)
    const chartData = [...logs].reverse().map(log => ({
        name: new Date(log.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        poids: Number(log.weight),
        date: log.date,
    }));

    // Calculate statistics
    const currentWeight = logs[0]?.weight || 0;
    const initialWeight = logs[logs.length - 1]?.weight || 0;
    const totalChange = currentWeight - initialWeight;

    // Week comparison
    const weekAgoDate = new Date();
    weekAgoDate.setDate(weekAgoDate.getDate() - 7);
    const weekAgoLog = logs.find(log => new Date(log.date) <= weekAgoDate);
    const weekChange = weekAgoLog ? currentWeight - weekAgoLog.weight : 0;

    // Goal progress (assuming goal is to lose weight for now)
    const goalWeight = targetWeight || (initialWeight > 0 ? initialWeight - 5 : 70); // Default: lose 5kg
    const progressToGoal = initialWeight > 0
        ? Math.min(100, Math.max(0, ((initialWeight - currentWeight) / (initialWeight - goalWeight)) * 100))
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;
        setLoading(true);
        try {
            await logWeight(parseFloat(weight));
            setWeight("");
        } catch (e) {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    // Get trend icon and color
    const getTrend = (change: number) => {
        if (change < -0.1) return { icon: TrendingDown, color: "text-green-400", label: "En baisse" };
        if (change > 0.1) return { icon: TrendingUp, color: "text-orange-400", label: "En hausse" };
        return { icon: Minus, color: "text-muted-foreground", label: "Stable" };
    };

    const trend = getTrend(weekChange);
    const TrendIcon = trend.icon;

    // Motivation message based on progress
    const getMotivation = () => {
        if (logs.length === 0) return "Commence à tracker ton poids !";
        if (logs.length === 1) return "Premier log ! Continue comme ça 💪";
        if (totalChange < -2) return "Incroyable progression ! Tu gères 🔥";
        if (totalChange < 0) return "Tu es sur la bonne voie ! 👊";
        if (totalChange === 0) return "Stabilité parfaite ! 💫";
        return "Garde le cap, ça va payer ! 💪";
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-input">
                    <CardContent className="p-4 text-center">
                        <Scale className="h-5 w-5 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-black text-white">{currentWeight || "--"}</p>
                        <p className="text-xs text-muted-foreground uppercase">Actuel (kg)</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-input">
                    <CardContent className="p-4 text-center">
                        <TrendIcon className={`h-5 w-5 mx-auto mb-2 ${trend.color}`} />
                        <p className={`text-2xl font-black ${weekChange <= 0 ? "text-green-400" : "text-orange-400"}`}>
                            {weekChange > 0 ? "+" : ""}{weekChange.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">Cette semaine</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-input">
                    <CardContent className="p-4 text-center">
                        <Trophy className={`h-5 w-5 mx-auto mb-2 ${totalChange <= 0 ? "text-green-400" : "text-orange-400"}`} />
                        <p className={`text-2xl font-black ${totalChange <= 0 ? "text-green-400" : "text-orange-400"}`}>
                            {totalChange > 0 ? "+" : ""}{totalChange.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">Total</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-input">
                    <CardContent className="p-4 text-center">
                        <Flame className="h-5 w-5 mx-auto text-orange-500 mb-2" />
                        <p className="text-2xl font-black text-white">{logs.length}</p>
                        <p className="text-xs text-muted-foreground uppercase">Pesées</p>
                    </CardContent>
                </Card>
            </div>

            {/* Goal Progress */}
            {logs.length > 0 && (
                <Card className="bg-card border-input overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                <span className="font-bold text-white">Objectif : {goalWeight} kg</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {progressToGoal.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${progressToGoal >= 100 ? "bg-green-500" : "bg-primary"}`}
                                style={{ width: `${Math.min(100, progressToGoal)}%` }}
                            />
                        </div>
                        <p className="mt-3 text-center text-sm font-bold text-muted-foreground">
                            {getMotivation()}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Chart Section */}
            <Card className="bg-card border-input">
                <CardContent className="p-6 h-[280px]">
                    <h3 className="text-sm text-muted-foreground uppercase font-bold tracking-widest mb-4">
                        📈 Évolution
                    </h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFD300" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#FFD300" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#666', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    hide
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid #333',
                                        borderRadius: '12px',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: '#FFD300' }}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="poids"
                                    stroke="#FFD300"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorWeight)"
                                    dot={{ fill: '#FFD300', strokeWidth: 0, r: 4 }}
                                    activeDot={{ fill: '#FFD300', strokeWidth: 2, stroke: '#fff', r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center">
                                <Scale className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>Pas encore de données</p>
                                <p className="text-sm">Pèse-toi pour commencer !</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Input Section */}
            <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-card border border-input p-6 rounded-xl">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Scale className="h-4 w-4 text-primary" />
                        Poids du jour (kg)
                    </label>
                    <Input
                        type="number"
                        step="0.1"
                        min="30"
                        max="300"
                        placeholder="ex: 75.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="text-2xl font-bold h-14 bg-background border-input focus:border-primary"
                    />
                </div>
                <Button
                    type="submit"
                    size="lg"
                    disabled={loading || !weight}
                    className="h-14 px-8 bg-primary text-black font-bold text-lg hover:bg-primary/90 cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "✓ Valider"}
                </Button>
            </form>

            {/* Recent Logs List */}
            {logs.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        📋 Historique
                        <span className="text-sm font-normal text-muted-foreground">
                            ({logs.length} entrées)
                        </span>
                    </h3>
                    <div className="space-y-2">
                        {logs.slice(0, 7).map((log, i) => {
                            const prevLog = logs[i + 1];
                            const diff = prevLog ? log.weight - prevLog.weight : 0;
                            const isToday = log.date === new Date().toISOString().split("T")[0];

                            return (
                                <div
                                    key={log.id || i}
                                    className={`flex justify-between items-center p-4 rounded-lg border transition-colors ${isToday
                                        ? "bg-primary/10 border-primary/30"
                                        : "bg-card/30 border-transparent hover:border-input"
                                        }`}
                                >
                                    <div>
                                        <span className="text-white font-medium capitalize">
                                            {new Date(log.date).toLocaleDateString('fr-FR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                        {isToday && (
                                            <span className="ml-2 text-xs bg-primary text-black px-2 py-0.5 rounded-full font-bold">
                                                Aujourd'hui
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {prevLog && (
                                            <span className={`text-sm font-bold ${diff < 0 ? "text-green-400" : diff > 0 ? "text-orange-400" : "text-muted-foreground"
                                                }`}>
                                                {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                                            </span>
                                        )}
                                        <span className="text-xl font-black text-white">{log.weight} kg</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
