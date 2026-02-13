"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingBag, ChevronDown } from "lucide-react";
import { STORES, buildStoreSearchUrl, type StoreId } from "@/lib/affiliate";

interface OrderOnlineProps {
    ingredients: string[];
}

export function OrderOnline({ ingredients }: OrderOnlineProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (ingredients.length === 0) return null;

    const handleStoreClick = (storeId: StoreId) => {
        const url = buildStoreSearchUrl(storeId, ingredients);
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <Card className="bg-card border-input overflow-hidden">
            <CardContent className="p-0">
                {/* Header - toujours visible */}
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
                                {ingredients.length} article{ingredients.length > 1 ? "s" : ""} restant{ingredients.length > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {/* Store buttons */}
                {isExpanded && (
                    <div className="px-5 pb-5 space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Fais tes courses en ligne avec ta liste pré-remplie :
                        </p>

                        <div className="grid gap-3">
                            {STORES.map((store) => (
                                <Button
                                    key={store.id}
                                    variant="outline"
                                    onClick={() => handleStoreClick(store.id as StoreId)}
                                    className="w-full h-auto py-3 px-4 justify-between cursor-pointer hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{store.logo}</span>
                                        <div className="text-left">
                                            <span className="font-bold text-white group-hover:text-primary transition-colors">
                                                {store.name}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                Drive & Livraison
                                            </span>
                                        </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Button>
                            ))}
                        </div>

                        <p className="text-[10px] text-muted-foreground/50 text-center pt-1">
                            Tu seras redirigé vers le site du supermarché
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
