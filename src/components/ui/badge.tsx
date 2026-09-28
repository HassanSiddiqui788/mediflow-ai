import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-800/80 border-zinc-700 text-zinc-300',
        gold:
          'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.2)]',
        yellow:
          'bg-yellow-400/10 border-yellow-400/30 text-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.15)]',
        amber:
          'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
        grey:
          'bg-zinc-800/90 border-zinc-700 text-zinc-300',
        charcoal:
          'bg-zinc-900 border-zinc-800 text-zinc-400',
        emerald:
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
        sky:
          'bg-sky-500/10 border-sky-500/30 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.15)]',
        rose:
          'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
        teal:
          'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.2)]',
        outline:
          'border-zinc-700 text-zinc-400 bg-transparent',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.2 text-[10px] tracking-wide uppercase',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotPulse?: boolean;
  dotColor?: string;
}

function Badge({
  className,
  variant,
  size,
  dot,
  dotPulse,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            dotColor ||
              (variant === 'gold' && 'bg-yellow-400') ||
              (variant === 'yellow' && 'bg-yellow-300') ||
              (variant === 'amber' && 'bg-amber-400') ||
              (variant === 'emerald' && 'bg-emerald-400') ||
              (variant === 'rose' && 'bg-rose-400') ||
              (variant === 'sky' && 'bg-sky-400') ||
              (variant === 'teal' && 'bg-yellow-400') ||
              'bg-zinc-400',
            dotPulse && 'animate-ping duration-1000'
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
