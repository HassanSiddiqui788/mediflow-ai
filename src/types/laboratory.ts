export type LabStatus = 'Pending' | 'In Progress' | 'Completed' | 'Reviewed';
export type LabPriority = 'STAT' | 'Urgent' | 'Routine';

export interface LabTest {
  id: string; // "LAB-8812"
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Pathology' | 'Immunology' | 'Blood Bank';
  sampleType: 'Blood' | 'Serum' | 'Plasma' | 'Urine' | 'Tissue' | 'CSF' | 'Swab' | 'Biopsy';
  doctor: string;
  department: string;
  requestedTime: string;
  estimatedCompletionTime: string;
  priority: LabPriority;
  status: LabStatus;
  resultSummary?: string;
  flaggedAbnormal?: boolean;
  referenceRange?: string;
  technician?: string;
}
