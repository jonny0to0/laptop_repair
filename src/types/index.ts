export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'waiting_parts'
  | 'waiting_customer'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type ServiceMode = 'shop_visit' | 'home_pickup' | 'on_site';

export type BookingSource = 'website' | 'whatsapp' | 'phone' | 'walk_in';

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}

export const STATUS_MAP: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: 'Pending Review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50',
    dotColor: 'bg-amber-500',
    description: 'We have received your request and will confirm shortly.',
  },
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700/50',
    dotColor: 'bg-blue-500',
    description: 'Booking confirmed. Awaiting device drop-off or pickup.',
  },
  in_progress: {
    label: 'In Progress / Diagnosing',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-700/50',
    dotColor: 'bg-indigo-500',
    description: 'Device is on the workbench undergoing diagnostic or repairs.',
  },
  waiting_parts: {
    label: 'Waiting for Parts',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-700/50',
    dotColor: 'bg-orange-500',
    description: 'Specialist components are en-route from suppliers.',
  },
  waiting_customer: {
    label: 'Waiting for Approval',
    badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-700/50',
    dotColor: 'bg-yellow-500',
    description: 'Estimate shared with customer, awaiting green light to proceed.',
  },
  ready: {
    label: 'Ready for Collection',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-700/50',
    dotColor: 'bg-teal-500',
    description: 'Repair completed, quality tested and ready for pickup/delivery.',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/50',
    dotColor: 'bg-emerald-500',
    description: 'Device returned to customer with warranty active.',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    description: 'Booking was cancelled.',
  },
  rejected: {
    label: 'Declined',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-700/50',
    dotColor: 'bg-rose-500',
    description: 'Request could not be accommodated.',
  },
};
