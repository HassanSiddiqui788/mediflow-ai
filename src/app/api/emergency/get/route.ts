import { NextRequest } from 'next/server';
import { getDbEmergencyCaseById } from '@/lib/services/emergency-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return apiError('Missing required parameter "id"', 'VALIDATION_ERROR', 400);
    }

    const emergencyCase = await getDbEmergencyCaseById(id.trim());

    if (!emergencyCase) {
      return apiError(`Emergency case not found for ID "${id}"`, 'NOT_FOUND', 404);
    }

    return apiSuccess(emergencyCase);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to retrieve emergency case from database', 'DATABASE_ERROR');
  }
}
