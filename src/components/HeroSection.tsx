'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Calculator,
  ArrowRight,
  Zap,
  Users,
  Clock,
  ShieldCheck,
  Truck,
  Monitor,
  BatteryCharging,
  Droplet,
  Cpu,
  Navigation,
  CheckCircle2,
  Star,
} from 'lucide-react';
import BrandCarousel from './BrandCarousel';
import RepairBookingModal, { ServiceOption, ServiceAreaOption } from './RepairBookingModal';
import CalculatorOopsModal from './CalculatorOopsModal';
import { ProblemItem } from './ProblemPicker';

function GoogleGIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const ROTATING_WORDS = ['Laptop', 'Desktop'];

interface HeroSectionProps {
  services?: ServiceOption[];
  serviceAreas?: ServiceAreaOption[];
  isCalculatorActive?: boolean;
  phone?: string;
  whatsapp?: string;
  address?: string;
  workingHours?: string;
}

export default function HeroSection({
  services,
  serviceAreas,
  isCalculatorActive = true,
  phone = '8345822352',
  whatsapp = '6295763758',
  address = 'West Bengal, Murshidabad',
  workingHours = 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed',
}: HeroSectionProps = {}) {
  const [displayedWord, setDisplayedWord] = useState('Laptop');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingProblem, setBookingProblem] = useState<ProblemItem | null>(null);
  const [isOopsModalOpen, setIsOopsModalOpen] = useState(false);
  const [isCalcActive, setIsCalcActive] = useState(isCalculatorActive);

  // Sync prop when updated
  useEffect(() => {
    setIsCalcActive(isCalculatorActive);
  }, [isCalculatorActive]);

  const handleCalculatorClick = (e: React.MouseEvent) => {
    if (!isCalcActive) {
      e.preventDefault();
      setIsOopsModalOpen(true);
    }
  };

  // Typewriter effect: starts with "Laptop", pauses, deletes character by character, types "Desktop", pauses, and loops
  useEffect(() => {
    const currentTarget = ROTATING_WORDS[wordIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayedWord === currentTarget) {
      // Hold the full word for 2.2 seconds before starting deletion
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && displayedWord === '') {
      // Hold briefly when fully erased before typing the next word
      timer = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      }, 350);
    } else {
      // Typewriter stepping
      const nextLength = isDeleting ? displayedWord.length - 1 : displayedWord.length + 1;
      const speed = isDeleting ? 70 : 130;

      timer = setTimeout(() => {
        setDisplayedWord(currentTarget.substring(0, nextLength));
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [displayedWord, isDeleting, wordIndex]);

  const handleDiagnosticTileClick = (e: React.MouseEvent, problemItem: Partial<ProblemItem>) => {
    e.preventDefault();
    const problem: ProblemItem = {
      id: problemItem.id || 'diagnostic-issue',
      title: problemItem.title || 'Hardware Diagnostic',
      subtitle: problemItem.subtitle || 'Doorstep inspection & certified repair',
      serviceSlug: problemItem.serviceSlug || 'laptop-repair',
      deviceType: problemItem.deviceType || 'Laptop',
      category: problemItem.category || 'Diagnostic',
      kicker: problemItem.kicker || 'HARDWARE & SYSTEM',
      turnaround: problemItem.turnaround || '1 - 2 Hours',
      warranty: problemItem.warranty || '90-Day Parts & Labor Warranty',
      groups: ['all'],
      icon: problemItem.icon || Wrench,
      iconBg: problemItem.iconBg || 'bg-sky-50',
      iconColor: problemItem.iconColor || 'text-[#155EEF]',
      iconBorder: problemItem.iconBorder || 'border-sky-100',
      kickerColor: problemItem.kickerColor || 'text-[#155EEF]',
    };
    setBookingProblem(problem);
    setIsBookingModalOpen(true);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-sky-50/30 to-transparent pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Soft Ambient Light Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* 1. Rating Pill with Stars & Google Logo */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">4.9/5</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-600">2,400+ Google Reviews</span>
              <GoogleGIcon className="w-3.5 h-3.5 ml-0.5" />
            </div>

            {/* 2. Primary Headline with Animated Word Cycling (Laptop <-> Desktop) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.12]">
              <span className="inline-block relative">
                <span className="text-slate-900">{displayedWord}</span>
                <span
                  className="inline-block w-[3px] sm:w-[4px] h-[0.8em] bg-[#0284C7] ml-1 align-middle animate-caret rounded-full shadow-xs"
                  aria-hidden="true"
                />
              </span>{' '}
              Problems? <br />
              <span className="text-[#0284C7]">Fixed in 2 Hours</span> or Less.
            </h1>

            {/* 3. Subheadline */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              <strong className="text-slate-900 font-bold">14+ years of excellence.</strong>{' '}
              Certified repair technicians come right to your doorstep across Kolkata. Equipped
              with genuine spare parts and up to{' '}
              <Link
                href="/terms"
                className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-[#0284C7] hover:decoration-[#0284C7] transition-colors"
              >
                90 days repair warranty
              </Link>
              .
            </p>

            {/* 4. Dual Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/book-repair"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-[#0284C7] hover:bg-[#0369a1] active:bg-[#075985] transition-all shadow-md shadow-sky-600/20 tap-target text-sm group"
              >
                <Wrench className="w-4 h-4 stroke-[2.2]" />
                <span>Book Doorstep Repair Now</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/calculate-repair-cost"
                onClick={handleCalculatorClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs tap-target text-sm group cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-[#0284C7] group-hover:scale-110 transition-transform" />
                <span>Calculate Repair Cost</span>
              </Link>
            </div>

            {/* 5. 4-Card Horizontal Statistics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
              {/* Stat 1 */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-900">
                  <Zap className="w-4 h-4 text-[#0284C7] fill-[#0284C7] shrink-0" />
                  <span className="text-base sm:text-lg font-black tracking-tight">14+</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  Years Experience
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-900">
                  <Users className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span className="text-base sm:text-lg font-black tracking-tight">50,000+</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  Happy Clients
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-900">
                  <Clock className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span className="text-base sm:text-lg font-black tracking-tight">2 Hrs</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  Avg Repair Time
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-base sm:text-lg font-black tracking-tight">100%</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  No Fix No Pay Guarantee
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: TECHFIX DIAGNOSTIC HUB ================= */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Floating Badge 1 (Top-Right): Free Pickup & Delivery with Animated Float */}
            <div className="absolute -top-6 -right-2 sm:-right-4 z-20 bg-white rounded-2xl p-3 border border-slate-100 shadow-xl shadow-slate-200/70 flex items-center gap-3 animate-float-badge">
              <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Free Pickup & Delivery
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Zero Convenience Fee
                </span>
              </div>
            </div>

            {/* Main Window Container */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-sky-950/10 p-5 sm:p-7 space-y-5 relative">
              
              {/* Window Title Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    TechFix Diagnostic Hub
                  </span>
                </div>
              </div>

              {/* Select Issue To Diagnostics Section */}
              <div className="space-y-2.5 text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Select Issue to Diagnostics
                </div>

                {/* 2x2 Interactive Problem Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Tile 1: Screen Replacement */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDiagnosticTileClick(e, {
                        id: 'broken_screen',
                        title: 'Broken / Glitching Screen',
                        subtitle: 'Cracked top glass, inner LCD ink bleed, vertical color lines, or severe flickering.',
                        serviceSlug: 'laptop-repair',
                        deviceType: 'Laptop',
                        category: 'Display & Glass Panel',
                        kicker: 'DISPLAY & GLASS PANEL',
                        turnaround: '1-2 Hours Replacement',
                        icon: Monitor,
                        iconBg: 'bg-sky-50',
                        iconColor: 'text-[#0284C7]',
                        kickerColor: 'text-[#0284C7]',
                      })
                    }
                    className="p-3 rounded-2xl border border-slate-200/90 hover:border-[#0284C7]/50 hover:bg-sky-50/30 transition-all flex items-center gap-2.5 group text-left cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0 border border-sky-100 group-hover:scale-105 transition-transform">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0284C7] transition-colors leading-tight">
                      Screen Replacement
                    </span>
                  </button>

                  {/* Tile 2: Battery & Power */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDiagnosticTileClick(e, {
                        id: 'battery_drain',
                        title: 'Rapid Drain / Not Charging',
                        subtitle: 'Battery dies in 30 mins, swollen battery casing, loose Type-C/DC jack charging pin.',
                        serviceSlug: 'laptop-repair',
                        deviceType: 'Laptop',
                        category: 'Battery & Charging',
                        kicker: 'BATTERY & CHARGING',
                        turnaround: '45-60 Mins Swap',
                        icon: BatteryCharging,
                        iconBg: 'bg-amber-50',
                        iconColor: 'text-amber-600',
                        kickerColor: 'text-amber-600',
                      })
                    }
                    className="p-3 rounded-2xl border border-slate-200/90 hover:border-amber-400/50 hover:bg-amber-50/30 transition-all flex items-center gap-2.5 group text-left cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform">
                      <BatteryCharging className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-700 transition-colors leading-tight">
                      Battery & Power
                    </span>
                  </button>

                  {/* Tile 3: Liquid Damage */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDiagnosticTileClick(e, {
                        id: 'water_damage',
                        title: 'Spilled Liquid / Corrosion',
                        subtitle: 'Accidental coffee, tea, or water spill into keyboard, causing short circuits or sticky keys.',
                        serviceSlug: 'laptop-repair',
                        deviceType: 'Laptop',
                        category: 'Liquid & Water Damage',
                        kicker: 'LIQUID & WATER DAMAGE',
                        turnaround: 'Urgent Ultrasonic Clean',
                        icon: Droplet,
                        iconBg: 'bg-blue-50',
                        iconColor: 'text-blue-600',
                        kickerColor: 'text-blue-600',
                      })
                    }
                    className="p-3 rounded-2xl border border-slate-200/90 hover:border-blue-400/50 hover:bg-blue-50/30 transition-all flex items-center gap-2.5 group text-left cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                      Liquid Damage
                    </span>
                  </button>

                  {/* Tile 4: Motherboard & Fan */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDiagnosticTileClick(e, {
                        id: 'no_power',
                        title: "Won't Turn On / No Power",
                        subtitle: 'Completely dead, no response to charger, power LED unlit, or fan fails to spin up.',
                        serviceSlug: 'laptop-repair',
                        deviceType: 'Laptop',
                        category: 'Power & Logic Board',
                        kicker: 'POWER & LOGIC BOARD',
                        turnaround: 'Same-Day Diagnostic',
                        icon: Cpu,
                        iconBg: 'bg-rose-50',
                        iconColor: 'text-rose-600',
                        kickerColor: 'text-rose-600',
                      })
                    }
                    className="p-3 rounded-2xl border border-slate-200/90 hover:border-rose-400/50 hover:bg-rose-50/30 transition-all flex items-center gap-2.5 group text-left cursor-pointer w-full"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-105 transition-transform">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-rose-700 transition-colors leading-tight">
                      Motherboard & Fan
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom Dark Navy Status Card */}
              <div className="bg-[#0B1528] rounded-2xl p-4 sm:p-5 text-white space-y-3.5 text-left shadow-inner">
                {/* Top Row: Label & Mini Truck */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Average Arrival Time
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 text-sky-400 flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Middle Row: Navigation + Time in Kolkata */}
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-sky-400 shrink-0 fill-sky-400" />
                  <span className="text-base sm:text-lg font-bold text-sky-400 tracking-tight">
                    30 Mins in Kolkata
                  </span>
                </div>

                {/* Bottom Row: Free Doorstep Pickup + Included Check */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Free Doorstep Pickup</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Included</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Badge 2 (Bottom-Left): No Fix, No Pay */}
            <div className="absolute -bottom-5 -left-2 sm:-left-4 z-20 bg-white rounded-2xl p-3 border border-slate-100 shadow-xl shadow-slate-200/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  No Fix, No Pay
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  100% Refund Guarantee
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ================= BRAND CAROUSEL (Infinite Sliding Marquee) ================= */}
        <BrandCarousel />
      </div>

      {/* Diagnostic / Repair Booking Modal for Quick Hub Tiles */}
      <RepairBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        problem={bookingProblem}
        services={services}
        serviceAreas={serviceAreas}
      />

      {/* Oops Modal when Cost Calculator is Deactivated by Admin */}
      <CalculatorOopsModal
        isOpen={isOopsModalOpen}
        onClose={() => setIsOopsModalOpen(false)}
        phone={phone}
        whatsapp={whatsapp}
        address={address}
        workingHours={workingHours}
      />
    </section>
  );
}
