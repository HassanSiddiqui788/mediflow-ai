import { NextRequest } from 'next/server';
import { getDbAppointments } from '@/lib/services/appointment-service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const department = searchParams.get('department') || undefined;
    const status = searchParams.get('status') || undefined;
    const date = searchParams.get('date') || undefined;

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : undefined;
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : undefined;

    const { appointments, total } = await getDbAppointments({
      search,
      department,
      status,
      date,
      page,
      limit,
    });

    const pagination =
      page && limit
        ? {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          }
        : undefined;

    return apiSuccess(appointments, { pagination });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch appointments from database', 'DATABASE_ERROR');
  }
}
