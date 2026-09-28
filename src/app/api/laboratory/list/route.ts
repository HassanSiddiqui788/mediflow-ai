import { NextRequest } from 'next/server';
import { getDbLabTests } from '@/lib/services/laboratory-service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : undefined;
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : undefined;

    const { labTests, total } = await getDbLabTests({
      category,
      status,
      priority,
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

    return apiSuccess(labTests, { pagination });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch laboratory tests from database', 'DATABASE_ERROR');
  }
}
