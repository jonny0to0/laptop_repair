'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Wrench,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Building,
  Truck,
  UserCheck,
  Send,
  Loader2,
  Sparkles,
  Phone,
  MessageCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface ServiceOption {
  id: number;
  name: string;
  slug: string;
}

interface ServiceAreaOption {
  id: number;
  name: string;
  slug: string;
  pincodes: string;
}

interface RepairBookingFormProps {
  initialProblem?: string;
  initialService?: string;
  initialDevice?: string;
  services: ServiceOption[];
  serviceAreas?: ServiceAreaOption[];
}

export default function RepairBookingForm({
  initialProblem = '',
  initialService = 'laptop-repair',
  initialDevice = 'Laptop',
  services = [],
  serviceAreas = [],
}: RepairBookingFormProps) {
  const [deviceType, setDeviceType] = useState(initialDevice);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serviceSlug, setServiceSlug] = useState(initialService);
  const [problem, setProblem] = useState(initialProblem);
  const [serviceMode, setServiceMode] = useState<'shop_visit' | 'home_pickup' | 'on_site'>('shop_visit');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('morning');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [areaSlug, setAreaSlug] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingCode: string;
    serviceName: string;
    deviceType: string;
    problem: string;
    serviceMode: string;
  } | null>(null);

  // Sync state if initial props change (e.g. user selected an issue card above)
  useEffect(() => {
    if (initialProblem) {
      setProblem(initialProblem);
    }
  }, [initialProblem]);

  useEffect(() => {
    if (initialService) {
      setServiceSlug(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    if (initialDevice) {
      setDeviceType(initialDevice);
    }
  }, [initialDevice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mobile,
          email,
          deviceType,
          brand,
          model,
          problem,
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
        setFeedback({ text: data.error || 'Failed to submit repair booking', isError: true });
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
      setFeedback({ text: 'Network connection error. Please try again.', isError: true });
      setLoading(false);
    }
  };

  // If booking is successfully confirmed, show the receipt state
  if (confirmedBooking) {
    const cleanWhatsApp = '919876543210';
    const waText = encodeURIComponent(
      `Hi ProTech IT, I just booked repair reference #${confirmedBooking.bookingCode} for my ${confirmedBooking.deviceType} (${confirmedBooking.problem}). Please confirm my slot.`
    );

    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Booking Received • Pending Workshop Confirmation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Your Diagnostic Request Is Booked!
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            A certified service technician has been notified. We will review your device symptoms and reach out to confirm your visit.
          </p>
        </div>

        {/* Highlighted Booking Code Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium">Tracking Code</span>
            <span className="text-lg font-mono font-bold text-[#155EEF]">
              {confirmedBooking.bookingCode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Device</span>
              <strong className="text-slate-800">{confirmedBooking.deviceType}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Service Mode</span>
              <strong className="text-slate-800 capitalize">
                {confirmedBooking.serviceMode.replace('_', ' ')}
              </strong>
            </div>
          </div>

          <div className="text-xs pt-1">
            <span className="text-slate-400 block">Selected Symptom</span>
            <span className="text-slate-800 font-medium">{confirmedBooking.problem}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20 tap-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Confirm on WhatsApp</span>
          </a>

          <Link
            href={`/track-booking?q=${confirmedBooking.bookingCode}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors tap-target"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Track Repair Status</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Every completed repair includes our 90-day parts & labor warranty</span>
        </div>
      </div>
    );
  }

  return (
    <div id="booking-form" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8 scroll-mt-24">
      {/* Form Header */}
      <div className="border-b border-slate-100 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#155EEF] bg-[#155EEF]/10 border border-[#155EEF]/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 2 • Diagnostic Booking Details</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900">
          Repair Booking Information
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your selected issue, tell us your device model, and choose your preferred appointment time.
        </p>

        {/* Selected Issue Alert Banner */}
        {problem && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-[#155EEF]">Pre-filled from Selected Issue: </span>
              <strong>{problem}</strong>
              <span className="text-blue-700/80 block mt-0.5">
                Service category: {services.find((s) => s.slug === serviceSlug)?.name || 'Laptop Repair'}. You can refine or add extra symptoms below.
              </span>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
            feedback.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Device Type & Service Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Device Type *
            </label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
            >
              <option value="Laptop">Laptop (Windows / Mac / Chromebook)</option>
              <option value="Desktop">Desktop PC (Gaming / Office / Workstation)</option>
              <option value="Apple MacBook">Apple MacBook (Air / Pro / M-Series)</option>
              <option value="All-in-one">All-in-One PC / iMac</option>
              <option value="Other">Other Hardware / Network Device</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Category *
            </label>
            <select
              value={serviceSlug}
              onChange={(e) => setServiceSlug(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
            >
              {services.length > 0 ? (
                services.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="laptop-repair">Laptop Repair</option>
                  <option value="desktop-repair">Desktop & PC Repair</option>
                  <option value="software-os-services">Software & OS Services</option>
                  <option value="networking-services">Networking & IT Support</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Row 2: Brand & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Dell, Apple, HP, Lenovo, Asus"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Model Number / Series
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Inspiron 15 3511, MacBook Pro M1 14''"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
            />
          </div>
        </div>

        {/* Row 3: Problem Description (Pre-filled from issue card) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Problem Description / Symptoms *
          </label>
          <textarea
            required
            rows={3}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Describe what happened (e.g. screen flickers when moved, no power after thunderstorm, coffee spill on keyboard)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20"
          />
        </div>

        {/* Row 4: Service Mode Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Choose How You Want to Service *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setServiceMode('shop_visit')}
              className={`p-4 rounded-xl border text-left transition-all tap-target ${
                serviceMode === 'shop_visit'
                  ? 'border-[#155EEF] bg-blue-50/40 ring-2 ring-[#155EEF]/20 text-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Building className={`w-4 h-4 ${serviceMode === 'shop_visit' ? 'text-[#155EEF]' : 'text-slate-400'}`} />
                <strong className="text-xs">Workshop Drop-in</strong>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Bring directly to our central lab. Free on-the-spot triage.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setServiceMode('home_pickup')}
              className={`p-4 rounded-xl border text-left transition-all tap-target ${
                serviceMode === 'home_pickup'
                  ? 'border-[#155EEF] bg-blue-50/40 ring-2 ring-[#155EEF]/20 text-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Truck className={`w-4 h-4 ${serviceMode === 'home_pickup' ? 'text-[#155EEF]' : 'text-slate-400'}`} />
                <strong className="text-xs">Courier Doorstep Pickup</strong>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Safe boxed courier collection from your residence or office.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setServiceMode('on_site')}
              className={`p-4 rounded-xl border text-left transition-all tap-target ${
                serviceMode === 'on_site'
                  ? 'border-[#155EEF] bg-blue-50/40 ring-2 ring-[#155EEF]/20 text-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className={`w-4 h-4 ${serviceMode === 'on_site' ? 'text-[#155EEF]' : 'text-slate-400'}`} />
                <strong className="text-xs">On-Site Tech Visit</strong>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Certified field engineer visits for software & Wi-Fi issues.
              </p>
            </button>
          </div>
        </div>

        {/* Row 5: Schedule (Preferred Date & Time Slot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Date
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Time Window
            </label>
            <select
              value={preferredSlot}
              onChange={(e) => setPreferredSlot(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
            >
              <option value="morning">Morning (9:00 AM - 1:00 PM)</option>
              <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
              <option value="evening">Evening (5:00 PM - 8:00 PM)</option>
            </select>
          </div>
        </div>

        {/* Row 6: Customer Details */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Your Contact Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
              />
            </div>
          </div>
        </div>

        {/* Address / Area input if courier or on-site */}
        {serviceMode !== 'shop_visit' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pickup / Visit Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / House No., Street, Landmark"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Region
              </label>
              <select
                value={areaSlug}
                onChange={(e) => setAreaSlug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 tap-target"
              >
                <option value="">Select Service Area / Pincode</option>
                {serviceAreas.map((area) => (
                  <option key={area.id} value={area.slug}>
                    {area.name} ({area.pincodes})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Submit Primary CTA Button using #155EEF */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            🔒 No upfront payment required. Written estimate provided after inspection.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3996] transition-all shadow-md shadow-[#155EEF]/20 disabled:opacity-60 tap-target cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Booking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Book Diagnostic Repair</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
