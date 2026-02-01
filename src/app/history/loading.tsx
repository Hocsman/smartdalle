import { Skeleton } from "@/components/skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                {/* Plans skeleton */}
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
