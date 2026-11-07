'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Laptop,
  Monitor,
  Phone,
  Mail,
  MapPin,
  User,
  Tag,
  Barcode,
  Bell,
  Info,
  ShieldCheck,
  Shield,
  Zap,
  Copy,
  Sparkles,
  Wrench,
  Headphones,
  Edit3,
  Loader2,
  Lock,
  Home,
  FileText,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { ProblemItem, PROBLEMS_DATA } from './ProblemPicker';

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
  companyName?: string;
  phone?: string;
}

const DEFAULT_SERVICES: ServiceOption[] = [
  { id: 1, name: 'Laptop Repair', slug: 'laptop-repair' },
  { id: 2, name: 'Desktop & PC Repair', slug: 'desktop-repair' },
  { id: 3, name: 'Software & OS Services', slug: 'software-os-services' },
  { id: 4, name: 'Networking & IT Support', slug: 'networking-services' },
];

const DEVICE_OPTIONS = [
  'Laptop',
  'Desktop',
  'All-in-One PC',
  'MacBook / iMac',
  'Custom Gaming Rig',
];

const SERVICE_CATEGORY_OPTIONS = [
  'Display & Glass Panel',
  'Display Repair',
  'Power & Logic Board',
  'Motherboard & Chipset',
  'Battery & Charging',
  'Keyboard & Trackpad',
  'System & OS Recovery',
  'Data Recovery & Storage',
  'Comprehensive Diagnostic',
];

const TIME_SLOTS = [
  '10:00 AM – 12:00 PM',
  '12:00 PM – 02:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
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
  companyName = 'ProTech IT & Computer Repair',
  phone = '+91 98765 43210',
}: RepairBookingModalProps) {
  const router = useRouter();
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Current Step: 1 = Your Details, 2 = Appointment, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Step 1: Device & Service Details
  const [deviceType, setDeviceType] = useState('Laptop');
  const [serviceCategory, setServiceCategory] = useState('Display & Glass Panel');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [selectedIssueTitle, setSelectedIssueTitle] = useState('Broken / Glitching Screen');
  const [isChangingIssue, setIsChangingIssue] = useState(false);

  // Step 1: Customer Information
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Dasturhat, Murshidabad, West Bengal');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Step 2: Appointment Details
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('10:00 AM – 12:00 PM');
  const [notes, setNotes] = useState('');
  const [smsUpdates, setSmsUpdates] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Availability validation
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Submission & UI status
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingCode: string;
    serviceName: string;
    deviceType: string;
    brand?: string;
    model?: string;
    problem: string;
    preferredDate?: string;
    preferredSlot?: string;
  } | null>(null);

  // Set default preferred date to tomorrow's date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setPreferredDate(dateStr);
  }, []);

  // Sync state whenever selected problem or calculator props change
  useEffect(() => {
    if (problem) {
      setSelectedIssueTitle(problem.title || 'Broken / Glitching Screen');
      if (problem.category) {
        setServiceCategory(problem.category);
      }
      if (problem.deviceType) {
        setDeviceType(problem.deviceType);
      }
    }

    if (selectedDevice) {
      setDeviceType(selectedDevice);
    }
    if (selectedBrand) {
      setBrand(selectedBrand);
    }

    setValidationError(null);
  }, [problem, selectedDevice, selectedBrand]);

  // Lock body scroll and handle Escape key
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

  // Check appointment availability when preferredDate changes
  useEffect(() => {
    if (!preferredDate) return;

    let isMounted = true;
    const checkDateAvailability = async () => {
      setCheckingAvailability(true);
      try {
        const res = await fetch(`/api/availability?date=${encodeURIComponent(preferredDate)}`);
        const data = await res.json();
        if (isMounted) {
          if (data && data.available === false) {
            setAvailabilityWarning(data.reason || 'Selected date is not available for bookings.');
          } else {
            setAvailabilityWarning(null);
          }
        }
      } catch {
        if (isMounted) setAvailabilityWarning(null);
      } finally {
        if (isMounted) setCheckingAvailability(false);
      }
    };

    checkDateAvailability();
    return () => {
      isMounted = false;
    };
  }, [preferredDate]);

  if (!isOpen) return null;

  // Format date nicely for display, e.g. "12 Nov 2026"
  const formatDisplayDate = (dString: string) => {
    if (!dString) return 'Not Selected';
    try {
      const parts = dString.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return dateObj.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      const d = new Date(dString);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return dString;
  };

  const todayMinDate = new Date().toISOString().split('T')[0];

  // Copy booking code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 8) {
      setValidationError('Please enter a valid phone number (at least 8 digits).');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!address.trim()) {
      setValidationError('Please enter your complete service or pickup address.');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!agreeTerms) {
      setValidationError('Please agree to the terms and conditions and service policy.');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentStep(2);
    setTimeout(() => {
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Step 2 Validation -> Proceed to Step 3 (Review & Confirmation)
  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!preferredDate) {
      setValidationError('Please select your preferred appointment date.');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!preferredSlot) {
      setValidationError('Please choose a preferred time slot.');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (availabilityWarning) {
      setValidationError('The selected date is unavailable. Please choose another date.');
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentStep(3);
    setTimeout(() => {
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Step 3: Final Confirmation Action -> Submit to Backend API
  const handleFinalConfirmBooking = async () => {
    if (submitting) return; // Strict duplicate prevention
    setSubmitting(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          deviceType: deviceType.trim(),
          brand: brand.trim() || undefined,
          model: model.trim() || undefined,
          problem: selectedIssueTitle.trim(),
          serviceCategory: serviceCategory.trim(),
          serviceSlug: problem?.serviceSlug || 'laptop-repair',
          serviceMode: 'shop_visit',
          preferredDate: preferredDate,
          preferredSlot: preferredSlot,
          address: address.trim(),
          notes: notes.trim() || undefined,
          smsUpdates: smsUpdates,
          emailUpdates: emailUpdates,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || 'Failed to submit repair booking. Please try again.');
        setSubmitting(false);
        modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setConfirmedBooking({
        bookingCode: data.booking.bookingCode,
        serviceName: data.booking.serviceName || serviceCategory,
        deviceType: data.booking.deviceType || deviceType,
        brand: data.booking.brand || brand,
        model: data.booking.model || model,
        problem: data.booking.problem || selectedIssueTitle,
        preferredDate: preferredDate,
        preferredSlot: preferredSlot,
      });

      setIsConfirmed(true);
      setSubmitting(false);
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } catch {
      setValidationError('Network connection error. Please check your internet or call our helpline.');
      setSubmitting(false);
      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Determine if device photo should be desktop or laptop
  const isDesktopSelected =
    deviceType.toLowerCase().includes('desktop') ||
    deviceType.toLowerCase().includes('pc') ||
    deviceType.toLowerCase().includes('rig');

  const previewDevicePhoto = isDesktopSelected
    ? '/images/desktop-preview.jpg'
    : '/images/laptop-preview.jpg';

  return (
    <div
      ref={modalScrollRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-md p-2.5 sm:p-5 md:p-8 overscroll-contain animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repair-booking-modal-title"
    >
      <div className="min-h-full flex items-start sm:items-center justify-center py-2 sm:py-6">
        {/* Main 3-Step Card */}
        <div
          className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-950/25 overflow-hidden text-left transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle light blue background wave art behind header */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-50/90 via-blue-50/40 to-transparent pointer-events-none -z-0" />

          {/* Modal Header */}
          <div className="relative z-10 px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Blue Calendar/Booking Icon */}
              <div className="w-12 h-12 rounded-2xl bg-blue-100/90 border border-blue-200/80 text-[#155EEF] flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h2
                  id="repair-booking-modal-title"
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                >
                  Repair Booking Information
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {currentStep === 3
                    ? 'Review and confirm your booking details'
                    : 'Fill in the details below to book your repair service'}
                </p>
              </div>
            </div>

            {/* Header Right: Graphic Art + Close 'X' Button */}
            <div className="flex items-center gap-4 self-end sm:self-auto">
              {/* Laptop Graphic Art with floating repair tools */}
              <div className="hidden md:block relative w-24 h-16 shrink-0">
                <Image
                  src="/images/header-repair-laptop.jpg"
                  alt="Laptop repair illustration"
                  fill
                  sizes="96px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-slate-200/90 hover:border-slate-300 text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 transition-all tap-target"
                aria-label="Close modal"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>
          </div>

          {/* Stepper Bar: Step 1 – Your Details | Step 2 – Appointment | Step 3 – Confirmation */}
          <div className="relative z-10 px-6 sm:px-8 py-3.5 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center justify-start sm:justify-start gap-3 sm:gap-8 overflow-x-auto no-scrollbar">
              {/* Step 1: Your Details */}
              <div
                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                  currentStep >= 1 ? 'text-[#155EEF] font-bold' : 'text-slate-400'
                }`}
                onClick={() => {
                  if (!isConfirmed && currentStep > 1) setCurrentStep(1);
                }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > 1 || (currentStep === 1 && isConfirmed)
                      ? 'bg-[#155EEF] text-white'
                      : currentStep === 1
                      ? 'bg-[#155EEF] text-white ring-2 ring-[#155EEF]/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                </div>
                <div className="relative text-xs sm:text-sm">
                  <span>Your Details</span>
                  {currentStep === 1 && !isConfirmed && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#155EEF] rounded-full" />
                  )}
                </div>
              </div>

              {/* Connecting line 1 */}
              <div className="w-8 sm:w-16 h-px bg-slate-200 shrink-0" />

              {/* Step 2: Appointment */}
              <div
                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                  currentStep >= 2 ? 'text-[#155EEF] font-bold' : 'text-slate-400'
                }`}
                onClick={() => {
                  if (!isConfirmed && currentStep === 3) setCurrentStep(2);
                }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > 2 || (currentStep === 2 && isConfirmed)
                      ? 'bg-[#155EEF] text-white'
                      : currentStep === 2
                      ? 'bg-[#155EEF] text-white ring-2 ring-[#155EEF]/20'
                      : 'bg-slate-100 border border-slate-300 text-slate-500'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                </div>
                <div className="relative text-xs sm:text-sm">
                  <span>Appointment</span>
                  {currentStep === 2 && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#155EEF] rounded-full" />
                  )}
                </div>
              </div>

              {/* Connecting line 2 */}
              <div className="w-8 sm:w-16 h-px bg-slate-200 shrink-0" />

              {/* Step 3: Confirmation */}
              <div
                className={`flex items-center gap-2 transition-colors ${
                  currentStep === 3 ? 'text-[#155EEF] font-bold' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isConfirmed
                      ? 'bg-[#155EEF] text-white ring-2 ring-[#155EEF]/20'
                      : currentStep === 3
                      ? 'bg-[#155EEF] text-white'
                      : 'bg-slate-100 border border-slate-300 text-slate-500'
                  }`}
                >
                  {isConfirmed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                </div>
                <div className="relative text-xs sm:text-sm">
                  <span>Confirmation</span>
                  {currentStep === 3 && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#155EEF] rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Validation Alert Message if any */}
          {validationError && (
            <div className="mx-6 sm:mx-8 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Main 2-Column Body Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ======================================================== */}
            {/* LEFT COLUMN: Main Form & Confirmation Details            */}
            {/* ======================================================== */}
            <div className={isConfirmed ? "col-span-1 lg:col-span-12 space-y-6" : "lg:col-span-7 xl:col-span-8 space-y-6"}>
              
              {/* ---------------------------------------------------- */}
              {/* STEP 1: YOUR DETAILS (Device & Customer Information) */}
              {/* ---------------------------------------------------- */}
              {currentStep === 1 && (
                <form onSubmit={handleProceedToAppointment} className="space-y-6">
                  {/* Selected Issue Alert Callout Banner with Change Action */}
                  <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#155EEF] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="text-left text-xs sm:text-sm">
                        <div className="font-bold text-slate-900">
                          Selected Issue:{' '}
                          <span className="text-[#155EEF] font-extrabold">
                            {selectedIssueTitle}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs mt-0.5">
                          Service Category:{' '}
                          <span className="font-semibold text-slate-800">
                            {serviceCategory}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsChangingIssue(!isChangingIssue)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#155EEF] hover:text-[#1048bc] bg-white border border-blue-200/80 hover:bg-blue-50/60 shadow-2xs transition-all self-start sm:self-auto tap-target"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isChangingIssue ? 'Done' : 'Change'}</span>
                    </button>
                  </div>

                  {/* Inline Issue Switcher Dropdown (when 'Change' is clicked) */}
                  {isChangingIssue && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                      <span className="text-xs font-bold text-slate-700 block">
                        Quickly select or type your device issue:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {PROBLEMS_DATA.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedIssueTitle(p.title);
                              setServiceCategory(p.category);
                              setIsChangingIssue(false);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              selectedIssueTitle === p.title
                                ? 'bg-[#155EEF] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400'
                            }`}
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                      <div className="pt-2">
                        <input
                          type="text"
                          value={selectedIssueTitle}
                          onChange={(e) => setSelectedIssueTitle(e.target.value)}
                          placeholder="Or type custom issue description..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-sm text-slate-900 focus:border-[#155EEF] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 1: Device & Service Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                      <Monitor className="w-4 h-4 text-[#155EEF]" />
                      <span>Device & Service Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Device Type Select */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Device Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <select
                            value={deviceType}
                            onChange={(e) => setDeviceType(e.target.value)}
                            required
                            className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          >
                            {DEVICE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Service Category Select */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Service Category <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <select
                            value={serviceCategory}
                            onChange={(e) => setServiceCategory(e.target.value)}
                            required
                            className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          >
                            {SERVICE_CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Brand / Manufacturer Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Brand / Manufacturer <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Tag className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder="e.g. Dell, HP, Lenovo, Asus"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Model Number / Series Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Model Number / Series <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Barcode className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="e.g. Inspiron 15 3511, MacBook Pro M1"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Customer Information */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                      <User className="w-4 h-4 text-[#155EEF]" />
                      <span>Customer Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Your Name"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                            placeholder="Your Number"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            placeholder="Dasturhat, Murshidabad, West Bengal"
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#155EEF] pointer-events-none">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-[#155EEF] border-slate-300 focus:ring-[#155EEF]"
                      />
                      <span>
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" className="text-[#155EEF] underline hover:text-blue-700">
                          terms and conditions
                        </Link>{' '}
                        and our{' '}
                        <Link href="/privacy-policy" target="_blank" className="text-[#155EEF] underline hover:text-blue-700">
                          service policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Step 1 Actions */}
                  {validationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in shake">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all tap-target cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3894] shadow-md shadow-blue-500/20 transition-all tap-target cursor-pointer touch-manipulation"
                    >
                      <span>Continue to Appointment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 2: APPOINTMENT (Date, Time Slot, Preferences)   */}
              {/* ---------------------------------------------------- */}
              {currentStep === 2 && (
                <form onSubmit={handleProceedToConfirmation} className="space-y-6">
                  {/* Section: Select Appointment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                      <Calendar className="w-4 h-4 text-[#155EEF]" />
                      <span>Select Appointment</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Preferred Date */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Preferred Date <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            min={todayMinDate}
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          />
                        </div>
                        {checkingAvailability && (
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin text-[#155EEF]" />
                            <span>Checking shop schedule...</span>
                          </div>
                        )}
                        {availabilityWarning && (
                          <div className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{availabilityWarning}</span>
                          </div>
                        )}
                      </div>

                      {/* Preferred Time Slot */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Preferred Time Slot <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Clock className="w-4 h-4" />
                          </div>
                          <select
                            value={preferredSlot}
                            onChange={(e) => setPreferredSlot(e.target.value)}
                            required
                            className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs"
                          >
                            {TIME_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes (Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {notes.length} / 500
                        </span>
                      </div>
                      <textarea
                        value={notes}
                        maxLength={500}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Any specific instructions or problem details..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none transition-all shadow-2xs resize-none"
                      />
                    </div>
                  </div>

                  {/* Section: Service Preferences */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                      <Bell className="w-4 h-4 text-[#155EEF]" />
                      <span>Service Preferences</span>
                    </div>

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={smsUpdates}
                          onChange={(e) => setSmsUpdates(e.target.checked)}
                          className="w-4 h-4 rounded text-[#155EEF] border-slate-300 focus:ring-[#155EEF]"
                        />
                        <span>I want to receive SMS updates</span>
                        <span title="Get real-time SMS status updates when your technician is assigned.">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={emailUpdates}
                          onChange={(e) => setEmailUpdates(e.target.checked)}
                          className="w-4 h-4 rounded text-[#155EEF] border-slate-300 focus:ring-[#155EEF]"
                        />
                        <span>I want to receive email updates</span>
                        <span title="Receive itemized diagnostic reports and invoices via email.">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  {validationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in shake">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(1);
                        setTimeout(() => modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all tap-target cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={Boolean(availabilityWarning)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3894] disabled:opacity-50 shadow-md shadow-blue-500/20 transition-all tap-target cursor-pointer touch-manipulation"
                    >
                      <span>Continue to Confirmation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ---------------------------------------------------- */}
              {/* STEP 3: CONFIRMATION (Review & Confirmed Screen)     */}
              {/* ---------------------------------------------------- */}
              {currentStep === 3 && (
                <div>
                  {!isConfirmed ? (
                    /* Review Screen before final confirmation */
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Please Review Your Booking Details
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Verify the information below before creating your service appointment.
                        </p>
                      </div>

                      {/* Summary Review Cards */}
                      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/90 space-y-4 text-xs sm:text-sm">
                        {/* Customer Row */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                          <div>
                            <span className="text-slate-400 font-medium block">Customer</span>
                            <span className="font-bold text-slate-900">{name}</span>
                            <span className="text-slate-500 block">{mobile}</span>
                            {email && <span className="text-slate-500 block">{email}</span>}
                          </div>
                          <div className="text-right max-w-xs">
                            <span className="text-slate-400 font-medium block">Service Address</span>
                            <span className="font-medium text-slate-800">{address}</span>
                          </div>
                        </div>

                        {/* Appointment Row */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                          <div>
                            <span className="text-slate-400 font-medium block">Appointment Date</span>
                            <span className="font-bold text-[#155EEF]">
                              {formatDisplayDate(preferredDate)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 font-medium block">Time Slot</span>
                            <span className="font-bold text-slate-900">{preferredSlot}</span>
                          </div>
                        </div>

                        {/* Device & Issue Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 font-medium block">Device</span>
                            <span className="font-semibold text-slate-800">
                              {deviceType} {brand ? `• ${brand}` : ''} {model ? `(${model})` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Reported Problem</span>
                            <span className="font-semibold text-slate-800">
                              {selectedIssueTitle}
                            </span>
                          </div>
                        </div>

                        {notes && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-slate-400 font-medium block">Notes:</span>
                            <span className="text-slate-700 italic">&ldquo;{notes}&rdquo;</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {validationError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in shake">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>{validationError}</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(2);
                            setTimeout(() => modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                          }}
                          disabled={submitting}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all tap-target cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Appointment</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleFinalConfirmBooking}
                          disabled={submitting}
                          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3894] shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all tap-target cursor-pointer touch-manipulation"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Creating Booking...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>Confirm & Book Diagnostic</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Booking Confirmed Success Screen (matches Image 2 right side) */
                    <div className="py-2 text-center space-y-6 animate-in zoom-in-95 duration-300">
                      {/* Big Green Checkmark with Confetti Dots */}
                      <div className="relative inline-flex items-center justify-center">
                        {/* Colorful Festive Confetti dots */}
                        <span className="absolute -top-3 -left-4 w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                        <span className="absolute -top-2 right-6 w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="absolute top-2 -right-5 w-2 h-2 rounded-full bg-blue-400" />
                        <span className="absolute -bottom-2 -left-6 w-2.5 h-2.5 rounded-full bg-purple-400" />
                        <span className="absolute -bottom-3 right-5 w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="absolute top-6 -left-7 w-2 h-2 rounded-full bg-indigo-400" />

                        {/* Central Green Check Badge */}
                        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                          <Check className="w-10 h-10 stroke-[3.2]" />
                        </div>
                      </div>

                      {/* Headline & Subtitle */}
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                          Booking Confirmed!
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                          Your repair booking has been successfully created. We will contact you shortly to confirm your appointment.
                        </p>
                      </div>

                      {/* Booking Reference No. Card */}
                      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 max-w-md mx-auto text-center space-y-1 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Booking Reference No.
                        </span>
                        <div className="flex items-center justify-center gap-2 pt-0.5">
                          <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                            {confirmedBooking?.bookingCode || 'HVAC-2026-1123'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(confirmedBooking?.bookingCode || '')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#155EEF] hover:bg-white transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {copiedCode && (
                          <div className="text-[11px] font-bold text-emerald-600 pt-0.5 animate-in fade-in">
                            ✓ Copied to clipboard!
                          </div>
                        )}
                      </div>

                      {/* Two Details Rows: Appointment Details & Service Details */}
                      <div className="space-y-4 max-w-lg mx-auto text-left text-xs sm:text-sm">
                        {/* Appointment Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Calendar className="w-4 h-4 text-[#155EEF]" />
                            <span>Appointment Details</span>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Date</span>
                              <span className="font-semibold text-slate-800">
                                {formatDisplayDate(preferredDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Time Slot</span>
                              <span className="font-semibold text-slate-800">
                                {preferredSlot}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Wrench className="w-4 h-4 text-[#155EEF]" />
                            <span>Service Details</span>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Issue</span>
                              <span className="font-semibold text-slate-800">
                                {confirmedBooking?.problem || selectedIssueTitle}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Service Category</span>
                              <span className="font-semibold text-slate-800">
                                {serviceCategory}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Device Type</span>
                              <span className="font-semibold text-slate-800">
                                {deviceType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons: Go to Home & View My Bookings */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                          href="/"
                          onClick={onClose}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all tap-target"
                        >
                          <Home className="w-4 h-4 text-slate-500" />
                          <span>Go to Home</span>
                        </Link>

                        <Link
                          href={`/track-booking?q=${encodeURIComponent(confirmedBooking?.bookingCode || '')}`}
                          onClick={onClose}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#155EEF] hover:bg-[#1048bc] shadow-md shadow-blue-500/20 transition-all tap-target"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>View My Bookings</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN: Dynamic Booking Summary Column             */}
            {/* ======================================================== */}
            {!isConfirmed && (
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                
                {/* 1. Header: Dark blue bar with document icon */}
                <div className="bg-[#0047AB] px-5 py-3 text-white flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-white" />
                  <span className="font-bold text-sm tracking-wide">
                    Booking Summary
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* 2. Device Photo: dynamically shows laptop or desktop photo */}
                  <div className="relative w-full h-36 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-2">
                    <Image
                      src={previewDevicePhoto}
                      alt={deviceType}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="object-contain transition-all duration-300 transform hover:scale-105"
                    />
                  </div>

                  {/* 3. Dynamic Data Table: updates in real time as user types/selects */}
                  <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium">Issue</span>
                      <span className="font-bold text-slate-800 text-right line-clamp-1">
                        {selectedIssueTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium">Service Category</span>
                      <span className="font-bold text-slate-800 text-right line-clamp-1">
                        {serviceCategory}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium">Device Type</span>
                      <span className="font-bold text-slate-800 text-right">
                        {deviceType}
                      </span>
                    </div>

                    {brand && (
                      <div className="flex items-center justify-between gap-2 animate-in fade-in">
                        <span className="text-slate-400 font-medium">Brand</span>
                        <span className="font-bold text-slate-800 text-right">
                          {brand}
                        </span>
                      </div>
                    )}

                    {model && (
                      <div className="flex items-center justify-between gap-2 animate-in fade-in">
                        <span className="text-slate-400 font-medium">Model / Series</span>
                        <span className="font-bold text-slate-800 text-right line-clamp-1">
                          {model}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 4. Step-specific content below dynamic data */}
                  
                  {/* Step 1 or Step 3: Trust Badges list */}
                  {(currentStep === 1 || currentStep === 3) && (
                    <div className="space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <Zap className="w-3 h-3 fill-amber-500" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">Quick Service</span>
                          <span className="text-[11px] text-slate-400 leading-none">Get your device fixed quickly</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-[#155EEF] flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">Verified Technicians</span>
                          <span className="text-[11px] text-slate-400 leading-none">Skilled & background verified experts</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                          <Tag className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">Transparent Pricing</span>
                          <span className="text-[11px] text-slate-400 leading-none">No hidden charges</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                          <Shield className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">Workmanship Warranty</span>
                          <span className="text-[11px] text-slate-400 leading-none">On repairs and parts</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Progress Status indicators (matching Image 2) */}
                  {currentStep === 2 && (
                    <div className="space-y-2.5 text-xs py-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="font-bold text-slate-800">Service Details</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold">Provided</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-[#155EEF] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="font-bold text-slate-800">Appointment</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {preferredDate ? formatDisplayDate(preferredDate) : 'Not Selected'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 text-[10px] font-bold">
                            3
                          </div>
                          <span className="font-medium text-slate-500">Confirmation</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Pending</span>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Green Card "No Advance Payment" */}
                  {currentStep === 1 && (
                    <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 flex items-center gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">No Advance Payment</span>
                        <span className="text-[11px] text-slate-500 leading-none">Pay only after service</span>
                      </div>
                    </div>
                  )}

                  {/* Step 3 Confirmed: Green Thank You Card (matching Image 2) */}
                  {currentStep === 3 && isConfirmed && (
                    <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="font-bold text-emerald-900">
                        Thank you for choosing {companyName}!
                      </div>
                    </div>
                  )}

                  {/* Need Help Card (present on Step 1 and Step 2) */}
                  {(!isConfirmed || currentStep !== 3) && (
                    <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 flex items-center gap-2.5 text-xs">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#155EEF] flex items-center justify-center shrink-0">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">Need Help?</span>
                        <a
                          href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                          className="text-[11px] text-[#155EEF] font-semibold hover:underline leading-none"
                        >
                          Call us: {phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
