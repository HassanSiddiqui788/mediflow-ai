import { NextRequest } from 'next/server';
import { getDbBedById } from '@/lib/services/bed-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return apiError('Missing required parameter "id"', 'VALIDATION_ERROR', 400);
    }

    const bed = await getDbBedById(id.trim());

    if (!bed) {
      return apiError(`Bed not found for ID "${id}"`, 'NOT_FOUND', 404);
    }

    return apiSuccess(bed);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to retrieve bed from database', 'DATABASE_ERROR');
  }
}
