import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Flame,
  BedDouble,
  Sparkles,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/layout/stat-card';
import { AIAlertBanner } from '@/components/dashboard/AIAlertBanner';
import { EmergencyQuickView } from '@/components/dashboard/EmergencyQuickView';
import { BedOccupancyVisualizer } from '@/components/dashboard/BedOccupancyVisualizer';
import { DepartmentStatusGrid } from '@/components/dashboard/DepartmentStatusGrid';
import { UpcomingAppointmentsCard } from '@/components/dashboard/UpcomingAppointmentsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getDbMetricOverview,
  getDbDepartmentStatuses,
} from '@/lib/services/analytics-service';
import { getDbOperationalAIInsights } from '@/lib/services/ai-service';
import { getDbEmergencyCases } from '@/lib/services/emergency-service';
import { getDbBeds, getDbWardSummaries } from '@/lib/services/bed-service';
import { getDbAppointments } from '@/lib/services/appointment-service';

export const metadata: Metadata = {
  title: 'Operations Dashboard | MediFlow AI',
  description: 'Real-time hospital operations, emergency triage, bed occupancy, and AI operational insights.',
};

export const dynamic = 'force-dynamic';

export async function DashboardPage() {
  const [
    metrics,
    insights,
    emergencyData,
    bedsData,
    wardSummaries,
    departmentStatuses,
    appointmentsData,
  ] = await Promise.all([
    getDbMetricOverview(),
    getDbOperationalAIInsights(),
    getDbEmergencyCases(),
    getDbBeds(),
    getDbWardSummaries(),
    getDbDepartmentStatuses(),
    getDbAppointments(),
  ]);

  const emergencyCases = emergencyData.emergencyCases;
  const beds = bedsData.beds;
  const appointments = appointmentsData.appointments;

  const occupancyRate =
    metrics.totalBeds > 0
      ? Math.round(((metrics.totalBeds - metrics.availableBeds) / metrics.totalBeds) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="Command Center"
        title="Hospital Operations Overview"
        description="Live operational telemetry, triage capacity, inpatient census, and real-time AI resource optimization powered by PostgreSQL."
      >
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="default" dot dotPulse className="font-bold">
            PostgreSQL Live Sync
          </Badge>
          <Link href="/analytics">
            <Button variant="outline" size="sm" className="text-xs border-zinc-300 hover:bg-zinc-100 text-black font-bold shadow-xs">
              <Activity className="h-3.5 w-3.5 mr-1 text-black" />
              View Analytics
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Main Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={metrics.totalPatients.toLocaleString()}
          change={metrics.totalPatientsChange}
          changeLabel="census in database"
          icon={<Users className="h-5 w-5" />}
          accent="gold"
        />

        <StatCard
          title="Today's Appointments"
          value={metrics.todayAppointments}
          change={metrics.todayAppointmentsChange}
          changeLabel="scheduled in database"
          icon={<Calendar className="h-5 w-5" />}
          accent="amber"
        />

        <StatCard
          title="Emergency Patients"
          value={metrics.emergencyPatients}
          change={metrics.emergencyPatientsChange}
          changeLabel="active in triage/bays"
          icon={<Flame className="h-5 w-5" />}
          accent="rose"
        />

        <StatCard
          title="Available Beds"
          value={`${metrics.availableBeds} / ${metrics.totalBeds}`}
          subtext={`${occupancyRate}% Total Hospital Occupancy`}
          icon={<BedDouble className="h-5 w-5" />}
          accent="yellow"
        />
      </div>

      {/* AI Operational Intelligence Highlight Banner */}
      <AIAlertBanner initialInsights={insights} />

      {/* 2-Column Core Clinical Operations: Emergency & Bed Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmergencyQuickView cases={emergencyCases} />
        <BedOccupancyVisualizer wardSummaries={wardSummaries} beds={beds} />
      </div>

      {/* Department Status Grid */}
      <DepartmentStatusGrid departmentStatuses={departmentStatuses} />

      {/* Bottom Row: Upcoming Appointments & AI Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <UpcomingAppointmentsCard appointments={appointments} />
        </div>

        {/* Quick Operations Orchestration Card */}
        <div className="lg:col-span-5">
          <Card variant="glass" className="h-full flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                    <CardTitle className="text-base text-black font-extrabold">AI Resource Protocols</CardTitle>
                  </div>
                  <p className="text-xs text-zinc-950 font-medium">Automated orchestration recommendations</p>
                </div>
                <Badge variant="gold" size="sm" className="font-bold">
                  {insights.length} Active
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                {insights.slice(0, 2).map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black truncate">{ins.title}</span>
                      <Badge variant={ins.severity === 'critical' ? 'rose' : 'gold'} size="sm" className="font-bold">
                        {ins.severity}
                      </Badge>
                    </div>
                    <p className="text-zinc-950 font-medium text-[11px] line-clamp-2">
                      {ins.recommendedAction}
                    </p>
                  </div>
                ))}
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Link href="/ai-insights" className="w-full">
                <Button variant="default" size="sm" className="w-full text-xs shadow-md">
                  <span>Open AI Intelligence Hub</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1 text-yellow-400" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
