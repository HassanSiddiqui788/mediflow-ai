import { NextRequest } from 'next/server';
import { deleteDbBed, getDbBedById } from '@/lib/services/bed-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // no body provided
      }
    }

    if (!id || !String(id).trim()) {
      return apiError('Missing required parameter "id" to delete', 'VALIDATION_ERROR', 400);
    }

    const bedId = String(id).trim();
    const existing = await getDbBedById(bedId);

    if (!existing) {
      return apiError(`Bed "${bedId}" not found`, 'NOT_FOUND', 404);
    }

    const deleted = await deleteDbBed(bedId);

    if (!deleted) {
      return apiError('Failed to delete bed record', 'INTERNAL_ERROR', 500);
    }

    return apiSuccess({ id: bedId, deleted: true });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to delete bed from database', 'DATABASE_ERROR');
  }
}
