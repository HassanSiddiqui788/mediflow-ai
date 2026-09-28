'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LabTest } from '@/types/laboratory';
import { getStatusBadgeStyles } from '@/lib/utils';

interface LaboratoryWorkflowProps {
  initialTests?: LabTest[];
}

export function LaboratoryWorkflow({ initialTests = [] }: LaboratoryWorkflowProps) {
  const [tests, setTests] = useState<LabTest[]>(initialTests);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/laboratory/list');
      const json = await res.json();
      if (json.success && json.data) {
        setTests(json.data);
      } else if (Array.isArray(json.data)) {
        setTests(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch laboratory tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        t.testName.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.doctor.toLowerCase().includes(search.toLowerCase()) ||
        t.department.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [tests, search, selectedCategory, selectedStatus]);

  const stats = useMemo(() => {
    const total = tests.length;
    const stat = tests.filter((t) => t.priority === 'STAT').length;
    const inProgress = tests.filter((t) => t.status === 'In Progress' || t.status === 'Pending').length;
    const completed = tests.filter((t) => t.status === 'Completed' || t.status === 'Reviewed').length;
    const abnormal = tests.filter((t) => t.flaggedAbnormal).length;
    return { total, stat, inProgress, completed, abnormal };
  }, [tests]);

  return (
    <div className="space-y-6">
      {/* Top Laboratory KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card variant="glass" className="p-3.5 border-zinc-300 bg-white shadow-xs">
          <p className="text-[10px] uppercase font-black text-black">Total Orders (DB)</p>
          <p className="text-xl font-black font-mono text-black mt-1">{stats.total} Orders</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-rose-300 bg-rose-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-black text-rose-950">STAT / Urgent</p>
          <p className="text-xl font-black font-mono text-rose-900 mt-1">{stats.stat} High Priority</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-amber-300 bg-amber-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-black text-amber-950">Processing Queue</p>
          <p className="text-xl font-black font-mono text-amber-900 mt-1">{stats.inProgress} Samples</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-emerald-300 bg-emerald-50/70 shadow-xs">
          <p className="text-[10px] uppercase font-black text-emerald-950">Results Ready</p>
          <p className="text-xl font-black font-mono text-emerald-900 mt-1">{stats.completed} Verified</p>
        </Card>
        <Card variant="glass" className="p-3.5 border-rose-300 bg-rose-50/70 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase font-black text-rose-950">Abnormal Flags</p>
          <p className="text-xl font-black font-mono text-rose-900 mt-1">{stats.abnormal} Critical</p>
        </Card>
      </div>

      {/* Filter & Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between border border-zinc-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search by test, patient, order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4 text-zinc-700" />}
              className="bg-white border-zinc-300 text-black placeholder:text-zinc-500 font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-500 shadow-xs cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Hematology">Hematology</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Pathology">Pathology</option>
            <option value="Immunology">Immunology</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs text-black font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-500 shadow-xs cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Reviewed">Reviewed</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTests}
          disabled={loading}
          className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs self-end md:self-center"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
          Refresh
        </Button>
      </div>

      {/* Lab Tests Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28 font-black text-black">Order Code</TableHead>
            <TableHead className="font-black text-black">Test & Category</TableHead>
            <TableHead className="font-black text-black">Patient Details</TableHead>
            <TableHead className="font-black text-black">Ordering Physician</TableHead>
            <TableHead className="font-black text-black">TAT / Estimated</TableHead>
            <TableHead className="font-black text-black">Priority</TableHead>
            <TableHead className="w-28 font-black text-black">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredTests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-black font-medium">
                {tests.length === 0
                  ? 'No laboratory orders found in PostgreSQL database.'
                  : 'No lab orders match current filter criteria.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredTests.map((test) => {
              const statusStyle = getStatusBadgeStyles(test.status);

              return (
                <TableRow key={test.id} className="group">
                  {/* Order ID */}
                  <TableCell className="font-mono text-xs font-black text-black">
                    {test.id}
                  </TableCell>

                  {/* Test Name & Category */}
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black">{test.testName}</span>
                        {test.flaggedAbnormal && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 border border-rose-300 text-[9px] font-black">
                            ABNORMAL
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-950 mt-0.5 font-mono font-semibold">
                        <span className="text-black font-bold">{test.category}</span>
                        <span>•</span>
                        <span>Sample: {test.sampleType}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Patient Details */}
                  <TableCell>
                    <div>
                      <Link
                        href={`/patients/${test.patientId}`}
                        className="font-bold text-black hover:text-yellow-600 transition-colors"
                      >
                        {test.patientName}
                      </Link>
                      <p className="text-[11px] text-zinc-950 font-bold font-mono">{test.patientId}</p>
                    </div>
                  </TableCell>

                  {/* Ordering Physician */}
                  <TableCell className="text-xs text-black">
                    <div>
                      <p className="font-bold text-black">{test.doctor}</p>
                      <span className="text-[11px] text-zinc-950 font-mono font-semibold">{test.department}</span>
                    </div>
                  </TableCell>

                  {/* TAT / Estimated */}
                  <TableCell className="text-xs font-mono font-bold text-black">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-700" />
                      <span>{test.estimatedCompletionTime}</span>
                    </div>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <Badge
                      variant={
                        test.priority === 'STAT'
                          ? 'rose'
                          : test.priority === 'Urgent'
                          ? 'amber'
                          : 'default'
                      }
                      size="sm"
                    >
                      {test.priority}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold items-center gap-1 ${statusStyle.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{test.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
