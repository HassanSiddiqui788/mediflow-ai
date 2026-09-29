import React from 'react';
import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/DashboardView';
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
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

  return (
    <DashboardView
      initialMetrics={metrics}
      initialInsights={insights}
      initialEmergencyCases={emergencyData.emergencyCases}
      initialBeds={bedsData.beds}
      initialWardSummaries={wardSummaries}
      initialDepartmentStatuses={departmentStatuses}
      initialAppointments={appointmentsData.appointments}
    />
  );
}

export default DashboardPage;
