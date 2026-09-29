'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Flame,
  BedDouble,
  Sparkles,
  ArrowRight,
  Activity,
  RefreshCw,
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
import { MetricOverview, DepartmentStatusItem } from '@/types/analytics';
import { OperationalInsight } from '@/types/ai';
import { EmergencyPatient } from '@/types/emergency';
import { Bed, WardSummary, WardType } from '@/types/bed';
import { Appointment } from '@/types/appointment';

interface DashboardViewProps {
  initialMetrics?: MetricOverview;
  initialInsights?: OperationalInsight[];
  initialEmergencyCases?: EmergencyPatient[];
  initialBeds?: Bed[];
  initialWardSummaries?: WardSummary[];
  initialDepartmentStatuses?: DepartmentStatusItem[];
  initialAppointments?: Appointment[];
}

export function DashboardView({
  initialMetrics,
  initialInsights = [],
  initialEmergencyCases = [],
  initialBeds = [],
  initialWardSummaries = [],
  initialDepartmentStatuses = [],
  initialAppointments = [],
}: DashboardViewProps) {
  const [metrics, setMetrics] = useState<MetricOverview | undefined>(initialMetrics);
  const [insights, setInsights] = useState<OperationalInsight[]>(initialInsights);
  const [emergencyCases, setEmergencyCases] = useState<EmergencyPatient[]>(initialEmergencyCases);
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [wardSummaries, setWardSummaries] = useState<WardSummary[]>(initialWardSummaries);
  const [departmentStatuses, setDepartmentStatuses] = useState<DepartmentStatusItem[]>(initialDepartmentStatuses);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(!initialMetrics);

  const computeWardSummaries = (bedList: Bed[]): WardSummary[] => {
    const wardMap = new Map<
      WardType,
      { total: number; occupied: number; available: number; cleaning: number }
    >();

    for (const b of bedList) {
      const w = b.ward as WardType;
      if (!wardMap.has(w)) {
        wardMap.set(w, { total: 0, occupied: 0, available: 0, cleaning: 0 });
      }
      const stats = wardMap.get(w)!;
      stats.total++;
      if (b.status === 'Occupied') stats.occupied++;
      else if (b.status === 'Available') stats.available++;
      else if (b.status === 'Cleaning') stats.cleaning++;
    }

    const summaries: WardSummary[] = [];
    for (const [ward, stats] of wardMap.entries()) {
      summaries.push({
        ward,
        total: stats.total,
        occupied: stats.occupied,
        available: stats.available,
        cleaning: stats.cleaning,
        occupancyRate: stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0,
      });
    }
    return summaries;
  };

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [analyticsRes, insightsRes, emergencyRes, bedsRes, aptsRes] = await Promise.all([
        fetch('/api/analytics/get', { cache: 'no-store' }),
        fetch('/api/ai/insights', { cache: 'no-store' }),
        fetch('/api/emergency/list', { cache: 'no-store' }),
        fetch('/api/beds/list', { cache: 'no-store' }),
        fetch('/api/appointments/list', { cache: 'no-store' }),
      ]);

      const [analyticsJson, insightsJson, emergencyJson, bedsJson, aptsJson] = await Promise.all([
        analyticsRes.json(),
        insightsRes.json(),
        emergencyRes.json(),
        bedsRes.json(),
        aptsRes.json(),
      ]);

      if (analyticsJson.success && analyticsJson.data) {
        if (analyticsJson.data.metricsOverview) {
          setMetrics(analyticsJson.data.metricsOverview);
        }
        if (analyticsJson.data.departmentStatuses) {
          setDepartmentStatuses(analyticsJson.data.departmentStatuses);
        }
      }

      if (insightsJson.success && Array.isArray(insightsJson.data)) {
        setInsights(insightsJson.data);
      } else if (Array.isArray(insightsJson.insights)) {
        setInsights(insightsJson.insights);
      }

      if (emergencyJson.success && Array.isArray(emergencyJson.data)) {
        setEmergencyCases(emergencyJson.data);
      }

      if (bedsJson.success && Array.isArray(bedsJson.data)) {
        setBeds(bedsJson.data);
        setWardSummaries(computeWardSummaries(bedsJson.data));
      }

      if (aptsJson.success && Array.isArray(aptsJson.data)) {
        setAppointments(aptsJson.data);
      }
    } catch (err) {
      console.error('Failed to load live dashboard data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch('/api/analytics/get', { cache: 'no-store' }),
      fetch('/api/ai/insights', { cache: 'no-store' }),
      fetch('/api/emergency/list', { cache: 'no-store' }),
      fetch('/api/beds/list', { cache: 'no-store' }),
      fetch('/api/appointments/list', { cache: 'no-store' }),
    ])
      .then(([aRes, iRes, eRes, bRes, aptRes]) =>
        Promise.all([aRes.json(), iRes.json(), eRes.json(), bRes.json(), aptRes.json()])
      )
      .then(([analyticsJson, insightsJson, emergencyJson, bedsJson, aptsJson]) => {
        if (!ignore) {
          if (analyticsJson.success && analyticsJson.data) {
            if (analyticsJson.data.metricsOverview) setMetrics(analyticsJson.data.metricsOverview);
            if (analyticsJson.data.departmentStatuses) setDepartmentStatuses(analyticsJson.data.departmentStatuses);
          }
          if (insightsJson.success && Array.isArray(insightsJson.data)) {
            setInsights(insightsJson.data);
          } else if (Array.isArray(insightsJson.insights)) {
            setInsights(insightsJson.insights);
          }
          if (emergencyJson.success && Array.isArray(emergencyJson.data)) {
            setEmergencyCases(emergencyJson.data);
          }
          if (bedsJson.success && Array.isArray(bedsJson.data)) {
            setBeds(bedsJson.data);
            setWardSummaries(computeWardSummaries(bedsJson.data));
          }
          if (aptsJson.success && Array.isArray(aptsJson.data)) {
            setAppointments(aptsJson.data);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load live dashboard data:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const occupancyRate = useMemo(() => {
    if (!metrics || metrics.totalBeds === 0) return 0;
    return Math.round(((metrics.totalBeds - metrics.availableBeds) / metrics.totalBeds) * 100);
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="Command Center"
        title="Hospital Operations Overview"
        description="Live operational telemetry, triage capacity, inpatient census, and real-time AI resource optimization powered by PostgreSQL."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            disabled={loading}
            className="text-xs border-zinc-300 hover:bg-zinc-100 text-black font-bold shadow-xs"
            title="Refresh latest database state"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
            Refresh
          </Button>

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
          value={metrics ? metrics.totalPatients.toLocaleString() : '...'}
          change={metrics?.totalPatientsChange ?? 0}
          changeLabel="census in database"
          icon={<Users className="h-5 w-5" />}
          accent="gold"
        />

        <StatCard
          title="Today's Appointments"
          value={metrics ? metrics.todayAppointments : '...'}
          change={metrics?.todayAppointmentsChange ?? 0}
          changeLabel="scheduled in database"
          icon={<Calendar className="h-5 w-5" />}
          accent="amber"
        />

        <StatCard
          title="Emergency Patients"
          value={metrics ? metrics.emergencyPatients : '...'}
          change={metrics?.emergencyPatientsChange ?? 0}
          changeLabel="active in triage/bays"
          icon={<Flame className="h-5 w-5" />}
          accent="rose"
        />

        <StatCard
          title="Available Beds"
          value={metrics ? `${metrics.availableBeds} / ${metrics.totalBeds}` : '...'}
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
