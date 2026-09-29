'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  Users,
  BedDouble,
  Activity,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  HourlyVolumeItem,
  BedOccupancyTrend,
  DepartmentWorkloadMetric,
  MetricOverview,
} from '@/types/analytics';

interface AnalyticsData {
  metricsOverview: MetricOverview;
  hourlyVolume: HourlyVolumeItem[];
  bedOccupancyTrends: BedOccupancyTrend[];
  departmentWorkload: DepartmentWorkloadMetric[];
}

interface OperationsAnalyticsDashboardProps {
  initialData?: AnalyticsData;
}

export function OperationsAnalyticsDashboard({ initialData }: OperationsAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('today');

  const fetchAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/get', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else if (json.metricsOverview) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    fetch('/api/analytics/get', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json.success && json.data) {
            setData(json.data);
          } else if (json.metricsOverview) {
            setData(json);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const metrics = data?.metricsOverview;
  const hourlyVolume = data?.hourlyVolume || [];
  const bedTrends = data?.bedOccupancyTrends || [];
  const workload = data?.departmentWorkload || [];

  const maxArrivals = hourlyVolume.length > 0 ? Math.max(...hourlyVolume.map((v) => v.emergencyArrivals)) : 10;

  return (
    <div className="space-y-6">
      {/* Time Range Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-black text-black">Hospital Operations & Throughput Analytics (PostgreSQL)</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
            className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
            Refresh
          </Button>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 border border-zinc-300 text-xs">
            {(['today', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md font-bold transition-colors uppercase cursor-pointer ${
                  timeRange === r
                    ? 'bg-zinc-900 text-white font-black shadow-xs'
                    : 'text-black hover:bg-zinc-200'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Operations KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-black font-bold">
            <span>Total Census (Database)</span>
            <Users className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-black font-mono text-black mt-1">
            {metrics?.totalPatients.toLocaleString() ?? '...'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-900 font-mono font-bold mt-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Master patient index count</span>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-black font-bold">
            <span>Today&apos;s Appointments</span>
            <Clock className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black font-mono text-black mt-1">
            {metrics?.todayAppointments ?? '...'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-sky-900 font-mono font-bold mt-1">
            <span>Scheduled clinical consultations</span>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-black font-bold">
            <span>Available Beds</span>
            <BedDouble className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-black font-mono text-black mt-1">
            {metrics?.availableBeds ?? '...'} / {metrics?.totalBeds ?? '...'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-amber-900 font-mono font-bold mt-1">
            <span>Ready for inpatient admissions</span>
          </div>
        </Card>

        <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-black font-bold">
            <span>Mean ED Wait Time</span>
            <Activity className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black font-mono text-black mt-1">
            {metrics?.avgEmergencyWaitTime ?? '...'}m
          </p>
          <div className="flex items-center gap-1 text-[11px] text-rose-950 font-mono font-bold mt-1">
            <span>Active emergency triage queue</span>
          </div>
        </Card>
      </div>

      {/* 2-Column Analytics: Hourly Emergency Flow & Bed Occupancy Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Volume Chart */}
        <div className="lg:col-span-7">
          <Card variant="glass" className="h-full border-zinc-300 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base text-black font-black">Emergency Influx & Throughput by Hour</CardTitle>
                <p className="text-xs text-zinc-950 font-medium">Hourly emergency arrival patterns</p>
              </div>
              <Badge variant="rose" size="sm">
                ER Flow
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              <div className="space-y-3">
                {hourlyVolume.map((item) => (
                  <div key={item.hour} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-black font-mono text-[11px]">
                      <span className="font-bold text-black">{item.hour}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-rose-950 font-black">Arrivals: {item.emergencyArrivals}</span>
                        <span className="text-emerald-950 font-black">Discharges: {item.discharges}</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-zinc-100 flex overflow-hidden border border-zinc-300">
                      <div
                        className="bg-rose-500 h-full rounded-l-full"
                        style={{ width: `${(item.emergencyArrivals / maxArrivals) * 60}%` }}
                      />
                      <div
                        className="bg-emerald-500 h-full rounded-r-full"
                        style={{ width: `${(item.discharges / maxArrivals) * 40}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Bed Occupancy Trend */}
        <div className="lg:col-span-5">
          <Card variant="glass" className="h-full border-zinc-300 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base text-black font-black">7-Day Census Trend</CardTitle>
                <p className="text-xs text-zinc-950 font-medium">Occupied beds by clinical division</p>
              </div>
              <Badge variant="gold" size="sm">
                Inpatient
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-3">
                {bedTrends.map((trend) => (
                  <div key={trend.day} className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-xs flex items-center justify-between shadow-xs">
                    <span className="font-black font-mono text-black">{trend.day}</span>
                    <div className="flex items-center gap-4 font-mono text-[11px]">
                      <span className="text-rose-950 font-black">ICU: {trend.icu}</span>
                      <span className="text-sky-950 font-black">General: {trend.general}</span>
                      <span className="text-amber-950 font-black">Surg: {trend.surgical}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Workload Matrix */}
      <Card variant="glass" className="border-zinc-300 bg-white shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base text-black font-black">Department Capacity & Utilization Matrix</CardTitle>
            <p className="text-xs text-zinc-950 font-medium">Real-time resource utilization against target operational capacity</p>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workload.map((dept) => (
              <div key={dept.department} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-300 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-black">{dept.department}</span>
                  <span
                    className={`font-mono text-xs font-black ${
                      dept.utilizationRate > 85 ? 'text-rose-950 font-black' : 'text-yellow-950 font-black'
                    }`}
                  >
                    {dept.utilizationRate}%
                  </span>
                </div>

                <Progress
                  value={dept.utilizationRate}
                  max={100}
                  indicatorColor={dept.utilizationRate > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-yellow-500 to-amber-500'}
                />

                <div className="flex justify-between text-[10px] text-zinc-950 font-mono font-bold pt-1">
                  <span>Active: {dept.currentActive}</span>
                  <span>Capacity: {dept.totalCapacity}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
