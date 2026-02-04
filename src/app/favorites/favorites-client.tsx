"use client";

import { useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FolderPlus, Plus, Loader2, Trash2, X,
} from "lucide-react";
import { Collection, createCollection, deleteCollection } from "@/app/actions/collections";

const EMOJI_OPTIONS = ["📁", "🍽️", "⚡", "🥗", "🏋️", "🎉", "🔥", "💪", "🌮", "🍕", "🥑", "🍜"];

type Recipe = {
    id: string;
    name: string;
    culture: string;
    image_url: string | null;
    price_estimated: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

interface FavoritesClientProps {
    allRecipes: Recipe[];
    collections: Collection[];
    collectionRecipeMap: Record<string, string[]>; // collectionId -> recipeId[]
}

export function FavoritesClient({
    allRecipes,
    collections: initialCollections,
    collectionRecipeMap,
}: FavoritesClientProps) {
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [collections, setCollections] = useState(initialCollections);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmoji, setNewEmoji] = useState("📁");
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filtrer les recettes selon la collection sélectionnée
    const displayedRecipes = selectedCollection
        ? allRecipes.filter((r) => collectionRecipeMap[selectedCollection]?.includes(r.id))
        : allRecipes;

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsCreating(true);
        try {
            const newCol = await createCollection(newName.trim(), newEmoji);
            setCollections((prev) => [{ ...newCol, recipe_count: 0 }, ...prev]);
            setNewName("");
            setNewEmoji("📁");
            setShowCreate(false);
        } catch (error) {
            const err = error as Error;
            alert(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (collectionId: string) => {
        setDeletingId(collectionId);
        try {
            await deleteCollection(collectionId);
            setCollections((prev) => prev.filter((c) => c.id !== collectionId));
            if (selectedCollection === collectionId) {
                setSelectedCollection(null);
            }
        } catch {
            console.error("Erreur suppression");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Collections Bar */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {/* "Tous" tab */}
                    <button
                        onClick={() => setSelectedCollection(null)}
                        className={`shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${
                            selectedCollection === null
                                ? "bg-primary text-black"
                                : "bg-card border border-input text-white hover:border-primary/50"
                        }`}
                    >
                        Tous ({allRecipes.length})
                    </button>

                    {/* Collection tabs */}
                    {collections.map((col) => (
                        <div key={col.id} className="relative group shrink-0">
                            <button
                                onClick={() =>
                                    setSelectedCollection(
                                        selectedCollection === col.id ? null : col.id
                                    )
                                }
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                                    selectedCollection === col.id
                                        ? "bg-primary text-black"
                                        : "bg-card border border-input text-white hover:border-primary/50"
                                }`}
                            >
                                <span>{col.emoji}</span>
                                {col.name}
                                <span className="text-xs opacity-70">
                                    ({col.recipe_count})
                                </span>
                            </button>
                            {/* Delete button on hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(col.id);
                                }}
                                className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full items-center justify-center text-xs hidden group-hover:flex cursor-pointer"
                            >
                                {deletingId === col.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <X className="h-3 w-3" />
                                )}
                            </button>
                        </div>
                    ))}

                    {/* Add collection button */}
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="shrink-0 px-4 py-2 rounded-full bg-card border border-dashed border-input text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer flex items-center gap-1.5 text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Nouvelle
                    </button>
                </div>

                {/* Create collection form */}
                {showCreate && (
                    <div className="flex flex-col gap-3 p-4 bg-card border border-input rounded-xl">
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
                                className="bg-primary text-black font-bold cursor-pointer"
                            >
                                {isCreating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Créer"
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowCreate(false)}
                                className="cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Recipes grid */}
            {displayedRecipes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} isFavorite />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-input">
                    <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                        {selectedCollection
                            ? "Aucune recette dans cette collection"
                            : "Pas encore de favori"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {selectedCollection
                            ? "Ajoute des recettes via le bouton dossier sur les cartes"
                            : "Va ajouter des recettes en favoris !"}
                    </p>
                </div>
            )}
        </div>
    );
}
