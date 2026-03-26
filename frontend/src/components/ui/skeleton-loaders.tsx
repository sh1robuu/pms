'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-xl bg-white/[0.04]',
                className
            )}
            {...props}
        />
    );
}

export function KpiSkeleton() {
    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-24 h-3" />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 px-6 py-4">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-28 h-4" />
                    <Skeleton className="w-16 h-4" />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-full h-40" />
            <div className="space-y-2">
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-3/4 h-3" />
            </div>
        </div>
    );
}
