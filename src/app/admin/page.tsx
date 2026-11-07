import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { STATUS_MAP, BookingStatus } from '@/types';
import DashboardRecentJobs from './DashboardRecentJobs';
import DashboardPendingJobs from './DashboardPendingJobs';

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  // Fetch real metrics from MySQL
  const [
    totalBookings,
    pendingCount,
    inProgressCount,
    readyCount,
    completedCount,
    cancelledCount,
    needsAttentionBookings,
    unansweredMessages,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'pending' } }),
    prisma.booking.count({ where: { status: 'in_progress' } }),
    prisma.booking.count({ where: { status: 'ready' } }),
    prisma.booking.count({ where: { status: 'completed' } }),
    prisma.booking.count({ where: { status: { in: ['cancelled', 'rejected'] } } }),
    prisma.booking.findMany({
      where: { status: 'pending' },
      include: {
        customer: true,
        service: true,
        area: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.contactMessage.findMany({
      where: { status: 'new' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.booking.findMany({
      include: {
        customer: true,
        service: true,
        area: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  const serializedRecentBookings = recentBookings.map((b) => ({
    ...b,
    quotedAmount: b.quotedAmount ? Number(b.quotedAmount) : null,
    finalAmount: b.finalAmount ? Number(b.finalAmount) : null,
    preferredDate: b.preferredDate ? b.preferredDate.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    statusHistory: b.statusHistory.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  const serializedNeedsAttention = needsAttentionBookings.map((b) => ({
    ...b,
    quotedAmount: b.quotedAmount ? Number(b.quotedAmount) : null,
    finalAmount: b.finalAmount ? Number(b.finalAmount) : null,
    preferredDate: b.preferredDate ? b.preferredDate.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    statusHistory: b.statusHistory.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time workshop activity, queue statuses, and incoming repair requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Bookings</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            <CalendarCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalBookings}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">All-time repairs</div>
        </div>

        <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-300">{pendingCount}</div>
          <div className="text-xs text-amber-800 dark:text-amber-400 font-medium mt-1">Requires review</div>
        </div>

        <div className="bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">{inProgressCount}</div>
          <div className="text-xs text-indigo-800 dark:text-indigo-400 font-medium mt-1">On the bench</div>
        </div>

        <div className="bg-teal-50/80 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-teal-800 dark:text-teal-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ready</span>
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-900 dark:text-teal-300">{readyCount}</div>
          <div className="text-xs text-teal-800 dark:text-teal-400 font-medium mt-1">Ready for pickup</div>
        </div>

        <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">{completedCount}</div>
          <div className="text-xs text-emerald-800 dark:text-emerald-400 font-medium mt-1">Dispatched/Delivered</div>
        </div>

        <div className="bg-slate-100/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cancelled</span>
            <XCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-300">{cancelledCount}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Cancelled/Declined</div>
        </div>
      </div>

      {/* Two Column Layout: Needs Attention & Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Attention: Pending Bookings */}
        <DashboardPendingJobs
          initialBookings={serializedNeedsAttention}
          pendingCount={pendingCount}
        />

        {/* Unanswered Contact Messages */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">New Contact Enquiries</h2>
            </div>
            <Link
              href="/admin/messages"
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {unansweredMessages.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No unread contact messages at this time.
              </div>
            ) : (
              unansweredMessages.map((msg) => (
                <div key={msg.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {msg.name} <span className="text-xs text-slate-600 dark:text-slate-400 font-normal font-mono">({msg.mobile})</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 leading-relaxed">
                      {msg.message}
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
                    New
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table with Interactive Manage Modal */}
      <DashboardRecentJobs initialBookings={serializedRecentBookings} />
    </div>
  );
}
