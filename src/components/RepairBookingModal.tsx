'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Truck,
  UserCheck,
  Send,
  Loader2,
  Lock,
  Calendar,
  Clock,
  Laptop,
  Check,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Copy,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { ProblemItem } from './ProblemPicker';

export interface ServiceOption {
  id: number;
  name: string;
  slug: string;
}

export interface ServiceAreaOption {
  id: number;
  name: string;
  slug: string;
  pincodes: string;
}

interface RepairBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemItem | null;
  services?: ServiceOption[];
  serviceAreas?: ServiceAreaOption[];
  isFromCalculator?: boolean;
  selectedBrand?: string;
  selectedDevice?: string;
  estimateRange?: string;
}

const DEFAULT_SERVICES: ServiceOption[] = [
  { id: 1, name: 'Laptop Repair', slug: 'laptop-repair' },
  { id: 2, name: 'Desktop & PC Repair', slug: 'desktop-pc-repair' },
  { id: 3, name: 'Software & OS Services', slug: 'software-os-services' },
  { id: 4, name: 'Data Recovery', slug: 'data-recovery' },
  { id: 5, name: 'Networking Services', slug: 'networking-services' },
];

export default function RepairBookingModal({
  isOpen,
  onClose,
  problem,
  services = DEFAULT_SERVICES,
  serviceAreas = [],
  isFromCalculator = false,
  selectedBrand,
  selectedDevice,
  estimateRange,
}: RepairBookingModalProps) {
  const activeServices = services && services.length > 0 ? services : DEFAULT_SERVICES;

  // Form states
  const [deviceType, setDeviceType] = useState('Laptop (Windows / Mac / Chromebook)');
  const [serviceSlug, setServiceSlug] = useState('laptop-repair');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [problemText, setProblemText] = useState('');
  const [serviceMode, setServiceMode] = useState<'shop_visit' | 'home_pickup' | 'on_site'>('shop_visit');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Morning (9:00 AM - 1:00 PM)');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [areaSlug, setAreaSlug] = useState('');

  // UI status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingCode: string;
    serviceName: string;
    deviceType: string;
    problem: string;
    serviceMode: string;
  } | null>(null);

  // Sync state whenever selected problem changes
  useEffect(() => {
    if (problem) {
      const fullProblemText = problem.subtitle
        ? `${problem.title} • ${problem.subtitle}`
        : problem.title;
      setProblemText(fullProblemText);
      setServiceSlug(problem.serviceSlug || 'laptop-repair');

      if (selectedBrand) {
        setBrand(selectedBrand);
      } else {
        setBrand('');
      }

      if (selectedDevice) {
        setDeviceType(selectedDevice);
      } else if (problem.deviceType === 'Desktop') {
        setDeviceType('Desktop / All-in-One PC');
      } else {
        setDeviceType('Laptop (Windows / Mac / Chromebook)');
      }

      setErrorMessage(null);
      setConfirmedBooking(null);
    }
  }, [problem, selectedBrand, selectedDevice]);

  // Lock body scroll and handle Escape key safely
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Set today's date as min
  const todayDateString = new Date().toISOString().split('T')[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mobile,
          email,
          deviceType: selectedDevice || deviceType,
          brand: selectedBrand || brand,
          model: model || (isFromCalculator ? 'Calculator Pre-Selected' : ''),
          problem: problemText,
          serviceSlug,
          serviceMode,
          preferredDate,
          preferredSlot,
          address,
          areaSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit booking. Please verify all required fields.');
        setLoading(false);
        return;
      }

      setConfirmedBooking({
        bookingCode: data.booking.bookingCode,
        serviceName: data.booking.serviceName,
        deviceType: data.booking.deviceType,
        problem: data.booking.problem,
        serviceMode: data.booking.serviceMode,
      });
      setLoading(false);
    } catch {
      setErrorMessage('Network connection error. Please try again or call our hotline.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md p-2.5 sm:p-5 md:p-8 overscroll-contain animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repair-booking-modal-title"
    >
      {/* Centering Flex Wrapper: items-start ensures the top/header is NEVER pushed off-screen or clipped */}
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-8">
        
        {/* Main Modal Card */}
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/30 overflow-hidden transform transition-all text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Navigation Bar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 sm:px-8 py-3.5 border-b border-slate-100 flex items-center justify-between shadow-2xs">
            {/* Left: Prominent Back to Issues Button for high UX clarity */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 transition-all tap-target group"
              title="Return to What issue is your device facing?"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all" />
              <span>← Back to Issues</span>
            </button>

            {/* Center: Step Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#0284C7] bg-sky-50 border border-sky-200/80">
              <span className="font-mono text-xs font-black">#</span>
              <span>Step 2 of 2 • Diagnostic Booking Details</span>
            </div>

            {/* Right: Close X Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors tap-target"
              aria-label="Close modal"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-8 md:p-9 space-y-6">
            
            {confirmedBooking ? (
              /* ================= Confirmation Receipt Screen ================= */
              <div className="py-6 sm:py-10 text-center max-w-lg mx-auto space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75 duration-300">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Diagnostic Booking Confirmed</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                    We Have Received Your Request!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    A certified technician will call you within <strong className="text-slate-900">15 minutes</strong> to confirm the appointment and arrange pickup/dispatch.
                  </p>
                </div>

                {/* Booking Code Reference Box */}
                <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200 text-left space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Booking Reference Code
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(confirmedBooking.bookingCode)}
                      className="inline-flex items-center gap-1.5 font-mono text-lg font-black text-[#155EEF] hover:text-[#1048bc] transition-colors"
                      title="Click to copy code"
                    >
                      <span>{confirmedBooking.bookingCode}</span>
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  {copiedCode && (
                    <div className="text-[11px] font-bold text-emerald-600 text-right -mt-2">
                      ✓ Copied to clipboard!
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Reported Problem</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {confirmedBooking.problem}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Service Mode</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {confirmedBooking.serviceMode.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href={`/track-booking?code=${confirmedBooking.bookingCode}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#155EEF] hover:bg-[#1048bc] shadow-md shadow-blue-500/20 text-sm transition-all"
                  >
                    <span>Track Booking Live</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 text-sm transition-all"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              /* ================= Booking Information Form ================= */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Header Title Section */}
                <div className="space-y-1.5">
                  <div className="sm:hidden inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#0284C7] bg-sky-50 border border-sky-200/90 mb-1">
                    <span className="font-mono text-xs font-black">#</span>
                    <span>{isFromCalculator ? 'Complete Your Repair Booking' : 'Step 2 • Diagnostic Booking Details'}</span>
                  </div>

                  <h2
                    id="repair-booking-modal-title"
                    className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                  >
                    {isFromCalculator ? 'Complete Your Repair Booking' : 'Repair Booking Information'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {isFromCalculator
                      ? 'Your device and issue are already configured. Choose your preferred service mode and enter contact details to finalize.'
                      : 'Review your selected issue, tell us your device model, and choose your preferred appointment time.'}
                  </p>
                </div>

                {/* Pre-filled Notification Callout Banner */}
                {isFromCalculator ? (
                  <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#155EEF] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#155EEF] bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                            Configured from Calculator
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900 pt-0.5">
                          {selectedBrand && selectedDevice
                            ? `${selectedBrand} ${selectedDevice}`
                            : problem?.title}
                        </div>
                        <div className="text-xs text-slate-600">
                          {problem?.title && !problem.title.startsWith(`${selectedBrand} ${selectedDevice}`) && (
                            <span className="font-semibold text-slate-800">{problem.title} • </span>
                          )}
                          {problem?.subtitle}
                        </div>
                      </div>
                    </div>

                    {estimateRange && (
                      <div className="sm:text-right shrink-0 bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-blue-200/80 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Calculated Estimate
                        </span>
                        <span className="text-lg font-black text-emerald-600 block">
                          {estimateRange}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-sky-50/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-[#155EEF] flex items-center justify-center shrink-0 mt-0.5 border border-sky-200/60">
                      <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
                    </div>
                    <div className="text-left text-xs sm:text-sm space-y-0.5">
                      <div className="font-bold text-slate-900">
                        Pre-filled from Selected Issue:{' '}
                        <span className="text-[#155EEF] font-black">
                          {problem?.title || 'Diagnostic Inspection'}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Service category: <span className="font-semibold text-slate-800">{problem?.category || 'Laptop Repair'}</span>. You can refine or add extra symptoms below.
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Alert if any */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in shake">
                    {errorMessage}
                  </div>
                )}

                {/* Only render Device Type, Brand, Model and Symptoms if NOT from calculator */}
                {!isFromCalculator && (
                  <>
                    {/* Grid Row 1: Device Type & Service Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Device Type *
                        </label>
                        <div className="relative">
                          <select
                            value={deviceType}
                            onChange={(e) => setDeviceType(e.target.value)}
                            required
                            className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs pr-10"
                          >
                            <option value="Laptop (Windows / Mac / Chromebook)">
                              Laptop (Windows / Mac / Chromebook)
                            </option>
                            <option value="Desktop / All-in-One PC">Desktop / All-in-One PC</option>
                            <option value="Custom Gaming Rig / Workstation">
                              Custom Gaming Rig / Workstation
                            </option>
                            <option value="MacBook / iMac">MacBook / iMac</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Service Category *
                        </label>
                        <div className="relative">
                          <select
                            value={serviceSlug}
                            onChange={(e) => setServiceSlug(e.target.value)}
                            required
                            className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs pr-10"
                          >
                            {activeServices.map((s) => (
                              <option key={s.id} value={s.slug}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Grid Row 2: Brand & Model Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Brand / Manufacturer <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          placeholder="e.g. Dell, Apple, HP, Lenovo, Asus"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Model Number / Series
                        </label>
                        <input
                          type="text"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder='e.g. Inspiron 15 3511, MacBook Pro M1 14"'
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Grid Row 3: Problem Description / Symptoms */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Problem Description / Symptoms *
                      </label>
                      <textarea
                        value={problemText}
                        onChange={(e) => setProblemText(e.target.value)}
                        required={!isFromCalculator}
                        rows={3}
                        placeholder="Describe your device symptom or what occurred prior to the issue..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs leading-relaxed"
                      />
                    </div>
                  </>
                )}

                {/* Grid Row 4: Choose How You Want To Service (3 Cards matching mockup) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Choose How You Want To Service *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Workshop Drop-in */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setServiceMode('shop_visit')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setServiceMode('shop_visit');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between tap-target ${
                        serviceMode === 'shop_visit'
                          ? 'border-2 border-[#155EEF] bg-blue-50/30 ring-2 ring-[#155EEF]/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#155EEF] border border-sky-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          Workshop Drop-in
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Bring directly to our central lab. Free on-the-spot triage.
                      </p>
                    </div>

                    {/* Option 2: Courier Doorstep Pickup */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setServiceMode('home_pickup')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setServiceMode('home_pickup');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between tap-target ${
                        serviceMode === 'home_pickup'
                          ? 'border-2 border-[#155EEF] bg-blue-50/30 ring-2 ring-[#155EEF]/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          Courier Doorstep Pickup
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Safe boxed courier collection from your residence or office.
                      </p>
                    </div>

                    {/* Option 3: On-Site Tech Visit */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setServiceMode('on_site')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setServiceMode('on_site');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between tap-target ${
                        serviceMode === 'on_site'
                          ? 'border-2 border-[#155EEF] bg-blue-50/30 ring-2 ring-[#155EEF]/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          On-Site Tech Visit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Certified field engineer visits for software & Wi-Fi issues.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conditional Address & Area inputs when Pickup or On-Site is chosen */}
                {serviceMode !== 'shop_visit' && (
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#155EEF]" />
                      <span>Doorstep Pickup / Visit Address in Kolkata</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          placeholder="House / Flat No., Apartment/Office Building, Street, Landmark"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#155EEF] outline-none shadow-2xs"
                        />
                      </div>
                      {serviceAreas && serviceAreas.length > 0 && (
                        <div className="sm:col-span-2 relative">
                          <select
                            value={areaSlug}
                            onChange={(e) => setAreaSlug(e.target.value)}
                            className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 shadow-2xs pr-10"
                          >
                            <option value="">Select Kolkata Region (Optional)</option>
                            {serviceAreas.map((area) => (
                              <option key={area.id} value={area.slug}>
                                {area.name} (Pincodes: {area.pincodes})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grid Row 5: Preferred Date & Preferred Time Window */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      min={todayDateString}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Preferred Time Window
                    </label>
                    <div className="relative">
                      <select
                        value={preferredSlot}
                        onChange={(e) => setPreferredSlot(e.target.value)}
                        className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs pr-10"
                      >
                        <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                        <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                        <option value="Evening (5:00 PM - 8:30 PM)">Evening (5:00 PM - 8:30 PM)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Grid Row 6: Your Contact Details */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    Your Contact Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row: Security Note + Submit CTA + Back Button */}
                <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>No upfront payment required. Written estimate provided after inspection.</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Secondary Bottom Back Button */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/3 sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors tap-target"
                    >
                      Back
                    </button>

                    {/* Primary Confirm & Book Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3894] transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 tap-target"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming Booking...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 rotate-45 -mt-0.5" />
                          <span>
                            {isFromCalculator
                              ? 'Book Repair with this Estimate'
                              : 'Confirm & Book Diagnostic Repair'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}