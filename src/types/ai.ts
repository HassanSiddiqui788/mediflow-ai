export type InsightSeverity = 'critical' | 'warning' | 'info' | 'positive';

export interface OperationalInsight {
  id: string;
  title: string;
  category: 'Emergency Bottleneck' | 'Bed Forecasting' | 'Staffing Optimization' | 'Laboratory Turnaround' | 'Discharge Flow';
  severity: InsightSeverity;
  description: string;
  impact: string;
  contributingFactors: string[];
  recommendedAction: string;
  confidenceScore: number; // 0-100%
  timestamp: string;
  metricTarget?: {
    current: string;
    projected: string;
    optimal: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  metricsData?: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
  }[];
}
