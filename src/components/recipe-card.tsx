import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { CollectionButton } from "@/components/collection-picker";

interface Recipe {
    id: string;
    name: string;
    culture: string;
    image_url: string | null;
    price_estimated: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface RecipeCardProps {
    recipe: Recipe;
    isFavorite?: boolean;
}

export function RecipeCard({ recipe, isFavorite = false }: RecipeCardProps) {
    return (
        <Link href={`/recipes/${recipe.id}`} className="block h-full cursor-pointer group">
            <Card className="h-full overflow-hidden border-input bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
                <div className="relative aspect-video w-full overflow-hidden">
                    {recipe.image_url ? (
                        <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                            No Image
                        </div>
                    )}

                    {/* Top bar with culture badge and favorite button */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                        <Badge variant="secondary" className="font-bold shadow-sm backdrop-blur-md bg-black/50 text-white border-none">
                            {recipe.culture}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                            <CollectionButton recipeId={recipe.id} />
                            <FavoriteButton recipeId={recipe.id} initialFavorite={isFavorite} size="sm" />
                        </div>
                    </div>
                </div>

                <CardHeader className="p-4 pb-2">
                    <h3 className="font-bold text-lg line-clamp-1 text-white group-hover:text-primary transition-colors">{recipe.name}</h3>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-primary text-black hover:bg-primary/90 font-bold border-none">
                            {recipe.protein}g Prot
                        </Badge>
                        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                            {recipe.calories} kcal
                        </Badge>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 border-t border-input/50 flex items-center justify-between mt-auto bg-secondary/20 h-10">
                    <div className="flex items-center text-green-400 font-bold">
                        <Wallet className="w-4 h-4 mr-1" />
                        {recipe.price_estimated} €
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
