import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmergencyPatient } from '@/types/emergency';

interface EmergencyQuickViewProps {
  cases?: EmergencyPatient[];
}

export function EmergencyQuickView({ cases = [] }: EmergencyQuickViewProps) {
  const activeCases = cases.slice(0, 4);
  const waitingCount = cases.filter((c) => c.status === 'Triage' || c.status === 'Awaiting Lab').length;
  const avgWait = cases.length > 0
    ? Math.round(cases.reduce((acc, c) => acc + c.waitingTimeMinutes, 0) / cases.length)
    : 0;

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <CardTitle className="text-base text-black font-extrabold">Emergency Department</CardTitle>
            </div>
            <p className="text-xs text-zinc-950 font-medium">Live triage queue & trauma bay load (PostgreSQL)</p>
          </div>
          <Badge variant={cases.length > 5 ? 'rose' : 'gold'} dot dotPulse size="default" className="font-bold">
            Status: {cases.length > 5 ? 'High Volume' : 'Stable'}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Metrics summary bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-black">Active ER</p>
              <p className="text-xl font-black font-mono text-black">{cases.length}</p>
            </div>
            <div className="border-x border-zinc-200">
              <p className="text-[10px] uppercase font-bold text-black">Waiting</p>
              <p className="text-xl font-black font-mono text-amber-800">{waitingCount}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-black">Avg Wait</p>
              <p className="text-xl font-black font-mono text-rose-700">{avgWait}m</p>
            </div>
          </div>

          {/* Quick patient list */}
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold text-black uppercase tracking-wider">
              Priority Triage Queue
            </p>
            {activeCases.length === 0 ? (
              <div className="p-4 text-center text-black font-medium text-xs rounded-lg bg-zinc-50 border border-zinc-200">
                No active emergency cases in queue.
              </div>
            ) : (
              activeCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-6 w-6 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                        caseItem.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                          : caseItem.priority === 'High'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold'
                      }`}
                    >
                      ESI-{caseItem.esiScore}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-black truncate">{caseItem.name}</p>
                      <p className="text-[11px] text-zinc-950 font-medium truncate">{caseItem.chiefComplaint}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end text-[11px] text-black font-bold font-mono">
                      <Clock className="h-3 w-3 text-zinc-700" />
                      <span>{caseItem.waitingTimeMinutes}m wait</span>
                    </div>
                    <span className="text-[10px] text-black font-mono font-bold">{caseItem.room}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0">
        <Link href="/emergency" className="w-full">
          <Button variant="default" size="sm" className="w-full text-xs flex items-center justify-center gap-1.5 shadow-md">
            <span>Open Emergency Command Center</span>
            <ArrowRight className="h-3.5 w-3.5 text-yellow-400" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
