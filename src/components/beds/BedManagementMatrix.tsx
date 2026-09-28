'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BedDouble,
  Search,
  CheckCircle2,
  Wrench,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bed, BedStatus } from '@/types/bed';
import { getStatusBadgeStyles } from '@/lib/utils';

interface BedManagementMatrixProps {
  initialBeds?: Bed[];
}

export function BedManagementMatrix({ initialBeds = [] }: BedManagementMatrixProps) {
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [loading, setLoading] = useState(false);
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [activeBedDetail, setActiveBedDetail] = useState<Bed | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/beds/list');
      const json = await res.json();
      if (json.success && json.data) {
        setBeds(json.data);
      } else if (Array.isArray(json.data)) {
        setBeds(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch beds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bedId: string, newStatus: BedStatus) => {
    try {
      setStatusUpdating(true);
      const res = await fetch(`/api/beds/update?id=${encodeURIComponent(bedId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          patientId: newStatus === 'Available' || newStatus === 'Cleaning' ? null : undefined,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBeds((prev) => prev.map((b) => (b.id === bedId ? json.data : b)));
        setActiveBedDetail(json.data);
      }
    } catch (err) {
      console.error('Error updating bed status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchesSearch =
        b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.room.toLowerCase().includes(search.toLowerCase()) ||
        (b.patient && b.patient.name.toLowerCase().includes(search.toLowerCase())) ||
        (b.reservedFor && b.reservedFor.toLowerCase().includes(search.toLowerCase()));

      const matchesWard = selectedWard === 'All' || b.ward === selectedWard;

      return matchesSearch && matchesWard;
    });
  }, [beds, search, selectedWard]);

  const summary = useMemo(() => {
    const total = beds.length;
    const occupied = beds.filter((b) => b.status === 'Occupied').length;
    const available = beds.filter((b) => b.status === 'Available').length;
    const cleaning = beds.filter((b) => b.status === 'Cleaning').length;
    const reserved = beds.filter((b) => b.status === 'Reserved').length;
    const maintenance = beds.filter((b) => b.status === 'Maintenance').length;
    return { total, occupied, available, cleaning, reserved, maintenance };
  }, [beds]);

  return (
    <div className="space-y-6">
      {/* Top Census Rollup Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card variant="glass" className="p-3.5 border-zinc-300 bg-white shadow-xs">
          <p className="text-[10px] uppercase font-bold text-black">Total in PostgreSQL</p>
          <p className="text-xl font-black font-mono text-black mt-0.5">{summary.total} Beds</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-emerald-300 bg-emerald-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-emerald-900">Available</p>
          <p className="text-xl font-black font-mono text-emerald-800 mt-0.5">{summary.available} Ready</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-sky-300 bg-sky-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-sky-900">Occupied</p>
          <p className="text-xl font-black font-mono text-sky-800 mt-0.5">{summary.occupied} Beds</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-amber-300 bg-amber-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-amber-900">Turnover / Cleaning</p>
          <p className="text-xl font-black font-mono text-amber-800 mt-0.5">{summary.cleaning} Units</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-yellow-300 bg-yellow-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-yellow-900">Reserved</p>
          <p className="text-xl font-black font-mono text-yellow-800 mt-0.5">{summary.reserved} Beds</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-rose-300 bg-rose-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-rose-900">Maintenance</p>
          <p className="text-xl font-black font-mono text-rose-800 mt-0.5">{summary.maintenance} Bed</p>
        </Card>
      </div>

      {/* Ward & Status Filter Tabs */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between border border-zinc-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search bed ID, room, or patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4 text-zinc-700" />}
              className="bg-white border-zinc-300 text-black placeholder:text-zinc-500 font-medium"
            />
          </div>

          {/* Ward Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 border border-zinc-300 flex-wrap">
            {(['All', 'ICU', 'Cardiology', 'Surgical', 'General Ward', 'Pediatrics', 'Emergency'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWard(w)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  selectedWard === w
                    ? 'bg-zinc-900 text-white font-bold shadow-xs'
                    : 'text-black hover:bg-zinc-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBeds}
          disabled={loading}
          className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs self-end md:self-center"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
          Refresh
        </Button>
      </div>

      {/* Bed Matrix Grid */}
      {filteredBeds.length === 0 ? (
        <div className="p-12 text-center text-zinc-900 glass-panel rounded-2xl border border-zinc-200 bg-white">
          <BedDouble className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
          <p className="font-bold text-black">No beds found</p>
          <p className="text-xs text-zinc-700 mt-1">No bed records match current filter in PostgreSQL.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBeds.map((bed) => {
            const badgeStyle = getStatusBadgeStyles(bed.status);

            return (
              <Card
                key={bed.id}
                variant="glass"
                onClick={() => setActiveBedDetail(bed)}
                className="p-4 cursor-pointer hover:border-zinc-400 border border-zinc-200 bg-white shadow-xs transition-all hover:scale-[1.01] flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-black font-mono block">
                        {bed.ward} • Floor {bed.floor}
                      </span>
                      <h3 className="text-base font-extrabold text-black group-hover:text-yellow-700 transition-colors font-mono">
                        {bed.bedNumber}
                      </h3>
                      <span className="text-[11px] text-zinc-950 font-mono font-semibold">{bed.room}</span>
                    </div>

                    <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${badgeStyle.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                      <span>{bed.status}</span>
                    </div>
                  </div>

                  {/* Bed Content based on status */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-200 text-xs">
                    {bed.status === 'Occupied' && bed.patient ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-black">
                          <User className="h-3.5 w-3.5 text-sky-700 shrink-0" />
                          <span className="truncate">{bed.patient.name}</span>
                        </div>
                        <p className="text-[11px] text-zinc-950 pl-5 truncate font-mono font-medium">
                          {bed.patient.id} • {bed.patient.attendingDoctor}
                        </p>
                      </div>
                    ) : bed.status === 'Available' ? (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-[11px]">Sanitized & Ready for Admission</span>
                      </div>
                    ) : bed.status === 'Cleaning' ? (
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[11px]">Turnover in progress</span>
                      </div>
                    ) : bed.status === 'Reserved' ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase text-yellow-900 font-bold">Reserved for</span>
                        <p className="text-xs font-bold text-black truncate">{bed.reservedFor}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                        <Wrench className="h-3.5 w-3.5" />
                        <span className="text-[11px] truncate">{bed.maintenanceNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {bed.equipment && bed.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {bed.equipment.map((eq) => (
                      <span
                        key={eq}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-black font-mono font-bold"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Bed Detail / Action Modal */}
      {activeBedDetail && (
        <Dialog open={Boolean(activeBedDetail)} onOpenChange={(open) => !open && setActiveBedDetail(null)}>
          <DialogContent onClose={() => setActiveBedDetail(null)} className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-mono text-lg">{activeBedDetail.bedNumber}</DialogTitle>
                <Badge variant={activeBedDetail.status === 'Available' ? 'emerald' : activeBedDetail.status === 'Reserved' ? 'gold' : 'sky'}>
                  {activeBedDetail.status}
                </Badge>
              </div>
              <DialogDescription>
                {activeBedDetail.ward} • {activeBedDetail.room} • Floor {activeBedDetail.floor}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {activeBedDetail.patient && (
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-sky-400">Admitted Patient</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{activeBedDetail.patient.name}</span>
                    <Link
                      href={`/patients/${activeBedDetail.patient.id}`}
                      className="text-xs text-yellow-400 hover:underline font-mono"
                    >
                      {activeBedDetail.patient.id}
                    </Link>
                  </div>
                  <p className="text-zinc-400">Attending: {activeBedDetail.patient.attendingDoctor}</p>
                </div>
              )}

              {/* Status change actions */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-300 block">Change Bed State (PostgreSQL)</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Available', 'Cleaning', 'Maintenance'] as BedStatus[]).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      disabled={statusUpdating || activeBedDetail.status === status}
                      onClick={() => handleUpdateStatus(activeBedDetail.id, status)}
                      className="text-[11px] border-zinc-700 hover:border-yellow-500/40 hover:text-yellow-300"
                    >
                      Set {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
