'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Power,
  Monitor,
  Gauge,
  Droplet,
  BatteryCharging,
  Wifi,
  ArrowRight,
  Check,
  Clock,
  Laptop,
  Loader2,
  ShieldCheck,
  Search,
  X,
  Sparkles,
  PhoneCall,
  HelpCircle,
} from 'lucide-react';
import RepairBookingModal, { ServiceOption, ServiceAreaOption } from './RepairBookingModal';

export interface ProblemItem {
  id: string;
  title: string;
  subtitle: string;
  serviceSlug: string;
  deviceType: string;
  category: string;
  kicker: string;
  turnaround: string;
  warranty: string;
  groups: string[];
  aliases?: string[];
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  kickerColor: string;
}

// 6 Core Issues matching the design specification & reference image
export const PROBLEMS_DATA: ProblemItem[] = [
  {
    id: 'wont_turn_on',
    title: "Won't Turn On / No Power",
    subtitle: 'Completely dead, no response to charger, power LED unlit, or fan fails to spin up.',
    serviceSlug: 'laptop-repair',
    deviceType: 'Laptop',
    category: 'Power & Logic Board',
    kicker: 'POWER & LOGIC BOARD',
    turnaround: 'Same-Day Diagnostic',
    warranty: '90-Day Warranty',
    groups: ['hardware', 'battery'],
    aliases: ['dead', 'no power', 'power ic', 'charging ic', 'motherboard short'],
    icon: Power,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    iconBorder: 'border-amber-100',
    kickerColor: 'text-amber-600',
  },
  {
    id: 'broken_screen',
    title: 'Broken / Glitching Screen',
    subtitle: 'Cracked top glass, inner LCD ink bleed, vertical color lines, or severe flickering.',
    serviceSlug: 'laptop-repair',
    deviceType: 'Laptop',
    category: 'Display & Glass Panel',
    kicker: 'DISPLAY & GLASS PANEL',
    turnaround: '1-2 Hours Replacement',
    warranty: '90-Day Warranty',
    groups: ['hardware'],
    aliases: ['screen replacement', 'cracked lcd', 'flickering display', 'broken glass'],
    icon: Monitor,
    iconBg: 'bg-sky-50',
    iconColor: 'text-[#155EEF]',
    iconBorder: 'border-sky-100',
    kickerColor: 'text-[#155EEF]',
  },
  {
    id: 'slow_crash',
    title: 'Slow / Crashing / BSOD',
    subtitle: 'System freezes frequently, takes 5+ minutes to boot, Blue Screen of Death, or malware infection.',
    serviceSlug: 'software-os-services',
    deviceType: 'Laptop',
    category: 'System & OS Recovery',
    kicker: 'SYSTEM & OS RECOVERY',
    turnaround: 'Same-Day Clean & Tune',
    warranty: '90-Day Warranty',
    groups: ['software'],
    aliases: ['blue screen', 'windows crash', 'sluggish', 'ssd upgrade', 'virus removal'],
    icon: Gauge,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconBorder: 'border-purple-100',
    kickerColor: 'text-purple-600',
  },
  {
    id: 'battery_charging',
    title: 'Rapid Drain / Not Charging',
    subtitle: 'Battery dies in 30 mins, swollen battery casing, loose Type-C/DC jack charging pin.',
    serviceSlug: 'laptop-repair',
    deviceType: 'Laptop',
    category: 'Battery & Charging',
    kicker: 'BATTERY & CHARGING',
    turnaround: '45-60 Mins Swap',
    warranty: '90-Day Warranty',
    groups: ['battery', 'hardware'],
    aliases: ['battery / loose port', 'battery backup', 'dc jack loose', 'charger not connecting'],
    icon: BatteryCharging,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    iconBorder: 'border-emerald-100',
    kickerColor: 'text-emerald-600',
  },
  {
    id: 'liquid_spill',
    title: 'Spilled Liquid / Corrosion',
    subtitle: 'Accidental coffee, tea, or water spill into keyboard, causing short circuits or sticky keys.',
    serviceSlug: 'laptop-repair',
    deviceType: 'Laptop',
    category: 'Liquid & Water Damage',
    kicker: 'LIQUID & WATER DAMAGE',
    turnaround: 'Urgent Ultrasonic Clean',
    warranty: '90-Day Warranty',
    groups: ['hardware'],
    aliases: ['liquid spill / water damage', 'water damage', 'coffee spill', 'short circuit clean'],
    icon: Droplet,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    iconBorder: 'border-rose-100',
    kickerColor: 'text-rose-600',
  },
  {
    id: 'no_internet',
    title: 'Wireless Dropping / No Signal',
    subtitle: "Wi-Fi keeps disconnecting, Bluetooth won't turn on, or network card driver errors.",
    serviceSlug: 'networking-services',
    deviceType: 'Laptop',
    category: 'Wi-Fi & Connectivity',
    kicker: 'WI-FI & CONNECTIVITY',
    turnaround: '30-45 Mins Fix',
    warranty: '90-Day Warranty',
    groups: ['network', 'software'],
    aliases: ['no internet / wi-fi dropping', 'wifi adapter missing', 'bluetooth error', 'slow internet'],
    icon: Wifi,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    iconBorder: 'border-cyan-100',
    kickerColor: 'text-cyan-600',
  },
];

interface ProblemPickerProps {
  selectedId?: string | null;
  onSelectProblem?: (problem: ProblemItem) => void;
  mode?: 'navigate' | 'select' | 'modal';
  className?: string;
  enableSearch?: boolean;
  useModal?: boolean;
  services?: ServiceOption[];
  serviceAreas?: ServiceAreaOption[];
}

export default function ProblemPicker({
  selectedId: controlledSelectedId,
  onSelectProblem,
  mode = 'navigate',
  className = '',
  enableSearch = true,
  useModal = true,
  services = [],
  serviceAreas = [],
}: ProblemPickerProps) {
  const router = useRouter();
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for instant Repair Booking Information popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProblem, setModalProblem] = useState<ProblemItem | null>(null);

  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  // Filter problems by category tab and search input query
  const filteredProblems = useMemo(() => {
    return PROBLEMS_DATA.filter((p) => {
      // Category filter check
      if (activeCategory !== 'all' && !p.groups.includes(activeCategory)) {
        return false;
      }

      // Search keyword filter check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSubtitle = p.subtitle.toLowerCase().includes(query);
        const matchesKicker = p.kicker.toLowerCase().includes(query);
        const matchesAlias = p.aliases?.some((a) => a.toLowerCase().includes(query));
        return matchesTitle || matchesSubtitle || matchesKicker || matchesAlias;
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  // Click handler: instantly opens Repair Booking Information Modal with pre-filled problem
  const handleCardClick = (p: ProblemItem) => {
    setInternalSelectedId(p.id);

    if (onSelectProblem) {
      onSelectProblem(p);
    }

    if (useModal) {
      setModalProblem(p);
      setIsModalOpen(true);
      return;
    }

    if (mode === 'navigate') {
      setLoadingId(p.id);
      const targetUrl = `/book-repair?service=${p.serviceSlug}&device=${p.deviceType}&problem=${encodeURIComponent(
        p.title
      )}&problemId=${p.id}`;
      router.push(targetUrl);
    }
  };

  const handleOpenCustomDiagnostic = () => {
    setModalProblem({
      id: 'custom_diagnostic',
      title: 'Custom Diagnostic Inspection',
      subtitle: 'Complete hardware, logic board, and OS inspection by a senior certified engineer.',
      serviceSlug: 'laptop-repair',
      deviceType: 'Laptop',
      category: 'Complete Diagnostic Inspection',
      kicker: 'COMPREHENSIVE DIAGNOSTIC',
      turnaround: 'Same-Day Inspection',
      warranty: '90-Day Warranty',
      groups: ['hardware'],
      icon: Monitor,
      iconBg: 'bg-sky-50',
      iconColor: 'text-[#155EEF]',
      iconBorder: 'border-sky-100',
      kickerColor: 'text-[#155EEF]',
    });
    setIsModalOpen(true);
  };

  // SEO Schema.org ItemList with Service entries
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Doorstep Laptop & Desktop Diagnostic Triage Kolkata',
    description:
      'Common laptop and desktop repair triage categories with 90-day warranty, genuine spare parts, and doorstep service in Kolkata.',
    numberOfItems: PROBLEMS_DATA.length,
    itemListElement: PROBLEMS_DATA.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Service',
        name: `${p.title} (${p.kicker})`,
        description: p.subtitle,
        provider: {
          '@type': 'LocalBusiness',
          name: 'ProTech IT Solutions',
          telephone: '+91 98765 43210',
          areaServed: {
            '@type': 'City',
            name: 'Kolkata',
          },
        },
        serviceType: 'Computer Repair Service',
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          warranty: p.warranty,
        },
      },
    })),
  };

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* Schema.org Structured Data for SEO Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Filter Tabs matching the uploaded design */}
      <div className="flex flex-col items-center gap-4">
        {/* Category Pills Track */}
        <div className="bg-slate-100/90 p-1 rounded-full border border-slate-200/80 inline-flex flex-wrap items-center justify-center gap-1 shadow-2xs max-w-full">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all tap-target ${
              activeCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            All Issues ({PROBLEMS_DATA.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('hardware')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all tap-target ${
              activeCategory === 'hardware'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Hardware & Screen
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('software')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all tap-target ${
              activeCategory === 'software'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Software & Crash
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('battery')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all tap-target ${
              activeCategory === 'battery'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Battery & Power
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('network')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all tap-target ${
              activeCategory === 'network'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            Wi-Fi & Network
          </button>
        </div>

        {/* Quick Symptom Live Search (UX Enhancement) */}
        {enableSearch && (
          <div className="relative w-full max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by symptom (e.g., flickering, coffee, no boot, battery)..."
              aria-label="Search computer issues by symptom"
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 focus:border-[#155EEF] focus:ring-3 focus:ring-[#155EEF]/10 outline-none text-slate-900 placeholder-slate-400 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Responsive 3-Column Desktop / 2-Column Tablet / 1-Column Mobile Grid */}
      {filteredProblems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-xs">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">No direct match for &ldquo;{searchQuery}&rdquo;</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            We handle chip-level motherboards, hinges, keyboards, fans, and over 50+ custom issues.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={handleOpenCustomDiagnostic}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1048bc] rounded-lg transition-colors shadow-xs"
            >
              Describe Custom Problem →
            </button>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="radiogroup"
          aria-label="Select device repair issue"
        >
          {filteredProblems.map((p) => {
            const Icon = p.icon;
            const isSelected =
              selectedId === p.id ||
              selectedId === p.title ||
              p.aliases?.some((a) => a.toLowerCase() === selectedId?.toLowerCase());
            const isLoading = loadingId === p.id;

            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(p);
                  }
                }}
                className={`group relative bg-white rounded-2xl p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155EEF] focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'border-2 border-[#155EEF] ring-4 ring-[#155EEF]/10 bg-blue-50/20 shadow-md shadow-[#155EEF]/10'
                    : 'border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:border-[#155EEF]/50 hover:shadow-[0_16px_32px_-8px_rgba(21,94,239,0.12)] hover:-translate-y-1'
                }`}
              >
                <div>
                  {/* Top Header Row: Icon (52x52) + Device Badge (Laptop) */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Colored Issue Icon Container */}
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0 ${p.iconBg} ${p.iconColor} ${p.iconBorder}`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    {/* Device Badge (Laptop) */}
                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#155EEF] text-white shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/80">
                          <Laptop className="w-3 h-3 text-slate-400" />
                          <span>{p.deviceType}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Eyebrow Kicker matching design */}
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${p.kickerColor}`}
                  >
                    {p.kicker}
                  </div>

                  {/* Primary Issue Title (h3 for semantic hierarchy & SEO) */}
                  <h3
                    className={`font-black text-slate-900 text-lg sm:text-[19px] leading-snug tracking-tight transition-colors ${
                      isSelected ? 'text-[#155EEF]' : 'group-hover:text-[#155EEF]'
                    }`}
                  >
                    {p.title}
                  </h3>

                  {/* Symptom Description Body */}
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed min-h-[3rem]">
                    {p.subtitle}
                  </p>
                </div>

                {/* Footer Meta Row & Clear Action CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100/90">
                  {/* Turnaround Time + Warranty Badge */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.turnaround}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                      <span>{p.warranty}</span>
                    </span>
                  </div>

                  {/* Single High-Conversion CTA Button - Opens Booking Modal */}
                  <div>
                    {isLoading ? (
                      <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#155EEF] flex items-center justify-center gap-2 tap-target shadow-xs">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Opening Booking...</span>
                      </div>
                    ) : isSelected ? (
                      <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#155EEF] shadow-sm flex items-center justify-center gap-2 tap-target">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Selected for Repair Booking</span>
                      </div>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200/90 group-hover:border-[#155EEF] group-hover:bg-[#155EEF] group-hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs tap-target">
                        <span>Select & Book Repair</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety-net conversion bar for complex / unlisted edge-case issues */}
      <div className="bg-gradient-to-r from-sky-50/70 via-white to-sky-50/70 rounded-2xl border border-sky-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#155EEF]/10 text-[#155EEF] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              Facing another issue or not sure what is broken?
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500">
              We fix over 50+ computer issues including hinge breakage, keyboard shorts, bios corruption & data recovery.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenCustomDiagnostic}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#155EEF] bg-white border border-[#155EEF]/30 hover:bg-[#155EEF] hover:text-white transition-all shadow-2xs tap-target"
        >
          <span>Free 2-Min Triage Call</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* Instant Repair Booking Information Modal matching mockup */}
      {/* ======================================================== */}
      <RepairBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        problem={modalProblem}
        services={services}
        serviceAreas={serviceAreas}
      />
    </div>
  );
}