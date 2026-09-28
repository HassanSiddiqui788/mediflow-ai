import {
  getDbMetricOverview,
  getDbDepartmentStatuses,
  getDbHourlyVolume,
  getDbBedOccupancyTrends,
  getDbDepartmentWorkload,
} from '@/lib/services/analytics-service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [metricsOverview, departmentStatuses, hourlyVolume, bedOccupancyTrends, departmentWorkload] =
      await Promise.all([
        getDbMetricOverview(),
        getDbDepartmentStatuses(),
        getDbHourlyVolume(),
        getDbBedOccupancyTrends(),
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
