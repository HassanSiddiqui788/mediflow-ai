import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  if (!timeString) return '—';
  try {
    if (timeString.includes(':') && timeString.length <= 5) {
      const [hours, minutes] = timeString.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      return `${formattedH}:${minutes} ${ampm}`;
    }
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return timeString;
  }
}

export function getInitials(name: string): string {
  if (!name) return 'MF';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getPriorityVariant(priority: string): 'critical' | 'high' | 'medium' | 'low' | 'default' {
  const p = priority.toLowerCase();
  if (p === 'critical' || p === 'stat') return 'critical';
  if (p === 'high' || p === 'urgent') return 'high';
  if (p === 'medium' || p === 'moderate') return 'medium';
  if (p === 'low' || p === 'routine') return 'low';
  return 'default';
}

export function getStatusBadgeStyles(status: string): { bg: string; text: string; dot: string } {
  switch (status.toLowerCase()) {
    case 'active':
    case 'available':
    case 'normal':
    case 'completed':
    case 'reviewed':
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        text: 'text-emerald-300',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      };
    case 'busy':
    case 'high':
    case 'occupied':
    case 'in progress':
    case 'checked in':
    case 'awaiting lab':
      return {
        bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
        text: 'text-sky-300',
        dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      };
    case 'moderate':
    case 'pending':
    case 'cleaning':
    case 'scheduled':
    case 'observation':
      return {
        bg: 'bg-amber-500/15 border-amber-500/35 text-amber-300',
        text: 'text-amber-200',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      };
    case 'critical':
    case 'cancelled':
    case 'maintenance':
    case 'stat':
    case 'in surgery':
      return {
        bg: 'bg-rose-500/15 border-rose-500/35 text-rose-300',
        text: 'text-rose-200',
        dot: 'bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(251,113,133,0.7)]',
      };
    case 'reserved':
    case 'transferred to icu':
    case 'triage':
      return {
        bg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',
        text: 'text-yellow-200',
        dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]',
      };
    default:
      return {
        bg: 'bg-zinc-800/80 border-zinc-700 text-zinc-300',
        text: 'text-zinc-200',
        dot: 'bg-zinc-400',
      };
  }
}
