import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  subtext?: string;
  icon: React.ReactNode;
  accent?: 'yellow' | 'gold' | 'amber' | 'grey' | 'rose' | 'teal' | 'sky' | 'emerald';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last 24h',
  subtext,
  icon,
  accent = 'gold',
  onClick,
}: StatCardProps) {
  const accentGlow = {
    gold: 'hover:border-yellow-400/70 from-yellow-500/10 via-amber-500/5 to-transparent',
    yellow: 'hover:border-yellow-400/70 from-yellow-400/10 via-transparent to-transparent',
    amber: 'hover:border-amber-400/70 from-amber-500/10 via-transparent to-transparent',
    grey: 'hover:border-zinc-400 from-zinc-200/40 via-transparent to-transparent',
    rose: 'hover:border-rose-400/70 from-rose-500/10 via-transparent to-transparent',
    teal: 'hover:border-yellow-400/70 from-yellow-500/10 via-transparent to-transparent',
    sky: 'hover:border-sky-400/70 from-sky-500/10 via-transparent to-transparent',
    emerald: 'hover:border-emerald-400/70 from-emerald-500/10 via-transparent to-transparent',
  }[accent];

  const iconBg = {
    gold: 'bg-yellow-50 text-yellow-700 border-yellow-300 shadow-xs',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-300',
    grey: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    teal: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[accent];

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-5 transition-all duration-300 border border-zinc-200/90 bg-white shadow-xs group',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        accentGlow
      )}
      onClick={onClick}
    >
      {/* Top subtle glow gradient background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none transition-opacity group-hover:opacity-60', accentGlow)} />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-black">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-black font-mono">
              {value}
            </span>
          </div>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border p-2 transition-transform group-hover:scale-110 duration-200', iconBg)}>
          {icon}
        </div>
      </div>

      <div className="relative z-10 mt-3 pt-3 border-t border-zinc-200/80 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5">
            {change > 0 ? (
              <Badge variant="emerald" size="sm" className="font-mono font-bold">
                <TrendingUp className="h-3 w-3" />
                +{change}%
              </Badge>
            ) : change < 0 ? (
              <Badge variant="rose" size="sm" className="font-mono font-bold">
                <TrendingDown className="h-3 w-3" />
                {change}%
              </Badge>
            ) : (
              <Badge variant="default" size="sm" className="font-mono font-bold">
                <Minus className="h-3 w-3" />
                0%
              </Badge>
            )}
            <span className="text-zinc-900 text-[11px] truncate font-semibold">{changeLabel}</span>
          </div>
        ) : subtext ? (
          <span className="text-zinc-900 text-[11px] truncate font-semibold">{subtext}</span>
        ) : null}
      </div>
    </Card>
  );
}
