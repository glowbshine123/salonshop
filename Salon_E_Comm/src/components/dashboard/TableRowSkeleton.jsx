
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function TableRowSkeleton({ cellCount = 5 }) {
    return (
        <tr className="border-b border-neutral-50/50 animate-pulse">
            {Array.from({ length: cellCount }).map((_, index) => (
                <td key={index} className="px-8 py-6">
                    <Skeleton className="h-4 w-24 rounded bg-neutral-200" />
                </td>
            ))}
        </tr>
    );
}
