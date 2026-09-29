import React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { LaboratoryWorkflow } from '@/components/laboratory/LaboratoryWorkflow';
import { Badge } from '@/components/ui/badge';
import { getDbLabTests } from '@/lib/services/laboratory-service';

export const metadata: Metadata = {
  title: 'Laboratory Diagnostic Workflow | MediFlow AI',
  description: 'Pathology, hematology, biochemistry, and microbiology diagnostic testing orders and STAT specimen tracking.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function LaboratoryPage() {
  const { labTests: tests } = await getDbLabTests();
  const statCount = tests.filter((t) => t.priority === 'STAT').length;

  return (
    <div className="space-y-6">
      <PageHeader
        category="Diagnostic & Pathology"
        title="Laboratory & Specimen Workflow"
        description="Diagnostic orders, turnaround time (TAT) tracking, automated abnormal flag verification, and STAT emergency priority queues powered by PostgreSQL."
      >
        <div className="flex items-center gap-2">
          <Badge variant="rose" size="default">
            STAT Orders in Queue: {statCount}
          </Badge>
        </div>
      </PageHeader>

      <LaboratoryWorkflow initialTests={tests} />
    </div>
  );
}
