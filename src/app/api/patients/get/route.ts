import { NextRequest } from 'next/server';
import { getDbPatientById } from '@/lib/services/patient-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return apiError('Missing required parameter "id"', 'VALIDATION_ERROR', 400);
    }

    const patient = await getDbPatientById(id.trim());

    if (!patient) {
      return apiError(`Patient not found for ID "${id}"`, 'NOT_FOUND', 404);
    }

    return apiSuccess(patient);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to retrieve patient details from database', 'DATABASE_ERROR');
  }
}
