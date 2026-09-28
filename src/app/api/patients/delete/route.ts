import { NextRequest } from 'next/server';
import { deleteDbPatient, getDbPatientById } from '@/lib/services/patient-service';
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

    const patientId = String(id).trim();
    const existing = await getDbPatientById(patientId);

    if (!existing) {
      return apiError(`Patient "${patientId}" not found`, 'NOT_FOUND', 404);
    }

    const deleted = await deleteDbPatient(patientId);

    if (!deleted) {
      return apiError('Failed to delete patient record', 'INTERNAL_ERROR', 500);
    }

    return apiSuccess({ id: patientId, deleted: true });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to delete patient from database', 'DATABASE_ERROR');
  }
}
