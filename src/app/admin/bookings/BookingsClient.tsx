'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  CalendarCheck,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  X,
  ExternalLink,
  Save,
  Loader2,
  User,
  MapPin,
  Laptop,
  Monitor,
  Tag,
  DollarSign,
  FileText,
  History,
} from 'lucide-react';
import { STATUS_MAP, BookingStatus, ServiceMode } from '@/types';
import { AdminSessionUser } from '@/lib/auth';
import ManageTicketModal, {
  SerializedBooking,
  ServiceData,
  ServiceAreaData,
  formatServiceModeLabel,
} from '@/components/admin/ManageTicketModal';

export type { SerializedBooking };

interface BookingsClientProps {
  initialBookings: SerializedBooking[];
  services: ServiceData[];
  serviceAreas: ServiceAreaData[];
  currentUser: AdminSessionUser;
}

const ALL_STATUSES: { id: BookingStatus; label: string }[] = [
  { id: 'pending', label: 'Pending Review' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_progress', label: 'In Progress / Diagnosing' },
  { id: 'waiting_parts', label: 'Waiting for Parts' },
  { id: 'waiting_customer', label: 'Waiting for Approval' },
  { id: 'ready', label: 'Ready for Collection' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'rejected', label: 'Rejected' },
];

export default function BookingsClient({
  initialBookings,
  services,
  serviceAreas,
  currentUser,
}: BookingsClientProps) {
  const [bookings, setBookings] = useState<SerializedBooking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [activeBooking, setActiveBooking] = useState<SerializedBooking | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick Metrics
  const counts = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      in_progress: bookings.filter((b) => b.status === 'in_progress').length,
      ready: bookings.filter((b) => b.status === 'ready').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
    };
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status Tab filter
      if (selectedStatusTab !== 'all') {
        if (selectedStatusTab === 'action_needed') {
          if (!['pending', 'waiting_parts', 'waiting_customer'].includes(b.status)) {
            return false;
          }
        } else if (b.status !== selectedStatusTab) {
          return false;
        }
      }

      // Mode filter
      if (selectedModeFilter !== 'all' && b.serviceMode !== selectedModeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesCode = b.bookingCode.toLowerCase().includes(query);
        const matchesName = b.customer.name.toLowerCase().includes(query);
        const matchesMobile = b.customer.mobile.includes(query);
        const matchesDevice = b.deviceType.toLowerCase().includes(query) || (b.brand && b.brand.toLowerCase().includes(query)) || (b.model && b.model.toLowerCase().includes(query));
        const matchesProblem = b.problem.toLowerCase().includes(query);

        if (!matchesCode && !matchesName && !matchesMobile && !matchesDevice && !matchesProblem) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, selectedStatusTab, selectedModeFilter, searchQuery]);

  // Open modal
  const handleOpenDetailModal = (b: SerializedBooking) => {
    setActiveBooking(b);
  };

  const handleModalSaveSuccess = (updated: SerializedBooking) => {
    const updatedList = bookings.map((item) => (item.id === updated.id ? updated : item));
    setBookings(updatedList);
    setActiveBooking(updated);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatModeLabel = (mode: ServiceMode) => {
    switch (mode) {
      case 'home_pickup':
        return 'Doorstep Pickup';
      case 'on_site':
        return 'On-Site Tech Visit';
      case 'shop_visit':
      default:
        return 'Workshop Drop-in';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ================= HEADER & STATS BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-sky-400" />
            <span>Repair Bookings & Workshop Queue</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage incoming tickets, schedule appointments, update diagnostic statuses, and quote repair costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/track-booking"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Customer Track View</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-xs text-slate-400 font-medium">Total Bookings</div>
          <div className="text-xl font-black text-white mt-0.5">{counts.total}</div>
        </div>

        <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-3.5">
          <div className="text-xs text-amber-400 font-medium">Pending Review</div>
          <div className="text-xl font-black text-amber-300 mt-0.5">{counts.pending}</div>
        </div>

        <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-3.5">
          <div className="text-xs text-indigo-400 font-medium">In Diagnostics</div>
          <div className="text-xl font-black text-indigo-300 mt-0.5">{counts.in_progress}</div>
        </div>

        <div className="bg-teal-950/20 border border-teal-900/40 rounded-2xl p-3.5">
          <div className="text-xs text-teal-400 font-medium">Ready for Delivery</div>
          <div className="text-xl font-black text-teal-300 mt-0.5">{counts.ready}</div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-3.5">
          <div className="text-xs text-emerald-400 font-medium">Completed Repairs</div>
          <div className="text-xl font-black text-emerald-300 mt-0.5">{counts.completed}</div>
        </div>
      </div>

      {/* ================= CONTROLS: SEARCH & STATUS TABS ================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        
        {/* Search & Service Mode Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. PRO-...), customer name, phone, device, or problem..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 w-full sm:w-auto"
            >
              <option value="all">All Service Modes</option>
              <option value="shop_visit">Workshop Drop-in</option>
              <option value="home_pickup">Courier Doorstep Pickup</option>
              <option value="on_site">On-Site Tech Visit</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedStatusTab === 'all'
                ? 'bg-sky-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({bookings.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusTab('action_needed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              selectedStatusTab === 'action_needed'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-950/60'
            }`}
          >
            Needs Attention ({counts.pending})
          </button>

          {ALL_STATUSES.map((st) => {
            const count = bookings.filter((b) => b.status === st.id).length;
            const isSelected = selectedStatusTab === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatusTab(st.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{st.label}</span>
                <span className="ml-1.5 text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ================= BOOKINGS TABLE ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Booking Code</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Device & Problem</th>
                <th className="py-3.5 px-4 font-semibold">Mode & Slot</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">No bookings found matching your search.</p>
                    <p className="text-xs text-slate-600 mt-1">Try clearing filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const statusMeta = STATUS_MAP[b.status] || STATUS_MAP.pending;
                  const dateStr = b.preferredDate
                    ? new Date(b.preferredDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Flexible';

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetailModal(b)}
                    >
                      {/* 1. Booking Code */}
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs tracking-wider">
                            {b.bookingCode}
                          </span>
                          <button
                            type="button"
                            title="Copy code"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(b.bookingCode);
                            }}
                            className="text-slate-500 hover:text-sky-400 transition-colors p-1"
                          >
                            {copiedCode === b.bookingCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* 2. Customer */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-xs">{b.customer.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${b.customer.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Phone className="w-3 h-3 text-sky-400" />
                            {b.customer.mobile}
                          </a>
                          <a
                            href={`https://wa.me/${b.customer.mobile.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors p-0.5"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* 3. Device & Problem */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>
                            {b.brand || ''} {b.deviceType} {b.model ? `(${b.model})` : ''}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5" title={b.problem}>
                          {b.problem}
                        </p>
                      </td>

                      {/* 4. Mode & Appointment */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {formatModeLabel(b.serviceMode)}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{dateStr}</span>
                          {b.preferredSlot && <span className="text-slate-500">• {b.preferredSlot}</span>}
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusMeta.dotColor}`} />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>

                      {/* 6. Amount */}
                      <td className="py-4 px-4 font-mono font-bold text-xs">
                        {b.finalAmount ? (
                          <span className="text-emerald-400">₹{b.finalAmount.toLocaleString('en-IN')}</span>
                        ) : b.quotedAmount ? (
                          <span className="text-slate-300">Quote: ₹{b.quotedAmount.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unquoted</span>
                        )}
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetailModal(b);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 transition-all border border-slate-700 hover:border-transparent"
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

      {/* ================= DETAILED INSPECTION & EDIT MODAL ================= */}
      <ManageTicketModal
        activeBooking={activeBooking}
        onClose={() => setActiveBooking(null)}
        onSaveSuccess={handleModalSaveSuccess}
      />

    </div>
  );
}
