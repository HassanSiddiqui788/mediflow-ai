import React from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { AIInsightsDashboard } from '@/components/ai/AIInsightsDashboard';
import { Badge } from '@/components/ui/badge';
import { getDbOperationalAIInsights } from '@/lib/services/ai-service';

export const metadata: Metadata = {
  title: 'AI Operational Insights & Copilot | MediFlow AI',
  description: 'AI-driven hospital operations orchestration, bottleneck predictions, capacity forecasting, and operational assistant.',
};

export const dynamic = 'force-dynamic';

export default async function AIInsightsPage() {
  const insights = await getDbOperationalAIInsights();

  return (
    <div className="space-y-6">
      <PageHeader
        category="Orchestration & Intelligence"
        title="MediFlow AI Operational Intelligence"
        description="Predictive operations modeling, throughput simulation, proactive staffing recommendations, and emergency bottleneck mitigation powered by PostgreSQL."
      >
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="default" dot dotPulse>
            PostgreSQL Operational Model Active
          </Badge>
        </div>
      </PageHeader>

      <AIInsightsDashboard initialInsights={insights} />
    </div>
  );
}
