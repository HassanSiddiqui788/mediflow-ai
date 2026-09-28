import { NextRequest } from 'next/server';
import { getDbBeds } from '@/lib/services/bed-service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ward = searchParams.get('ward') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : undefined;
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : undefined;

    const { beds, total } = await getDbBeds({
      ward,
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

    return apiSuccess(beds, { pagination });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch bed records from database', 'DATABASE_ERROR');
  }
}
