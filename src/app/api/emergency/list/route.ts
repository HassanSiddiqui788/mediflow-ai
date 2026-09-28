import { NextRequest } from 'next/server';
import { getDbEmergencyCases } from '@/lib/services/emergency-service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const priority = searchParams.get('priority') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : undefined;
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : undefined;

    const { emergencyCases, total } = await getDbEmergencyCases({
      priority,
      status,
      search,
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

    return apiSuccess(emergencyCases, { pagination });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch emergency cases from database', 'DATABASE_ERROR');
  }
}
