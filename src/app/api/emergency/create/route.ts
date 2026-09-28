import { NextRequest } from 'next/server';
import { createDbEmergencyCase } from '@/lib/services/emergency-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const chiefComplaint = typeof body?.chiefComplaint === 'string' ? body.chiefComplaint.trim() : '';
    const room = typeof body?.room === 'string' ? body.room.trim() : 'Bay 01';
    const assignedDoctor = typeof body?.assignedDoctor === 'string' ? body.assignedDoctor.trim() : 'ER Attending Physician';
    const priority = body?.priority || 'Medium';
    const esiScore = typeof body?.esiScore === 'number' ? body.esiScore : 3;
    const age = typeof body?.age === 'number' ? body.age : 40;
    const gender = body?.gender || 'Unknown';

    if (!name || name.length < 2) {
      return apiError('Field "name" is required', 'VALIDATION_ERROR', 422);
    }
    if (!chiefComplaint || chiefComplaint.length < 2) {
      return apiError('Field "chiefComplaint" is required', 'VALIDATION_ERROR', 422);
    }

    const emergencyCase = await createDbEmergencyCase({
      name,
      age,
      gender,
      priority,
      esiScore,
      chiefComplaint,
      vitals: body?.vitals,
      assignedDoctor,
      assignedNurse: body?.assignedNurse,
      room,
      status: body?.status || 'Triage',
      notes: body?.notes,
      flags: Array.isArray(body?.flags) ? body.flags : undefined,
    });

    return apiSuccess(emergencyCase, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to create emergency case in PostgreSQL', 'DATABASE_ERROR');
  }
}
