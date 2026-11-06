'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Laptop,
  MapPin,
  History,
  Wrench,
  CheckCircle2,
  Save,
  Loader2,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { STATUS_MAP, BookingStatus, ServiceMode } from '@/types';

export interface CustomerData {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
}

export interface ServiceData {
  id: number;
  name: string;
  slug?: string;
}

export interface ServiceAreaData {
  id: number;
  name: string;
  slug?: string;
}

export interface StatusHistoryItem {
  id: number;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  note: string | null;
  createdAt: string;
}

export interface SerializedBooking {
  id: number;
  bookingCode: string;
  customerId: number;
  serviceId: number;
  areaId: number | null;
  deviceType: string;
  brand: string | null;
  model: string | null;
  problem: string;
  address: string | null;
  preferredDate: string | null;
  preferredSlot: string | null;
  serviceMode: ServiceMode;
  status: BookingStatus;
  source?: string;
  publicNote: string | null;
  internalNote: string | null;
  quotedAmount: number | null;
  finalAmount: number | null;
  createdAt: string;
  updatedAt: string;
  customer: CustomerData;
  service: ServiceData;
  area?: ServiceAreaData | null;
  statusHistory?: StatusHistoryItem[];
}

export const ALL_BOOKING_STATUSES: { id: BookingStatus; label: string }[] = [
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

export function formatServiceModeLabel(mode: ServiceMode | string): string {
  switch (mode) {
    case 'home_pickup':
      return 'Home Pickup & Drop';
    case 'on_site':
      return 'On-Site Diagnostic';
    case 'shop_visit':
    default:
      return 'Carry-In (Shop Visit)';
  }
}

interface ManageTicketModalProps {
  activeBooking: SerializedBooking | null;
  onClose: () => void;
  onSaveSuccess?: (updatedBooking: SerializedBooking) => void;
}

export default function ManageTicketModal({
  activeBooking,
  onClose,
  onSaveSuccess,
}: ManageTicketModalProps) {
  const [editStatus, setEditStatus] = useState<BookingStatus>('pending');
  const [editStatusNote, setEditStatusNote] = useState('');
  const [editQuotedAmount, setEditQuotedAmount] = useState<string>('');
  const [editFinalAmount, setEditFinalAmount] = useState<string>('');
  const [editPublicNote, setEditPublicNote] = useState('');
  const [editInternalNote, setEditInternalNote] = useState('');
  const [editServiceMode, setEditServiceMode] = useState<ServiceMode>('shop_visit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever activeBooking changes
  useEffect(() => {
    if (activeBooking) {
      setEditStatus(activeBooking.status);
      setEditStatusNote('');
      setEditQuotedAmount(activeBooking.quotedAmount ? String(activeBooking.quotedAmount) : '');
      setEditFinalAmount(activeBooking.finalAmount ? String(activeBooking.finalAmount) : '');
      setEditPublicNote(activeBooking.publicNote || '');
      setEditInternalNote(activeBooking.internalNote || '');
      setEditServiceMode(activeBooking.serviceMode);
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [activeBooking]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!activeBooking) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeBooking, onClose]);

  if (!activeBooking) return null;

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/bookings/${activeBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          statusNote: editStatusNote,
          quotedAmount: editQuotedAmount,
          finalAmount: editFinalAmount,
          publicNote: editPublicNote,
          internalNote: editInternalNote,
          serviceMode: editServiceMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update booking');
        setIsSaving(false);
        return;
      }

      const updated: SerializedBooking = {
        ...activeBooking,
        ...data.booking,
        quotedAmount: data.booking.quotedAmount ? Number(data.booking.quotedAmount) : null,
        finalAmount: data.booking.finalAmount ? Number(data.booking.finalAmount) : null,
        statusHistory: data.booking.statusHistory || activeBooking.statusHistory || [],
      };

      setSaveSuccess(true);
      if (onSaveSuccess) {
        onSaveSuccess(updated);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMessage('Network error while saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center overscroll-contain animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-left overflow-hidden my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {activeBooking.bookingCode}
              </span>
              <span className="text-xs text-slate-400">
                Created on {new Date(activeBooking.createdAt).toLocaleString('en-IN')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Manage Repair Ticket • {activeBooking.customer.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          {/* LEFT COLUMN: TICKET DETAILS (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Customer Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Customer Information</span>
              </div>
              <div className="text-sm font-bold text-white">{activeBooking.customer.name}</div>
              <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>{activeBooking.customer.mobile}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeBooking.customer.mobile}`}
                    className="px-2 py-1 rounded bg-slate-800 text-sky-400 hover:bg-slate-700 text-[10px] font-sans font-semibold"
                  >
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${activeBooking.customer.mobile.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 text-[10px] font-sans font-semibold"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              {activeBooking.customer.email && (
                <div className="text-xs text-slate-400">{activeBooking.customer.email}</div>
              )}
              {activeBooking.address && (
                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{activeBooking.address}</span>
                </div>
              )}
            </div>

            {/* Device & Diagnostics Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                <span>Device Specifications</span>
              </div>
              <div className="text-sm font-bold text-white">
                {activeBooking.brand || ''} {activeBooking.deviceType}{' '}
                {activeBooking.model ? `• ${activeBooking.model}` : ''}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Reported Problem:</span>
                <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-1 leading-relaxed">
                  {activeBooking.problem}
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                <span>Service Mode:</span>
                <span className="font-semibold text-slate-200">
                  {formatServiceModeLabel(activeBooking.serviceMode)}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Service Category:</span>
                <span className="font-semibold text-slate-200">{activeBooking.service.name}</span>
              </div>
            </div>

            {/* Status Timeline History Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span>Status History Timeline</span>
              </div>

              <div className="space-y-3 text-xs pl-2 border-l border-slate-800">
                {activeBooking.statusHistory && activeBooking.statusHistory.length > 0 ? (
                  activeBooking.statusHistory.map((h, i) => (
                    <div key={h.id || i} className="relative pl-3 space-y-0.5">
                      <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-sky-500" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white uppercase text-[10px]">
                          {h.toStatus}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">By {h.changedBy}</div>
                      {h.note && (
                        <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-1.5 rounded mt-0.5">
                          "{h.note}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs">No status change history recorded yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TECHNICIAN WORKSPACE & EDIT FORM (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>Technician Control & Pricing</span>
              </h3>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved Successfully
                </span>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* 1. Status Transition Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Update Repair Stage / Status *
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as BookingStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-sky-500"
              >
                {ALL_BOOKING_STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Service Mode
              </label>
              <select
                value={editServiceMode}
                onChange={(e) => setEditServiceMode(e.target.value as ServiceMode)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="shop_visit">Carry-In (Shop Visit)</option>
                <option value="home_pickup">Home Pickup & Drop</option>
                <option value="on_site">On-Site Diagnostic</option>
              </select>
            </div>

            {/* Status Change Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Reason / Log for Status Change (Recorded in Audit Trail)
              </label>
              <input
                type="text"
                value={editStatusNote}
                onChange={(e) => setEditStatusNote(e.target.value)}
                placeholder="e.g. Disassembled laptop, screen replaced with FHD IPS panel, running stress test"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* 2. Quoted Amount & Final Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Estimated / Quoted Cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="50"
                    value={editQuotedAmount}
                    onChange={(e) => setEditQuotedAmount(e.target.value)}
                    placeholder="e.g. 2800"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Initial quote given to customer.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Final Invoice Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="50"
                    value={editFinalAmount}
                    onChange={(e) => setEditFinalAmount(e.target.value)}
                    placeholder="e.g. 2650"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-emerald-300 font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Final charged upon completion.</span>
              </div>
            </div>

            {/* 3. Public Customer Tracking Note */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-sky-300 flex items-center justify-between">
                <span>Public Status Note (Shown on Customer Tracking Page)</span>
                <span className="text-[10px] font-normal text-slate-400">Visible to customer</span>
              </label>
              <textarea
                rows={2}
                value={editPublicNote}
                onChange={(e) => setEditPublicNote(e.target.value)}
                placeholder="e.g. Motherboard diagnostics complete. Parts arrived, assembly in progress. Estimated delivery tomorrow."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* 4. Internal Workshop Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-300 flex items-center justify-between">
                <span>Internal Technician Notes (Private Workshop Only)</span>
                <span className="text-[10px] font-normal text-slate-400">Staff confidential</span>
              </label>
              <textarea
                rows={2}
                value={editInternalNote}
                onChange={(e) => setEditInternalNote(e.target.value)}
                placeholder="e.g. Replaced MOSFET PQ24, cleaned liquid residue near audio IC. Customer requested invoice on company name."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Update Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
