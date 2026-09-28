import { NextRequest } from 'next/server';
import { updateDbBedStatus } from '@/lib/services/bed-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get('id') || body?.id;

    if (!id || !String(id).trim()) {
      return apiError('Missing required parameter "id" for bed update', 'VALIDATION_ERROR', 400);
    }

    const updated = await updateDbBedStatus(String(id).trim(), {
      status: body?.status,
      patientId: body?.patientId,
      nurseInCharge: body?.nurseInCharge,
      maintenanceNote: body?.maintenanceNote,
      ward: body?.ward,
      room: body?.room,
      floor: body?.floor,
      equipment: Array.isArray(body?.equipment) ? body.equipment : undefined,
    });

    if (!updated) {
      return apiError(`Bed "${id}" not found`, 'NOT_FOUND', 404);
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to update bed in PostgreSQL', 'DATABASE_ERROR');
  }
}
