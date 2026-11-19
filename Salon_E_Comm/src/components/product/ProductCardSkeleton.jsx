
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[300px] w-full rounded-xl bg-neutral-200" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded bg-neutral-200" />
                <Skeleton className="h-4 w-1/2 rounded bg-neutral-200" />
            </div>
            <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-20 rounded bg-neutral-200" />
                <Skeleton className="h-8 w-8 rounded-full bg-neutral-200" />
            </div>
        </div>
    );
}
