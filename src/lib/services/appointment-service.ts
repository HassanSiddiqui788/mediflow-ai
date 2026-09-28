import { db } from '@/lib/db';
import { Appointment, AppointmentStatus, AppointmentType } from '@/types/appointment';

interface DbAppointmentRow {
  id: number;
  appointmentCode: string;
  patientId: number;
  doctor: string;
  doctorId?: string | null;
  department: string;
  date: string;
  time: string;
  duration?: number | null;
  type: string;
  status: string;
  room: string;
  reasonForVisit: string;
  notes?: string | null;
}

interface DbPatientRow {
  id: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

function calculateAge(dobString?: string): number {
  if (!dobString) return 40;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 40;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function formatDbAppointment(row: DbAppointmentRow, patient?: DbPatientRow): Appointment {
  return {
    id: row.appointmentCode || `APT-${row.id}`,
    patientId: patient?.patientCode || (row.patientId ? `PT-${row.patientId}` : 'PT-0000'),
    patientName: patient ? `${patient.firstName} ${patient.lastName}`.trim() : 'Registered Patient',
    patientAge: calculateAge(patient?.dateOfBirth),
    patientGender: patient?.gender || 'Other',
    doctor: row.doctor || 'Staff Physician',
    doctorId: row.doctorId || 'DOC-101',
    department: row.department || 'General Medicine',
    date: row.date || new Date().toISOString().split('T')[0],
    time: row.time || '09:00',
    duration: row.duration || 30,
    type: (row.type as AppointmentType) || 'Consultation',
    status: (row.status as AppointmentStatus) || 'Scheduled',
    room: row.room || 'Room 101',
    reasonForVisit: row.reasonForVisit || 'Follow-up Consultation',
    notes: row.notes || undefined,
  };
}

export async function getDbAppointments(options?: {
  search?: string;
  department?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}) {
  const [appointments, patients] = (await Promise.all([
    db.orm.public.Appointment.all(),
    db.orm.public.Patient.all(),
  ])) as [DbAppointmentRow[], DbPatientRow[]];

  const patientMap = new Map<number, DbPatientRow>();
  for (const p of patients) {
    patientMap.set(p.id, p);
  }

  let formatted = appointments.map((apt) =>
    formatDbAppointment(apt, patientMap.get(apt.patientId))
  );

  if (options?.search) {
    const s = options.search.toLowerCase();
    formatted = formatted.filter(
      (a) =>
        a.patientName.toLowerCase().includes(s) ||
        a.id.toLowerCase().includes(s) ||
        a.doctor.toLowerCase().includes(s) ||
        a.department.toLowerCase().includes(s) ||
        a.reasonForVisit.toLowerCase().includes(s)
    );
  }

  if (options?.department && options.department !== 'All') {
    formatted = formatted.filter((a) => a.department === options.department);
  }

  if (options?.status && options.status !== 'All') {
    formatted = formatted.filter((a) => a.status === options.status);
  }

  if (options?.date) {
    formatted = formatted.filter((a) => a.date === options.date);
  }

  const total = formatted.length;

  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit;
    formatted = formatted.slice(start, start + options.limit);
  }

  return { appointments: formatted, total };
}

export async function getDbAppointmentById(idOrCode: string) {
  const appointments = (await db.orm.public.Appointment.all()) as DbAppointmentRow[];
  const match = appointments.find(
    (a) => a.appointmentCode.toLowerCase() === idOrCode.toLowerCase() || String(a.id) === idOrCode
  );

  if (!match) return null;

  const patient = match.patientId
    ? ((await db.orm.public.Patient.first({ id: match.patientId })) as DbPatientRow | null)
    : null;
  return formatDbAppointment(match, patient || undefined);
}

export async function createDbAppointment(data: {
  patientId: string | number;
  doctor: string;
  doctorId?: string;
  department: string;
  date: string;
  time: string;
  duration?: number;
  type: string;
  status?: string;
  room: string;
  reasonForVisit: string;
  notes?: string;
}) {
  let resolvedPatientId: number = 1;
  const patients = (await db.orm.public.Patient.all()) as DbPatientRow[];

  if (typeof data.patientId === 'number') {
    resolvedPatientId = data.patientId;
  } else {
    const matched = patients.find(
      (p) =>
        p.patientCode.toLowerCase() === data.patientId.toString().toLowerCase() ||
        String(p.id) === data.patientId.toString()
    );
    if (matched) {
      resolvedPatientId = matched.id;
    } else if (patients.length > 0) {
      resolvedPatientId = patients[0].id;
    }
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const appointmentCode = `APT-${randomSuffix}`;

  const row = (await db.orm.public.Appointment.create({
    appointmentCode,
    patientId: resolvedPatientId,
    doctor: data.doctor,
    doctorId: data.doctorId || null,
    department: data.department,
    date: data.date,
    time: data.time,
    duration: data.duration || 30,
    type: data.type,
    status: data.status || 'Scheduled',
    room: data.room,
    reasonForVisit: data.reasonForVisit,
    notes: data.notes || null,
  })) as DbAppointmentRow;

  const patient = patients.find((p) => p.id === resolvedPatientId);
  return formatDbAppointment(row, patient);
}

export async function updateDbAppointment(
  idOrCode: string,
  data: Partial<{
    doctor: string;
    department: string;
    date: string;
    time: string;
    duration: number;
    type: string;
    status: string;
    room: string;
    reasonForVisit: string;
    notes: string | null;
  }>
) {
  const appointments = (await db.orm.public.Appointment.all()) as DbAppointmentRow[];
  const match = appointments.find(
    (a) => a.appointmentCode.toLowerCase() === idOrCode.toLowerCase() || String(a.id) === idOrCode
  );

  if (!match) return null;

  const updateData: Record<string, unknown> = {};
  if (data.doctor !== undefined) updateData.doctor = data.doctor;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.date !== undefined) updateData.date = data.date;
  if (data.time !== undefined) updateData.time = data.time;
  if (data.duration !== undefined) updateData.duration = data.duration;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.room !== undefined) updateData.room = data.room;
  if (data.reasonForVisit !== undefined) updateData.reasonForVisit = data.reasonForVisit;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await db.orm.public.Appointment.where({ id: match.id }).update(updateData);
  return getDbAppointmentById(match.appointmentCode);
}

export async function deleteDbAppointment(idOrCode: string) {
  const appointments = (await db.orm.public.Appointment.all()) as DbAppointmentRow[];
  const match = appointments.find(
    (a) => a.appointmentCode.toLowerCase() === idOrCode.toLowerCase() || String(a.id) === idOrCode
  );

  if (!match) return false;

  await db.orm.public.Appointment.where({ id: match.id }).delete();
  return true;
}
