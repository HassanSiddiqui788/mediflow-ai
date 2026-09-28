import { NextRequest } from 'next/server';
import { createDbPatient } from '@/lib/services/patient-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
    const department = typeof body?.department === 'string' ? body.department.trim() : 'General Medicine';
    const attendingDoctor = typeof body?.attendingDoctor === 'string' ? body.attendingDoctor.trim() : typeof body?.doctor === 'string' ? body.doctor.trim() : 'Staff Physician';
    const status = typeof body?.status === 'string' ? body.status.trim() : 'Inpatient';

    if (!firstName || firstName.length < 2) {
      return apiError('Field "firstName" is required and must be at least 2 characters', 'VALIDATION_ERROR', 422);
    }
    if (!lastName || lastName.length < 2) {
      return apiError('Field "lastName" is required and must be at least 2 characters', 'VALIDATION_ERROR', 422);
    }

    const dateOfBirth = body?.dob || body?.dateOfBirth || '1985-01-01';
    const gender = body?.gender || 'Other';
    const bloodGroup = body?.bloodGroup || 'O+';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '+1 (555) 000-0000';
    const email = typeof body?.email === 'string' ? body.email.trim() : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mediflow.net`;
    const address = typeof body?.address === 'string' ? body.address.trim() : '100 Medical Plaza, Hospital District';

    const patient = await createDbPatient({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      department,
      attendingDoctor,
      status,
      bedNumber: body?.bedNumber || undefined,
      admissionDate: body?.admissionDate || undefined,
      allergies: Array.isArray(body?.allergies) ? body.allergies : undefined,
      insuranceProvider: body?.insuranceProvider || undefined,
      policyNumber: body?.policyNumber || undefined,
      vitals: body?.vitals || undefined,
    });

    return apiSuccess(patient, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to create patient record in PostgreSQL', 'DATABASE_ERROR');
  }
}
