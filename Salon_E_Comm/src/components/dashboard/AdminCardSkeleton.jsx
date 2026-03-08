
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminCardSkeleton() {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-16 w-16 rounded-[24px] bg-neutral-200" />
                <Skeleton className="h-10 w-10 rounded-lg bg-neutral-200" />
            </div>
            <div className="space-y-4 flex-1">
                <Skeleton className="h-4 w-24 rounded bg-neutral-200" />
                <Skeleton className="h-8 w-48 rounded bg-neutral-200" />
                <Skeleton className="h-20 w-full rounded-2xl bg-neutral-200" />
            </div>
        </div>
    );
}
