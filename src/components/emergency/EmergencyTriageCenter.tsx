'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Clock,
  Activity,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmergencyPatient, EmergencyPriority } from '@/types/emergency';
import { getStatusBadgeStyles } from '@/lib/utils';

interface EmergencyTriageCenterProps {
  initialCases?: EmergencyPatient[];
}

export function EmergencyTriageCenter({ initialCases = [] }: EmergencyTriageCenterProps) {
  const [cases, setCases] = useState<EmergencyPatient[]>(initialCases);
  const [loading, setLoading] = useState(initialCases.length === 0);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: 45,
    gender: 'Male',
    priority: 'High' as EmergencyPriority,
    esiScore: 2,
    chiefComplaint: 'Acute Chest Tightness with Radiating Pain',
    room: 'Bay 03',
    assignedDoctor: 'Dr. Sarah Jenkins, MD',
  });
  const [addLoading, setAddLoading] = useState(false);

  const fetchCases = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/emergency/list', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setCases(json.data);
      } else if (Array.isArray(json.data)) {
        setCases(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch emergency cases:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    fetch('/api/emergency/list', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json.success && json.data) {
            setCases(json.data);
          } else if (Array.isArray(json.data)) {
            setCases(json.data);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load emergency cases:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch('/api/emergency/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCases((prev) => [json.data, ...prev.filter((c) => c.id !== json.data.id)]);
        setIsAddOpen(false);
        setFormData({
          name: '',
          age: 45,
          gender: 'Male',
          priority: 'High',
          esiScore: 2,
          chiefComplaint: 'Acute Chest Tightness with Radiating Pain',
          room: 'Bay 03',
          assignedDoctor: 'Dr. Sarah Jenkins, MD',
        });
        fetchCases();
      }
    } catch (err) {
      console.error('Error adding emergency case:', err);
    } finally {
      setAddLoading(false);
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.chiefComplaint.toLowerCase().includes(search.toLowerCase()) ||
        c.room.toLowerCase().includes(search.toLowerCase()) ||
        c.assignedDoctor.toLowerCase().includes(search.toLowerCase());

      const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [cases, search, priorityFilter]);

  const stats = useMemo(() => {
    const total = cases.length;
    const critical = cases.filter((c) => c.priority === 'Critical').length;
    const high = cases.filter((c) => c.priority === 'High').length;
    const avgWait = total > 0 ? Math.round(cases.reduce((acc, c) => acc + c.waitingTimeMinutes, 0) / total) : 0;
    return { total, critical, high, avgWait };
  }, [cases]);

  return (
    <div className="space-y-6">
      {/* Top Critical Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card variant="glass" className="p-4 border-rose-300 bg-rose-50/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-black">Total in PostgreSQL</span>
            <Flame className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black font-mono text-black mt-1">{stats.total} Patients</p>
          <span className="text-[11px] text-rose-800 font-mono font-bold">Real-time DB Census</span>
        </Card>

        <Card variant="glass" className="p-4 border-rose-300 bg-rose-50/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-rose-900">ESI-1 Critical Resus</span>
            <ShieldAlert className="h-4 w-4 text-rose-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-700 mt-1">{stats.critical} Cases</p>
          <span className="text-[11px] text-black font-semibold">Direct Physician Bedside</span>
        </Card>

        <Card variant="glass" className="p-4 border-amber-300 bg-amber-50/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-900">ESI-2 Emergent High</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-800 mt-1">{stats.high} Cases</p>
          <span className="text-[11px] text-black font-semibold">Target Triage &lt; 15 min</span>
        </Card>

        <Card variant="glass" className="p-4 border-zinc-300 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-black">Mean Wait Duration</span>
            <Activity className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-black font-mono text-black mt-1">{stats.avgWait} mins</p>
          <span className="text-[11px] text-black font-mono font-bold">Derived from database</span>
        </Card>
      </div>

      {/* Triage Search & Priority Tabs */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between border border-zinc-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search ER patient, complaint, bay, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4 text-zinc-700" />}
              className="bg-white border-zinc-300 text-black placeholder:text-zinc-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 border border-zinc-300 flex-wrap">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-zinc-900 text-white font-bold shadow-xs'
                    : 'text-black hover:bg-zinc-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCases}
            disabled={loading}
            className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => setIsAddOpen(true)}
            className="text-xs shadow-md"
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-yellow-400" />
            Triage Influx
          </Button>
        </div>
      </div>

      {/* Emergency Cases Grid */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center text-zinc-900 glass-panel rounded-2xl border border-zinc-200 bg-white">
          <Flame className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
          <p className="font-bold text-black">No emergency cases found</p>
          <p className="text-xs text-zinc-700 mt-1">No acute triage cases in PostgreSQL database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem) => {
            const badgeStyle = getStatusBadgeStyles(caseItem.status);

            return (
              <Card
                key={caseItem.id}
                variant="glass"
                className={`p-4 hover:border-zinc-400 border border-zinc-200 bg-white shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                  caseItem.priority === 'Critical'
                    ? 'border-rose-300 bg-rose-50/30'
                    : caseItem.priority === 'High'
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          caseItem.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
                            : caseItem.priority === 'High'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold'
                        }`}
                      >
                        {caseItem.esiScore}
                      </span>
                      <div>
                        <h3 className="font-bold text-black text-sm">{caseItem.name}</h3>
                        <span className="text-[10px] text-zinc-950 font-mono font-bold">
                          {caseItem.id} • {caseItem.age}y {caseItem.gender}
                        </span>
                      </div>
                    </div>

                    <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeStyle.bg}`}>
                      {caseItem.status}
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-black">Chief Complaint</span>
                    <p className="font-medium text-black">{caseItem.chiefComplaint}</p>
                  </div>

                  {/* Vitals & Bay */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-black font-mono">
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <span className="text-[10px] text-black block uppercase font-bold">Location</span>
                      <span className="text-black font-black">{caseItem.room}</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <span className="text-[10px] text-black block uppercase font-bold">Wait Duration</span>
                      <span className="text-amber-800 font-black">{caseItem.waitingTimeMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 text-[11px] text-black font-medium flex items-center justify-between">
                  <span>Attending: <strong>{caseItem.assignedDoctor}</strong></span>
                  <span className="font-mono text-[10px] text-black font-bold">Arr: {caseItem.arrivalTime}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Triage Influx Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent onClose={() => setIsAddOpen(false)}>
          <DialogHeader>
            <DialogTitle>Register Triage Influx</DialogTitle>
            <DialogDescription>Add acute emergency arrival directly to PostgreSQL database.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-300 font-medium">Patient Full Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Johnathan Clark"
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 font-medium">Age</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium">ESI Score (1-5)</label>
                <select
                  value={formData.esiScore}
                  onChange={(e) => {
                    const score = Number(e.target.value);
                    const prio = score === 1 ? 'Critical' : score === 2 ? 'High' : score === 3 ? 'Medium' : 'Low';
                    setFormData({ ...formData, esiScore: score, priority: prio as EmergencyPriority });
                  }}
                  className="w-full h-9 mt-1 px-3 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200"
                >
                  <option value={1}>1 - Resuscitation</option>
                  <option value={2}>2 - Emergent</option>
                  <option value={3}>3 - Urgent</option>
                  <option value={4}>4 - Less Urgent</option>
                  <option value={5}>5 - Non-Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium">Trauma Bay / Room</label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Bay 01"
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-medium">Chief Complaint</label>
              <Input
                required
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="destructive" disabled={addLoading} className="text-xs">
                {addLoading ? 'Registering...' : 'Confirm & Triage'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
