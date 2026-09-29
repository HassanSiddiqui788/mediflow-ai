'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OperationalInsight } from '@/types/ai';

interface AIAlertBannerProps {
  initialInsights?: OperationalInsight[];
}

export function AIAlertBanner({ initialInsights }: AIAlertBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [insights, setInsights] = useState<OperationalInsight[]>(initialInsights || []);

  React.useEffect(() => {
    let ignore = false;
    if (!initialInsights || initialInsights.length === 0) {
      fetch('/api/ai/insights', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) {
            if (data.success && Array.isArray(data.data)) setInsights(data.data);
            else if (data.insights) setInsights(data.insights);
          }
        })
        .catch(console.error);
    }
    return () => {
      ignore = true;
    };
  }, [initialInsights]);

  const primaryAlert = insights[0];

  if (!primaryAlert) {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-4 flex items-center justify-between text-xs text-zinc-700 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-600" />
          <span>AI Operational Engine: All hospital operations tracking within optimal clinical boundaries.</span>
        </div>
        <Link href="/ai-insights">
          <Button variant="ghost" size="sm" className="text-xs text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100/60">
            Open AI Hub
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-yellow-300/80 bg-gradient-to-r from-amber-50/90 via-yellow-50/60 to-white p-4 sm:p-5 shadow-xs">
      {/* Background warm gold subtle highlight */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Alert Header & Content */}
          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-900 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="h-5 w-5 animate-pulse text-yellow-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase text-black tracking-wider">
                  AI Operational Intelligence (PostgreSQL)
                </span>
                <Badge variant={primaryAlert.severity === 'critical' ? 'rose' : 'gold'} size="sm" dot dotPulse className="font-bold">
                  {primaryAlert.category}
                </Badge>
                <span className="text-[11px] text-black font-mono font-bold">
                  {primaryAlert.confidenceScore}% Confidence
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-black">
                {primaryAlert.title}
              </h2>
              <p className="text-xs text-zinc-950 font-medium max-w-3xl leading-relaxed">
                {primaryAlert.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs border-zinc-300 hover:bg-zinc-100 text-black font-bold bg-white shadow-xs"
            >
              {expanded ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp className="h-3.5 w-3.5 ml-1 text-black" />
                </>
              ) : (
                <>
                  <span>Contributing Factors</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1 text-black" />
                </>
              )}
            </Button>
            <Link href="/ai-insights">
              <Button size="sm" variant="default" className="text-xs shadow-md">
                <span>View Operational Analysis</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 text-yellow-400" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Collapsible Contributing Factors & Recommendation */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-yellow-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-yellow-200 space-y-2 shadow-xs">
              <p className="font-semibold text-yellow-900 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Contributing Operational Bottlenecks:
              </p>
              <ul className="space-y-1.5 text-zinc-700 pl-2">
                {primaryAlert.contributingFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-2 shadow-xs">
              <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-yellow-600" />
                Recommended Orchestration Action:
              </p>
              <p className="text-zinc-700 leading-relaxed">
                {primaryAlert.recommendedAction}
              </p>
              {primaryAlert.metricTarget && (
                <div className="pt-2 flex items-center gap-4 text-[11px] font-mono text-zinc-600 border-t border-zinc-200">
                  <span>Target: <strong className="text-yellow-800">{primaryAlert.metricTarget.optimal}</strong></span>
                  <span>Projected: <strong className="text-amber-800">{primaryAlert.metricTarget.projected}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
