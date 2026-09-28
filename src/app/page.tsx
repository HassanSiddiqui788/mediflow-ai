import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  Sparkles,
  Flame,
  BedDouble,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'MediFlow AI | Modern Hospital Operations Platform',
  description: 'AI-driven hospital operations SaaS for patient flow, emergency triage, bed capacity, and clinical throughput.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col justify-between relative overflow-hidden selection:bg-yellow-500/30 selection:text-yellow-200">
      {/* Background ambient lighting - Gold & Charcoal */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-yellow-500/15 via-amber-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-yellow-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-yellow-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Activity className="h-5 w-5 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">MediFlow</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/40">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-300 hover:text-white">
                Staff Portal
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="btn-gold text-xs">
                <span>Launch Operations</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 flex-1 flex flex-col justify-center text-center">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-yellow-500/35 text-xs text-yellow-300 shadow-xl shadow-black/60">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            <span className="font-semibold">MediFlow AI Operations OS</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 font-mono">Production Architecture Live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Orchestrate Hospital Operations with{' '}
            <span className="text-gold-gradient">
              Predictive Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Unify Emergency Triage, Inpatient Bed Census, Diagnostic Laboratories, and Master Schedules into a single high-performance clinical operations command center.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="btn-gold w-full sm:w-auto text-sm px-8 shadow-xl shadow-yellow-500/25">
                <span>Open Operations Dashboard</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/ai-insights">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                <span>Explore AI Insights</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left max-w-5xl mx-auto">
          <Link href="/emergency">
            <Card variant="glass" className="p-6 h-full hover:border-rose-500/40 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white mb-1.5 flex items-center justify-between">
                <span>Emergency Triage Command</span>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Real-time ESI 1-5 severity categorization, vital monitoring, resuscitation bay allocation, and surge alerts.
              </p>
            </Card>
          </Link>

          <Link href="/beds">
            <Card variant="glass" className="p-6 h-full hover:border-yellow-500/40 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BedDouble className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white mb-1.5 flex items-center justify-between">
                <span>Inpatient Bed Matrix</span>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Live telemetry unit mapping across ICU, Cardiology, Surgery, and Pediatrics with automated turnover workflows.
              </p>
            </Card>
          </Link>

          <Link href="/ai-insights">
            <Card variant="glass" className="p-6 h-full hover:border-yellow-500/40 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-white mb-1.5 flex items-center justify-between">
                <span>AI Operational Copilot</span>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Predictive bottleneck modeling, proactive shift staffing balancing, and natural language operations simulation.
              </p>
            </Card>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-400 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-yellow-400" />
            <span className="font-semibold text-zinc-300">MediFlow AI Operations OS</span>
            <span>•</span>
            <span>PostgreSQL Synchronized</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <Link href="/dashboard" className="hover:text-yellow-300 transition-colors">Dashboard</Link>
            <Link href="/patients" className="hover:text-yellow-300 transition-colors">Patients</Link>
            <Link href="/emergency" className="hover:text-yellow-300 transition-colors">Emergency</Link>
            <Link href="/beds" className="hover:text-yellow-300 transition-colors">Beds</Link>
            <Link href="/laboratory" className="hover:text-yellow-300 transition-colors">Laboratory</Link>
            <Link href="/analytics" className="hover:text-yellow-300 transition-colors">Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
