'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, Laptop, CalendarCheck } from 'lucide-react';
import { STATUS_MAP, BookingStatus } from '@/types';
import ManageTicketModal, {
  SerializedBooking,
  formatServiceModeLabel,
} from '@/components/admin/ManageTicketModal';

interface DashboardRecentJobsProps {
  initialBookings: SerializedBooking[];
}

export default function DashboardRecentJobs({ initialBookings }: DashboardRecentJobsProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<SerializedBooking[]>(initialBookings);
  const [activeBooking, setActiveBooking] = useState<SerializedBooking | null>(null);

  const handleOpenManage = (booking: SerializedBooking) => {
    setActiveBooking(booking);
  };

  const handleSaveSuccess = (updated: SerializedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    setActiveBooking(updated);
    router.refresh();
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-sky-400" />
              <span>Recent Repair Jobs</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest customer bookings received • Click Manage to view & update ticket in-place
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 group"
          >
            <span>All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Booking ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Mode</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No bookings recorded yet. New requests from the public booking wizard will appear here automatically.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const statusConf = STATUS_MAP[b.status as BookingStatus] || STATUS_MAP.pending;
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => handleOpenManage(b)}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-sky-400">
                        {b.bookingCode}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                          {b.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.customer.mobile}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-200 font-medium">{b.service.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Laptop className="w-3 h-3 text-slate-500" />
                          <span>
                            {b.brand ? `${b.brand} ` : ''}
                            {b.deviceType}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 capitalize">
                        {formatServiceModeLabel(b.serviceMode)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor}`} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-medium">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenManage(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 transition-all border border-slate-700 hover:border-transparent cursor-pointer shadow-xs"
                          title="Open Ticket Management Modal"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
