import React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { AppointmentsView } from '@/components/appointments/AppointmentsView';
import { getDbAppointments } from '@/lib/services/appointment-service';

export const metadata: Metadata = {
  title: 'Appointments Schedule | MediFlow AI',
  description: 'Hospital master schedule, outpatient clinics, operating room procedures, and consultation slots.',
};

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const { appointments } = await getDbAppointments();

  return (
    <div className="space-y-6">
      <PageHeader
        category="Schedule & Outpatient"
        title="Appointments & Procedures"
        description="Master hospital clinical schedule, check-in tracking, room allocation, and attending physician rosters powered by PostgreSQL."
      />

      <AppointmentsView initialAppointments={appointments} />
    </div>
  );
}
