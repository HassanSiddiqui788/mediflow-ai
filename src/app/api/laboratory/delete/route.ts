import { NextRequest } from 'next/server';
import { deleteDbLabTest, getDbLabTestById } from '@/lib/services/laboratory-service';
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

    const testId = String(id).trim();
    const existing = await getDbLabTestById(testId);

    if (!existing) {
      return apiError(`Laboratory test "${testId}" not found`, 'NOT_FOUND', 404);
    }

    const deleted = await deleteDbLabTest(testId);

    if (!deleted) {
      return apiError('Failed to delete laboratory test', 'INTERNAL_ERROR', 500);
    }

    return apiSuccess({ id: testId, deleted: true });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to delete laboratory test from database', 'DATABASE_ERROR');
  }
}
