import { db } from '@/lib/db';
import { Bed, BedStatus, WardType, WardSummary } from '@/types/bed';

interface DbBedRow {
  id: number;
  bedCode: string;
  bedNumber: string;
  ward: string;
  room: string;
  floor: number;
  status: string;
  equipment?: string | null;
  patientId?: number | null;
  lastCleaned?: string | null;
  reservedFor?: string | null;
  maintenanceNote?: string | null;
  nurseInCharge?: string | null;
}

interface DbPatientRow {
  id: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  gender: string;
  admissionDate?: string | null;
  attendingDoctor?: string | null;
}

export function formatDbBed(row: DbBedRow, patient?: DbPatientRow): Bed {
  const equipment = row.equipment
    ? row.equipment.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return {
    id: row.bedCode || `BED-${row.id}`,
    bedNumber: row.bedNumber,
    ward: row.ward as WardType,
    room: row.room,
    floor: row.floor,
    status: row.status as BedStatus,
    equipment,
    patient: patient
      ? {
          id: patient.patientCode || `PT-${patient.id}`,
          name: `${patient.firstName} ${patient.lastName}`.trim(),
          age: 50,
          gender: patient.gender || 'Unknown',
          admissionTime: patient.admissionDate || new Date().toISOString().split('T')[0],
          diagnosis: `Admitted to ${row.ward}`,
          attendingDoctor: patient.attendingDoctor || 'Staff Physician',
          nurseInCharge: row.nurseInCharge || 'Charge Nurse',
        }
      : undefined,
    lastCleaned: row.lastCleaned || undefined,
    reservedFor: row.reservedFor || undefined,
    maintenanceNote: row.maintenanceNote || undefined,
  };
}

export async function getDbBeds(options?: {
  ward?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [beds, patients] = (await Promise.all([
    db.orm.public.Bed.all(),
    db.orm.public.Patient.all(),
  ])) as [DbBedRow[], DbPatientRow[]];

  const patientMap = new Map<number, DbPatientRow>();
  for (const p of patients) {
    patientMap.set(p.id, p);
  }

  let formatted = beds.map((b) => formatDbBed(b, b.patientId ? patientMap.get(b.patientId) : undefined));

  if (options?.search) {
    const s = options.search.toLowerCase();
    formatted = formatted.filter(
      (b) =>
        b.bedNumber.toLowerCase().includes(s) ||
        b.ward.toLowerCase().includes(s) ||
        b.room.toLowerCase().includes(s) ||
        (b.patient && b.patient.name.toLowerCase().includes(s))
    );
  }

  if (options?.ward && options.ward !== 'All') {
    formatted = formatted.filter((b) => b.ward === options.ward);
  }

  if (options?.status && options.status !== 'All') {
    formatted = formatted.filter((b) => b.status === options.status);
  }

  const total = formatted.length;

  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit;
    formatted = formatted.slice(start, start + options.limit);
  }

  return { beds: formatted, total };
}

export async function getDbBedById(idOrCode: string) {
  const beds = (await db.orm.public.Bed.all()) as DbBedRow[];
  const match = beds.find(
    (b) => b.bedCode.toLowerCase() === idOrCode.toLowerCase() || String(b.id) === idOrCode
  );

  if (!match) return null;

  const patient = match.patientId
    ? ((await db.orm.public.Patient.first({ id: match.patientId })) as DbPatientRow | null)
    : null;
  return formatDbBed(match, patient || undefined);
}

export async function createDbBed(data: {
  bedNumber: string;
  ward: string;
  room: string;
  floor: number;
  status?: BedStatus;
  equipment?: string[];
  nurseInCharge?: string;
}) {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const bedCode = `BED-${randomSuffix}`;

  const row = (await db.orm.public.Bed.create({
    bedCode,
    bedNumber: data.bedNumber.trim(),
    ward: data.ward,
    room: data.room.trim(),
    floor: data.floor,
    status: data.status || 'Available',
    equipment: data.equipment ? data.equipment.join(', ') : null,
    nurseInCharge: data.nurseInCharge || null,
  })) as DbBedRow;

  return formatDbBed(row);
}

export async function getDbWardSummaries(): Promise<WardSummary[]> {
  const beds = (await db.orm.public.Bed.all()) as DbBedRow[];
  const wardMap = new Map<
    WardType,
    { total: number; occupied: number; available: number; cleaning: number }
  >();

  for (const b of beds) {
    const w = b.ward as WardType;
    if (!wardMap.has(w)) {
      wardMap.set(w, { total: 0, occupied: 0, available: 0, cleaning: 0 });
    }
    const stats = wardMap.get(w)!;
    stats.total++;
    if (b.status === 'Occupied') stats.occupied++;
    else if (b.status === 'Available') stats.available++;
    else if (b.status === 'Cleaning') stats.cleaning++;
  }

  const summaries: WardSummary[] = [];
  for (const [ward, stats] of wardMap.entries()) {
    summaries.push({
      ward,
      total: stats.total,
      occupied: stats.occupied,
      available: stats.available,
      cleaning: stats.cleaning,
      occupancyRate: stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0,
    });
  }

  return summaries;
}

export async function updateDbBedStatus(
  idOrCode: string,
  data: {
    status?: BedStatus;
    patientId?: number | null;
    nurseInCharge?: string | null;
    maintenanceNote?: string | null;
    ward?: string;
    room?: string;
    floor?: number;
    equipment?: string[];
  }
) {
  const beds = (await db.orm.public.Bed.all()) as DbBedRow[];
  const match = beds.find(
    (b) => b.bedCode.toLowerCase() === idOrCode.toLowerCase() || String(b.id) === idOrCode
  );

  if (!match) return null;

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.patientId !== undefined) updateData.patientId = data.patientId;
  if (data.nurseInCharge !== undefined) updateData.nurseInCharge = data.nurseInCharge;
  if (data.maintenanceNote !== undefined) updateData.maintenanceNote = data.maintenanceNote;
  if (data.ward !== undefined) updateData.ward = data.ward;
  if (data.room !== undefined) updateData.room = data.room;
  if (data.floor !== undefined) updateData.floor = data.floor;
  if (data.equipment !== undefined) updateData.equipment = data.equipment.join(', ');

  await db.orm.public.Bed.where({ id: match.id }).update(updateData);

  const updated = (await db.orm.public.Bed.first({ id: match.id })) as DbBedRow | null;
  const patient = updated?.patientId
    ? ((await db.orm.public.Patient.first({ id: updated.patientId })) as DbPatientRow | null)
    : null;
  return updated ? formatDbBed(updated, patient || undefined) : null;
}

export async function deleteDbBed(idOrCode: string) {
  const beds = (await db.orm.public.Bed.all()) as DbBedRow[];
  const match = beds.find(
    (b) => b.bedCode.toLowerCase() === idOrCode.toLowerCase() || String(b.id) === idOrCode
  );

  if (!match) return false;

  await db.orm.public.Bed.where({ id: match.id }).delete();
  return true;
}
