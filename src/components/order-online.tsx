"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ShoppingBag, ChevronDown } from "lucide-react";
import { STORES, buildIngredientUrl, type Store } from "@/lib/affiliate";

interface OrderOnlineProps {
    ingredients: string[];
}

export function OrderOnline({ ingredients }: OrderOnlineProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store>(STORES[0]);

    if (ingredients.length === 0) return null;

    return (
        <Card className="bg-card border-input overflow-hidden">
            <CardContent className="p-0">
                {/* Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-secondary/10 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-bold text-white">Commander en ligne</h3>
                            <p className="text-xs text-muted-foreground">
                                {ingredients.length} article{ingredients.length > 1 ? "s" : ""} — cherche par ingrédient
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                    <div className="px-5 pb-5 space-y-4">
                        {/* Store selector */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {STORES.map((store) => (
                                <button
                                    key={store.id}
                                    onClick={() => setSelectedStore(store)}
                                    className={`
                                        shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold
                                        transition-all cursor-pointer
                                        ${selectedStore.id === store.id
                                            ? "bg-primary text-black border-primary"
                                            : "bg-secondary/20 text-white border-input hover:border-primary/50"
                                        }
                                    `}
                                >
                                    <span>{store.logo}</span>
                                    <span>{store.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Per-ingredient links */}
                        <div className="space-y-2">
                            {ingredients.map((ingredient, i) => {
                                const url = buildIngredientUrl(selectedStore, ingredient);
                                return (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                            flex items-center justify-between p-3 rounded-lg border border-input
                                            bg-secondary/10 hover:bg-secondary/30 hover:border-primary/50
                                            transition-all group cursor-pointer
                                        "
                                    >
                                        <span className="text-sm text-white group-hover:text-primary transition-colors truncate">
                                            {ingredient}
                                        </span>
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                                    </a>
                                );
                            })}
                        </div>

                        <p className="text-[10px] text-muted-foreground/50 text-center">
                            Chaque lien ouvre la recherche sur {selectedStore.name}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
