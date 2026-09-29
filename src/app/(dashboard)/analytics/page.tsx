import React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { OperationsAnalyticsDashboard } from '@/components/analytics/OperationsAnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  getDbMetricOverview,
  getDbHourlyVolume,
  getDbBedOccupancyTrends,
  getDbDepartmentWorkload,
} from '@/lib/services/analytics-service';

export const metadata: Metadata = {
  title: 'Hospital Operational Analytics | MediFlow AI',
  description: 'Operations analytics, patient flow, bed occupancy trends, average length of stay (ALOS), and department capacity utilization.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AnalyticsPage() {
  const [metricsOverview, hourlyVolume, bedOccupancyTrends, departmentWorkload] =
    await Promise.all([
      getDbMetricOverview(),
      getDbHourlyVolume(),
      getDbBedOccupancyTrends(),
      getDbDepartmentWorkload(),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        category="Intelligence & Metrics"
        title="Operations Analytics & Throughput"
        description="Comprehensive operational performance tracking, door-to-provider distributions, department utilization, and 7-day census trends powered by PostgreSQL."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs border-slate-800">
            <Download className="h-3.5 w-3.5 mr-1 text-slate-400" />
            Export Executive Report
          </Button>
        </div>
      </PageHeader>

      <OperationsAnalyticsDashboard
        initialData={{
          metricsOverview,
          hourlyVolume,
          bedOccupancyTrends,
          departmentWorkload,
        }}
      />
    </div>
  );
}
