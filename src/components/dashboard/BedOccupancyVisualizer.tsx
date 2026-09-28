import React from 'react';
import Link from 'next/link';
import { BedDouble, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WardSummary, Bed } from '@/types/bed';

interface BedOccupancyVisualizerProps {
  wardSummaries?: WardSummary[];
  beds?: Bed[];
}

export function BedOccupancyVisualizer({
  wardSummaries = [],
  beds = [],
}: BedOccupancyVisualizerProps) {
  const totalBeds = beds.length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const overallRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-yellow-600" />
              <CardTitle className="text-base text-black font-extrabold">Bed Capacity & Census</CardTitle>
            </div>
            <p className="text-xs text-zinc-950 font-medium">Total hospital bed allocation (PostgreSQL)</p>
          </div>
          <Badge
            variant={overallRate > 80 ? 'amber' : 'gold'}
            size="default"
            className="font-mono font-bold"
          >
            {overallRate}% Total Occupied
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Top capacity metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-black">Total Beds</p>
              <p className="text-xl font-black font-mono text-black">{totalBeds}</p>
            </div>
            <div className="border-x border-zinc-200">
              <p className="text-[10px] uppercase font-bold text-black">Occupied</p>
              <p className="text-xl font-black font-mono text-amber-800">{occupiedBeds}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-black">Available</p>
              <p className="text-xl font-black font-mono text-black">{availableBeds}</p>
            </div>
          </div>

          {/* Ward Breakdown Bars */}
          <div className="space-y-3">
            <p className="text-[11px] font-extrabold text-black uppercase tracking-wider">
              Ward Occupancy Breakdown
            </p>

            {wardSummaries.length === 0 ? (
              <div className="p-4 text-center text-black font-medium text-xs rounded-lg bg-zinc-50 border border-zinc-200">
                No ward allocations found.
              </div>
            ) : (
              wardSummaries.slice(0, 4).map((ward) => (
                <div key={ward.ward} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-black">
                    <span className="font-bold text-black">{ward.ward}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-black font-bold">{ward.occupied}/{ward.total}</span>
                      <span
                        className={`font-black ${
                          ward.occupancyRate >= 80 ? 'text-amber-800' : 'text-black'
                        }`}
                      >
                        {ward.occupancyRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={ward.occupied}
                    max={ward.total}
                    indicatorColor={
                      ward.occupancyRate >= 85
                        ? 'bg-rose-500'
                        : ward.occupancyRate >= 75
                        ? 'bg-amber-500'
                        : 'bg-yellow-400'
                    }
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0">
        <Link href="/beds" className="w-full">
          <Button variant="default" size="sm" className="w-full text-xs flex items-center justify-center gap-1.5 shadow-md">
            <span>Manage Bed Allocations</span>
            <ArrowRight className="h-3.5 w-3.5 text-yellow-400" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
