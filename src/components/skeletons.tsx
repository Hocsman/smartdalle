import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-muted/50",
                className
            )}
        />
    );
}

export function RecipeCardSkeleton() {
    return (
        <div className="h-full overflow-hidden rounded-xl border border-input bg-card shadow-md">
            {/* Image skeleton */}
            <Skeleton className="aspect-video w-full rounded-none" />

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4" />

                {/* Badges */}
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-input/50">
                    <Skeleton className="h-5 w-16" />
                </div>
            </div>
        </div>
    );
}

export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <RecipeCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>

            {/* Section title */}
            <Skeleton className="h-8 w-48" />

            {/* Recipe grid */}
            <RecipeGridSkeleton count={6} />
        </div>
    );
}

export function RecipePageSkeleton() {
    return (
        <div className="min-h-screen pb-20">
            {/* Hero image skeleton */}
            <Skeleton className="h-[40vh] w-full rounded-none" />

            <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main content */}
                    <div className="flex-1 space-y-6">
                        {/* Badges */}
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-20" />
                        </div>

                        {/* Title */}
                        <Skeleton className="h-14 w-3/4" />

                        {/* Macros */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>

                        {/* Instructions */}
                        <Skeleton className="h-8 w-40" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-xl" />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 space-y-6">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
