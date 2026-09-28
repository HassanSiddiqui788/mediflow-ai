import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white font-semibold border border-zinc-800 shadow-md hover:from-black hover:via-zinc-900 hover:to-zinc-800 hover:border-zinc-700 hover:shadow-lg active:scale-[0.98]',
        gold:
          'bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white font-semibold border border-zinc-800 shadow-md hover:from-black hover:via-zinc-900 hover:to-zinc-800 active:scale-[0.98]',
        darkGradient:
          'bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white font-semibold border border-zinc-800 shadow-md hover:from-black hover:via-zinc-900 hover:to-zinc-800 active:scale-[0.98]',
        greyGradient:
          'bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 text-white font-semibold border border-zinc-600 shadow-sm hover:from-zinc-800 hover:to-black active:scale-[0.98]',
        goldSubtle:
          'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-300 hover:bg-zinc-200 active:scale-[0.98]',
        secondary:
          'bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-900 text-white font-semibold hover:from-zinc-900 hover:to-black border border-zinc-700 shadow-xs active:scale-[0.98]',
        charcoal:
          'bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white font-semibold border border-zinc-800 hover:from-black hover:to-zinc-900 active:scale-[0.98]',
        outline:
          'border border-zinc-300 bg-white text-zinc-950 font-semibold hover:bg-zinc-100 hover:text-black hover:border-zinc-400 shadow-xs active:scale-[0.98]',
        ghost:
          'text-zinc-950 font-semibold hover:bg-zinc-100 hover:text-black',
        destructive:
          'bg-rose-600 text-white font-semibold border border-rose-700 hover:bg-rose-700 active:scale-[0.98]',
        tealSubtle:
          'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-300 hover:bg-zinc-200',
        amberSubtle:
          'bg-zinc-100 text-zinc-950 font-semibold border border-zinc-300 hover:bg-zinc-200',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-6 text-sm font-semibold',
        icon: 'h-9 w-9 p-0',
        iconSm: 'h-8 w-8 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
