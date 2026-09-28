import { NextRequest } from 'next/server';
import { getDbAppointmentById } from '@/lib/services/appointment-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.trim()) {
      return apiError('Missing required parameter "id"', 'VALIDATION_ERROR', 400);
    }

    const appointment = await getDbAppointmentById(id.trim());

    if (!appointment) {
      return apiError(`Appointment not found for ID "${id}"`, 'NOT_FOUND', 404);
    }

    return apiSuccess(appointment);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to retrieve appointment from database', 'DATABASE_ERROR');
  }
}
