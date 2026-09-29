import React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { BedManagementMatrix } from '@/components/beds/BedManagementMatrix';
import { Badge } from '@/components/ui/badge';
import { getDbBeds } from '@/lib/services/bed-service';

export const metadata: Metadata = {
  title: 'Bed & Room Management | MediFlow AI',
  description: 'Hospital bed census, telemetry unit allocation, ward occupancy matrix, and sanitization turnover tracking.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function BedsPage() {
  const { beds } = await getDbBeds();
  const occupied = beds.filter((b) => b.status === 'Occupied').length;
  const occupancyRate = beds.length > 0 ? Math.round((occupied / beds.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        category="Inpatient & Census"
        title="Bed & Room Management Matrix"
        description="Live inpatient census across Intensive Care (ICU), Cardiology, Surgical, Pediatrics, and General Wards powered by PostgreSQL."
      >
        <div className="flex items-center gap-2">
          <Badge variant={occupancyRate > 80 ? 'amber' : 'emerald'} size="default">
            {occupancyRate}% Hospital Census
          </Badge>
        </div>
      </PageHeader>

      <BedManagementMatrix initialBeds={beds} />
    </div>
  );
}
