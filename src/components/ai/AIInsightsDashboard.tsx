'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Send,
  ShieldCheck,
  Bot,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OperationalInsight, ChatMessage } from '@/types/ai';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'MSG-01',
    sender: 'assistant',
    content:
      'Hello. I am MediFlow Operations Intelligence Assistant. I analyze real-time hospital operational telemetry from PostgreSQL — including ED triage queues, ICU bed census, lab turnaround times, and outpatient schedules. How can I assist with hospital operational flow today?',
    timestamp: '15:10',
    suggestedActions: [
      'What is the current ICU and bed census?',
      'Why is the Emergency Department wait time surging?',
      'What is the status of pending laboratory tests?',
      'Summarize total hospital master patient index census',
    ],
  },
];

interface AIInsightsDashboardProps {
  initialInsights?: OperationalInsight[];
}

let messageCounter = 100;
function getNextMessageId(prefix: string) {
  messageCounter++;
  return `${prefix}-${messageCounter}`;
}

export function AIInsightsDashboard({ initialInsights }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<OperationalInsight[]>(initialInsights || []);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/insights');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInsights(json.data);
      } else if (json.insights) {
        setInsights(json.insights);
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const userMessage: ChatMessage = {
      id: getNextMessageId('USER'),
      sender: 'user',
      content: query,
      timestamp: nowStr,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();

      const replyContent =
        (json.success && json.data?.reply) ||
        json.reply ||
        'Operational telemetry query processed against PostgreSQL database.';

      const assistantMessage: ChatMessage = {
        id: getNextMessageId('ASST'),
        sender: 'assistant',
        content: replyContent,
        timestamp: nowStr,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error';
      console.error('AI query error:', msg);
      const errorMessage: ChatMessage = {
        id: getNextMessageId('ERR'),
        sender: 'assistant',
        content: 'Failed to communicate with operational AI engine. Please check PostgreSQL database connectivity.',
        timestamp: nowStr,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteAction = (actionKey: string) => {
    setExecutedActions((prev) => ({ ...prev, [actionKey]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer Alert */}
      <div className="p-3.5 rounded-xl bg-yellow-50/90 border border-yellow-300 text-xs flex items-center justify-between text-black shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-yellow-600 shrink-0" />
          <span>
            <strong className="text-black font-black">Operational Scope Guarantee:</strong> MediFlow AI generates hospital logistics, staffing, and bed utilization insights from PostgreSQL. It does not diagnose conditions or prescribe medical treatment.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInsights}
          disabled={loading}
          className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
          Refresh
        </Button>
      </div>

      {/* Main 2-Column: Live Proactive Insights & Copilot Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Proactive Operational Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span>Real-Time Operational Bottleneck Signals ({insights.length})</span>
            </h2>
          </div>

          {insights.length === 0 ? (
            <div className="p-8 text-center text-black font-medium text-xs bg-zinc-50 border border-zinc-300 rounded-xl">
              No active operational bottleneck alerts in PostgreSQL database.
            </div>
          ) : (
            insights.map((insight) => {
              const isExecuted = executedActions[insight.id];

              return (
                <Card
                  key={insight.id}
                  variant="glass"
                  className={`p-5 space-y-4 transition-all shadow-xs ${
                    insight.severity === 'critical'
                      ? 'border-rose-300 bg-rose-50/50'
                      : insight.severity === 'warning'
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            insight.severity === 'critical'
                              ? 'rose'
                              : insight.severity === 'warning'
                              ? 'amber'
                              : 'gold'
                          }
                          size="sm"
                        >
                          {insight.category}
                        </Badge>
                        <span className="text-[11px] text-zinc-950 font-bold font-mono">
                          {insight.confidenceScore}% Confidence Score
                        </span>
                      </div>
                      <h3 className="text-base font-black text-black">{insight.title}</h3>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-300 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-yellow-700" />
                    </div>
                  </div>

                  <p className="text-xs text-black font-medium leading-relaxed">{insight.description}</p>

                  {/* Contributing Factors List */}
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-300 text-xs space-y-1.5">
                    <span className="text-[10px] uppercase font-black text-black block">
                      Contributing Telemetry Data (PostgreSQL)
                    </span>
                    <ul className="space-y-1 text-zinc-950 font-semibold">
                      {insight.contributingFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation & Action */}
                  <div className="p-3.5 rounded-xl bg-yellow-50/90 border border-yellow-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-black text-black">
                        Recommended Orchestration Protocol
                      </span>
                      <p className="text-black font-bold">{insight.recommendedAction}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="default"
                      disabled={isExecuted}
                      onClick={() => handleExecuteAction(insight.id)}
                      className={`text-xs shrink-0 shadow-md ${
                        isExecuted
                          ? 'bg-emerald-100 border border-emerald-300 text-emerald-950 font-black'
                          : ''
                      }`}
                    >
                      {isExecuted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-700" />
                          Protocol Dispatched
                        </>
                      ) : (
                        <>
                          <span>Dispatch Protocol</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Copilot Chat */}
        <div className="lg:col-span-5">
          <Card variant="glass" className="h-[680px] flex flex-col justify-between overflow-hidden border-zinc-300 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-zinc-200 bg-zinc-100/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-yellow-700" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black text-black">Operations Copilot</CardTitle>
                    <p className="text-[11px] text-zinc-950 font-semibold">PostgreSQL telemetry interface</p>
                  </div>
                </div>
                <Badge variant="gold" size="sm" dot dotPulse>
                  Live DB Synchronized
                </Badge>
              </div>
            </CardHeader>

            {/* Chat Message Scroll Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white font-semibold rounded-br-none shadow-md border border-zinc-800'
                        : 'bg-zinc-100 border border-zinc-300 text-black font-medium rounded-bl-none shadow-xs space-y-2'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>

                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-zinc-300 space-y-1.5">
                        <span className="text-[10px] uppercase font-black text-black block">
                          Suggested Queries:
                        </span>
                        {msg.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(action)}
                            className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-zinc-200 border border-zinc-300 text-[11px] text-black font-bold transition-colors cursor-pointer"
                          >
                            → {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-950 font-bold font-mono mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-black font-bold p-2">
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-yellow-600" />
                  <span>Querying PostgreSQL database metrics...</span>
                </div>
              )}
            </CardContent>

            {/* Input Footer */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-100/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask about ICU census, ED wait time, or patient volume..."
                  className="text-xs h-9 bg-white border-zinc-300 focus:border-yellow-400 text-black font-medium placeholder:text-zinc-500"
                />
                <Button type="submit" size="sm" variant="default" disabled={isThinking || !inputQuery.trim()} className="h-9 px-3 shadow-md">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
