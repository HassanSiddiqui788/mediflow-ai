import { NextRequest } from 'next/server';
import { createDbAppointment } from '@/lib/services/appointment-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const doctor = typeof body?.doctor === 'string' ? body.doctor.trim() : '';
    const department = typeof body?.department === 'string' ? body.department.trim() : 'General Medicine';
    const date = typeof body?.date === 'string' ? body.date.trim() : new Date().toISOString().split('T')[0];
    const time = typeof body?.time === 'string' ? body.time.trim() : '09:00';
    const room = typeof body?.room === 'string' ? body.room.trim() : 'Room 101';
    const reasonForVisit = typeof body?.reasonForVisit === 'string' ? body.reasonForVisit.trim() : 'General Consultation';
    const type = typeof body?.type === 'string' ? body.type.trim() : 'Consultation';
    const status = typeof body?.status === 'string' ? body.status.trim() : 'Scheduled';
    const rawPatientId = body?.patientId;
    const patientId = rawPatientId !== undefined && rawPatientId !== '' ? rawPatientId : 1;

    if (!doctor || doctor.length < 2) {
      return apiError('Field "doctor" is required', 'VALIDATION_ERROR', 422);
    }
    if (patientId === undefined || patientId === null || patientId === '') {
      return apiError('Field "patientId" is required', 'VALIDATION_ERROR', 422);
    }

    const appointment = await createDbAppointment({
      patientId,
      doctor,
      doctorId: body?.doctorId,
      department,
      date,
      time,
      duration: typeof body?.duration === 'number' ? body.duration : 30,
      type,
      status,
      room,
      reasonForVisit,
      notes: body?.notes,
    });

    return apiSuccess(appointment, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to create appointment in PostgreSQL', 'DATABASE_ERROR');
  }
}
