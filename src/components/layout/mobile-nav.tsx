'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Flame,
  BedDouble,
  FlaskConical,
  BarChart3,
  Sparkles,
  Activity,
  X,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAVIGATION_ITEMS } from '@/lib/constants';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  Flame: <Flame className="h-4 w-4" />,
  BedDouble: <BedDouble className="h-4 w-4" />,
  FlaskConical: <FlaskConical className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
};

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-800 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center">
                <Activity className="h-4 w-4 animate-pulse" />
              </div>
              <span className="font-bold text-white text-sm">MediFlow AI</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-4 space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-yellow-500/10 text-yellow-300 font-semibold border border-yellow-500/35'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-yellow-400' : 'text-zinc-400'}>
                      {ICON_MAP[item.icon]}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-bold text-xs">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Dr. Sarah Jenkins</p>
              <p className="text-[10px] text-zinc-400">Chief Medical Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
