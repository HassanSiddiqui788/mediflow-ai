export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'sky' | 'gold' | 'yellow';
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Patients',
    href: '/patients',
    icon: 'Users',
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: 'Calendar',
  },
  {
    title: 'Emergency',
    href: '/emergency',
    icon: 'Flame',
  },
  {
    title: 'Beds & Rooms',
    href: '/beds',
    icon: 'BedDouble',
  },
  {
    title: 'Laboratory',
    href: '/laboratory',
    icon: 'FlaskConical',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: 'BarChart3',
  },
  {
    title: 'AI Insights',
    href: '/ai-insights',
    icon: 'Sparkles',
  },
];

export const HOSPITAL_DEPARTMENTS = [
  'Emergency',
  'Cardiology',
  'Neurology',
  'General Medicine',
  'Orthopedics',
  'Pediatrics',
  'Oncology',
  'Radiology',
  'Laboratory',
  'Intensive Care (ICU)',
  'General Surgery',
] as const;

export const HOSPITAL_INFO = {
  name: 'MediFlow AI',
  campus: 'Metropolitan Medical Center',
  tier: 'Level 1 Trauma Center',
  tagline: 'Intelligent Hospital Operations & Resource Orchestration',
  version: 'v1.0-preview',
  activeStaffOnDuty: 142,
  operatingTheatersActive: 8,
};
