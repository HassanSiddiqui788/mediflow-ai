import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-slate-800/70',
        shimmer ? 'skeleton-shimmer' : 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass-panel rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-800/60">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton className={cn('h-4', i === 0 ? 'w-20' : i === 1 ? 'w-36' : 'w-24')} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
      <div className="h-48 w-full flex items-end gap-3 pt-6 px-2">
        <Skeleton className="h-[40%] w-full rounded-t" />
        <Skeleton className="h-[65%] w-full rounded-t" />
        <Skeleton className="h-[85%] w-full rounded-t" />
        <Skeleton className="h-[50%] w-full rounded-t" />
        <Skeleton className="h-[90%] w-full rounded-t" />
        <Skeleton className="h-[70%] w-full rounded-t" />
        <Skeleton className="h-[60%] w-full rounded-t" />
      </div>
    </div>
  );
}

export { Skeleton };
