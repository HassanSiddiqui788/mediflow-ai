'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Sparkles,
  Command,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Menu,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommandPalette } from './command-palette';
import { MobileNav } from './mobile-nav';

export function Header() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-zinc-200 bg-white/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Left: Mobile Nav Toggle & Search Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Quick Search Button / CMD+K trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100/90 border border-zinc-200 hover:border-yellow-500/50 text-xs text-zinc-600 hover:text-zinc-900 transition-all w-48 sm:w-64 md:w-80 group text-left cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-yellow-600 transition-colors shrink-0" />
            <span className="truncate flex-1 font-medium">Search patients, beds, doctors...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 shadow-xs">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Center: Live Hospital Operation Status (Desktop) */}
        <div className="hidden xl:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-ping" />
            <span className="font-mono text-yellow-700 font-bold">LIVE OPS</span>
            <span className="text-zinc-300">|</span>
            <span className="font-medium text-zinc-700">142 Staff On-Duty</span>
            <span className="text-zinc-300">|</span>
            <span className="font-medium text-zinc-700">8 ORs Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            <span>ED Surge: <strong className="font-bold text-rose-800">Level 2</strong></span>
          </div>
        </div>

        {/* Right: Actions, AI Quick Trigger & Notifications */}
        <div className="flex items-center gap-2">
          {/* AI Insights Quick Link */}
          <Link href="/ai-insights">
            <Button
              variant="goldSubtle"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 text-xs h-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-yellow-600" />
              <span>AI Insights</span>
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
            </Button>
          </Link>

          {/* Notifications Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg bg-zinc-100 border border-zinc-200 hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.9)]" />
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-zinc-200 p-4 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-zinc-900">Live Operations Feed</span>
                    </div>
                    <Badge variant="rose" size="sm">3 Urgent</Badge>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-rose-800 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> ED Triage Alert
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">2m ago</span>
                      </div>
                      <p className="text-zinc-700 text-[11px]">
                        ED wait time increased to 34m. Fast-Track protocol activation suggested.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-amber-900 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5 text-amber-600" /> ICU Bed Projection
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">14m ago</span>
                      </div>
                      <p className="text-zinc-700 text-[11px]">
                        ICU expected to reach 96% capacity by 19:00. Step-down orders required.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-800 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> STAT Lab Ready
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">22m ago</span>
                      </div>
                      <p className="text-zinc-700 text-[11px]">
                        High-Sensitivity Troponin for PT-9049 ready for review.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 text-center">
                    <Link
                      href="/ai-insights"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-yellow-700 hover:text-yellow-800 font-semibold"
                    >
                      View AI Diagnostics & Incident Log →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 pl-2 border-l border-zinc-200 text-xs text-black hover:text-yellow-700"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-md shadow-yellow-500/15">
              <div className="h-full w-full bg-zinc-950 rounded-[6px] flex items-center justify-center font-mono font-bold text-xs text-yellow-300">
                SJ
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-black leading-tight">Dr. Jenkins</p>
              <p className="text-[10px] text-zinc-950 font-bold">Chief Officer</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Global Command Palette (CMD+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />
    </>
  );
}
