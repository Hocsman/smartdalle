"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

interface CookingTimerProps {
    defaultMinutes?: number;
}

export function CookingTimer({ defaultMinutes = 15 }: CookingTimerProps) {
    const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [initialSeconds] = useState(defaultMinutes * 60);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning && totalSeconds > 0) {
            interval = setInterval(() => {
                setTotalSeconds((prev) => prev - 1);
            }, 1000);
        } else if (totalSeconds === 0 && isRunning) {
            setIsRunning(false);
            // Play notification sound or vibrate
            if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
            // Browser notification
            if (Notification.permission === "granted") {
                new Notification("SmartDalle ⏰", {
                    body: "C'est prêt ! Ta recette est terminée 🔥",
                    icon: "/icon.png"
                });
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, totalSeconds]);

    const toggleTimer = useCallback(() => {
        // Request notification permission on first start
        if (!isRunning && Notification.permission === "default") {
            Notification.requestPermission();
        }
        setIsRunning(!isRunning);
    }, [isRunning]);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTotalSeconds(initialSeconds);
    }, [initialSeconds]);

    const adjustTime = useCallback((minutes: number) => {
        setTotalSeconds((prev) => Math.max(0, prev + minutes * 60));
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = ((initialSeconds - totalSeconds) / initialSeconds) * 100;

    return (
        <Card className="bg-card border-input overflow-hidden">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-white">
                    <Timer className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">Timer de cuisson</h3>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Time display */}
                <div className="text-center">
                    <span className={`text-5xl font-black tabular-nums ${totalSeconds === 0 ? "text-green-400 animate-pulse" : "text-white"}`}>
                        {formatTime(totalSeconds)}
                    </span>
                    {totalSeconds === 0 && (
                        <p className="text-green-400 font-bold mt-2">C&apos;est prêt ! 🔥</p>
                    )}
                </div>

                {/* Quick adjust buttons */}
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime(-5)}
                        disabled={totalSeconds < 300}
                        className="text-xs cursor-pointer"
                    >
                        -5 min
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime(-1)}
                        disabled={totalSeconds < 60}
                        className="text-xs cursor-pointer"
                    >
                        -1 min
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime(1)}
                        className="text-xs cursor-pointer"
                    >
                        +1 min
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustTime(5)}
                        className="text-xs cursor-pointer"
                    >
                        +5 min
                    </Button>
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={toggleTimer}
                        className={`font-bold px-8 cursor-pointer ${isRunning ? "bg-orange-500 hover:bg-orange-600" : "bg-primary text-black hover:bg-primary/90"}`}
                    >
                        {isRunning ? (
                            <>
                                <Pause className="mr-2 h-4 w-4" /> Pause
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" /> {totalSeconds === 0 ? "Terminé" : "Start"}
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={resetTimer}
                        className="cursor-pointer"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
