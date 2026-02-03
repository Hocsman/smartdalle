"use client";

interface MacroBarProps {
    label: string;
    value: number;
    max: number;
    color: string;
    unit?: string;
}

function MacroBar({ label, value, max, color, unit = "g" }: MacroBarProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const isOver = value > max;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-medium ${isOver ? "text-red-400" : "text-white"}`}>
                    {value} / {max}{unit}
                </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: isOver ? "#ef4444" : color,
                    }}
                />
            </div>
        </div>
    );
}

interface MacroBarsProps {
    protein: { consumed: number; goal: number };
    carbs: { consumed: number; goal: number };
    fat: { consumed: number; goal: number };
}

export function MacroBars({ protein, carbs, fat }: MacroBarsProps) {
    return (
        <div className="space-y-4">
            <MacroBar
                label="Protéines"
                value={protein.consumed}
                max={protein.goal}
                color="#3b82f6"
            />
            <MacroBar
                label="Glucides"
                value={carbs.consumed}
                max={carbs.goal}
                color="#f59e0b"
            />
            <MacroBar
                label="Lipides"
                value={fat.consumed}
                max={fat.goal}
                color="#8b5cf6"
            />
        </div>
    );
}
