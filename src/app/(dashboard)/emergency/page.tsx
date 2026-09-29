import React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { EmergencyTriageCenter } from '@/components/emergency/EmergencyTriageCenter';
import { Badge } from '@/components/ui/badge';
import { getDbEmergencyCases } from '@/lib/services/emergency-service';

export const metadata: Metadata = {
  title: 'Emergency Department (ED) Command | MediFlow AI',
  description: 'Emergency department triage command center, ESI prioritization, trauma bay load, and waiting duration tracking.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function EmergencyPage() {
  const { emergencyCases: cases } = await getDbEmergencyCases();
  const criticalCount = cases.filter((c) => c.priority === 'Critical' || c.esiScore <= 2).length;

  return (
    <div className="space-y-6">
      <PageHeader
        category="Acute & Trauma Services"
        title="Emergency Department Command Center"
        description="Real-time ESI-1 through ESI-5 triage queue, resuscitation bay allocations, vital sign alarms, and door-to-provider metrics powered by PostgreSQL."
      >
        <div className="flex items-center gap-2">
          <Badge variant={criticalCount > 2 ? 'rose' : 'teal'} size="default" dot dotPulse>
            {criticalCount > 2 ? 'Surge Protocol Alpha Active' : 'Emergency Flow Operational'}
          </Badge>
        </div>
      </PageHeader>

      <EmergencyTriageCenter initialCases={cases} />
    </div>
  );
}
