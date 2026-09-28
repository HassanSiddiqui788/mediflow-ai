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
  ChevronRight,
  LogOut,
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

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-64 bg-[#09090b] border-r border-zinc-800 shrink-0 h-screen sticky top-0 select-none z-30 overflow-hidden justify-between',
        className
      )}
    >
      {/* Top Header & Hospital Level */}
      <div className="shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800 bg-[#09090b]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-yellow-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-[#09090b] rounded-[10px] flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                <Activity className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">MediFlow</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.2)]">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight">Hospital Ops Platform</p>
            </div>
          </Link>
        </div>

        {/* Hospital Tier Badge */}
        <div className="px-3.5 py-2 mx-3 my-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            <span className="text-xs font-medium text-zinc-200">Level 1 Center</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">Metro Central</span>
        </div>
      </div>

      {/* Navigation Links - Non-scrolling static container */}
      <div className="flex-1 px-3 py-1 space-y-0.5 overflow-hidden flex flex-col justify-start">
        <p className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Operations
        </p>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 relative',
                isActive
                  ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent text-yellow-300 font-semibold border-l-2 border-l-yellow-400 border-t border-b border-r border-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.1)]'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-yellow-400' : 'text-zinc-400 group-hover:text-yellow-300'
                  )}
                >
                  {ICON_MAP[item.icon] || <Activity className="h-4 w-4" />}
                </span>
                <span className="truncate">{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium',
                    item.badgeColor === 'rose' && 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
                    item.badgeColor === 'amber' && 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
                    (item.badgeColor === 'gold' || item.badgeColor === 'yellow') && 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.2)]',
                    item.badgeColor === 'sky' && 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
                    (!item.badgeColor || item.badgeColor === 'emerald') && 'bg-zinc-800 text-zinc-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* AI Copilot Teaser Box */}
        <div className="pt-2 mt-1 border-t border-zinc-800/80">
          <Link
            href="/ai-insights"
            className="block p-2.5 rounded-xl bg-gradient-to-b from-yellow-950/30 via-zinc-900/90 to-black border border-yellow-500/30 hover:border-yellow-400/60 transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-semibold">
                <Sparkles className="h-3 w-3 text-yellow-400" />
                <span>MediFlow AI Copilot</span>
              </div>
              <ChevronRight className="h-3 w-3 text-yellow-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight truncate">
              Live hospital operations & telemetry
            </p>
          </Link>
        </div>
      </div>

      {/* User / Duty Profile Footer */}
      <div className="p-3 border-t border-zinc-800 bg-[#09090b] shrink-0">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 flex items-center justify-center font-semibold text-xs shrink-0 shadow-inner">
              <Stethoscope className="h-3.5 w-3.5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Dr. Sarah Jenkins</p>
              <p className="text-[10px] text-zinc-400 truncate">Chief Medical Officer</p>
            </div>
          </div>
          <Link
            href="/login"
            className="p-1.5 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 rounded-md transition-colors"
            title="Switch Profile"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
