import { DashboardSkeleton } from "@/components/skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen gradient-bg p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <DashboardSkeleton />
            </div>
        </div>
    );
}
