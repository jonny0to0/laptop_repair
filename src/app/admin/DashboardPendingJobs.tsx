'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import ManageTicketModal, { SerializedBooking } from '@/components/admin/ManageTicketModal';

interface DashboardPendingJobsProps {
  initialBookings: SerializedBooking[];
  pendingCount: number;
}

export default function DashboardPendingJobs({
  initialBookings,
  pendingCount,
}: DashboardPendingJobsProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<SerializedBooking[]>(initialBookings);
  const [activeBooking, setActiveBooking] = useState<SerializedBooking | null>(null);

  const handleSaveSuccess = (updated: SerializedBooking) => {
    // If status changed away from pending, remove or update
    setBookings((prev) =>
      prev
        .map((b) => (b.id === updated.id ? updated : b))
        .filter((b) => b.status === 'pending')
    );
    setActiveBooking(updated);
    router.refresh();
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h2 className="text-base font-semibold text-white">Pending Approval Queue</h2>
          </div>
          <Link
            href="/admin/bookings?status=pending"
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
          >
            View all ({pendingCount})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80 mt-2">
          {bookings.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No pending bookings requiring immediate action. All clear!
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl transition-colors cursor-pointer group"
                onClick={() => setActiveBooking(b)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {b.bookingCode}
                    </span>
                    <span className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">
                      {b.customer.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {b.service.name} • {b.deviceType} {b.brand ? `(${b.brand})` : ''}: {b.problem}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveBooking(b);
                  }}
                  className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 transition-all font-semibold"
                >
                  Review
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shared Manage Repair Ticket Modal */}
      <ManageTicketModal
        activeBooking={activeBooking}
        onClose={() => setActiveBooking(null)}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
}
