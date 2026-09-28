import { NextRequest } from 'next/server';
import { createDbBed } from '@/lib/services/bed-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const bedNumber = typeof body?.bedNumber === 'string' ? body.bedNumber.trim() : '';
    const ward = typeof body?.ward === 'string' ? body.ward.trim() : 'General Ward';
    const room = typeof body?.room === 'string' ? body.room.trim() : 'Room 101';
    const floor = typeof body?.floor === 'number' ? body.floor : 1;
    const status = body?.status || 'Available';

    if (!bedNumber || bedNumber.length < 2) {
      return apiError('Field "bedNumber" is required', 'VALIDATION_ERROR', 422);
    }

    const bed = await createDbBed({
      bedNumber,
      ward,
      room,
      floor,
      status,
      equipment: Array.isArray(body?.equipment) ? body.equipment : undefined,
      nurseInCharge: body?.nurseInCharge,
    });

    return apiSuccess(bed, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to create bed in PostgreSQL', 'DATABASE_ERROR');
  }
}
