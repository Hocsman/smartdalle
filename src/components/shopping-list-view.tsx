"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Copy, Trash2, ShoppingCart, Sparkles } from "lucide-react";

interface ShoppingListViewProps {
    ingredients: string[];
}

import { categorizeIngredient, CATEGORIES } from "@/utils/categories";
import PdfExportButton from "@/components/pdf-export-button";

export default function ShoppingListView({ ingredients }: ShoppingListViewProps) {
    // Dedupe ingredients
    const uniqueIngredients = useMemo(() =>
        Array.from(new Set(ingredients)).sort(),
        [ingredients]
    );

    // Load checked items from localStorage
    const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set();
        const saved = localStorage.getItem("shoppingChecked");
        if (saved) {
            try {
                return new Set(JSON.parse(saved));
            } catch {
                return new Set();
            }
        }
        return new Set();
    });

    // Save to localStorage on change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("shoppingChecked", JSON.stringify([...checkedItems]));
        }
    }, [checkedItems]);

    // Group by category
    const categorized = useMemo(() => {
        const groups: Record<string, string[]> = {};
        uniqueIngredients.forEach((ing) => {
            const cat = categorizeIngredient(ing);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(ing);
        });
        return groups;
    }, [uniqueIngredients]);

    const toggleItem = (item: string) => {
        const next = new Set(checkedItems);
        if (next.has(item)) {
            next.delete(item);
        } else {
            next.add(item);
        }
        setCheckedItems(next);
    };

    const clearChecked = () => {
        setCheckedItems(new Set());
    };

    const copyToClipboard = async () => {
        const unchecked = uniqueIngredients.filter((i) => !checkedItems.has(i));
        const text = `🛒 Ma Liste SmartDalle:\n\n${unchecked.map((i) => `☐ ${i}`).join("\n")}`;
        await navigator.clipboard.writeText(text);
    };

    const progress = uniqueIngredients.length > 0
        ? Math.round((checkedItems.size / uniqueIngredients.length) * 100)
        : 0;

    const allChecked = checkedItems.size === uniqueIngredients.length && uniqueIngredients.length > 0;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Progress Header */}
            <Card className="bg-card border-input overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white">{checkedItems.size}/{uniqueIngredients.length}</p>
                                <p className="text-sm text-muted-foreground">articles trouvés</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <PdfExportButton ingredients={ingredients} />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                                className="cursor-pointer"
                                title="Copier la liste"
                            >
                                <Copy className="h-4 w-4 mr-1" />
                                Copier
                            </Button>
                            {checkedItems.size > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearChecked}
                                    className="cursor-pointer text-orange-400 hover:text-orange-300"
                                    title="Réinitialiser"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${allChecked ? "bg-green-500" : "bg-primary"}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {allChecked && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-green-400 font-bold">
                            <Sparkles className="h-5 w-5" />
                            Mission accomplie ! Tu as tout trouvé 🎉
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Categorized Lists */}
            {uniqueIngredients.length === 0 ? (
                <Card className="bg-card/30 border-dashed border-input">
                    <CardContent className="p-12 text-center">
                        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Ta liste est vide. Génère un plan d&apos;abord !</p>
                    </CardContent>
                </Card>
            ) : (
                CATEGORIES.filter((cat) => categorized[cat.name]?.length > 0).map((cat) => (
                    <Card key={cat.name} className="bg-card border-input">
                        <CardHeader className="pb-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">{cat.emoji}</span>
                                {cat.name}
                                <span className="text-sm font-normal text-muted-foreground ml-auto">
                                    {categorized[cat.name]?.filter((i) => checkedItems.has(i)).length}/{categorized[cat.name]?.length}
                                </span>
                            </h3>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2">
                                {categorized[cat.name]?.map((item) => {
                                    const isChecked = checkedItems.has(item);
                                    return (
                                        <div
                                            key={item}
                                            onClick={() => toggleItem(item)}
                                            className={`
                                                group flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200
                                                ${isChecked
                                                    ? "bg-green-500/10 border-green-500/30"
                                                    : "bg-secondary/20 border-input hover:border-primary/50"
                                                }
                                            `}
                                        >
                                            <div className={`
                                                h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                ${isChecked
                                                    ? "bg-green-500 border-green-500 text-white scale-110"
                                                    : "border-muted-foreground group-hover:border-primary"
                                                }
                                            `}>
                                                {isChecked && <Check className="h-4 w-4 stroke-[3px]" />}
                                            </div>
                                            <span className={`flex-1 ${isChecked ? "line-through text-muted-foreground" : "text-white"}`}>
                                                {item}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Tip */}
            {uniqueIngredients.length > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                    💡 Tes coches sont sauvegardées automatiquement
                </p>
            )}
        </div>
    );
}
