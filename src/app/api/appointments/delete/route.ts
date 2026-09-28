import { NextRequest } from 'next/server';
import { deleteDbAppointment, getDbAppointmentById } from '@/lib/services/appointment-service';
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

    const aptId = String(id).trim();
    const existing = await getDbAppointmentById(aptId);

    if (!existing) {
      return apiError(`Appointment "${aptId}" not found`, 'NOT_FOUND', 404);
    }

    const deleted = await deleteDbAppointment(aptId);

    if (!deleted) {
      return apiError('Failed to delete appointment record', 'INTERNAL_ERROR', 500);
    }

    return apiSuccess({ id: aptId, deleted: true });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to delete appointment from database', 'DATABASE_ERROR');
  }
}
