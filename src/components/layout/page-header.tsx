import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  category?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  category,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-200',
        className
      )}
    >
      <div className="space-y-1">
        {category && (
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
            {category}
          </p>
        )}
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black flex items-center gap-2.5">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-950 font-medium max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
