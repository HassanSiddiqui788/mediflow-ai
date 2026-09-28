export type EmergencyPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type EmergencyStatus = 'Triage' | 'With Doctor' | 'In Surgery' | 'Awaiting Lab' | 'Observation' | 'Discharged' | 'Transferred to ICU';

export interface EmergencyPatient {
  id: string; // "ER-409"
  patientId?: string;
  name: string;
  age: number;
  gender: string;
  arrivalTime: string; // ISO or HH:mm
  waitingTimeMinutes: number;
  priority: EmergencyPriority;
  esiScore: 1 | 2 | 3 | 4 | 5; // Emergency Severity Index 1 (Resuscitation) to 5 (Non-urgent)
  chiefComplaint: string;
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    temp: number;
  };
  assignedDoctor: string;
  assignedNurse?: string;
  room: string; // e.g., "Bay 04", "Trauma-1", "Triage-B"
  status: EmergencyStatus;
  notes: string;
  flags?: string[];
}
