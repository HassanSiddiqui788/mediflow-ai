import { NextRequest } from 'next/server';
import { updateDbEmergencyCase } from '@/lib/services/emergency-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get('id') || body?.id;

    if (!id || !String(id).trim()) {
      return apiError('Missing required parameter "id" for emergency case update', 'VALIDATION_ERROR', 400);
    }

    const updated = await updateDbEmergencyCase(String(id).trim(), {
      status: body?.status,
      room: body?.room,
      assignedDoctor: body?.assignedDoctor,
      assignedNurse: body?.assignedNurse,
      waitingTimeMinutes: body?.waitingTimeMinutes,
      notes: body?.notes,
    });

    if (!updated) {
      return apiError(`Emergency case "${id}" not found`, 'NOT_FOUND', 404);
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to update emergency case in PostgreSQL', 'DATABASE_ERROR');
  }
}
