import { NextRequest } from 'next/server';
import { getDbLabTestById } from '@/lib/services/laboratory-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return apiError('Missing required parameter "id"', 'VALIDATION_ERROR', 400);
    }

    const labTest = await getDbLabTestById(id.trim());

    if (!labTest) {
      return apiError(`Laboratory test not found for ID "${id}"`, 'NOT_FOUND', 404);
    }

    return apiSuccess(labTest);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to retrieve laboratory test from database', 'DATABASE_ERROR');
  }
}
