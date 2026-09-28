export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Maintenance';
export type WardType = 'ICU' | 'Emergency' | 'General Ward' | 'Cardiology' | 'Surgical' | 'Pediatrics' | 'Oncology';

export interface Bed {
  id: string; // "BED-304A"
  bedNumber: string;
  ward: WardType;
  room: string;
  floor: number;
  status: BedStatus;
  equipment?: string[]; // e.g. ['Ventilator', 'ECG Monitor', 'Oxygen']
  patient?: {
    id: string;
    name: string;
    age: number;
    gender: string;
    admissionTime: string;
    diagnosis: string;
    attendingDoctor: string;
    nurseInCharge: string;
  };
  lastCleaned?: string;
  reservedFor?: string;
  maintenanceNote?: string;
}

export interface WardSummary {
  ward: WardType;
  total: number;
  occupied: number;
  available: number;
  cleaning: number;
  occupancyRate: number; // percentage
}
