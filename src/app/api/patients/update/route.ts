import { NextRequest } from 'next/server';
import { updateDbPatient } from '@/lib/services/patient-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get('id') || body?.id;

    if (!id || !String(id).trim()) {
      return apiError('Missing required parameter "id" for update', 'VALIDATION_ERROR', 400);
    }

    const updated = await updateDbPatient(String(id).trim(), {
      firstName: body?.firstName,
      lastName: body?.lastName,
      dateOfBirth: body?.dob || body?.dateOfBirth,
      gender: body?.gender,
      bloodGroup: body?.bloodGroup,
      phone: body?.phone,
      email: body?.email,
      address: body?.address,
      department: body?.department,
      attendingDoctor: body?.attendingDoctor || body?.doctor,
      status: body?.status,
      bedNumber: body?.bedNumber,
      admissionDate: body?.admissionDate,
      lastVisit: body?.lastVisit,
      allergies: Array.isArray(body?.allergies) ? body.allergies : undefined,
      insuranceProvider: body?.insuranceProvider,
      policyNumber: body?.policyNumber,
      vitals: body?.vitals,
    });

    if (!updated) {
      return apiError(`Patient "${id}" not found`, 'NOT_FOUND', 404);
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to update patient in PostgreSQL', 'DATABASE_ERROR');
  }
}
