import { NextRequest } from 'next/server';
import { updateDbAppointment } from '@/lib/services/appointment-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get('id') || body?.id;

    if (!id || !String(id).trim()) {
      return apiError('Missing required parameter "id" for appointment update', 'VALIDATION_ERROR', 400);
    }

    const updated = await updateDbAppointment(String(id).trim(), {
      doctor: body?.doctor,
      department: body?.department,
      date: body?.date,
      time: body?.time,
      duration: body?.duration,
      type: body?.type,
      status: body?.status,
      room: body?.room,
      reasonForVisit: body?.reasonForVisit,
      notes: body?.notes,
    });

    if (!updated) {
      return apiError(`Appointment "${id}" not found`, 'NOT_FOUND', 404);
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to update appointment in PostgreSQL', 'DATABASE_ERROR');
  }
}
