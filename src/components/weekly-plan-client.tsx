"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Calendar,
    Flame,
    Euro,
    Loader2,
    Plus,
    X,
    GripVertical,
} from "lucide-react";
import { generateWeeklyPlan, getWeeklyPlans, updateMealSlot, swapMeals } from "@/app/planning/actions";
import Link from "next/link";

interface Recipe {
    id: string;
    name: string;
    calories: number;
    protein: number;
    price_estimated: number;
    image_url: string | null;
    culture?: string;
}

interface DayPlan {
    date: string;
    planId: string | null;
    breakfast: Recipe | null;
    lunch: Recipe | null;
    dinner: Recipe | null;
    snack: Recipe | null;
}

interface WeeklyPlanClientProps {
    initialPlans: DayPlan[];
    initialWeekStart: string;
    initialWeekDates: string[];
    allRecipes: Recipe[];
    isPremium: boolean;
}

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_FULL_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MEALS = [
    { key: "breakfast" as const, label: "Petit-dej", emoji: "🌅" },
    { key: "lunch" as const, label: "Dejeuner", emoji: "☀️" },
    { key: "dinner" as const, label: "Diner", emoji: "🌙" },
    { key: "snack" as const, label: "Snack", emoji: "🍎" },
];

export function WeeklyPlanClient({
    initialPlans,
    initialWeekStart,
    initialWeekDates,
    allRecipes,
    isPremium,
}: WeeklyPlanClientProps) {
    const [plans, setPlans] = useState<DayPlan[]>(initialPlans);
    const [weekStart, setWeekStart] = useState(initialWeekStart);
    const [weekDates, setWeekDates] = useState(initialWeekDates);
    const [weekOffset, setWeekOffset] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; slot: string } | null>(null);
    const [draggedMeal, setDraggedMeal] = useState<{ date: string; slot: string; recipe: Recipe } | null>(null);

    // Calculate week totals
    const weekTotals = plans.reduce(
        (acc, day) => {
            const meals = [day.breakfast, day.lunch, day.dinner, day.snack].filter(Boolean) as Recipe[];
            meals.forEach(meal => {
                acc.calories += meal.calories || 0;
                acc.protein += meal.protein || 0;
                acc.price += meal.price_estimated || 0;
            });
            return acc;
        },
        { calories: 0, protein: 0, price: 0 }
    );

    const navigateWeek = async (direction: number) => {
        const newOffset = weekOffset + direction;
        setWeekOffset(newOffset);

        startTransition(async () => {
            const result = await getWeeklyPlans(newOffset);
            setPlans(result.plans);
            setWeekStart(result.weekStart);
            setWeekDates(result.weekDates);
        });
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generateWeeklyPlan();
            // Refresh data
            const result = await getWeeklyPlans(weekOffset);
            setPlans(result.plans);
        } catch (error) {
            console.error("Error generating weekly plan:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectRecipe = async (recipeId: string) => {
        if (!selectedSlot) return;

        startTransition(async () => {
            try {
                await updateMealSlot(selectedSlot.date, selectedSlot.slot as "breakfast" | "lunch" | "dinner" | "snack", recipeId);
                const result = await getWeeklyPlans(weekOffset);
                setPlans(result.plans);
                setSelectedSlot(null);
            } catch (error) {
                console.error("Error adding meal:", error);
                alert("Erreur lors de l'ajout du repas. Veuillez reessayer.");
            }
        });
    };

    const handleRemoveMeal = async (date: string, slot: string) => {
        startTransition(async () => {
            await updateMealSlot(date, slot as "breakfast" | "lunch" | "dinner" | "snack", null);
            const result = await getWeeklyPlans(weekOffset);
            setPlans(result.plans);
        });
    };

    const handleDragStart = (date: string, slot: string, recipe: Recipe) => {
        setDraggedMeal({ date, slot, recipe });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (targetDate: string, targetSlot: string) => {
        if (!draggedMeal) return;
        if (draggedMeal.date === targetDate && draggedMeal.slot === targetSlot) {
            setDraggedMeal(null);
            return;
        }

        startTransition(async () => {
            await swapMeals(draggedMeal.date, draggedMeal.slot, targetDate, targetSlot);
            const result = await getWeeklyPlans(weekOffset);
            setPlans(result.plans);
            setDraggedMeal(null);
        });
    };

    // Format date range for header
    const formatDateRange = () => {
        if (weekDates.length < 7) return "";
        const start = new Date(weekDates[0]);
        const end = new Date(weekDates[6]);
        const startStr = start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        const endStr = end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        return `${startStr} - ${endStr}`;
    };

    const isToday = (date: string) => {
        return date === new Date().toISOString().split("T")[0];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                        <Calendar className="h-7 w-7 text-primary" />
                        Planning Semaine
                    </h1>
                    <p className="text-muted-foreground mt-1">{formatDateRange()}</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Week Navigation */}
                    <div className="flex items-center gap-1 bg-card/50 rounded-lg p-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigateWeek(-1)}
                            disabled={isPending}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setWeekOffset(0);
                                startTransition(async () => {
                                    const result = await getWeeklyPlans(0);
                                    setPlans(result.plans);
                                    setWeekStart(result.weekStart);
                                    setWeekDates(result.weekDates);
                                });
                            }}
                            disabled={weekOffset === 0 || isPending}
                            className="text-xs"
                        >
                            Auj.
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigateWeek(1)}
                            disabled={isPending}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || isPending}
                        className="bg-primary text-black font-bold hover:bg-primary/90"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Generer la semaine
                    </Button>
                </div>
            </header>

            {/* Week Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-card/40 border border-input rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-orange-400">
                        <Flame className="h-5 w-5" />
                        <span className="text-2xl font-black">{Math.round(weekTotals.calories / 7)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">kcal/jour moy.</p>
                </div>
                <div className="bg-card/40 border border-input rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <span className="text-lg font-black">P</span>
                        <span className="text-2xl font-black">{Math.round(weekTotals.protein / 7)}g</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">prot/jour moy.</p>
                </div>
                <div className="bg-card/40 border border-input rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-green-400">
                        <Euro className="h-5 w-5" />
                        <span className="text-2xl font-black">{weekTotals.price.toFixed(0)}€</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">budget semaine</p>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto -mx-4 px-4">
                <div className="min-w-[800px]">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDates.map((date, idx) => {
                            const d = new Date(date);
                            const dayNum = d.getDate();
                            const today = isToday(date);

                            return (
                                <div
                                    key={date}
                                    className={`text-center p-2 rounded-lg ${
                                        today ? "bg-primary/20 border border-primary/50" : "bg-card/30"
                                    }`}
                                >
                                    <p className={`text-xs font-bold uppercase ${today ? "text-primary" : "text-muted-foreground"}`}>
                                        {DAYS_FR[idx]}
                                    </p>
                                    <p className={`text-lg font-black ${today ? "text-primary" : "text-white"}`}>
                                        {dayNum}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Meal Rows */}
                    {MEALS.map(meal => (
                        <div key={meal.key} className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">{meal.emoji}</span>
                                <span className="text-xs font-bold text-muted-foreground uppercase">{meal.label}</span>
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {plans.map((day, idx) => {
                                    const recipe = day[meal.key];

                                    return (
                                        <div
                                            key={`${day.date}-${meal.key}`}
                                            className={`relative min-h-[80px] rounded-lg border transition-all ${
                                                recipe
                                                    ? "bg-card/60 border-input hover:border-primary/50"
                                                    : "bg-card/20 border-dashed border-input/50 hover:border-primary/30"
                                            } ${draggedMeal ? "cursor-copy" : ""}`}
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDrop(day.date, meal.key)}
                                        >
                                            {recipe ? (
                                                <div
                                                    draggable
                                                    onDragStart={() => handleDragStart(day.date, meal.key, recipe)}
                                                    className="p-2 h-full cursor-grab active:cursor-grabbing"
                                                >
                                                    <div className="flex items-start justify-between gap-1">
                                                        <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0 mt-0.5" />
                                                        <button
                                                            onClick={() => handleRemoveMeal(day.date, meal.key)}
                                                            className="p-0.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <Link href={`/recipes/${recipe.id}`}>
                                                        <p className="text-xs font-semibold text-white line-clamp-2 hover:text-primary transition-colors">
                                                            {recipe.name}
                                                        </p>
                                                    </Link>
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                                        <span>{recipe.calories}kcal</span>
                                                        <span>|</span>
                                                        <span>{recipe.protein}g</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedSlot({ date: day.date, slot: meal.key })}
                                                    className="w-full h-full flex items-center justify-center p-2 group cursor-pointer"
                                                >
                                                    <Plus className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recipe Picker Modal */}
            {selectedSlot && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSelectedSlot(null)}
                    />
                    <div className="relative w-full sm:w-[480px] max-h-[70vh] bg-card border border-input rounded-t-3xl sm:rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-input flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">Choisir une recette</h3>
                                <p className="text-xs text-muted-foreground">
                                    {DAYS_FULL_FR[weekDates.indexOf(selectedSlot.date)]} - {MEALS.find(m => m.key === selectedSlot.slot)?.label}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedSlot(null)}
                                className="p-2 rounded-full hover:bg-secondary/50"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-2">
                            {allRecipes.map(recipe => (
                                <button
                                    key={recipe.id}
                                    onClick={() => handleSelectRecipe(recipe.id)}
                                    disabled={isPending}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left cursor-pointer"
                                >
                                    {recipe.image_url ? (
                                        <img
                                            src={recipe.image_url}
                                            alt={recipe.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg">
                                            🍽️
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{recipe.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {recipe.calories} kcal | {recipe.protein}g prot | {recipe.price_estimated}€
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {(isPending || isGenerating) && (
                <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center pointer-events-none">
                    <div className="bg-card/90 backdrop-blur-md rounded-xl p-4 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        <span className="text-sm font-semibold text-white">
                            {isGenerating ? "Generation en cours..." : "Chargement..."}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
