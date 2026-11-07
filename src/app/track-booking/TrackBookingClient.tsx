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
  Phone,
  MessageCircle,
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
  finalAmount?: string | number | null;
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
  const initialQuery = searchParams.get('q') || searchParams.get('code') || '';

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
        setError(data.error || 'No repair booking found matching your search.');
        setLoading(false);
        return;
      }

      setBooking(data.booking);
      setLoading(false);
    } catch {
      setError('Network connection error. Please verify your internet and try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const statusConfig = booking ? STATUS_MAP[booking.status] || STATUS_MAP.pending : null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-2 sm:px-0">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#155EEF] bg-[#155EEF]/10 border border-[#155EEF]/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-Time Device Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Repair Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
          Enter your repair tracking reference (e.g., <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold font-mono">PRO-2026-XXXX</code>) or the mobile phone number used during booking.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2.5 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. PRO-2026-8023 or 9876543210"
            className="w-full pl-11 pr-4 py-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl bg-slate-50 border border-slate-200 focus:border-[#155EEF] tap-target"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3996] transition-all flex items-center justify-center gap-2 disabled:opacity-60 tap-target cursor-pointer shadow-sm shadow-blue-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Device</span>
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div
          className="max-w-xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <span className="font-semibold">{error}</span>
            <p className="text-slate-600 text-xs mt-1">
              Please double check your reference number or phone number, or contact our support team.
            </p>
          </div>
        </div>
      )}

      {/* Booking Result View */}
      {booking && statusConfig && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          {/* Reference & Badge Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Repair Reference Code
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#155EEF]">
                {booking.bookingCode}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusConfig.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Status Description Callout */}
          <div className="text-xs sm:text-sm text-slate-700 bg-blue-50/60 p-4 rounded-2xl border border-blue-100 leading-relaxed">
            {statusConfig.description}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Customer</span>
              <strong className="text-slate-900 text-sm font-bold">{booking.customerName}</strong>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Device</span>
              <strong className="text-slate-900 text-sm font-bold">
                {booking.brand ? `${booking.brand} ` : ''}{booking.deviceType}
                {booking.model ? ` (${booking.model})` : ''}
              </strong>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Service Category</span>
              <strong className="text-slate-900 text-sm font-bold">{booking.serviceName}</strong>
            </div>

            <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Reported Issue / Symptoms</span>
              <span className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                {booking.problem}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Booked On</span>
              <span className="text-slate-800 text-xs sm:text-sm font-medium">
                {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Cost breakdown if available */}
          {(booking.quotedAmount || booking.finalAmount) && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-emerald-900">
                {booking.finalAmount ? 'Final Itemized Amount:' : 'Estimated Diagnosis Quote:'}
              </span>
              <span className="font-mono font-bold text-base sm:text-lg text-emerald-800">
                ₹{(booking.finalAmount || booking.quotedAmount)?.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Timeline / Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Workshop & Diagnostic Milestones
              </h4>
              <div className="space-y-4">
                {booking.statusHistory.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">
                        {STATUS_MAP[h.toStatus]?.label || h.toStatus}
                      </div>
                      {h.note && <p className="text-slate-600 mt-1 leading-relaxed">{h.note}</p>}
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {new Date(h.createdAt).toLocaleString()} • {h.changedBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Direct Action Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Includes 90-Day Written Warranty Upon Completion</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  `Hi ProTech IT, I would like an update on my repair reference #${booking.bookingCode}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors tap-target"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Desk</span>
              </a>

              <Link
                href="/contact"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors tap-target"
              >
                <span>Contact Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
