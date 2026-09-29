'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Activity,
  Droplet,
  Thermometer,
  Wind,
  Calendar,
  Phone,
  Shield,
  AlertTriangle,
  Pill,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Patient } from '@/types/patient';
import { getStatusBadgeStyles } from '@/lib/utils';

export function PatientDetailView({ patient: initialPatient }: { patient: Patient }) {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchPatient = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/patients/get?id=${encodeURIComponent(initialPatient.id)}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setPatient(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch patient details:', err);
    }
  }, [initialPatient.id]);

  React.useEffect(() => {
    let ignore = false;
    fetch(`/api/patients/get?id=${encodeURIComponent(initialPatient.id)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setPatient(json.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch patient details:', err);
      });

    return () => {
      ignore = true;
    };
  }, [initialPatient.id]);

  const statusStyle = getStatusBadgeStyles(patient.status);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between">
        <Link href="/patients">
          <Button variant="outline" size="sm" className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Patient Directory
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatient}
            className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
            title="Refresh record from PostgreSQL"
          >
            Refresh
          </Button>
          <Badge variant={patient.status === 'Critical' ? 'rose' : 'gold'} dot dotPulse>
            {patient.status}
          </Badge>
          <span className="text-xs text-zinc-950 font-bold font-mono">MRN: {patient.mrn}</span>
        </div>
      </div>

      {/* Patient Master Card Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-zinc-200 bg-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-xl shadow-yellow-500/20 shrink-0">
              <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center font-mono font-bold text-2xl text-yellow-300">
                {patient.name[0]}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-black tracking-tight">{patient.name}</h1>
                <Badge variant="default" className="font-mono text-xs">
                  {patient.id}
                </Badge>
                <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${statusStyle.bg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  <span>{patient.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-950 font-bold font-mono">
                <span>{patient.age} years old</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span>DOB: {patient.dob}</span>
                <span>•</span>
                <span className="text-yellow-700 font-black">Blood: {patient.bloodGroup}</span>
                {patient.bedNumber && (
                  <>
                    <span>•</span>
                    <span className="text-amber-700 font-black">Bed: {patient.bedNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Doctor / Care Info */}
          <div className="flex flex-col sm:flex-row gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs shadow-xs">
            <div>
              <p className="text-[10px] uppercase font-black text-black">Department</p>
              <p className="font-bold text-black">{patient.department}</p>
            </div>
            <div className="sm:border-l border-zinc-300 sm:pl-3">
              <p className="text-[10px] uppercase font-black text-black">Attending Physician</p>
              <p className="font-bold text-black">{patient.doctor}</p>
            </div>
            {patient.admissionDate && (
              <div className="sm:border-l border-zinc-300 sm:pl-3">
                <p className="text-[10px] uppercase font-black text-black">Admitted</p>
                <p className="font-bold font-mono text-black">{patient.admissionDate}</p>
              </div>
            )}
          </div>
        </div>

        {/* Allergies & Insurance Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-black flex items-center gap-1 font-bold">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Known Allergies:
            </span>
            {patient.allergies.map((allergy, i) => (
              <Badge key={i} variant={allergy.includes('NKDA') ? 'default' : 'rose'} size="sm">
                {allergy}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 text-black font-medium">
            <Shield className="h-3.5 w-3.5 text-yellow-600" />
            <span>Insurance: <strong className="text-black font-bold">{patient.insuranceProvider}</strong> ({patient.policyNumber})</span>
          </div>
        </div>
      </div>

      {/* Vital Signs Live Telemetry Card */}
      {patient.vitals && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Heart Rate */}
          <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
            <div className="flex items-center justify-between text-xs text-black font-bold">
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-600 animate-pulse" /> Heart Rate
              </span>
              <span className="text-[10px] text-zinc-950 font-bold font-mono">bpm</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-black">
                {patient.vitals.heartRate}
              </span>
              <span className={`text-[10px] font-mono font-bold ${patient.vitals.heartRate > 100 || patient.vitals.heartRate < 60 ? 'text-amber-900' : 'text-emerald-900'}`}>
                {patient.vitals.heartRate > 100 ? 'Tachycardia' : patient.vitals.heartRate < 60 ? 'Bradycardia' : 'Normal (60-100)'}
              </span>
            </div>
          </Card>

          {/* Blood Pressure */}
          <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
            <div className="flex items-center justify-between text-xs text-black font-bold">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-sky-600" /> Blood Pressure
              </span>
              <span className="text-[10px] text-zinc-950 font-bold font-mono">mmHg</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-black">
                {patient.vitals.bloodPressure}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-900">Target</span>
            </div>
          </Card>

          {/* SpO2 */}
          <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
            <div className="flex items-center justify-between text-xs text-black font-bold">
              <span className="flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5 text-yellow-600" /> Oxygen Sat (SpO2)
              </span>
              <span className="text-[10px] text-zinc-950 font-bold font-mono">%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono ${patient.vitals.oxygenSaturation < 95 ? 'text-rose-600' : 'text-black'}`}>
                {patient.vitals.oxygenSaturation}%
              </span>
              <span className={`text-[10px] font-mono font-bold ${patient.vitals.oxygenSaturation < 95 ? 'text-rose-900 font-bold' : 'text-emerald-900'}`}>
                {patient.vitals.oxygenSaturation < 95 ? 'Hypoxemia Alert' : 'Normal (>95%)'}
              </span>
            </div>
          </Card>

          {/* Temperature */}
          <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
            <div className="flex items-center justify-between text-xs text-black font-bold">
              <span className="flex items-center gap-1.5">
                <Thermometer className="h-3.5 w-3.5 text-amber-600" /> Temperature
              </span>
              <span className="text-[10px] text-zinc-950 font-bold font-mono">°C</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono ${patient.vitals.temperature >= 38 ? 'text-rose-600' : 'text-black'}`}>
                {patient.vitals.temperature}°
              </span>
              <span className={`text-[10px] font-mono font-bold ${patient.vitals.temperature >= 38 ? 'text-rose-900' : 'text-emerald-900'}`}>
                {patient.vitals.temperature >= 38 ? 'Febrile' : 'Afebrile'}
              </span>
            </div>
          </Card>

          {/* Respiratory Rate */}
          <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-black font-bold">
              <span className="flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-yellow-600" /> Resp Rate
              </span>
              <span className="text-[10px] text-zinc-950 font-bold font-mono">/min</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-black">
                {patient.vitals.respiratoryRate}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-900">Normal</span>
            </div>
          </Card>
        </div>
      )}

      {/* Detail Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-100 border border-zinc-300">
          <TabsTrigger value="overview">Clinical History & Notes</TabsTrigger>
          <TabsTrigger value="labs" badge={patient.labReports.length}>
            Laboratory Reports
          </TabsTrigger>
          <TabsTrigger value="appointments" badge={patient.appointments.length}>
            Appointments
          </TabsTrigger>
          <TabsTrigger value="contact">Contact & Emergency</TabsTrigger>
        </TabsList>

        {/* Overview & Medical History Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card variant="glass" className="border-zinc-300 bg-white shadow-xs">
            <CardHeader>
              <CardTitle className="text-base text-black font-black">Clinical Records & Diagnostic History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.medicalHistory.length === 0 ? (
                <p className="text-xs text-black font-medium py-4">No historical medical notes recorded yet.</p>
              ) : (
                patient.medicalHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-zinc-50 border border-zinc-300 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200">
                      <div>
                        <span className="font-black text-sm text-black">{rec.diagnosis}</span>
                        <p className="text-[11px] text-zinc-950 font-bold font-mono">
                          {rec.department} • Recorded by {rec.doctor}
                        </p>
                      </div>
                      <Badge variant="outline" size="sm" className="font-mono font-bold self-start sm:self-auto border-zinc-300 text-black">
                        {rec.date}
                      </Badge>
                    </div>

                    <p className="text-xs text-black font-medium leading-relaxed">{rec.notes}</p>

                    {rec.prescription && rec.prescription.length > 0 && (
                      <div className="pt-2 border-t border-zinc-200">
                        <p className="text-[11px] font-black text-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Pill className="h-3 w-3 text-yellow-600" /> Prescribed Medications:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.prescription.map((rx, idx) => (
                            <Badge key={idx} variant="gold" size="sm">
                              {rx}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laboratory Reports Tab */}
        <TabsContent value="labs" className="space-y-4">
          <Card variant="glass" className="border-zinc-300 bg-white shadow-xs">
            <CardHeader>
              <CardTitle className="text-base text-black font-black">Diagnostic Laboratory Assays</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.labReports.length === 0 ? (
                <p className="text-xs text-black font-medium py-4">No laboratory reports available for this patient.</p>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {patient.labReports.map((lab) => (
                    <div key={lab.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">{lab.testName}</span>
                          {lab.isAbnormal && (
                            <Badge variant="rose" size="sm">
                              Flagged Abnormal
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-950 font-bold font-mono">
                          Category: {lab.category} • Ref Range: {lab.referenceRange} • Date: {lab.date}
                        </p>
                      </div>

                      <div className="text-right sm:self-center">
                        <div className={`font-mono font-black text-sm ${lab.isAbnormal ? 'text-rose-900' : 'text-emerald-900'}`}>
                          {lab.result}
                        </div>
                        <Badge variant={lab.status === 'Completed' ? 'emerald' : 'amber'} size="sm" className="mt-1">
                          {lab.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card variant="glass" className="border-zinc-300 bg-white shadow-xs">
            <CardHeader>
              <CardTitle className="text-base text-black font-black">Scheduled & Past Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.appointments.length === 0 ? (
                <p className="text-xs text-black font-medium py-4">No appointment records on file.</p>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {patient.appointments.map((apt) => (
                    <div key={apt.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-800">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-black">{apt.type} with {apt.doctor}</p>
                          <p className="text-[11px] text-zinc-950 font-bold font-mono">
                            {apt.date} at {apt.time} • {apt.department}
                          </p>
                        </div>
                      </div>
                      <Badge variant={apt.status === 'Completed' ? 'emerald' : 'sky'} size="sm">
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass" className="p-5 space-y-3 border-zinc-300 bg-white shadow-xs">
              <h3 className="font-black text-sm text-black flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-600" /> Patient Contact Details
              </h3>
              <div className="space-y-2 text-xs text-black font-medium">
                <p><strong className="text-black font-bold">Primary Phone:</strong> {patient.phone}</p>
                <p><strong className="text-black font-bold">Email:</strong> {patient.email}</p>
                <p><strong className="text-black font-bold">Residential Address:</strong> {patient.address}</p>
              </div>
            </Card>

            <Card variant="glass" className="p-5 space-y-3 border-zinc-300 bg-white shadow-xs">
              <h3 className="font-black text-sm text-black flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Emergency Contact (Next of Kin)
              </h3>
              <div className="space-y-2 text-xs text-black font-medium">
                <p><strong className="text-black font-bold">Contact Name:</strong> {patient.emergencyContact.name}</p>
                <p><strong className="text-black font-bold">Relationship:</strong> {patient.emergencyContact.relationship}</p>
                <p><strong className="text-black font-bold">Emergency Phone:</strong> {patient.emergencyContact.phone}</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
