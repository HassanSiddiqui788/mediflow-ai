import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/appointment';
import { getStatusBadgeStyles } from '@/lib/utils';

interface UpcomingAppointmentsCardProps {
  appointments?: Appointment[];
}

export function UpcomingAppointmentsCard({ appointments = [] }: UpcomingAppointmentsCardProps) {
  const todayUpcoming = appointments
    .filter((a) => a.status === 'Checked In' || a.status === 'Scheduled' || a.status === 'In Progress')
    .slice(0, 5);

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <CardTitle className="text-base text-black font-extrabold">Upcoming Consultations</CardTitle>
            </div>
            <p className="text-xs text-zinc-950 font-medium">Scheduled clinical appointments (PostgreSQL)</p>
          </div>
          <Badge variant="gold" size="sm" className="font-mono font-bold">
            {todayUpcoming.length} Active Slots
          </Badge>
        </CardHeader>

        <CardContent className="space-y-2.5 pt-2">
          {todayUpcoming.length === 0 ? (
            <div className="p-4 text-center text-black font-medium text-xs rounded-lg bg-zinc-50 border border-zinc-200">
              No scheduled appointments found in database.
            </div>
          ) : (
            todayUpcoming.map((apt) => {
              const badgeStyle = getStatusBadgeStyles(apt.status);

              return (
                <div
                  key={apt.id}
                  className="p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center h-10 w-11 rounded-lg bg-white border border-zinc-300 font-mono text-center shrink-0 shadow-xs">
                      <span className="text-[10px] text-black font-black leading-none">{apt.time}</span>
                      <span className="text-[9px] text-zinc-900 font-bold uppercase">{apt.duration}m</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-black truncate">{apt.patientName}</p>
                        <span className="text-[10px] text-black font-bold font-mono">{apt.patientId}</span>
                      </div>
                      <p className="text-[11px] text-zinc-950 font-medium truncate">
                        {apt.department} • {apt.doctor}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold items-center gap-1 ${badgeStyle.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                      <span>{apt.status}</span>
                    </div>
                    <span className="block text-[10px] text-black font-bold font-mono mt-0.5">{apt.room}</span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </div>

      <div className="p-4 pt-0">
        <Link href="/appointments" className="w-full">
          <Button variant="default" size="sm" className="w-full text-xs flex items-center justify-center gap-1.5 shadow-md">
            <span>View Full Master Schedule</span>
            <ArrowRight className="h-3.5 w-3.5 text-yellow-400" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
