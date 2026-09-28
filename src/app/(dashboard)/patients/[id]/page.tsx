import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PatientDetailView } from '@/components/patients/PatientDetailView';
import { getDbPatientById } from '@/lib/services/patient-service';

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PatientPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await getDbPatientById(id);

  return {
    title: patient ? `${patient.name} (${patient.id}) | MediFlow AI` : 'Patient Record | MediFlow AI',
    description: patient
      ? `Clinical details, vitals, medical history, and lab reports for ${patient.name}.`
      : 'Patient details and operations records.',
  };
}

export default async function PatientDetailPage({ params }: PatientPageProps) {
  const { id } = await params;
  const patient = await getDbPatientById(id);

  if (!patient) {
    notFound();
  }

  return <PatientDetailView patient={patient} />;
}
