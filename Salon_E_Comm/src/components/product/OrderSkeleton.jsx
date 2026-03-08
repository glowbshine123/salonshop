
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"

export default function OrderSkeleton() {
    return (
        <div className="bg-white rounded-[24px] border border-neutral-100 p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32 rounded bg-neutral-200" />
                    <Skeleton className="h-4 w-48 rounded bg-neutral-200" />
                </div>
                <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-20 rounded bg-neutral-200 ml-auto" />
                    <Skeleton className="h-8 w-24 rounded bg-neutral-200 ml-auto" />
                </div>
            </div>
            <div className="border-t border-neutral-50 pt-6 flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded bg-neutral-200" />
                <Skeleton className="h-8 w-32 rounded bg-neutral-200" />
            </div>
        </div>
    );
}
