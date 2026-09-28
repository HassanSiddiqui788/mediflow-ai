import { NextRequest } from 'next/server';
import { deleteDbEmergencyCase, getDbEmergencyCaseById } from '@/lib/services/emergency-service';
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

    const caseId = String(id).trim();
    const existing = await getDbEmergencyCaseById(caseId);

    if (!existing) {
      return apiError(`Emergency case "${caseId}" not found`, 'NOT_FOUND', 404);
    }

    const deleted = await deleteDbEmergencyCase(caseId);

    if (!deleted) {
      return apiError('Failed to delete emergency case', 'INTERNAL_ERROR', 500);
    }

    return apiSuccess({ id: caseId, deleted: true });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to delete emergency case from database', 'DATABASE_ERROR');
  }
}
