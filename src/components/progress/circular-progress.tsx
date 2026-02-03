"use client";

interface CircularProgressProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label: string;
    unit?: string;
}

export function CircularProgress({
    value,
    max,
    size = 120,
    strokeWidth = 10,
    color = "#22c55e",
    label,
    unit = "g",
}: CircularProgressProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // Couleur dynamique selon le pourcentage
    const getColor = () => {
        if (percentage > 100) return "#ef4444"; // Rouge si dépassé
        if (percentage >= 80) return "#22c55e"; // Vert si proche
        if (percentage >= 50) return "#f59e0b"; // Orange si moyen
        return "#6b7280"; // Gris si bas
    };

    const dynamicColor = color === "#22c55e" ? getColor() : color;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background circle */}
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#333"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={dynamicColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-500 ease-out"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">{value}</span>
                    <span className="text-xs text-muted-foreground">/ {max}{unit}</span>
                </div>
            </div>
            <span className="text-sm font-medium text-white">{label}</span>
        </div>
    );
}
