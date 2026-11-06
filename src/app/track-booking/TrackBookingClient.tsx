'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { STATUS_MAP, BookingStatus } from '@/types';
import {
  Search,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Building,
  Loader2,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface BookingResult {
  id: number;
  bookingCode: string;
  customerName: string;
  deviceType: string;
  brand?: string;
  model?: string;
  problem: string;
  serviceMode: string;
  serviceName: string;
  status: BookingStatus;
  quotedAmount?: string | number | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    fromStatus: BookingStatus;
    toStatus: BookingStatus;
    changedBy: string;
    note?: string;
    createdAt: string;
  }>;
}

export default function TrackBookingClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResult | null>(null);

  const handleSearch = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/track?q=${encodeURIComponent(codeToSearch.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No repair booking found');
        setLoading(false);
        return;
      }

      setBooking(data.booking);
      setLoading(false);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const statusConfig = booking ? STATUS_MAP[booking.status] || STATUS_MAP.pending : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#155EEF] uppercase tracking-wider">
          Real-Time Device Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Your Repair Status
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Enter your repair tracking reference (e.g., <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold font-mono">PRO-XXXXX</code>) or the mobile number provided during booking.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. PRO-84291 or 9876543210"
            className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3996] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 tap-target cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Track Device</span>
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Result View */}
      {booking && statusConfig && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Booking Reference</span>
              <div className="text-2xl font-mono font-extrabold text-[#155EEF]">
                {booking.bookingCode}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed">
            {statusConfig.description}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs pt-2">
            <div>
              <span className="text-slate-400 block mb-0.5">Customer Name</span>
              <strong className="text-slate-900 text-sm font-semibold">{booking.customerName}</strong>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Device</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {booking.brand ? `${booking.brand} ` : ''}{booking.deviceType}
                {booking.model ? ` (${booking.model})` : ''}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Service Type</span>
              <strong className="text-slate-900 text-sm font-semibold">{booking.serviceName}</strong>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-0.5">Reported Issue</span>
              <span className="text-slate-800 text-xs font-medium leading-relaxed">{booking.problem}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Booked On</span>
              <span className="text-slate-800 text-xs">
                {new Date(booking.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Timeline / Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Diagnostic & Workshop Updates
              </h4>
              <div className="space-y-4">
                {booking.statusHistory.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5">
                      <Wrench className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {STATUS_MAP[h.toStatus]?.label || h.toStatus}
                      </div>
                      {h.note && <p className="text-slate-600 mt-0.5 leading-relaxed">{h.note}</p>}
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {new Date(h.createdAt).toLocaleString()} • {h.changedBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <Shield className="w-4 h-4" />
              <span>Includes 90-Day Warranty Upon Completion</span>
            </span>
            <Link href="/contact" className="text-[#155EEF] hover:underline font-semibold">
              Contact Workshop Support →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
