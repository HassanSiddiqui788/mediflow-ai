import React from 'react';
import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DepartmentStatusItem } from '@/types/analytics';
import { getStatusBadgeStyles } from '@/lib/utils';

interface DepartmentStatusGridProps {
  departmentStatuses?: DepartmentStatusItem[];
}

export function DepartmentStatusGrid({ departmentStatuses = [] }: DepartmentStatusGridProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-yellow-600" />
            <CardTitle className="text-base text-black font-extrabold">Department Operational Status</CardTitle>
          </div>
          <p className="text-xs text-zinc-950 font-medium">Live operational load & wait times (PostgreSQL)</p>
        </div>
        <Badge variant="gold" size="sm" dot dotPulse className="font-bold">
          Active Units: {departmentStatuses.length}
        </Badge>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departmentStatuses.map((dept) => {
            const badgeStyle = getStatusBadgeStyles(dept.load);

            return (
              <div
                key={dept.department}
                className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all space-y-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-black group-hover:text-zinc-900 transition-colors truncate">
                    {dept.department}
                  </span>
                  <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 shrink-0 ${badgeStyle.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                    <span>{dept.load}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-black border-t border-zinc-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black block">Patients</span>
                    <span className="font-mono font-black text-black">{dept.activePatients}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black block">Staff</span>
                    <span className="font-mono font-black text-black">{dept.availableStaff}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-black block">Avg Wait</span>
                    <span className="font-mono font-black text-black">{dept.avgWaitMinutes}m</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
