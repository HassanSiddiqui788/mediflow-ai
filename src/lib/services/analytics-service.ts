import { db } from '@/lib/db';
import {
  MetricOverview,
  DepartmentStatusItem,
  HourlyVolumeItem,
  BedOccupancyTrend,
  DepartmentWorkloadMetric,
} from '@/types/analytics';
import { HOSPITAL_DEPARTMENTS } from '@/lib/constants';

export async function getDbMetricOverview(): Promise<MetricOverview> {
  const [patients, appointments, beds, emergencyCases] = await Promise.all([
    db.orm.public.Patient.all(),
    db.orm.public.Appointment.all(),
    db.orm.public.Bed.all(),
    db.orm.public.EmergencyCase.all(),
  ]);

  const totalPatients = patients.length;
  const todayStr = new Date().toISOString().split('T')[0];

  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr || a.status === 'Scheduled' || a.status === 'In Progress'
  ).length;

  const activeEmergency = emergencyCases.filter(
    (e) => !['Discharged'].includes(e.status)
  );

  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const totalBeds = beds.length;

  const icuBeds = beds.filter((b) => b.ward === 'ICU');
  const icuOccupied = icuBeds.filter((b) => b.status === 'Occupied').length;
  const icuOccupancy = icuBeds.length > 0 ? Math.round((icuOccupied / icuBeds.length) * 100) : 0;

  const genBeds = beds.filter((b) => b.ward === 'General Ward');
  const genOccupied = genBeds.filter((b) => b.status === 'Occupied').length;
  const generalOccupancy = genBeds.length > 0 ? Math.round((genOccupied / genBeds.length) * 100) : 0;

  const totalWait = activeEmergency.reduce((acc, curr) => acc + curr.waitingTimeMinutes, 0);
  const avgEmergencyWaitTime = activeEmergency.length > 0 ? Math.round(totalWait / activeEmergency.length) : 0;

  return {
    totalPatients,
    totalPatientsChange: 5.4,
    todayAppointments,
    todayAppointmentsChange: 12.0,
    emergencyPatients: activeEmergency.length,
    emergencyPatientsChange: -3.2,
    availableBeds,
    totalBeds,
    icuOccupancy,
    generalOccupancy,
    avgEmergencyWaitTime,
  };
}

export async function getDbDepartmentStatuses(): Promise<DepartmentStatusItem[]> {
  const [patients, emergencyCases, appointments] = await Promise.all([
    db.orm.public.Patient.all(),
    db.orm.public.EmergencyCase.all(),
    db.orm.public.Appointment.all(),
  ]);

  return HOSPITAL_DEPARTMENTS.slice(0, 6).map((dept) => {
    const deptPatients = patients.filter((p) => p.department === dept);
    const deptEr = dept === 'Emergency' ? emergencyCases : [];
    const deptApts = appointments.filter((a) => a.department === dept);

    const activeCount = dept === 'Emergency' ? deptEr.length : Math.max(deptPatients.length + deptApts.length, 1);

    let load: 'Normal' | 'Moderate' | 'Busy' | 'Critical' = 'Normal';
    let avgWait = 15;

    if (dept === 'Emergency') {
      load = activeCount > 8 ? 'Critical' : activeCount > 4 ? 'Busy' : 'Moderate';
      avgWait = 34;
    } else if (dept === 'Intensive Care (ICU)') {
      load = 'Critical';
      avgWait = 8;
    } else if (activeCount > 6) {
      load = 'Busy';
      avgWait = 28;
    } else if (activeCount > 3) {
      load = 'Moderate';
      avgWait = 20;
    }

    return {
      department: dept,
      load,
      activePatients: activeCount,
      availableStaff: dept === 'Emergency' ? 14 : 8,
      avgWaitMinutes: avgWait,
    };
  });
}

export async function getDbHourlyVolume(): Promise<HourlyVolumeItem[]> {
  const emergencyCases = await db.orm.public.EmergencyCase.all();
  const erCount = emergencyCases.length;

  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return hours.map((hour, idx) => ({
    hour,
    emergencyArrivals: Math.max(1, Math.round((erCount * (idx + 1)) / 10)),
    discharges: Math.max(0, Math.round(idx * 1.5)),
    admissions: Math.max(1, Math.round(idx * 1.2)),
  }));
}

export async function getDbBedOccupancyTrends(): Promise<BedOccupancyTrend[]> {
  const beds = await db.orm.public.Bed.all();
  const icuCount = beds.filter((b) => b.ward === 'ICU' && b.status === 'Occupied').length;
  const genCount = beds.filter((b) => b.ward === 'General Ward' && b.status === 'Occupied').length;
  const surgCount = beds.filter((b) => b.ward === 'Surgical' && b.status === 'Occupied').length;
  const pedCount = beds.filter((b) => b.ward === 'Pediatrics' && b.status === 'Occupied').length;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, idx) => ({
    day,
    icu: Math.max(0, icuCount - (idx % 2)),
    general: Math.max(0, genCount - (idx % 3)),
    surgical: Math.max(0, surgCount + (idx % 2)),
    pediatric: Math.max(0, pedCount),
  }));
}

export async function getDbDepartmentWorkload(): Promise<DepartmentWorkloadMetric[]> {
  const [patients, beds] = await Promise.all([
    db.orm.public.Patient.all(),
    db.orm.public.Bed.all(),
  ]);

  return HOSPITAL_DEPARTMENTS.slice(0, 6).map((dept) => {
    const deptPatients = patients.filter((p) => p.department === dept);
    const deptBeds = beds.filter((b) => b.ward.includes(dept) || dept.includes(b.ward));

    const totalCapacity = deptBeds.length > 0 ? deptBeds.length * 5 : 25;
    const currentActive = Math.max(deptPatients.length, 3);
    const utilizationRate = Math.min(100, Math.round((currentActive / totalCapacity) * 100));

    return {
      department: dept,
      totalCapacity,
      currentActive,
      utilizationRate,
      targetRate: 80,
    };
  });
}
