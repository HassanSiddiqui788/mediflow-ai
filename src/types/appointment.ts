export type AppointmentStatus = 'Scheduled' | 'Checked In' | 'In Progress' | 'Completed' | 'Cancelled';
export type AppointmentType = 'Consultation' | 'Follow-up' | 'Emergency' | 'Surgery' | 'Routine Checkup' | 'Diagnostic';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  avatarUrl?: string;
  availableDays: string[];
}

export interface Appointment {
  id: string; // e.g. "APT-1082"
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctor: string;
  doctorId: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  room: string;
  reasonForVisit: string;
  notes?: string;
}
