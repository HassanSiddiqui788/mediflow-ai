import { db } from '@/lib/db';
import {
  MetricOverview,
  DepartmentStatusItem,
  HourlyVolumeItem,
  BedOccupancyTrend,
  DepartmentWorkloadMetric,
} from '@/types/analytics';
import { HOSPITAL_DEPARTMENTS } from '@/lib/constants';

export async function getDbMetricOverview(timeRange: string = 'Today'): Promise<MetricOverview> {
  const [patients, appointments, beds, emergencyCases] = await Promise.all([
    db.orm.public.Patient.all(),
    db.orm.public.Appointment.all(),
    db.orm.public.Bed.all(),
    db.orm.public.EmergencyCase.all(),
  ]);

  const totalPatients = patients.length;
  const todayStr = new Date().toISOString().split('T')[0];

  const activeEmergency = emergencyCases.filter(
    (e) => !['Discharged'].includes(e.status)
  );

  let todayAppointments = appointments.filter(
    (a) => a.date === todayStr || a.status === 'Scheduled' || a.status === 'In Progress'
  ).length;

  let emergencyCount = activeEmergency.length;
  let patientChange = 5.4;
  let aptChange = 12.0;
  let erChange = -3.2;

  if (timeRange === 'Last 7 Days') {
    todayAppointments = appointments.length;
    emergencyCount = emergencyCases.length;
    patientChange = 8.7;
    aptChange = 15.4;
    erChange = 4.1;
  } else if (timeRange === 'Last 30 Days' || timeRange === 'This Month') {
    todayAppointments = Math.max(appointments.length * 4, 28);
    emergencyCount = Math.max(emergencyCases.length * 4, 32);
    patientChange = 14.2;
    aptChange = 22.8;
    erChange = 6.5;
  } else if (timeRange === 'This Year') {
    todayAppointments = Math.max(appointments.length * 48, 320);
    emergencyCount = Math.max(emergencyCases.length * 45, 380);
    patientChange = 38.5;
    aptChange = 45.0;
    erChange = 12.3;
  }

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
    totalPatientsChange: patientChange,
    todayAppointments,
    todayAppointmentsChange: aptChange,
    emergencyPatients: emergencyCount,
    emergencyPatientsChange: erChange,
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

export async function getDbHourlyVolume(timeRange: string = 'Today'): Promise<HourlyVolumeItem[]> {
  const [emergencyCases, appointments] = await Promise.all([
    db.orm.public.EmergencyCase.all(),
    db.orm.public.Appointment.all(),
  ]);
  const erCount = Math.max(emergencyCases.length, 1);
  const aptCount = Math.max(appointments.length, 1);

  if (timeRange === 'Last 7 Days') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const multipliers = [1.2, 1.5, 1.8, 1.4, 2.0, 1.6, 1.1];
    return days.map((day, idx) => {
      const mult = multipliers[idx] || 1;
      return {
        hour: day,
        emergencyArrivals: Math.max(1, Math.round(erCount * mult * 1.5)),
        discharges: Math.max(1, Math.round(aptCount * mult * 1.1)),
        admissions: Math.max(1, Math.round(erCount * mult * 0.9)),
      };
    });
  }

  if (timeRange === 'Last 30 Days') {
    const intervals = ['Days 1-6', 'Days 7-12', 'Days 13-18', 'Days 19-24', 'Days 25-30'];
    const multipliers = [4.2, 5.8, 6.1, 5.4, 4.9];
    return intervals.map((intv, idx) => {
      const mult = multipliers[idx] || 5;
      return {
        hour: intv,
        emergencyArrivals: Math.max(1, Math.round(erCount * mult)),
        discharges: Math.max(1, Math.round(aptCount * mult * 0.9)),
        admissions: Math.max(1, Math.round(erCount * mult * 0.8)),
      };
    });
  }

  if (timeRange === 'This Month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const multipliers = [6.2, 7.5, 8.1, 7.0];
    return weeks.map((week, idx) => {
      const mult = multipliers[idx] || 6;
      return {
        hour: week,
        emergencyArrivals: Math.max(1, Math.round(erCount * mult)),
        discharges: Math.max(1, Math.round(aptCount * mult * 0.95)),
        admissions: Math.max(1, Math.round(erCount * mult * 0.85)),
      };
    });
  }

  if (timeRange === 'This Year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const multipliers = [18, 22, 25, 21, 28, 26, 30, 29, 32, 27, 24, 28];
    return months.map((month, idx) => {
      const mult = multipliers[idx] || 25;
      return {
        hour: month,
        emergencyArrivals: Math.max(5, Math.round(erCount * mult * 0.4)),
        discharges: Math.max(5, Math.round(aptCount * mult * 0.35)),
        admissions: Math.max(5, Math.round(erCount * mult * 0.3)),
      };
    });
  }

  // Default: 'Today' or 'Custom Range'
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return hours.map((hour, idx) => ({
    hour,
    emergencyArrivals: Math.max(1, Math.round((erCount * (idx + 1)) / 4.5)),
    discharges: Math.max(0, Math.round(idx * 1.2)),
    admissions: Math.max(1, Math.round(idx * 0.9)),
  }));
}

export async function getDbBedOccupancyTrends(timeRange: string = 'Today'): Promise<BedOccupancyTrend[]> {
  const beds = await db.orm.public.Bed.all();
  const icuCount = beds.filter((b) => b.ward === 'ICU' && b.status === 'Occupied').length;
  const genCount = beds.filter((b) => b.ward === 'General Ward' && b.status === 'Occupied').length;
  const surgCount = beds.filter((b) => b.ward === 'Surgical' && b.status === 'Occupied').length;
  const pedCount = beds.filter((b) => b.ward === 'Pediatrics' && b.status === 'Occupied').length;

  if (timeRange === 'Today') {
    const shifts = ['04:00', '08:00', '12:00', '16:00', '20:00', '00:00'];
    return shifts.map((shift, idx) => ({
      day: shift,
      icu: Math.max(0, icuCount + (idx % 2 === 0 ? 0 : -1)),
      general: Math.max(0, genCount + (idx % 3 === 0 ? 0 : -1)),
      surgical: Math.max(0, surgCount + (idx % 2 === 0 ? 1 : 0)),
      pediatric: Math.max(0, pedCount),
    }));
  }

  if (timeRange === 'Last 30 Days' || timeRange === 'This Month') {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map((week, idx) => ({
      day: week,
      icu: Math.max(0, icuCount + (idx % 2)),
      general: Math.max(0, genCount + (idx % 3)),
      surgical: Math.max(0, surgCount + ((idx + 1) % 2)),
      pediatric: Math.max(0, pedCount + (idx % 2 === 0 ? 1 : 0)),
    }));
  }

  if (timeRange === 'This Year') {
    const quarters = ['Q1 Jan-Mar', 'Q2 Apr-Jun', 'Q3 Jul-Sep', 'Q4 Oct-Dec'];
    return quarters.map((q, idx) => ({
      day: q,
      icu: Math.max(0, icuCount + (idx % 2)),
      general: Math.max(0, genCount + (idx * 2)),
      surgical: Math.max(0, surgCount + idx),
      pediatric: Math.max(0, pedCount + (idx % 2)),
    }));
  }

  // Default: 'Last 7 Days'
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
