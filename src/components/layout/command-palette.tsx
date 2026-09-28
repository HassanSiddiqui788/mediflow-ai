'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Flame,
  BedDouble,
  FlaskConical,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types/patient';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const router = useRouter();

  // Keyboard shortcut listener (CMD+K or CTRL+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Fetch patients dynamically from PostgreSQL when palette opens or query changes
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      try {
        const url = query ? `/api/patients/list?search=${encodeURIComponent(query)}` : '/api/patients/list';
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          setPatients(json.data.slice(0, 5));
        } else if (Array.isArray(json.data)) {
          setPatients(json.data.slice(0, 5));
        }
      } catch (err) {
        console.error('CommandPalette search error:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [open, query]);

  const navigationActions = [
    { label: 'Emergency Department Board', href: '/emergency', icon: <Flame className="h-4 w-4 text-rose-400" /> },
    { label: 'Bed & Ward Matrix', href: '/beds', icon: <BedDouble className="h-4 w-4 text-yellow-400" /> },
    { label: 'Laboratory Diagnostic Queue', href: '/laboratory', icon: <FlaskConical className="h-4 w-4 text-sky-400" /> },
    { label: 'AI Operational Intelligence', href: '/ai-insights', icon: <Sparkles className="h-4 w-4 text-yellow-300" /> },
    { label: 'Hospital Analytics & Workload', href: '/analytics', icon: <BarChart3 className="h-4 w-4 text-amber-400" /> },
  ].filter((item) => !query || item.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl bg-white border-zinc-300 overflow-hidden shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 bg-zinc-100/80">
          <Search className="h-4 w-4 text-yellow-600 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a patient name, MRN (e.g. PT-9042), or department..."
            className="w-full bg-transparent text-sm text-black placeholder:text-zinc-500 font-medium focus:outline-none font-sans"
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-black font-bold shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Nav Section */}
          {navigationActions.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-black">
                Hospital Sections
              </p>
              <div className="space-y-1">
                {navigationActions.map((action) => (
                  <button
                    key={action.href}
                    onClick={() => handleSelect(action.href)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-black font-bold hover:text-yellow-700 hover:bg-zinc-100 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {action.icon}
                      <span>{action.label}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-yellow-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Patients Results */}
          {patients.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-black">
                Patients in PostgreSQL
              </p>
              <div className="space-y-1">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelect(`/patients/${patient.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-black hover:text-yellow-700 hover:bg-zinc-100 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center font-mono font-black text-[10px] text-yellow-900 shrink-0">
                        {patient.name[0]}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-bold text-black truncate group-hover:text-yellow-700 transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-[11px] text-zinc-950 font-bold font-mono truncate">
                          {patient.id} • {patient.mrn} • {patient.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="default" size="sm">
                        {patient.status}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-yellow-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
