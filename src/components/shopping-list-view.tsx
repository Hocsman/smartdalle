"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check, Circle } from "lucide-react";

interface ShoppingListViewProps {
    ingredients: string[];
}

export default function ShoppingListView({ ingredients }: ShoppingListViewProps) {
    // Use a set to track checked items by index since duplicates might exist
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
        const next = new Set(checkedItems);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        setCheckedItems(next);
    };

    // Deduping identical strings for cleaner list
    // Note: Simple string dedupe.
    const uniqueIngredients = Array.from(new Set(ingredients)).sort();

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {uniqueIngredients.length === 0 ? (
                <div className="text-center py-12 bg-card/30 rounded-lg">
                    <p className="text-muted-foreground">Ta liste est vide. Génère un plan d'abord !</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {uniqueIngredients.map((item, idx) => {
                        const isChecked = checkedItems.has(idx);
                        return (
                            <div
                                key={idx}
                                onClick={() => toggleItem(idx)}
                                className={`
                                group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200
                                ${isChecked
                                        ? "bg-secondary/20 border-transparent opacity-50"
                                        : "bg-card border-input hover:border-primary/50"
                                    }
                            `}
                            >
                                <div className={`
                                h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors
                                ${isChecked
                                        ? "bg-green-500 border-green-500 text-black"
                                        : "border-muted-foreground group-hover:border-primary"
                                    }
                            `}>
                                    {isChecked && <Check className="h-4 w-4 stroke-[3px]" />}
                                </div>
                                <span className={`text-lg ${isChecked ? "line-through text-muted-foreground" : "text-white"}`}>
                                    {item}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-8 text-center text-sm text-muted-foreground">
                {checkedItems.size} / {uniqueIngredients.length} articles trouvés
            </div>
        </div>
    );
}
