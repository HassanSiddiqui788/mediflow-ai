import { getDbOperationalAIInsights } from '@/lib/services/ai-service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const insights = await getDbOperationalAIInsights();
    return apiSuccess(insights);
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to compute operational insights from database', 'DATABASE_ERROR');
  }
}
