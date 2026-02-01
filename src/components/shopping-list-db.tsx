"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Trash2, ShoppingCart, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { toggleShoppingItem, deleteShoppingItem, clearShoppingList } from "@/app/actions/add-to-shopping-list";

interface ShoppingItem {
    id: string;
    ingredient_name: string;
    quantity: string | null;
    is_checked: boolean;
    recipe_id: string | null;
    recipes: { name: string } | null;
}

interface ShoppingListDbProps {
    items: ShoppingItem[];
}

export default function ShoppingListDb({ items }: ShoppingListDbProps) {
    const [isPending, startTransition] = useTransition();
    const [pendingItemId, setPendingItemId] = useState<string | null>(null);

    const checkedCount = items.filter((item) => item.is_checked).length;
    const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;
    const allChecked = checkedCount === items.length && items.length > 0;

    // Group items by recipe
    const groupedItems = items.reduce((acc, item) => {
        const recipeName = item.recipes?.name || "Autres";
        if (!acc[recipeName]) acc[recipeName] = [];
        acc[recipeName].push(item);
        return acc;
    }, {} as Record<string, ShoppingItem[]>);

    const handleToggle = (itemId: string, currentState: boolean) => {
        setPendingItemId(itemId);
        startTransition(async () => {
            try {
                await toggleShoppingItem(itemId, !currentState);
            } catch (error) {
                console.error(error);
            } finally {
                setPendingItemId(null);
            }
        });
    };

    const handleDelete = (itemId: string) => {
        setPendingItemId(itemId);
        startTransition(async () => {
            try {
                await deleteShoppingItem(itemId);
            } catch (error) {
                console.error(error);
            } finally {
                setPendingItemId(null);
            }
        });
    };

    const handleClearAll = () => {
        startTransition(async () => {
            try {
                await clearShoppingList();
            } catch (error) {
                console.error(error);
            }
        });
    };

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
                                <p className="text-2xl font-black text-white">{checkedCount}/{items.length}</p>
                                <p className="text-sm text-muted-foreground">articles trouvés</p>
                            </div>
                        </div>
                        {items.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                disabled={isPending}
                                className="cursor-pointer text-red-400 hover:text-red-300 hover:border-red-500/50"
                            >
                                {isPending && !pendingItemId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Tout effacer
                                    </>
                                )}
                            </Button>
                        )}
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
                            Mission accomplie !
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Empty State */}
            {items.length === 0 ? (
                <Card className="bg-card/30 border-dashed border-input">
                    <CardContent className="p-12 text-center">
                        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-2">Ta liste est vide</p>
                        <p className="text-sm text-muted-foreground/70">
                            Ajoute des ingrédients depuis une recette !
                        </p>
                    </CardContent>
                </Card>
            ) : (
                /* Grouped Lists by Recipe */
                Object.entries(groupedItems).map(([recipeName, recipeItems]) => (
                    <Card key={recipeName} className="bg-card border-input">
                        <CardHeader className="pb-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-primary">📌</span>
                                {recipeName}
                                <span className="text-sm font-normal text-muted-foreground ml-auto">
                                    {recipeItems.filter((i) => i.is_checked).length}/{recipeItems.length}
                                </span>
                            </h3>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2">
                                {recipeItems.map((item) => {
                                    const isItemPending = pendingItemId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`
                                                group flex items-center gap-4 p-3 rounded-lg border transition-all duration-200
                                                ${item.is_checked
                                                    ? "bg-green-500/10 border-green-500/30"
                                                    : "bg-secondary/20 border-input hover:border-primary/50"
                                                }
                                            `}
                                        >
                                            {/* Checkbox Circle */}
                                            <button
                                                onClick={() => handleToggle(item.id, item.is_checked)}
                                                disabled={isPending}
                                                className={`
                                                    h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer
                                                    ${item.is_checked
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : "border-muted-foreground hover:border-primary"
                                                    }
                                                    ${isItemPending ? "opacity-50" : ""}
                                                `}
                                            >
                                                {isItemPending ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : item.is_checked ? (
                                                    <Check className="h-4 w-4 stroke-[3px]" />
                                                ) : null}
                                            </button>

                                            {/* Ingredient Name + Quantity */}
                                            <div className="flex-1">
                                                <span className={`${item.is_checked ? "line-through text-muted-foreground" : "text-white"}`}>
                                                    {item.ingredient_name}
                                                </span>
                                                {item.quantity && (
                                                    <span className="ml-2 text-sm text-primary font-medium">
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                disabled={isPending}
                                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Tip */}
            {items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                    ✨ Tes coches sont sauvegardées dans ton compte
                </p>
            )}
        </div>
    );
}
