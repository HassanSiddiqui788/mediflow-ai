import { NextRequest } from 'next/server';
import { createDbLabTest } from '@/lib/services/laboratory-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const testName = typeof body?.testName === 'string' ? body.testName.trim() : '';
    const category = typeof body?.category === 'string' ? body.category.trim() : 'Biochemistry';
    const sampleType = typeof body?.sampleType === 'string' ? body.sampleType.trim() : 'Venous Blood';
    const doctor = typeof body?.doctor === 'string' ? body.doctor.trim() : 'Attending Physician';
    const department = typeof body?.department === 'string' ? body.department.trim() : 'General Medicine';
    const priority = body?.priority || 'Routine';
    const rawPatientId = body?.patientId;
    const patientId = rawPatientId !== undefined && rawPatientId !== '' ? rawPatientId : 1;

    if (!testName || testName.length < 2) {
      return apiError('Field "testName" is required', 'VALIDATION_ERROR', 422);
    }
    if (patientId === undefined || patientId === null || patientId === '') {
      return apiError('Field "patientId" is required', 'VALIDATION_ERROR', 422);
    }

    const labTest = await createDbLabTest({
      patientId,
      testName,
      category,
      sampleType,
      doctor,
      department,
      priority,
      estimatedCompletionTime: body?.estimatedCompletionTime,
      status: body?.status || 'Pending',
      referenceRange: body?.referenceRange,
      technician: body?.technician,
    });

    return apiSuccess(labTest, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to create laboratory test in PostgreSQL', 'DATABASE_ERROR');
  }
}
