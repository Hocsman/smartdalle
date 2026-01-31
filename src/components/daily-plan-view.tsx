import { RecipeCard } from "@/components/recipe-card";
import { Badge } from "@/components/ui/badge";

interface PlanProps {
    plan: any; // Using any for speed, ideally typed properly with detailed join
    recipes: {
        breakfast: any;
        lunch: any;
        dinner: any;
        snack: any;
    };
}

export function DailyPlanView({ plan, recipes }: PlanProps) {
    const totalCals =
        (recipes.breakfast?.calories || 0) +
        (recipes.lunch?.calories || 0) +
        (recipes.dinner?.calories || 0) +
        (recipes.snack?.calories || 0);

    const totalProtein =
        (recipes.breakfast?.protein || 0) +
        (recipes.lunch?.protein || 0) +
        (recipes.dinner?.protein || 0) +
        (recipes.snack?.protein || 0);

    // Calculate total price
    const totalPrice = (
        (Number(recipes.breakfast?.price_estimated) || 0) +
        (Number(recipes.lunch?.price_estimated) || 0) +
        (Number(recipes.dinner?.price_estimated) || 0) +
        (Number(recipes.snack?.price_estimated) || 0)
    ).toFixed(2);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-card/50 border border-input rounded-xl p-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Menu du Jour</h2>
                    <p className="text-muted-foreground">{plan.date}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center">
                        <span className="block text-3xl font-bold text-primary">{totalCals}</span>
                        <span className="text-xs text-muted-foreground uppercase">Kcal</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-3xl font-bold text-white">{totalProtein}g</span>
                        <span className="text-xs text-muted-foreground uppercase">Prot</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-3xl font-bold text-green-400">{totalPrice}€</span>
                        <span className="text-xs text-muted-foreground uppercase">Total</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Badge className="bg-white text-black font-bold">Petit-Déj</Badge>
                    {recipes.breakfast && <RecipeCard recipe={recipes.breakfast} />}
                </div>
                <div className="space-y-2">
                    <Badge className="bg-white text-black font-bold">Déjeuner</Badge>
                    {recipes.lunch && <RecipeCard recipe={recipes.lunch} />}
                </div>
                <div className="space-y-2">
                    <Badge className="bg-white text-black font-bold">Dîner</Badge>
                    {recipes.dinner && <RecipeCard recipe={recipes.dinner} />}
                </div>
                <div className="space-y-2">
                    <Badge className="bg-primary text-black font-bold">Snack</Badge>
                    {recipes.snack && <RecipeCard recipe={recipes.snack} />}
                </div>
            </div>
        </div>
    );
}
