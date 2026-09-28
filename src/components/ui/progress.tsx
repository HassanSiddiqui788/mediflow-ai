import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  indicatorColor?: string;
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  indicatorColor,
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Dynamic color based on percentage if indicatorColor is not passed
  let autoColor = 'bg-gradient-to-r from-teal-500 to-emerald-500';
  if (!indicatorColor) {
    if (percentage >= 90) autoColor = 'bg-rose-500';
    else if (percentage >= 75) autoColor = 'bg-amber-500';
  }

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{percentage.toFixed(0)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div
        className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-800/80', className)}
        {...props}
      >
        <div
          className={cn('h-full transition-all duration-500 rounded-full', indicatorColor || autoColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
