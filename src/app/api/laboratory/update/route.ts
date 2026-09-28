import { NextRequest } from 'next/server';
import { updateDbLabTest } from '@/lib/services/laboratory-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get('id') || body?.id;

    if (!id || !String(id).trim()) {
      return apiError('Missing required parameter "id" for lab test update', 'VALIDATION_ERROR', 400);
    }

    const updated = await updateDbLabTest(String(id).trim(), {
      status: body?.status,
      resultSummary: body?.resultSummary,
      flaggedAbnormal: body?.flaggedAbnormal,
      technician: body?.technician,
    });

    if (!updated) {
      return apiError(`Laboratory test "${id}" not found`, 'NOT_FOUND', 404);
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to update laboratory test in PostgreSQL', 'DATABASE_ERROR');
  }
}
