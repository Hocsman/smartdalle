"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    FolderPlus, X, Check, Loader2, Plus, Trash2,
} from "lucide-react";
import {
    getCollections,
    createCollection,
    addToCollection,
    removeFromCollection,
    Collection,
} from "@/app/actions/collections";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["📁", "🍽️", "⚡", "🥗", "🏋️", "🎉", "🔥", "💪", "🌮", "🍕", "🥑", "🍜"];

interface CollectionPickerProps {
    recipeId: string;
    onClose: () => void;
}

export function CollectionPicker({ recipeId, onClose }: CollectionPickerProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [recipeCollectionIds, setRecipeCollectionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmoji, setNewEmoji] = useState("📁");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Charger les collections
    useEffect(() => {
        const load = async () => {
            try {
                const cols = await getCollections();
                setCollections(cols);

                // Vérifier dans quelles collections la recette est
                const { getRecipeCollections } = await import("@/app/actions/collections");
                const ids = await getRecipeCollections(recipeId);
                setRecipeCollectionIds(ids);
            } catch {
                console.error("Erreur chargement collections");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [recipeId]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsCreating(true);
        try {
            const newCol = await createCollection(newName.trim(), newEmoji);
            // Ajouter la recette directement à la nouvelle collection
            await addToCollection(newCol.id, recipeId);
            setCollections((prev) => [
                { ...newCol, recipe_count: 1 },
                ...prev,
            ]);
            setRecipeCollectionIds((prev) => [...prev, newCol.id]);
            setNewName("");
            setNewEmoji("📁");
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Erreur");
        } finally {
            setIsCreating(false);
        }
    };

    const toggleCollection = async (collectionId: string) => {
        setActionLoading(collectionId);
        const isInCollection = recipeCollectionIds.includes(collectionId);

        try {
            if (isInCollection) {
                await removeFromCollection(collectionId, recipeId);
                setRecipeCollectionIds((prev) => prev.filter((id) => id !== collectionId));
                setCollections((prev) =>
                    prev.map((c) =>
                        c.id === collectionId ? { ...c, recipe_count: Math.max(0, c.recipe_count - 1) } : c
                    )
                );
            } else {
                await addToCollection(collectionId, recipeId);
                setRecipeCollectionIds((prev) => [...prev, collectionId]);
                setCollections((prev) =>
                    prev.map((c) =>
                        c.id === collectionId ? { ...c, recipe_count: c.recipe_count + 1 } : c
                    )
                );
            }
        } catch {
            console.error("Erreur toggle collection");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="bg-card border-input w-full max-w-md max-h-[80vh] overflow-hidden">
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-input">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Ajouter à une collection
                        </h3>
                        <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Create new collection */}
                    <div className="p-4 border-b border-input space-y-3">
                        <div className="flex gap-2">
                            <div className="flex gap-1 flex-wrap">
                                {EMOJI_OPTIONS.map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => setNewEmoji(e)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg cursor-pointer transition-all ${
                                            newEmoji === e
                                                ? "bg-primary/20 border border-primary"
                                                : "hover:bg-secondary/50"
                                        }`}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nom de la collection..."
                                className="bg-background border-input"
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            />
                            <Button
                                onClick={handleCreate}
                                disabled={!newName.trim() || isCreating}
                                className="bg-primary text-black font-bold cursor-pointer shrink-0"
                            >
                                {isCreating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Collections list */}
                    <div className="p-4 overflow-y-auto max-h-[40vh] space-y-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : collections.length === 0 ? (
                            <p className="text-center text-muted-foreground text-sm py-8">
                                Aucune collection. Crée ta première ci-dessus !
                            </p>
                        ) : (
                            collections.map((collection) => {
                                const isInCollection = recipeCollectionIds.includes(collection.id);
                                const isToggling = actionLoading === collection.id;

                                return (
                                    <button
                                        key={collection.id}
                                        onClick={() => toggleCollection(collection.id)}
                                        disabled={isToggling}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                            isInCollection
                                                ? "bg-primary/10 border-primary/30"
                                                : "bg-secondary/10 border-input hover:border-primary/30"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{collection.emoji}</span>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white">{collection.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {collection.recipe_count} recette{collection.recipe_count !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                        {isToggling ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        ) : isInCollection ? (
                                            <Check className="h-5 w-5 text-primary" />
                                        ) : (
                                            <Plus className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Bouton pour ouvrir le picker depuis une RecipeCard
export function CollectionButton({ recipeId }: { recipeId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-primary/80 flex items-center justify-center cursor-pointer transition-colors"
                title="Ajouter à une collection"
            >
                <FolderPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            {isOpen && (
                <CollectionPicker recipeId={recipeId} onClose={() => setIsOpen(false)} />
            )}
        </>
    );
}
