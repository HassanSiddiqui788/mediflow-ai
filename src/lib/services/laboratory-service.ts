import { db } from '@/lib/db';
import { LabTest, LabStatus, LabPriority } from '@/types/laboratory';

interface DbLabTestRow {
  id: number;
  testCode: string;
  patientId: number;
  testName: string;
  category: string;
  sampleType: string;
  doctor: string;
  department: string;
  requestedTime?: { toString: () => string } | null;
  estimatedCompletionTime?: string | null;
  priority: string;
  status: string;
  resultSummary?: string | null;
  flaggedAbnormal?: boolean | null;
  referenceRange?: string | null;
  technician?: string | null;
}

interface DbPatientRow {
  id: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export function formatDbLabTest(row: DbLabTestRow, patient?: DbPatientRow): LabTest {
  const reqIso = row.requestedTime ? row.requestedTime.toString() : new Date().toISOString();
  const reqDate = new Date(reqIso);
  const requestedTimeString = !isNaN(reqDate.getTime())
    ? reqDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '12:00';

  return {
    id: row.testCode || `LAB-${row.id}`,
    patientId: patient?.patientCode || (row.patientId ? `PT-${row.patientId}` : 'PT-0000'),
    patientName: patient ? `${patient.firstName} ${patient.lastName}`.trim() : 'Hospital Patient',
    patientAge: 45,
    patientGender: patient?.gender || 'Other',
    testName: row.testName,
    category: row.category as 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Pathology' | 'Immunology',
    sampleType: row.sampleType as 'Blood' | 'Serum' | 'Plasma' | 'Urine' | 'CSF' | 'Swab' | 'Biopsy',
    doctor: row.doctor,
    department: row.department,
    requestedTime: requestedTimeString,
    estimatedCompletionTime: row.estimatedCompletionTime || '+45 mins',
    priority: row.priority as LabPriority,
    status: row.status as LabStatus,
    resultSummary: row.resultSummary || undefined,
    flaggedAbnormal: Boolean(row.flaggedAbnormal),
    referenceRange: row.referenceRange || undefined,
    technician: row.technician || 'Central Lab Tech',
  };
}

export async function getDbLabTests(options?: {
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [labTests, patients] = (await Promise.all([
    db.orm.public.LabTest.all(),
    db.orm.public.Patient.all(),
  ])) as [DbLabTestRow[], DbPatientRow[]];

  const patientMap = new Map<number, DbPatientRow>();
  for (const p of patients) {
    patientMap.set(p.id, p);
  }

  let formatted = labTests.map((l) => formatDbLabTest(l, patientMap.get(l.patientId)));

  if (options?.search) {
    const s = options.search.toLowerCase();
    formatted = formatted.filter(
      (l) =>
        l.testName.toLowerCase().includes(s) ||
        l.patientName.toLowerCase().includes(s) ||
        l.id.toLowerCase().includes(s) ||
        l.doctor.toLowerCase().includes(s) ||
        l.department.toLowerCase().includes(s)
    );
  }

  if (options?.category && options.category !== 'All') {
    formatted = formatted.filter((l) => l.category === options.category);
  }

  if (options?.status && options.status !== 'All') {
    formatted = formatted.filter((l) => l.status === options.status);
  }

  if (options?.priority && options.priority !== 'All') {
    formatted = formatted.filter((l) => l.priority === options.priority);
  }

  const total = formatted.length;

  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit;
    formatted = formatted.slice(start, start + options.limit);
  }

  return { labTests: formatted, total };
}

export async function getDbLabTestById(idOrCode: string) {
  const labTests = (await db.orm.public.LabTest.all()) as DbLabTestRow[];
  const match = labTests.find(
    (l) => l.testCode.toLowerCase() === idOrCode.toLowerCase() || String(l.id) === idOrCode
  );

  if (!match) return null;

  const patient = match.patientId
    ? ((await db.orm.public.Patient.first({ id: match.patientId })) as DbPatientRow | null)
    : null;
  return formatDbLabTest(match, patient || undefined);
}

export async function createDbLabTest(data: {
  patientId: string | number;
  testName: string;
  category: string;
  sampleType: string;
  doctor: string;
  department: string;
  priority?: string;
  estimatedCompletionTime?: string;
  status?: string;
  referenceRange?: string;
  technician?: string;
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
  const testCode = `LAB-${randomSuffix}`;

  const row = (await db.orm.public.LabTest.create({
    testCode,
    patientId: resolvedPatientId,
    testName: data.testName,
    category: data.category,
    sampleType: data.sampleType,
    doctor: data.doctor,
    department: data.department,
    priority: data.priority || 'Routine',
    status: data.status || 'Pending',
    estimatedCompletionTime: data.estimatedCompletionTime || '+45 mins',
    referenceRange: data.referenceRange || 'Standard reference limits',
    flaggedAbnormal: false,
    technician: data.technician || 'Central Lab Tech',
  })) as DbLabTestRow;

  const patient = patients.find((p) => p.id === resolvedPatientId);
  return formatDbLabTest(row, patient);
}

export async function updateDbLabTest(
  idOrCode: string,
  data: Partial<{
    status: LabStatus;
    resultSummary: string;
    flaggedAbnormal: boolean;
    technician: string;
  }>
) {
  const labTests = (await db.orm.public.LabTest.all()) as DbLabTestRow[];
  const match = labTests.find(
    (l) => l.testCode.toLowerCase() === idOrCode.toLowerCase() || String(l.id) === idOrCode
  );

  if (!match) return null;

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.resultSummary !== undefined) updateData.resultSummary = data.resultSummary;
  if (data.flaggedAbnormal !== undefined) updateData.flaggedAbnormal = data.flaggedAbnormal;
  if (data.technician !== undefined) updateData.technician = data.technician;

  await db.orm.public.LabTest.where({ id: match.id }).update(updateData);
  return getDbLabTestById(match.testCode);
}

export async function deleteDbLabTest(idOrCode: string) {
  const labTests = (await db.orm.public.LabTest.all()) as DbLabTestRow[];
  const match = labTests.find(
    (l) => l.testCode.toLowerCase() === idOrCode.toLowerCase() || String(l.id) === idOrCode
  );

  if (!match) return false;

  await db.orm.public.LabTest.where({ id: match.id }).delete();
  return true;
}
