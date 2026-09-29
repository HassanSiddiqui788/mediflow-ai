'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonTableRow } from '@/components/ui/skeleton';
import { HOSPITAL_DEPARTMENTS } from '@/lib/constants';
import { formatDate, getStatusBadgeStyles } from '@/lib/utils';
import { Patient } from '@/types/patient';
import { AdmitPatientDialog } from './AdmitPatientDialog';
import { Dropdown } from '@/components/ui/dropdown';

interface PatientTableProps {
  initialPatients?: Patient[];
  isLoading?: boolean;
}

export function PatientTable({ initialPatients = [], isLoading = false }: PatientTableProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [loading, setLoading] = useState(isLoading);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdmitOpen, setIsAdmitOpen] = useState(false);
  const itemsPerPage = 8;

  const fetchPatients = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients/list', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setPatients(json.data);
      } else if (Array.isArray(json.data)) {
        setPatients(json.data);
      }
    } catch (err: unknown) {
      console.error('Failed to refresh patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    fetch('/api/patients/list', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json.success && json.data) {
            setPatients(json.data);
          } else if (Array.isArray(json.data)) {
            setPatients(json.data);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load patients:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.mrn.toLowerCase().includes(search.toLowerCase()) ||
        p.doctor.toLowerCase().includes(search.toLowerCase());

      const matchesDept = selectedDept === 'All' || p.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [patients, search, selectedDept, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev.filter((p) => p.id !== newPatient.id)]);
    fetchPatients();
  };

  const departmentOptions = [
    { value: 'All', label: 'All Departments' },
    ...HOSPITAL_DEPARTMENTS.map((dept) => ({ value: dept, label: dept })),
  ];

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Inpatient', label: 'Inpatient' },
    { value: 'Outpatient', label: 'Outpatient' },
    { value: 'Active', label: 'Active' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Discharged', label: 'Discharged' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Buttons & Search Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between border border-zinc-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search by name, ID, MRN, or doctor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="h-4 w-4 text-zinc-700" />}
              className="bg-white border-zinc-300 text-black placeholder:text-zinc-500 font-medium"
            />
          </div>

          {/* Department Dropdown Filter */}
          <Dropdown
            value={selectedDept}
            onChange={(val) => {
              setSelectedDept(val);
              setCurrentPage(1);
            }}
            options={departmentOptions}
            className="w-full sm:w-auto"
          />

          {/* Status Dropdown Filter */}
          <Dropdown
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
            options={statusOptions}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            disabled={loading}
            className="text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
            title="Refresh from PostgreSQL"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin text-black' : 'text-zinc-700'}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => setIsAdmitOpen(true)}
            className="text-xs shadow-md"
          >
            <UserPlus className="h-4 w-4 mr-1.5 text-yellow-400" />
            Admit Patient
          </Button>

          <div className="text-xs text-black font-bold font-mono ml-2 hidden sm:block">
            <span>{filteredPatients.length} records</span>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28 text-black font-bold">Patient ID</TableHead>
            <TableHead className="text-black font-bold">Patient Name</TableHead>
            <TableHead className="w-20 text-black font-bold">Age / Gen</TableHead>
            <TableHead className="text-black font-bold">Department</TableHead>
            <TableHead className="text-black font-bold">Attending Doctor</TableHead>
            <TableHead className="w-28 text-black font-bold">Status</TableHead>
            <TableHead className="w-28 text-black font-bold">Last Visit</TableHead>
            <TableHead className="w-24 text-right text-black font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonTableRow key={idx} cols={8} />
            ))
          ) : paginatedPatients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-zinc-900">
                <div className="flex flex-col items-center justify-center gap-1">
                  <AlertCircle className="h-6 w-6 text-zinc-500 mb-1" />
                  <p className="font-bold text-black">No patients found</p>
                  <p className="text-xs text-zinc-700">
                    {patients.length === 0
                      ? 'The PostgreSQL database currently has no patient records. Click "Admit Patient" to add one.'
                      : 'Try adjusting your search criteria or clear current filters.'}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedPatients.map((patient) => {
              const statusStyle = getStatusBadgeStyles(patient.status);

              return (
                <TableRow key={patient.id} className="group hover:bg-yellow-50/50">
                  {/* Patient ID */}
                  <TableCell className="font-mono text-xs font-bold text-black">
                    {patient.id}
                  </TableCell>

                  {/* Name & Blood Group */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center font-mono font-bold text-xs text-black shrink-0">
                        {patient.name[0]}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="font-bold text-black hover:text-yellow-700 transition-colors truncate block"
                        >
                          {patient.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-900 font-medium">
                          <span className="font-mono">{patient.mrn}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-black">{patient.bloodGroup}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Age / Gender */}
                  <TableCell className="text-xs text-black font-semibold">
                    {patient.age}y / {patient.gender[0]}
                  </TableCell>

                  {/* Department */}
                  <TableCell className="text-xs text-black font-semibold">
                    {patient.department}
                    {patient.bedNumber && (
                      <span className="block text-[10px] text-zinc-900 font-mono font-bold">
                        Bed: {patient.bedNumber}
                      </span>
                    )}
                  </TableCell>

                  {/* Doctor */}
                  <TableCell className="text-xs text-black font-semibold">
                    {patient.doctor}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold items-center gap-1 ${statusStyle.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{patient.status}</span>
                    </div>
                  </TableCell>

                  {/* Last Visit */}
                  <TableCell className="text-xs text-black font-mono font-semibold">
                    {formatDate(patient.lastVisit)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Link href={`/patients/${patient.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] px-2.5 border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
                      >
                        <Eye className="h-3 w-3 mr-1 text-black" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-black font-medium">
          <p className="font-mono">
            Page <strong className="text-black font-bold">{currentPage}</strong> of{' '}
            <strong className="text-black font-bold">{totalPages}</strong> (
            {filteredPatients.length} total patients)
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1 text-black" />
              Previous
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-8 w-8 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-black hover:bg-zinc-200 border border-zinc-300 bg-white'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs border-zinc-300 bg-white text-black font-bold hover:bg-zinc-100 shadow-xs"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1 text-black" />
            </Button>
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
      <AdmitPatientDialog
        open={isAdmitOpen}
        onOpenChange={setIsAdmitOpen}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
}
