export interface DepartmentStatusItem {
  department: string;
  load: 'Normal' | 'Moderate' | 'Busy' | 'Critical';
  activePatients: number;
  availableStaff: number;
  avgWaitMinutes: number;
}

export interface MetricOverview {
  totalPatients: number;
  totalPatientsChange: number; // percentage vs yesterday
  todayAppointments: number;
  todayAppointmentsChange: number;
  emergencyPatients: number;
  emergencyPatientsChange: number;
  availableBeds: number;
  totalBeds: number;
  icuOccupancy: number; // percentage
  generalOccupancy: number; // percentage
  avgEmergencyWaitTime: number; // minutes
}

export interface HourlyVolumeItem {
  hour: string;
  emergencyArrivals: number;
  discharges: number;
  admissions: number;
}

export interface BedOccupancyTrend {
  day: string;
  icu: number;
  general: number;
  surgical: number;
  pediatric: number;
}

export interface DepartmentWorkloadMetric {
  department: string;
  totalCapacity: number;
  currentActive: number;
  utilizationRate: number;
  targetRate: number;
}
