import { db } from '@/lib/db';
import { Patient, PatientStatus, Gender, BloodGroup } from '@/types/patient';

interface DbPatientRow {
  id: number;
  patientCode: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRel?: string | null;
  emergencyContactPhone?: string | null;
  department?: string | null;
  attendingDoctor?: string | null;
  status: string;
  bedNumber?: string | null;
  admissionDate?: string | null;
  lastVisit?: string | null;
  allergies?: string | null;
  insuranceProvider?: string | null;
  policyNumber?: string | null;
  vitalsBp?: string | null;
  vitalsHeartRate?: number | null;
  vitalsSpo2?: number | null;
  vitalsTemp?: number | null;
  vitalsRespRate?: number | null;
}

interface DbAppointmentRow {
  id: number;
  appointmentCode: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  type: string;
  status: string;
}

interface DbLabTestRow {
  id: number;
  testCode: string;
  testName: string;
  category: string;
  resultSummary?: string | null;
  referenceRange?: string | null;
  flaggedAbnormal?: boolean | null;
  status: string;
  createdAt?: { toString: () => string } | null;
}

function calculateAge(dobString: string): number {
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 45;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function formatDbPatientToPatient(
  row: DbPatientRow,
  related?: { appointments?: DbAppointmentRow[]; labTests?: DbLabTestRow[] }
): Patient {
  const allergies = row.allergies
    ? row.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const appointments = (related?.appointments || []).map((apt) => ({
    id: apt.appointmentCode || `APT-${apt.id}`,
    date: apt.date,
    time: apt.time,
    doctor: apt.doctor,
    department: apt.department,
    type: apt.type as 'Consultation' | 'Follow-up' | 'Procedure' | 'Emergency' | 'Check-up',
    status: apt.status as 'Scheduled' | 'Checked In' | 'In Progress' | 'Completed' | 'Cancelled',
  }));

  const labReports = (related?.labTests || []).map((lab) => ({
    id: lab.testCode || `LAB-${lab.id}`,
    testName: lab.testName,
    date: lab.createdAt ? lab.createdAt.toString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: lab.category as 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Pathology' | 'Immunology',
    result: lab.resultSummary || 'Normal limits',
    referenceRange: lab.referenceRange || 'Standard',
    isAbnormal: Boolean(lab.flaggedAbnormal),
    status: lab.status as 'Pending' | 'In Progress' | 'Completed' | 'Reviewed',
  }));

  return {
    id: row.patientCode || `PT-${row.id}`,
    mrn: row.mrn || `MRN-${row.id}`,
    name: `${row.firstName} ${row.lastName}`.trim(),
    age: calculateAge(row.dateOfBirth),
    gender: (row.gender as Gender) || 'Other',
    dob: row.dateOfBirth,
    bloodGroup: (row.bloodGroup as BloodGroup) || 'O+',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    emergencyContact: {
      name: row.emergencyContactName || 'None Listed',
      relationship: row.emergencyContactRel || 'Contact',
      phone: row.emergencyContactPhone || 'N/A',
    },
    department: row.department || 'General Medicine',
    doctor: row.attendingDoctor || 'Staff Physician',
    assignedDoctorId: undefined,
    status: (row.status as PatientStatus) || 'Active',
    bedNumber: row.bedNumber || undefined,
    admissionDate: row.admissionDate || undefined,
    lastVisit: row.lastVisit || new Date().toISOString().split('T')[0],
    allergies,
    insuranceProvider: row.insuranceProvider || 'Self-pay / Uninsured',
    policyNumber: row.policyNumber || 'N/A',
    vitals: row.vitalsHeartRate
      ? {
          heartRate: row.vitalsHeartRate,
          bloodPressure: row.vitalsBp || '120/80',
          oxygenSaturation: row.vitalsSpo2 || 98,
          temperature: row.vitalsTemp || 37.0,
          respiratoryRate: row.vitalsRespRate || 16,
          lastRecorded: new Date().toISOString().replace('T', ' ').substring(0, 16),
        }
      : undefined,
    medicalHistory: [
      {
        id: `REC-${row.id}-1`,
        date: row.admissionDate || row.lastVisit || new Date().toISOString().split('T')[0],
        diagnosis: `Clinical Care - ${row.department || 'General Medicine'}`,
        doctor: row.attendingDoctor || 'Attending Physician',
        department: row.department || 'General Medicine',
        notes: `Patient admitted under ${row.status} care protocol in ${row.department || 'General'}.`,
        prescription: allergies.length > 0 ? [`Allergies noted: ${allergies.join(', ')}`] : [],
      },
    ],
    labReports,
    appointments,
  };
}

export async function getDbPatients(options?: {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const rows = (await db.orm.public.Patient.all()) as DbPatientRow[];

  let formatted = rows.map((r) => formatDbPatientToPatient(r));

  if (options?.search) {
    const s = options.search.toLowerCase();
    formatted = formatted.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.id.toLowerCase().includes(s) ||
        p.mrn.toLowerCase().includes(s) ||
        p.doctor.toLowerCase().includes(s) ||
        p.department.toLowerCase().includes(s)
    );
  }

  if (options?.department && options.department !== 'All') {
    formatted = formatted.filter((p) => p.department === options.department);
  }

  if (options?.status && options.status !== 'All') {
    formatted = formatted.filter((p) => p.status === options.status);
  }

  const total = formatted.length;

  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit;
    formatted = formatted.slice(start, start + options.limit);
  }

  return { patients: formatted, total };
}

export async function getDbPatientById(idOrCode: string) {
  const rows = (await db.orm.public.Patient.all()) as DbPatientRow[];
  const match = rows.find(
    (p) =>
      p.patientCode.toLowerCase() === idOrCode.toLowerCase() ||
      p.mrn.toLowerCase() === idOrCode.toLowerCase() ||
      String(p.id) === idOrCode
  );

  if (!match) return null;

  const [appointmentsRes, labTestsRes] = await Promise.all([
    db.orm.public.Appointment.where({ patientId: match.id }).all(),
    db.orm.public.LabTest.where({ patientId: match.id }).all(),
  ]);

  const appointments = (appointmentsRes as unknown) as DbAppointmentRow[];
  const labTests = (labTestsRes as unknown) as DbLabTestRow[];

  return formatDbPatientToPatient(match, { appointments, labTests });
}

export async function createDbPatient(data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  attendingDoctor: string;
  status: string;
  emergencyContactName?: string;
  emergencyContactRel?: string;
  emergencyContactPhone?: string;
  bedNumber?: string;
  admissionDate?: string;
  allergies?: string[];
  insuranceProvider?: string;
  policyNumber?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    oxygenSaturation?: number;
    temperature?: number;
    respiratoryRate?: number;
  };
}) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const mrnSuffix = Math.floor(100000 + Math.random() * 900000);
  const patientCode = `PT-${randomSuffix}`;
  const mrn = `MRN-${mrnSuffix}`;

  const row = (await db.orm.public.Patient.create({
    patientCode,
    mrn,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    bloodGroup: data.bloodGroup,
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    address: data.address.trim(),
    emergencyContactName: data.emergencyContactName || null,
    emergencyContactRel: data.emergencyContactRel || null,
    emergencyContactPhone: data.emergencyContactPhone || null,
    department: data.department,
    attendingDoctor: data.attendingDoctor,
    status: data.status,
    bedNumber: data.bedNumber || null,
    admissionDate: data.admissionDate || (data.status === 'Inpatient' ? new Date().toISOString().split('T')[0] : null),
    lastVisit: new Date().toISOString().split('T')[0],
    allergies: data.allergies ? data.allergies.join(', ') : null,
    insuranceProvider: data.insuranceProvider || null,
    policyNumber: data.policyNumber || null,
    vitalsBp: data.vitals?.bloodPressure || null,
    vitalsHeartRate: data.vitals?.heartRate ?? null,
    vitalsSpo2: data.vitals?.oxygenSaturation ?? null,
    vitalsTemp: data.vitals?.temperature ?? null,
    vitalsRespRate: data.vitals?.respiratoryRate ?? null,
  })) as DbPatientRow;

  return formatDbPatientToPatient(row);
}

export async function updateDbPatient(
  idOrCode: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
    phone: string;
    email: string;
    address: string;
    department: string;
    attendingDoctor: string;
    status: string;
    bedNumber: string | null;
    admissionDate: string | null;
    lastVisit: string | null;
    allergies: string[];
    insuranceProvider: string;
    policyNumber: string;
    vitals: {
      bloodPressure?: string;
      heartRate?: number;
      oxygenSaturation?: number;
      temperature?: number;
      respiratoryRate?: number;
    };
  }>
) {
  const rows = (await db.orm.public.Patient.all()) as DbPatientRow[];
  const match = rows.find(
    (p) =>
      p.patientCode.toLowerCase() === idOrCode.toLowerCase() ||
      p.mrn.toLowerCase() === idOrCode.toLowerCase() ||
      String(p.id) === idOrCode
  );

  if (!match) return null;

  const updateData: Record<string, unknown> = {};
  if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
  if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
  if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.bloodGroup !== undefined) updateData.bloodGroup = data.bloodGroup;
  if (data.phone !== undefined) updateData.phone = data.phone.trim();
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
  if (data.address !== undefined) updateData.address = data.address.trim();
  if (data.department !== undefined) updateData.department = data.department;
  if (data.attendingDoctor !== undefined) updateData.attendingDoctor = data.attendingDoctor;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.bedNumber !== undefined) updateData.bedNumber = data.bedNumber;
  if (data.admissionDate !== undefined) updateData.admissionDate = data.admissionDate;
  if (data.lastVisit !== undefined) updateData.lastVisit = data.lastVisit;
  if (data.allergies !== undefined) updateData.allergies = data.allergies.join(', ');
  if (data.insuranceProvider !== undefined) updateData.insuranceProvider = data.insuranceProvider;
  if (data.policyNumber !== undefined) updateData.policyNumber = data.policyNumber;
  if (data.vitals?.bloodPressure !== undefined) updateData.vitalsBp = data.vitals.bloodPressure;
  if (data.vitals?.heartRate !== undefined) updateData.vitalsHeartRate = data.vitals.heartRate;
  if (data.vitals?.oxygenSaturation !== undefined) updateData.vitalsSpo2 = data.vitals.oxygenSaturation;
  if (data.vitals?.temperature !== undefined) updateData.vitalsTemp = data.vitals.temperature;
  if (data.vitals?.respiratoryRate !== undefined) updateData.vitalsRespRate = data.vitals.respiratoryRate;

  await db.orm.public.Patient.where({ id: match.id }).update(updateData);

  return getDbPatientById(match.patientCode);
}

export async function deleteDbPatient(idOrCode: string) {
  const rows = (await db.orm.public.Patient.all()) as DbPatientRow[];
  const match = rows.find(
    (p) =>
      p.patientCode.toLowerCase() === idOrCode.toLowerCase() ||
      p.mrn.toLowerCase() === idOrCode.toLowerCase() ||
      String(p.id) === idOrCode
  );

  if (!match) return false;

  await db.orm.public.Patient.where({ id: match.id }).delete();
  return true;
}
