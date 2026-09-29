import {
  getDbMetricOverview,
  getDbDepartmentStatuses,
  getDbHourlyVolume,
  getDbBedOccupancyTrends,
  getDbDepartmentWorkload,
} from '@/lib/services/analytics-service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'Today';

    const [metricsOverview, departmentStatuses, hourlyVolume, bedOccupancyTrends, departmentWorkload] =
      await Promise.all([
        getDbMetricOverview(timeRange),
        getDbDepartmentStatuses(),
        getDbHourlyVolume(timeRange),
        getDbBedOccupancyTrends(timeRange),
        getDbDepartmentWorkload(),
      ]);

    return apiSuccess({
      metricsOverview,
      departmentStatuses,
      hourlyVolume,
      bedOccupancyTrends,
      departmentWorkload,
    });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to fetch analytics telemetry from database', 'DATABASE_ERROR');
  }
}
