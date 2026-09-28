export type PatientStatus = 'Active' | 'Discharged' | 'Inpatient' | 'Outpatient' | 'Critical';
export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface VitalSigns {
  heartRate: number; // bpm
  bloodPressure: string; // e.g. 120/80
  oxygenSaturation: number; // %
  temperature: number; // Celsius
  respiratoryRate: number; // breaths/min
  lastRecorded: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  doctor: string;
  department: string;
  notes: string;
  prescription?: string[];
}

export interface PatientLabItem {
  id: string;
  testName: string;
  date: string;
  category: string;
  result: string;
  referenceRange: string;
  isAbnormal: boolean;
  status: 'Completed' | 'Pending' | 'In Progress' | 'Reviewed';
}

export interface PatientAppointmentItem {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  type: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled' | 'In Progress' | 'Checked In';
}

export interface Patient {
  id: string; // e.g. "PT-9042"
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: Gender;
  dob: string;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  department: string;
  doctor: string;
  assignedDoctorId?: string;
  status: PatientStatus;
  bedNumber?: string;
  admissionDate?: string;
  lastVisit: string;
  allergies: string[];
  insuranceProvider: string;
  policyNumber: string;
  vitals?: VitalSigns;
  medicalHistory: MedicalRecord[];
  labReports: PatientLabItem[];
  appointments: PatientAppointmentItem[];
}
