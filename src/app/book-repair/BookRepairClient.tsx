'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProblemPicker, { ProblemItem, PROBLEMS_DATA } from '@/components/ProblemPicker';
import RepairBookingForm from '@/components/RepairBookingForm';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle,
  Wrench,
  Phone,
  MessageCircle,
  MapPin,
  Laptop,
} from 'lucide-react';

interface BookRepairClientProps {
  services: Array<{ id: number; name: string; slug: string }>;
  serviceAreas: Array<{ id: number; name: string; slug: string; pincodes: string }>;
  phone?: string;
  whatsapp?: string;
  address?: string;
}

export default function BookRepairClient({
  services,
  serviceAreas,
  phone = '+91 98765 43210',
  whatsapp = '919876543210',
  address = 'Shop 14, Silicon Arcade, Tech Avenue, Metro Plaza',
}: BookRepairClientProps) {
  const searchParams = useSearchParams();

  // Query parameter pre-fill
  const paramProblem = searchParams.get('problem') || '';
  const paramProblemId = searchParams.get('problemId') || '';
  const paramService = searchParams.get('service') || 'laptop-repair';
  const paramDevice = searchParams.get('device') || 'Laptop';

  // Active selected issue
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);

  // Match initial problem from search parameters if present
  useEffect(() => {
    if (paramProblemId) {
      const match = PROBLEMS_DATA.find((p) => p.id === paramProblemId);
      if (match) {
        setSelectedProblem(match);
        return;
      }
    }

    if (paramProblem) {
      const match = PROBLEMS_DATA.find(
        (p) => p.title.toLowerCase() === paramProblem.toLowerCase()
      );
      if (match) {
        setSelectedProblem(match);
        return;
      }
    }
  }, [paramProblem, paramProblemId]);

  const handleSelectProblem = (p: ProblemItem) => {
    setSelectedProblem(p);
    // Smooth scroll down to booking form for seamless conversion
    const formElement = document.getElementById('booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. Improved Heading Section matching reference image & UX standards */}
      <section className="text-center max-w-3xl mx-auto pt-4" aria-label="Diagnostic issue triage">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#0284C7] border border-sky-200/80 mb-3.5 shadow-2xs">
          <span className="font-mono text-xs font-black">#</span>
          <span>STEP 1 OF 2 • FAST DIAGNOSTIC TRIAGE</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
          What issue is your device facing?
        </h1>

        {/* Descriptive Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 mt-3.5 leading-relaxed max-w-2xl mx-auto">
          Tap a symptom below to pre-fill your doorstep repair booking in seconds. Every repair includes a thorough diagnostic inspection, transparent quote, and 90-day warranty.
        </p>

        {/* 3 Trust Pills matching uploaded image */}
        <div className="pt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Diagnostic Fee Walk-ins</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50/90 text-sky-800 border border-sky-200/80 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>90-Day Parts & Labor Warranty</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50/90 text-amber-800 border border-amber-200/80 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Same-Day Turnaround Available</span>
          </span>
        </div>
      </section>

      {/* 2. Redesigned Issue Cards Grid with 3 cols desktop, 2 cols tablet, 1 col mobile */}
      <section>
        <ProblemPicker
          selectedId={selectedProblem?.id || null}
          onSelectProblem={handleSelectProblem}
          mode="select"
          useModal={false}
          services={services}
          serviceAreas={serviceAreas}
        />
      </section>

      {/* 3. Pre-Filled Repair Booking Form */}
      <section>
        <RepairBookingForm
          initialProblem={selectedProblem?.title || paramProblem}
          initialService={selectedProblem?.serviceSlug || paramService}
          initialDevice={selectedProblem?.deviceType || paramDevice}
          services={services}
          serviceAreas={serviceAreas}
        />
      </section>

      {/* 4. Quick Help & Support Footer Banner */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <span className="text-xs font-bold text-[#155EEF] uppercase tracking-wider">
            Need Live Diagnostic Advice?
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Not sure what is wrong with your device?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Call our service desk or send a quick WhatsApp message. A workshop technician will guide you immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-colors tap-target"
          >
            <Phone className="w-4 h-4 text-[#155EEF]" />
            <span>Call Workshop ({phone})</span>
          </a>

          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              'Hi ProTech IT, I need advice diagnosing an issue on my computer/laptop.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors tap-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Instant WhatsApp Chat</span>
          </a>
        </div>
      </section>
    </div>
  );
}
