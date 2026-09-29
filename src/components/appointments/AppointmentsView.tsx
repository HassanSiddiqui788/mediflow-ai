'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { HOSPITAL_DEPARTMENTS } from '@/lib/constants';
import { getStatusBadgeStyles } from '@/lib/utils';
import { Appointment } from '@/types/appointment';

interface AppointmentsViewProps {
  initialAppointments?: Appointment[];
}

export function AppointmentsView({ initialAppointments = [] }: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(initialAppointments.length === 0);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [isBookOpen, setIsBookOpen] = useState(false);

  // New appointment form state
  const [formData, setFormData] = useState({
    patientId: 'PT-9042',
    doctor: 'Dr. David Chen, MD',
    department: 'General Medicine',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    duration: 30,
    type: 'Consultation',
    status: 'Scheduled',
    room: 'Suite 204',
    reasonForVisit: 'Routine Follow-up and Vitals Review',
  });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  const fetchAppointments = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments/list', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setAppointments(json.data);
      } else if (Array.isArray(json.data)) {
        setAppointments(json.data);
      }
    } catch (err) {
      console.error('Failed to refresh appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    fetch('/api/appointments/list', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json.success && json.data) {
            setAppointments(json.data);
          } else if (Array.isArray(json.data)) {
            setAppointments(json.data);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load appointments:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookLoading(true);
    setBookError(null);

    try {
      const res = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || 'Failed to book appointment');
      }

      setAppointments((prev) => [json.data, ...prev.filter((a) => a.id !== json.data.id)]);
      setIsBookOpen(false);
      fetchAppointments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error booking appointment';
      setBookError(msg);
    } finally {
      setBookLoading(false);
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(search.toLowerCase()) ||
        apt.doctor.toLowerCase().includes(search.toLowerCase()) ||
        apt.room.toLowerCase().includes(search.toLowerCase()) ||
        apt.reasonForVisit.toLowerCase().includes(search.toLowerCase());

      const matchesDept = selectedDept === 'All' || apt.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || apt.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [appointments, search, selectedDept, selectedStatus]);

  // Statistics counters
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      completed: appointments.filter((a) => a.status === 'Completed').length,
      checkedIn: appointments.filter((a) => a.status === 'Checked In').length,
      inProgress: appointments.filter((a) => a.status === 'In Progress').length,
      scheduled: appointments.filter((a) => a.status === 'Scheduled').length,
    };
  }, [appointments]);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card variant="glass" className="p-3.5 border-zinc-300 bg-white shadow-xs">
          <p className="text-[10px] uppercase font-bold text-black">Total in Database</p>
          <p className="text-xl font-black font-mono text-black mt-1">{stats.total}</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-sky-300 bg-sky-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-sky-900">Checked In</p>
          <p className="text-xl font-black font-mono text-sky-800 mt-1">{stats.checkedIn}</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-yellow-300 bg-yellow-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-yellow-900">In Progress</p>
          <p className="text-xl font-black font-mono text-yellow-800 mt-1">{stats.inProgress}</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-emerald-300 bg-emerald-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-emerald-900">Completed</p>
          <p className="text-xl font-black font-mono text-emerald-800 mt-1">{stats.completed}</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-amber-300 bg-amber-50/70 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase font-bold text-amber-900">Upcoming / Sched</p>
          <p className="text-xl font-black font-mono text-amber-800 mt-1">{stats.scheduled}</p>
        </Card>
      </div>

      {/* Filter & Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between border border-zinc-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search by patient, doctor, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4 text-zinc-700" />}
              className="bg-white border-zinc-300 text-black placeholder:text-zinc-500 font-medium"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-500 shadow-xs cursor-pointer"
          >
            <option value="All">All Departments</option>
            {HOSPITAL_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-500 shadow-xs cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Checked In">Checked In</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* View mode toggle & Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAppointments}
            disabled={loading}
            className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => setIsBookOpen(true)}
            className="text-xs shadow-md"
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-yellow-400" />
            Book Slot
          </Button>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-100 border border-zinc-300">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-zinc-900 text-white shadow-xs' : 'text-black hover:bg-zinc-200'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'timeline' ? 'bg-zinc-900 text-white shadow-xs' : 'text-black hover:bg-zinc-200'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'list' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 font-black text-black">Time</TableHead>
              <TableHead className="font-black text-black">Patient Details</TableHead>
              <TableHead className="font-black text-black">Attending Doctor</TableHead>
              <TableHead className="font-black text-black">Department / Room</TableHead>
              <TableHead className="font-black text-black">Visit Reason & Type</TableHead>
              <TableHead className="w-32 font-black text-black">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-black font-medium">
                  {appointments.length === 0
                    ? 'No appointments found in PostgreSQL. Click "Book Slot" to add one.'
                    : 'No appointments match current filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((apt) => {
                const badgeStyle = getStatusBadgeStyles(apt.status);

                return (
                  <TableRow key={apt.id} className="group">
                    {/* Time */}
                    <TableCell>
                      <div className="flex flex-col font-mono">
                        <span className="text-xs font-black text-black">{apt.time}</span>
                        <span className="text-[10px] text-zinc-950 font-bold">{apt.duration} mins</span>
                      </div>
                    </TableCell>

                    {/* Patient */}
                    <TableCell>
                      <div>
                        <Link
                          href={`/patients/${apt.patientId}`}
                          className="font-bold text-black hover:text-yellow-600 transition-colors"
                        >
                          {apt.patientName}
                        </Link>
                        <p className="text-[11px] text-zinc-950 font-bold font-mono">
                          {apt.patientId} • {apt.patientAge}y {apt.patientGender}
                        </p>
                      </div>
                    </TableCell>

                    {/* Doctor */}
                    <TableCell className="text-xs font-bold text-black">
                      {apt.doctor}
                    </TableCell>

                    {/* Department / Room */}
                    <TableCell>
                      <div className="text-xs text-black">
                        <span className="font-bold">{apt.department}</span>
                        <span className="block text-[10px] text-black font-mono font-extrabold">
                          {apt.room}
                        </span>
                      </div>
                    </TableCell>

                    {/* Visit Type / Reason */}
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-bold text-black">{apt.type}</span>
                        <p className="text-[11px] text-zinc-950 font-medium truncate max-w-xs">{apt.reasonForVisit}</p>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-bold items-center gap-1.5 ${badgeStyle.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                        <span>{apt.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          <div className="relative pl-6 border-l-2 border-zinc-300 space-y-6">
            {filteredAppointments.map((apt) => {
              const badgeStyle = getStatusBadgeStyles(apt.status);

              return (
                <div key={apt.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-black border-2 border-yellow-400" />

                  <Card variant="glass" className="p-4 border-zinc-300 bg-white hover:border-zinc-500 transition-all shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded bg-zinc-100 border border-zinc-300 font-mono text-black font-black text-xs">
                          {apt.time}
                        </div>
                        <div>
                          <Link href={`/patients/${apt.patientId}`} className="font-bold text-black hover:text-yellow-600">
                            {apt.patientName}
                          </Link>
                          <span className="text-[11px] text-zinc-950 font-mono font-bold ml-2">({apt.patientId})</span>
                        </div>
                      </div>

                      <div className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold items-center gap-1 self-start sm:self-auto ${badgeStyle.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                        <span>{apt.status}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-black">
                      <div>
                        <span className="text-[10px] uppercase text-black font-extrabold block">Doctor</span>
                        <span className="font-bold text-black">{apt.doctor}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-black font-extrabold block">Department & Room</span>
                        <span className="font-bold text-black">{apt.department} • <strong className="text-black font-mono font-black">{apt.room}</strong></span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-black font-extrabold block">Reason</span>
                        <span className="text-zinc-950 font-medium">{apt.reasonForVisit}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Dialog open={isBookOpen} onOpenChange={setIsBookOpen}>
        <DialogContent onClose={() => setIsBookOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-black font-black">Book Consultation Slot</DialogTitle>
            <DialogDescription className="text-zinc-950 font-medium">Schedule clinical consultation in PostgreSQL database.</DialogDescription>
          </DialogHeader>

          {bookError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold">
              {bookError}
            </div>
          )}

          <form onSubmit={handleBookSubmit} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-black font-bold">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-9 mt-1 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold shadow-xs"
                >
                  {HOSPITAL_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-black font-bold">Attending Doctor</label>
                <Input
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="mt-1 text-xs bg-white border-zinc-300 text-black font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-black font-bold">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 text-xs bg-white border-zinc-300 text-black font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-black font-bold">Time</label>
                <Input
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1 text-xs font-mono bg-white border-zinc-300 text-black font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-black font-bold">Room</label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="mt-1 text-xs font-mono bg-white border-zinc-300 text-black font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-black font-bold">Reason for Visit</label>
              <Input
                value={formData.reasonForVisit}
                onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                className="mt-1 text-xs bg-white border-zinc-300 text-black font-medium"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBookOpen(false)} className="text-xs border-zinc-300 text-black font-bold hover:bg-zinc-100">
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={bookLoading} className="text-xs shadow-md">
                {bookLoading ? 'Saving...' : 'Confirm Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
