import React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { PatientTable } from '@/components/patients/PatientTable';
import { getDbPatients } from '@/lib/services/patient-service';

export const metadata: Metadata = {
  title: 'Patients Directory | MediFlow AI',
  description: 'Manage hospital patient records, MRN rosters, medical histories, and active inpatient admissions.',
};

export const dynamic = 'force-dynamic';

export default async function PatientsPage() {
  const { patients: initialPatients } = await getDbPatients();

  return (
    <div className="space-y-6">
      <PageHeader
        category="Directory & Admissions"
        title="Patient Management"
        description="Comprehensive master patient index (MPI) with active admissions, clinical departments, assigned physicians, and EHR records powered by PostgreSQL."
      />

      <PatientTable initialPatients={initialPatients} />
    </div>
  );
}
