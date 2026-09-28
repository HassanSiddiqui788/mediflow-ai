'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HOSPITAL_DEPARTMENTS } from '@/lib/constants';
import { UserPlus, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Patient } from '@/types/patient';

interface AdmitPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: (patient: Patient) => void;
}

export function AdmitPatientDialog({
  open,
  onOpenChange,
  onPatientCreated,
}: AdmitPatientDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '1985-06-15',
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+1 (555) ',
    email: '',
    address: '123 Health Ave, Metro City',
    department: 'General Medicine',
    doctor: 'Dr. David Chen, MD',
    status: 'Inpatient',
    bedNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: 'Spouse',
    insuranceProvider: 'Blue Cross Premier Health',
    policyNumber: 'BC-1092834',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/patients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dob: formData.dob,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone,
          email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@mediflow.net`,
          address: formData.address,
          department: formData.department,
          attendingDoctor: formData.doctor,
          status: formData.status,
          bedNumber: formData.bedNumber || undefined,
          emergencyContact: {
            name: formData.emergencyContactName || 'Family Contact',
            relationship: formData.emergencyContactRel || 'Contact',
            phone: formData.emergencyContactPhone || formData.phone,
          },
          insuranceProvider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.error?.message || (typeof data.error === 'string' ? data.error : 'Failed to admit patient');
        throw new Error(msg);
      }

      if (onPatientCreated) {
        onPatientCreated(data.data);
      }

      onOpenChange(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dob: '1985-06-15',
        gender: 'Female',
        bloodGroup: 'O+',
        phone: '+1 (555) ',
        email: '',
        address: '123 Health Ave, Metro City',
        department: 'General Medicine',
        doctor: 'Dr. David Chen, MD',
        status: 'Inpatient',
        bedNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRel: 'Spouse',
        insuranceProvider: 'Blue Cross Premier Health',
        policyNumber: 'BC-1092834',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl bg-white border-zinc-300 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-black font-black">
            <UserPlus className="h-5 w-5 text-yellow-600" />
            <span>Admit / Register New Patient</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-950 font-medium">
            Enter patient demographics, department assignment, and insurance details to save to PostgreSQL.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-black">First Name *</label>
              <Input
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Marcus"
                className="mt-1 bg-white border-zinc-300 text-black font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-black">Last Name *</label>
              <Input
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Vance"
                className="mt-1 bg-white border-zinc-300 text-black font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-black">Date of Birth</label>
              <Input
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="mt-1 bg-white border-zinc-300 text-black font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-black">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold shadow-xs"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-black">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="mt-1 w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-bold font-mono shadow-xs"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-black">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="mt-1 font-mono text-xs bg-white border-zinc-300 text-black font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-black">Email (Optional)</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@email.com"
                className="mt-1 text-xs bg-white border-zinc-300 text-black font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-black">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold shadow-xs"
              >
                {HOSPITAL_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-black">Attending Physician</label>
              <Input
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                placeholder="Dr. Name"
                className="mt-1 text-xs bg-white border-zinc-300 text-black font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-black">Admission Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold shadow-xs"
              >
                <option value="Inpatient">Inpatient</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Active">Active</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-black">Assigned Bed (Optional)</label>
              <Input
                name="bedNumber"
                value={formData.bedNumber}
                onChange={handleChange}
                placeholder="e.g. ICU-04, GW-12"
                className="mt-1 font-mono text-xs bg-white border-zinc-300 text-black font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-black">Emergency Contact</label>
              <Input
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Name (Relationship)"
                className="mt-1 text-xs bg-white border-zinc-300 text-black font-medium"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm" disabled={loading} className="text-xs shadow-md">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin text-white" />
                  Saving to PostgreSQL...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Confirm & Admit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
