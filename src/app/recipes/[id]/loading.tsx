import { RecipePageSkeleton } from "@/components/skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen gradient-bg">
            <RecipePageSkeleton />
        </div>
    );
}
