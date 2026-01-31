"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logWeight } from "@/app/actions/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

interface WeightTrackerProps {
    logs: { date: string; weight: number }[];
}

export default function WeightTracker({ logs }: WeightTrackerProps) {
    const [weight, setWeight] = useState("");
    const [loading, setLoading] = useState(false);

    // Format data for chart
    const data = logs.map(log => ({
        name: new Date(log.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        poids: Number(log.weight)
    })).reverse(); // Supabase usually returns latest first, we want chronological for chart? Actually usually we fetch desc for list, need asc for chart.
    // Let's ensure chronological order for chart
    const chartData = [...data].reverse();

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

    return (
        <div className="space-y-8">
            {/* Chart Section */}
            <div className="bg-card/50 border border-input rounded-xl p-6 h-[300px] w-full relative">
                <h3 className="absolute top-4 left-6 text-sm text-muted-foreground uppercase font-bold tracking-widest">Évolution</h3>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFD300" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#FFD300" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                            <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#FFD300' }}
                            />
                            <Area type="monotone" dataKey="poids" stroke="#FFD300" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Pas encore de données. Pèse-toi !
                    </div>
                )}
            </div>

            {/* Input Section */}
            <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-card border border-input p-6 rounded-xl">
                <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-white">Poids du jour (kg)</label>
                    <Input
                        type="number"
                        step="0.1"
                        placeholder="ex: 75.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="text-2xl font-bold h-14 bg-background border-input focus:border-primary"
                    />
                </div>
                <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="h-14 px-8 bg-primary text-black font-bold text-lg hover:bg-primary/90"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Valider"}
                </Button>
            </form>

            {/* Recent Logs List */}
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Historique</h3>
                {logs.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-card/30 rounded-lg border border-transparent hover:border-input transition-colors">
                        <span className="text-muted-foreground">{new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}</span>
                        <span className="text-xl font-bold text-white">{log.weight} kg</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
