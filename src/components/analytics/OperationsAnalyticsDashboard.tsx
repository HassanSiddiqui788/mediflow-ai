'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Clock,
  Users,
  BedDouble,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dropdown } from '@/components/ui/dropdown';
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
  const [timeRange, setTimeRange] = useState<string>('Today');

  const timeRangeOptions = [
    { value: 'Today', label: 'Today' },
    { value: 'Last 7 Days', label: 'Last 7 Days' },
    { value: 'Last 30 Days', label: 'Last 30 Days' },
    { value: 'This Month', label: 'This Month' },
    { value: 'This Year', label: 'This Year' },
    { value: 'Custom Range', label: 'Custom Range' },
  ];

  const fetchAnalytics = React.useCallback(async (selectedRange?: string) => {
    try {
      setLoading(true);
      const range = selectedRange || timeRange;
      const res = await fetch(`/api/analytics/get?timeRange=${encodeURIComponent(range)}`, { cache: 'no-store' });
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
  }, [timeRange]);

  React.useEffect(() => {
    let ignore = false;
    fetch('/api/analytics/get?timeRange=Today', { cache: 'no-store' })
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

  const handleTimeRangeChange = (val: string) => {
    setTimeRange(val);
    fetchAnalytics(val);
  };

  const metrics = data?.metricsOverview;
  const hourlyVolume: HourlyVolumeItem[] = useMemo(() => data?.hourlyVolume || [], [data?.hourlyVolume]);
  const bedTrends: BedOccupancyTrend[] = useMemo(() => data?.bedOccupancyTrends || [], [data?.bedOccupancyTrends]);
  const workload: DepartmentWorkloadMetric[] = useMemo(() => data?.departmentWorkload || [], [data?.departmentWorkload]);

  const maxArrivals = useMemo(() => {
    if (hourlyVolume.length === 0) return 10;
    const maxVal = Math.max(
      ...hourlyVolume.flatMap((v: HourlyVolumeItem) => [v.emergencyArrivals, v.discharges, v.admissions || 0])
    );
    return maxVal > 0 ? maxVal : 10;
  }, [hourlyVolume]);

  const volumeChartTitle = useMemo(() => {
    switch (timeRange) {
      case 'Today':
        return 'Emergency Influx & Throughput by Hour';
      case 'Last 7 Days':
        return 'Emergency Influx & Throughput (Last 7 Days)';
      case 'Last 30 Days':
        return 'Emergency Influx & Throughput (Last 30 Days)';
      case 'This Month':
        return 'Monthly Emergency Influx & Throughput';
      case 'This Year':
        return 'Annual Emergency Influx & Throughput';
      default:
        return `Emergency Influx & Throughput (${timeRange})`;
    }
  }, [timeRange]);

  const volumeChartSubtitle = useMemo(() => {
    switch (timeRange) {
      case 'Today':
        return 'Hourly emergency arrival patterns';
      case 'Last 7 Days':
        return 'Daily emergency arrivals and throughput';
      case 'Last 30 Days':
      case 'This Month':
        return 'Periodic throughput and admission distribution';
      case 'This Year':
        return 'Monthly volume and discharge tracking';
      default:
        return 'Arrival and throughput distribution';
    }
  }, [timeRange]);

  const censusTrendTitle = useMemo(() => {
    switch (timeRange) {
      case 'Today':
        return "Today's Census Trend by Shift";
      case 'Last 7 Days':
        return '7-Day Census Trend';
      case 'Last 30 Days':
        return '30-Day Census Trend';
      case 'This Month':
        return 'Monthly Census Trend';
      case 'This Year':
        return 'Annual Census Trend by Quarter';
      default:
        return `Census Trend (${timeRange})`;
    }
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* Time Range Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-black text-black">Hospital Operations & Throughput Analytics (PostgreSQL)</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Dropdown
            value={timeRange}
            onChange={handleTimeRangeChange}
            options={timeRangeOptions}
            icon={<Calendar className="h-3.5 w-3.5" />}
            className="w-auto"
            menuClassName="w-48"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(timeRange)}
            disabled={loading}
            className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
            Refresh
          </Button>
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
            <span>Appointments ({timeRange})</span>
            <Clock className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black font-mono text-black mt-1">
            {metrics?.todayAppointments ?? '...'}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-sky-900 font-mono font-bold mt-1">
            <span>Clinical consultations in range</span>
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
                <CardTitle className="text-base text-black font-black">{volumeChartTitle}</CardTitle>
                <p className="text-xs text-zinc-950 font-medium">{volumeChartSubtitle}</p>
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
                        className="bg-rose-500 h-full rounded-l-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, (item.emergencyArrivals / maxArrivals) * 60)}%` }}
                      />
                      <div
                        className="bg-emerald-500 h-full rounded-r-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, (item.discharges / maxArrivals) * 40)}%` }}
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
                <CardTitle className="text-base text-black font-black">{censusTrendTitle}</CardTitle>
                <p className="text-xs text-zinc-950 font-medium">Occupied beds by clinical division</p>
              </div>
              <Badge variant="gold" size="sm">
                Inpatient
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-3">
                {bedTrends.map((trend) => (
                  <div key={trend.day} className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-300 text-xs flex items-center justify-between shadow-xs hover:border-zinc-400 transition-colors">
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
