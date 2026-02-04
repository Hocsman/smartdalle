"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Plus, Trash2, Loader2, AlertTriangle, Clock, Leaf, ChevronDown,
} from "lucide-react";
import { addPantryItem, deletePantryItem, PantryItem } from "@/app/actions/pantry";
import { CATEGORIES, categorizeIngredient } from "@/utils/categories";
import AntiWasteSuggestions from "@/components/anti-waste-suggestions";

interface PantryClientProps {
    items: PantryItem[];
    isPremium: boolean;
}

function getExpiryStatus(expiryDate: string | null): "ok" | "soon" | "urgent" | "expired" | null {
    if (!expiryDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "expired";
    if (diffDays <= 2) return "urgent";
    if (diffDays <= 7) return "soon";
    return "ok";
}

function ExpiryBadge({ status }: { status: "ok" | "soon" | "urgent" | "expired" | null }) {
    if (!status || status === "ok") return null;

    const config = {
        soon: { label: "Bientôt", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
        urgent: { label: "Urgent !", className: "bg-red-500/20 text-red-400 border-red-500/30" },
        expired: { label: "Périmé", className: "bg-red-500/30 text-red-400 border-red-500/40 line-through" },
    };

    const { label, className } = config[status];

    return (
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${className}`}>
            {status === "urgent" && <AlertTriangle className="h-3 w-3 inline mr-1" />}
            {status === "soon" && <Clock className="h-3 w-3 inline mr-1" />}
            {label}
        </span>
    );
}

export default function PantryClient({ items: initialItems, isPremium }: PantryClientProps) {
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    // Group items by category
    const categorizedItems = useMemo(() => {
        const groups: Record<string, PantryItem[]> = {};
        initialItems.forEach((item) => {
            const cat = item.category || categorizeIngredient(item.ingredient_name);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [initialItems]);

    const activeCategories = useMemo(() => {
        return CATEGORIES.filter((cat) => categorizedItems[cat.name]?.length > 0);
    }, [categorizedItems]);

    // Count urgent items
    const urgentCount = useMemo(() => {
        return initialItems.filter((item) => {
            const status = getExpiryStatus(item.expiry_date);
            return status === "urgent" || status === "expired";
        }).length;
    }, [initialItems]);

    const toggleSection = (sectionName: string) => {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionName)) next.delete(sectionName);
            else next.add(sectionName);
            return next;
        });
    };

    const handleAdd = async () => {
        if (!name.trim()) return;
        setIsAdding(true);
        try {
            await addPantryItem({
                ingredient_name: name.trim(),
                quantity: quantity.trim() || undefined,
                expiry_date: expiryDate || undefined,
            });
            setName("");
            setQuantity("");
            setExpiryDate("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = (itemId: string) => {
        setDeletingId(itemId);
        startTransition(async () => {
            try {
                await deletePantryItem(itemId);
            } catch (error) {
                console.error(error);
            } finally {
                setDeletingId(null);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Urgent Alert */}
            {urgentCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-400">
                        <strong>{urgentCount} ingrédient{urgentCount > 1 ? "s" : ""}</strong> expire{urgentCount > 1 ? "nt" : ""} bientôt ou {urgentCount > 1 ? "sont périmés" : "est périmé"} !
                    </p>
                </div>
            )}

            {/* Add Item Form */}
            <Card className="bg-card border-input">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nom de l'ingrédient..."
                                className="bg-background border-input flex-1"
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <Input
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Qté (ex: 500g)"
                                className="bg-background border-input w-28"
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="flex items-center gap-2 flex-1">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="bg-background border border-input rounded-md px-3 py-2 text-sm text-white flex-1 [color-scheme:dark]"
                                    placeholder="Date d'expiration"
                                />
                            </div>
                            <Button
                                onClick={handleAdd}
                                disabled={!name.trim() || isAdding}
                                className="bg-primary text-black font-bold cursor-pointer"
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Empty State */}
            {initialItems.length === 0 ? (
                <Card className="bg-card/30 border-dashed border-input">
                    <CardContent className="p-12 text-center">
                        <Leaf className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-2">Ton frigo est vide</p>
                        <p className="text-sm text-muted-foreground/70">
                            Ajoute tes ingrédients pour des suggestions anti-gaspi !
                        </p>
                    </CardContent>
                </Card>
            ) : (
                /* Grouped Lists by Category */
                activeCategories.map((cat) => {
                    const categoryItems = categorizedItems[cat.name];
                    const isCollapsed = collapsedSections.has(cat.name);
                    const hasUrgent = categoryItems.some((item) => {
                        const s = getExpiryStatus(item.expiry_date);
                        return s === "urgent" || s === "expired";
                    });

                    return (
                        <Card key={cat.name} className={`bg-card border-input ${hasUrgent ? "border-red-500/30" : ""}`}>
                            <CardHeader
                                className="pb-2 cursor-pointer select-none"
                                onClick={() => toggleSection(cat.name)}
                            >
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-2xl">{cat.emoji}</span>
                                    {cat.name}
                                    <span className="text-sm font-normal text-muted-foreground ml-auto">
                                        {categoryItems.length}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                                </h3>
                            </CardHeader>
                            {!isCollapsed && (
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        {categoryItems.map((item) => {
                                            const expiryStatus = getExpiryStatus(item.expiry_date);
                                            const isDeleting = deletingId === item.id;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                                        expiryStatus === "expired"
                                                            ? "bg-red-500/10 border-red-500/30"
                                                            : expiryStatus === "urgent"
                                                            ? "bg-orange-500/10 border-orange-500/30"
                                                            : "bg-secondary/20 border-input hover:border-primary/50"
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`font-medium ${expiryStatus === "expired" ? "line-through text-muted-foreground" : "text-white"}`}>
                                                                {item.ingredient_name}
                                                            </span>
                                                            {item.quantity && (
                                                                <span className="text-sm text-primary font-medium">
                                                                    {item.quantity}
                                                                </span>
                                                            )}
                                                            <ExpiryBadge status={expiryStatus} />
                                                        </div>
                                                        {item.expiry_date && expiryStatus !== "expired" && (
                                                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                                                                Expire le {new Date(item.expiry_date).toLocaleDateString("fr-FR")}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={isPending}
                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer shrink-0"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })
            )}

            {/* Anti-waste AI Suggestions */}
            <AntiWasteSuggestions isPremium={isPremium} hasPantryItems={initialItems.length > 0} />

            {/* Info */}
            {initialItems.length > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                    Les ingrédients de ton frigo seront exclus automatiquement de ta liste de courses
                </p>
            )}
        </div>
    );
}
