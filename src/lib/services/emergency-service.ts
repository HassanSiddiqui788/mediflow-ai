import { db } from '@/lib/db';
import { EmergencyPatient, EmergencyPriority, EmergencyStatus } from '@/types/emergency';

interface DbEmergencyRow {
  id: number;
  caseCode: string;
  patientId?: number | null;
  patientName: string;
  patientAge: number;
  patientGender: string;
  arrivalTime?: { toString: () => string } | null;
  waitingTimeMinutes: number;
  priority: string;
  esiScore: number;
  chiefComplaint: string;
  vitalsBp?: string | null;
  vitalsPulse?: number | null;
  vitalsSpo2?: number | null;
  vitalsTemp?: number | null;
  assignedDoctor: string;
  assignedNurse?: string | null;
  room: string;
  status: string;
  notes?: string | null;
  flags?: string | null;
}

export function formatDbEmergencyCase(row: DbEmergencyRow): EmergencyPatient {
  const flags = row.flags
    ? row.flags.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const arrivalIso = row.arrivalTime ? row.arrivalTime.toString() : new Date().toISOString();
  const arrivalDate = new Date(arrivalIso);
  const arrivalTimeString = !isNaN(arrivalDate.getTime())
    ? arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '12:00';

  return {
    id: row.caseCode || `ER-${row.id}`,
    patientId: row.patientId ? `PT-${row.patientId}` : undefined,
    name: row.patientName,
    age: row.patientAge,
    gender: row.patientGender,
    arrivalTime: arrivalTimeString,
    waitingTimeMinutes: row.waitingTimeMinutes,
    priority: row.priority as EmergencyPriority,
    esiScore: row.esiScore as 1 | 2 | 3 | 4 | 5,
    chiefComplaint: row.chiefComplaint,
    vitals: {
      bp: row.vitalsBp || '120/80',
      pulse: row.vitalsPulse || 75,
      spo2: row.vitalsSpo2 || 98,
      temp: row.vitalsTemp || 37.0,
    },
    assignedDoctor: row.assignedDoctor,
    assignedNurse: row.assignedNurse || undefined,
    room: row.room,
    status: row.status as EmergencyStatus,
    notes: row.notes || '',
    flags,
  };
}

export async function getDbEmergencyCases(options?: {
  priority?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const cases = (await db.orm.public.EmergencyCase.all()) as DbEmergencyRow[];

  let formatted = cases.map(formatDbEmergencyCase);

  if (options?.search) {
    const s = options.search.toLowerCase();
    formatted = formatted.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s) ||
        c.chiefComplaint.toLowerCase().includes(s) ||
        c.assignedDoctor.toLowerCase().includes(s) ||
        c.room.toLowerCase().includes(s)
    );
  }

  if (options?.priority && options.priority !== 'All') {
    formatted = formatted.filter((c) => c.priority === options.priority);
  }

  if (options?.status && options.status !== 'All') {
    formatted = formatted.filter((c) => c.status === options.status);
  }

  const total = formatted.length;

  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit;
    formatted = formatted.slice(start, start + options.limit);
  }

  return { emergencyCases: formatted, total };
}

export async function getDbEmergencyCaseById(idOrCode: string) {
  const cases = (await db.orm.public.EmergencyCase.all()) as DbEmergencyRow[];
  const match = cases.find(
    (c) => c.caseCode.toLowerCase() === idOrCode.toLowerCase() || String(c.id) === idOrCode
  );

  return match ? formatDbEmergencyCase(match) : null;
}

export async function createDbEmergencyCase(data: {
  name: string;
  age: number;
  gender: string;
  priority: string;
  esiScore: number;
  chiefComplaint: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    spo2?: number;
    temp?: number;
  };
  assignedDoctor: string;
  assignedNurse?: string;
  room: string;
  status?: string;
  notes?: string;
  flags?: string[];
}) {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const caseCode = `ER-${randomSuffix}`;

  const row = (await db.orm.public.EmergencyCase.create({
    caseCode,
    patientName: data.name,
    patientAge: data.age,
    patientGender: data.gender,
    waitingTimeMinutes: 0,
    priority: data.priority,
    esiScore: data.esiScore,
    chiefComplaint: data.chiefComplaint,
    vitalsBp: data.vitals?.bp || null,
    vitalsPulse: data.vitals?.pulse ?? null,
    vitalsSpo2: data.vitals?.spo2 ?? null,
    vitalsTemp: data.vitals?.temp ?? null,
    assignedDoctor: data.assignedDoctor,
    assignedNurse: data.assignedNurse || null,
    room: data.room,
    status: data.status || 'Triage',
    notes: data.notes || null,
    flags: data.flags ? data.flags.join(', ') : null,
  })) as DbEmergencyRow;

  return formatDbEmergencyCase(row);
}

export async function updateDbEmergencyCase(
  idOrCode: string,
  data: Partial<{
    status: EmergencyStatus;
    room: string;
    assignedDoctor: string;
    assignedNurse: string;
    waitingTimeMinutes: number;
    notes: string;
  }>
) {
  const cases = (await db.orm.public.EmergencyCase.all()) as DbEmergencyRow[];
  const match = cases.find(
    (c) => c.caseCode.toLowerCase() === idOrCode.toLowerCase() || String(c.id) === idOrCode
  );

  if (!match) return null;

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.room !== undefined) updateData.room = data.room;
  if (data.assignedDoctor !== undefined) updateData.assignedDoctor = data.assignedDoctor;
  if (data.assignedNurse !== undefined) updateData.assignedNurse = data.assignedNurse;
  if (data.waitingTimeMinutes !== undefined) updateData.waitingTimeMinutes = data.waitingTimeMinutes;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await db.orm.public.EmergencyCase.where({ id: match.id }).update(updateData);
  return getDbEmergencyCaseById(match.caseCode);
}

export async function deleteDbEmergencyCase(idOrCode: string) {
  const cases = (await db.orm.public.EmergencyCase.all()) as DbEmergencyRow[];
  const match = cases.find(
    (c) => c.caseCode.toLowerCase() === idOrCode.toLowerCase() || String(c.id) === idOrCode
  );

  if (!match) return false;

  await db.orm.public.EmergencyCase.where({ id: match.id }).delete();
  return true;
}
