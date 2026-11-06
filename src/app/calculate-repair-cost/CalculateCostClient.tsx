'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Laptop,
  Monitor,
  Cpu,
  Zap,
  Check,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  HelpCircle,
  BatteryCharging,
  Droplet,
  HardDrive,
  Keyboard,
  Flame,
  Wrench,
  ChevronRight,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import RepairBookingModal, { ServiceOption, ServiceAreaOption } from '@/components/RepairBookingModal';
import { ProblemItem } from '@/components/ProblemPicker';

export interface DynamicCalculatorItem {
  id: number;
  code: string;
  name: string;
  category: string;
  serviceSlug: string;
  description: string;
  baseMin: number;
  baseMax: number;
  turnaround: string;
  warranty: string;
  icon: string;
  tag: string | null;
  sortOrder: number;
  isActive: boolean;
  tierOptionsJson: string | null;
}

export interface DynamicDeviceOption {
  id: string;
  label: string;
  tagline: string;
  badge?: string;
  multiplier: number;
}

interface CalculateCostClientProps {
  services: ServiceOption[];
  serviceAreas: ServiceAreaOption[];
  phone: string;
  whatsapp: string;
  calculatorItems?: DynamicCalculatorItem[];
  calculatorDevices?: DynamicDeviceOption[];
  calculatorBrands?: string[];
  calculatorBrandMultipliers?: Record<string, number>;
  calculatorBrandCategoryCosts?: Record<
    string,
    Record<string, { multiplier: number; min?: number; max?: number }>
  >;
}

interface RepairIssueOption {
  id: string;
  name: string;
  category: string;
  serviceSlug: string;
  description: string;
  baseMin: number;
  baseMax: number;
  turnaround: string;
  warranty: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  tag?: string;
  hasTiers?: boolean;
  tierOptions?: Array<{ id: string; label: string; priceMultiplier: number; note?: string }>;
}

const DYNAMIC_ICON_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }
> = {
  Monitor: { icon: Monitor, bg: 'bg-sky-50', color: 'text-[#155EEF]' },
  BatteryCharging: { icon: BatteryCharging, bg: 'bg-amber-50', color: 'text-amber-600' },
  Cpu: { icon: Cpu, bg: 'bg-rose-50', color: 'text-rose-600' },
  Droplet: { icon: Droplet, bg: 'bg-blue-50', color: 'text-blue-600' },
  HardDrive: { icon: HardDrive, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  Keyboard: { icon: Keyboard, bg: 'bg-purple-50', color: 'text-purple-600' },
  Flame: { icon: Flame, bg: 'bg-orange-50', color: 'text-orange-600' },
  Wrench: { icon: Wrench, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  Laptop: { icon: Laptop, bg: 'bg-sky-50', color: 'text-sky-600' },
  Zap: { icon: Zap, bg: 'bg-indigo-50', color: 'text-indigo-600' },
};

const DEVICE_OPTIONS = [
  {
    id: 'Laptop',
    label: 'Laptop',
    tagline: 'Windows / Mac / Chromebook',
    badge: 'Most Popular',
    icon: Laptop,
    accent: 'border-blue-500 bg-blue-50/30 text-blue-700',
  },
  {
    id: 'Desktop',
    label: 'Desktop / PC',
    tagline: 'Tower / All-in-One PC',
    badge: 'Fast Triage',
    icon: Monitor,
    accent: 'border-sky-500 bg-sky-50/30 text-sky-700',
  },
  {
    id: 'MacBook',
    label: 'Apple MacBook',
    tagline: 'Air / Pro / M1-M3 / Intel',
    badge: 'Retina & Silicon',
    icon: Cpu,
    accent: 'border-slate-800 bg-slate-100 text-slate-900',
  },
  {
    id: 'Gaming Rig',
    label: 'Gaming PC',
    tagline: 'Custom Rig / High-End GPU',
    badge: 'High Performance',
    icon: Zap,
    accent: 'border-indigo-500 bg-indigo-50/30 text-indigo-700',
  },
];

const BRAND_OPTIONS = [
  'Dell',
  'HP',
  'Lenovo',
  'ASUS',
  'Acer',
  'Apple',
  'MSI',
  'Samsung',
  'Toshiba',
  'Other Brand',
];

const REPAIR_ISSUES: RepairIssueOption[] = [
  {
    id: 'screen_replacement',
    name: 'Screen / Display Replacement',
    category: 'Display & Glass Panel',
    serviceSlug: 'laptop-repair',
    description: 'Cracked glass, glitching horizontal lines, ink bleed, or pitch black screen',
    baseMin: 2499,
    baseMax: 4800,
    turnaround: '1 - 2 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Monitor,
    iconBg: 'bg-sky-50',
    iconColor: 'text-[#155EEF]',
    tag: 'Quick 2-Hour Swap',
    hasTiers: true,
    tierOptions: [
      { id: 'screen_standard', label: 'OEM Standard HD Screen (Grade A)', priceMultiplier: 1.0, note: 'Best value replacement' },
      { id: 'screen_ips', label: 'FHD / IPS 144Hz High-Gamut Panel', priceMultiplier: 1.35, note: 'Vibrant color reproduction' },
      { id: 'screen_oem_plus', label: 'Original Manufacturer Grade (Apple / Dell)', priceMultiplier: 1.7, note: 'Factory original specs' },
    ],
  },
  {
    id: 'battery_replacement',
    name: 'Battery & Charging Port Fix',
    category: 'Battery & Charging',
    serviceSlug: 'laptop-repair',
    description: 'Rapid drain in under 30 mins, swollen battery case, loose Type-C or DC jack pin',
    baseMin: 1499,
    baseMax: 2999,
    turnaround: '45 - 60 Mins',
    warranty: '90-Day Parts & Labor Warranty',
    icon: BatteryCharging,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    tag: 'Same-Day Swap',
    hasTiers: true,
    tierOptions: [
      { id: 'battery_standard', label: 'Standard High-Capacity Battery', priceMultiplier: 1.0, note: 'Grade A cells' },
      { id: 'battery_genuine', label: 'Genuine Grade Long-Life Battery', priceMultiplier: 1.4, note: 'Maximum cycle life' },
      { id: 'battery_port_only', label: 'Type-C / DC Charging Port Repair Only', priceMultiplier: 0.85, note: 'Component soldering fix' },
    ],
  },
  {
    id: 'motherboard_repair',
    name: 'Motherboard Chip-Level Repair',
    category: 'Power & Logic Board',
    serviceSlug: 'laptop-repair',
    description: 'Completely dead, no power LED light, short circuits, or sudden automatic shutdown',
    baseMin: 1800,
    baseMax: 4500,
    turnaround: 'Same-Day Diagnostic',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Cpu,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    tag: 'Micro-Soldering Lab',
    hasTiers: true,
    tierOptions: [
      { id: 'mb_power_ic', label: 'Power IC & MOSFET Chip Repair', priceMultiplier: 1.0, note: 'Fixes charging & startup logic' },
      { id: 'mb_bios', label: 'BIOS Reprogramming & IO Controller', priceMultiplier: 1.15, note: 'Firmware & sensor recovery' },
      { id: 'mb_reball', label: 'Full Component Re-balling & Track Restoration', priceMultiplier: 1.5, note: 'Severe board short-circuit' },
    ],
  },
  {
    id: 'liquid_damage',
    name: 'Spilled Liquid & Water Damage Clean',
    category: 'Liquid & Water Damage',
    serviceSlug: 'laptop-repair',
    description: 'Accidental water, tea, coffee, or juice spill causing short circuits or sticky keyboard',
    baseMin: 1200,
    baseMax: 3200,
    turnaround: 'Urgent Ultrasonic Clean',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Droplet,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    tag: 'Ultrasonic Bath',
    hasTiers: true,
    tierOptions: [
      { id: 'liquid_clean', label: 'Chemical Wash & Ultrasonic Board Deoxidation', priceMultiplier: 1.0, note: 'Corrosion removal & drying' },
      { id: 'liquid_clean_parts', label: 'Liquid Deoxidation + Keypad / Trackpad Repair', priceMultiplier: 1.6, note: 'Includes input repairs' },
    ],
  },
  {
    id: 'ssd_ram_upgrade',
    name: 'NVMe SSD & High-Speed RAM Upgrade',
    category: 'Hardware & Storage',
    serviceSlug: 'laptop-repair',
    description: 'Supercharge slow boot times, eliminate 100% disk usage, and upgrade to lightning NVMe',
    baseMin: 1850,
    baseMax: 4200,
    turnaround: '30 - 45 Mins',
    warranty: '90-Day Parts & Labor Warranty',
    icon: HardDrive,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    tag: '5x Speed Boost',
    hasTiers: true,
    tierOptions: [
      { id: 'ssd_512', label: '512GB Ultra NVMe SSD (up to 3,500 MB/s)', priceMultiplier: 1.0, note: 'Includes OS migration' },
      { id: 'ssd_1tb', label: '1TB Gen4 High-Speed NVMe (up to 7,000 MB/s)', priceMultiplier: 1.65, note: 'Maximum storage & speed' },
      { id: 'ram_16gb', label: '16GB DDR4 / DDR5 High-Speed RAM Upgrade', priceMultiplier: 1.25, note: 'Smooth multitasking' },
    ],
  },
  {
    id: 'keyboard_hinge',
    name: 'Keyboard & Broken Hinge Fabrication',
    category: 'Chassis & Keyboard',
    serviceSlug: 'laptop-repair',
    description: 'Broken plastic screen hinges, chassis coming apart, stuck or missing keys',
    baseMin: 1199,
    baseMax: 2600,
    turnaround: '1 - 2 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Keyboard,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    tag: 'Reinforced Steel Bushing',
    hasTiers: true,
    tierOptions: [
      { id: 'hinge_fix', label: 'Broken Hinge Reinforcement & Base Fabrication', priceMultiplier: 1.0, note: 'Heavy-duty steel binding' },
      { id: 'kb_replace', label: 'Full Backlit Keyboard Replacement', priceMultiplier: 1.35, note: 'Genuine brand layout' },
    ],
  },
  {
    id: 'thermal_service',
    name: 'Thermal Servicing & Overheating Fix',
    category: 'Thermal & Cooling',
    serviceSlug: 'laptop-repair',
    description: 'Loud roaring fan, laptop burning hot to touch, thermal throttling while working or gaming',
    baseMin: 799,
    baseMax: 1499,
    turnaround: '45 Mins Service',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Flame,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    tag: 'Arctic MX-4 Paste',
    hasTiers: true,
    tierOptions: [
      { id: 'thermal_standard', label: 'Deep Heat-Sink De-dusting + Arctic MX-4 Paste', priceMultiplier: 1.0, note: 'Drops temp by 15-20°C' },
      { id: 'thermal_dual_fan', label: 'Dual Cooling Fan Replacement + Thermal Pads', priceMultiplier: 1.8, note: 'Gaming / high-performance' },
    ],
  },
  {
    id: 'os_software_bsod',
    name: 'OS Recovery, Virus & BSOD Crash Fix',
    category: 'System & Software',
    serviceSlug: 'software-os-services',
    description: 'Blue Screen of Death (BSOD), endless reboot loops, malware removal, or driver errors',
    baseMin: 699,
    baseMax: 1299,
    turnaround: '1 - 2 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Wrench,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    tag: 'Clean Genuine Setup',
    hasTiers: true,
    tierOptions: [
      { id: 'os_clean_install', label: 'Genuine Windows 11 / macOS Clean Reinstall', priceMultiplier: 1.0, note: 'Includes drivers & updates' },
      { id: 'os_virus_backup', label: 'Full Malware Disinfection + 100% Data Protection', priceMultiplier: 1.3, note: 'Keeps all files intact' },
    ],
  },
];

export default function CalculateCostClient({
  services,
  serviceAreas,
  phone,
  whatsapp,
  calculatorItems,
  calculatorDevices,
  calculatorBrands,
  calculatorBrandMultipliers,
  calculatorBrandCategoryCosts,
}: CalculateCostClientProps) {
  // Dynamic Devices
  const deviceOptions = useMemo(() => {
    if (calculatorDevices && calculatorDevices.length > 0) {
      return calculatorDevices.map((d) => {
        let IconComp = Laptop;
        let accent = 'border-blue-500 bg-blue-50/30 text-blue-700';
        if (d.id === 'Desktop') {
          IconComp = Monitor;
          accent = 'border-sky-500 bg-sky-50/30 text-sky-700';
        } else if (d.id === 'MacBook') {
          IconComp = Cpu;
          accent = 'border-slate-800 bg-slate-100 text-slate-900';
        } else if (d.id === 'Gaming Rig') {
          IconComp = Zap;
          accent = 'border-indigo-500 bg-indigo-50/30 text-indigo-700';
        }
        return {
          id: d.id,
          label: d.label,
          tagline: d.tagline,
          badge: d.badge || '',
          icon: IconComp,
          accent,
          multiplier: d.multiplier,
        };
      });
    }
    return DEVICE_OPTIONS.map((d) => ({
      ...d,
      multiplier: d.id === 'MacBook' ? 1.35 : d.id === 'Gaming Rig' ? 1.15 : d.id === 'Desktop' ? 0.95 : 1.0,
    }));
  }, [calculatorDevices]);

  // Dynamic Brands
  const brandOptions = useMemo(() => {
    return calculatorBrands && calculatorBrands.length > 0 ? calculatorBrands : BRAND_OPTIONS;
  }, [calculatorBrands]);

  // Dynamic Issues
  const repairIssues: RepairIssueOption[] = useMemo(() => {
    if (calculatorItems && calculatorItems.length > 0) {
      return calculatorItems.map((item) => {
        const iconConfig = DYNAMIC_ICON_CONFIG[item.icon] || {
          icon: Wrench,
          bg: 'bg-indigo-50',
          color: 'text-indigo-600',
        };
        let tiers: Array<{ id: string; label: string; priceMultiplier: number; note?: string }> = [];
        if (item.tierOptionsJson) {
          try {
            tiers = JSON.parse(item.tierOptionsJson);
          } catch (e) {
            console.error('Failed to parse tier options:', e);
          }
        }
        return {
          id: item.code,
          name: item.name,
          category: item.category,
          serviceSlug: item.serviceSlug,
          description: item.description,
          baseMin: item.baseMin,
          baseMax: item.baseMax,
          turnaround: item.turnaround,
          warranty: item.warranty,
          icon: iconConfig.icon,
          iconBg: iconConfig.bg,
          iconColor: iconConfig.color,
          tag: item.tag || undefined,
          hasTiers: tiers.length > 0,
          tierOptions: tiers,
        };
      });
    }
    return REPAIR_ISSUES;
  }, [calculatorItems]);

  // Selections
  const [selectedDevice, setSelectedDevice] = useState<string>(
    deviceOptions[0]?.id || 'Laptop'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    brandOptions[0] || 'Dell'
  );
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    repairIssues[0]?.id || 'screen_replacement'
  );
  const [selectedTierId, setSelectedTierId] = useState<string>('screen_standard');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingProblem, setBookingProblem] = useState<ProblemItem | null>(null);

  // Active Issue
  const activeIssue = useMemo(() => {
    return repairIssues.find((i) => i.id === selectedIssueId) || repairIssues[0] || REPAIR_ISSUES[0];
  }, [repairIssues, selectedIssueId]);

  // Reset or select default tier when issue changes
  useEffect(() => {
    if (activeIssue.hasTiers && activeIssue.tierOptions && activeIssue.tierOptions.length > 0) {
      setSelectedTierId(activeIssue.tierOptions[0].id);
    } else {
      setSelectedTierId('');
    }
  }, [activeIssue]);

  // Helper to extract brand multiplier for a given category
  const getBrandMultiplier = (brand: string, category: string): number => {
    const rawRule = calculatorBrandCategoryCosts?.[brand]?.[category];
    if (typeof rawRule === 'number') {
      return rawRule;
    }
    if (rawRule && typeof rawRule === 'object' && typeof rawRule.multiplier === 'number') {
      return rawRule.multiplier;
    }
    return calculatorBrandMultipliers?.[brand] ?? 1.0;
  };

  // Pricing calculation
  const calculatedEstimate = useMemo(() => {
    let multiplier = 1.0;
    const baseMin = activeIssue.baseMin;
    const baseMax = activeIssue.baseMax;

    // 1. Brand multiplier applied directly to the master Catalog Base Estimate
    const brandMult = getBrandMultiplier(selectedBrand, activeIssue.category);
    multiplier *= brandMult;

    // 2. Device architecture multiplier
    const dev = deviceOptions.find((d) => d.id === selectedDevice);
    if (dev) {
      if (selectedDevice === 'MacBook' && selectedBrand === 'Apple') {
        multiplier *= 1.0;
      } else {
        multiplier *= dev.multiplier;
      }
    }

    // 3. Part quality / tier multiplier
    if (activeIssue.hasTiers && activeIssue.tierOptions) {
      const activeTier = activeIssue.tierOptions.find((t) => t.id === selectedTierId);
      if (activeTier) {
        multiplier *= activeTier.priceMultiplier;
      }
    }

    const minRounded = Math.round((baseMin * multiplier) / 50) * 50;
    const maxRounded = Math.round((baseMax * multiplier) / 50) * 50;

    return {
      min: minRounded,
      max: maxRounded,
      brandMultiplier: brandMult,
      turnaround: activeIssue.turnaround,
      warranty: activeIssue.warranty,
    };
  }, [
    activeIssue,
    deviceOptions,
    selectedDevice,
    selectedBrand,
    selectedTierId,
    calculatorBrandMultipliers,
    calculatorBrandCategoryCosts,
  ]);

  const activeTierLabel = useMemo(() => {
    if (!activeIssue.hasTiers || !activeIssue.tierOptions) return '';
    const tier = activeIssue.tierOptions.find((t) => t.id === selectedTierId);
    return tier ? tier.label : '';
  }, [activeIssue, selectedTierId]);

  // Handle open booking modal with estimate prefilled
  const handleProceedToBooking = () => {
    const syntheticProblem: ProblemItem = {
      id: activeIssue.id,
      title: `${activeIssue.name} (${selectedBrand} ${selectedDevice})`,
      subtitle: `Calculated estimate: ₹${calculatedEstimate.min.toLocaleString('en-IN')} – ₹${calculatedEstimate.max.toLocaleString('en-IN')}${
        activeTierLabel ? ` • ${activeTierLabel}` : ''
      } (${calculatedEstimate.turnaround}, ${calculatedEstimate.warranty})`,
      serviceSlug: activeIssue.serviceSlug || 'laptop-repair',
      deviceType: selectedDevice,
      category: activeIssue.category,
      kicker: `${selectedBrand} ${selectedDevice}`,
      turnaround: calculatedEstimate.turnaround,
      warranty: calculatedEstimate.warranty,
      groups: ['all'],
      icon: activeIssue.icon,
      iconBg: activeIssue.iconBg,
      iconColor: activeIssue.iconColor,
      iconBorder: 'border-slate-200',
      kickerColor: activeIssue.iconColor,
    };

    setBookingProblem(syntheticProblem);
    setIsBookingModalOpen(true);
  };

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* ================= TOP BREADCRUMB & CASUAL HEADER ================= */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#155EEF] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Repair Cost Calculator</span>
          </nav>

          {/* Friendly Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-[#155EEF] to-blue-700 text-white p-6 sm:p-10 shadow-xl shadow-blue-500/10">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-10 w-60 h-60 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Instant Honest Pricing • Zero Hidden Charges</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Calculate Your Repair Cost in Seconds.
              </h1>

              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                No awkward billing or surprise invoices. Pick your gear, manufacturer, and what seems to be acting up to see realistic Kolkata repair pricing, turnaround times, and 90-day warranty coverage upfront.
              </p>

              {/* Casual Guarantees Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/95">
                <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Free Diagnostics Walk-in
                </span>
                <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  90-Day Parts & Labor Warranty
                </span>
                <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                  <Truck className="w-4 h-4 text-amber-300" />
                  Free Doorstep Pickup Across Kolkata
                </span>
                <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                  <Check className="w-4 h-4 text-sky-200" />
                  100% No Fix, No Pay Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAIN CALCULATOR WORKSPACE (2 Columns on Desktop) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: STEP-BY-STEP TRIAGE (8 Cols) ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: DEVICE SELECTION */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#155EEF] font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      What machine are we working on?
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tap your device type to tune component specs and labor estimates.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Large Device Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {deviceOptions.map((dev) => {
                  const Icon = dev.icon;
                  const isSelected = selectedDevice === dev.id;
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setSelectedDevice(dev.id)}
                      className={`relative p-4 rounded-2xl border text-left transition-all tap-target flex flex-col justify-between cursor-pointer group ${
                        isSelected
                          ? 'border-2 border-[#155EEF] bg-blue-50/40 shadow-sm ring-2 ring-blue-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isSelected
                              ? 'bg-[#155EEF] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#155EEF] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {dev.badge}
                        </span>
                        <div className="font-bold text-sm text-slate-900 mt-0.5">
                          {dev.label}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {dev.tagline}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: BRAND SELECTION */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#155EEF] font-black text-sm flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Who manufactured your device?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Different brands use specific display panels, pinouts, and batteries.
                  </p>
                </div>
              </div>

              {/* Brand Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {brandOptions.map((brand) => {
                  const isSelected = selectedBrand === brand;
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer tap-target flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#155EEF] bg-[#155EEF] text-white shadow-sm shadow-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{brand}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: SYMPTOM / ISSUE SELECTION */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#155EEF] font-black text-sm flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      What seems to be the problem?
                    </h2>
                    <p className="text-xs text-slate-500">
                      Choose the closest symptom below. We will provide an exact quote after diagnostic inspection.
                    </p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-[#155EEF] hidden sm:block">
                  {repairIssues.length} Available Diagnostics
                </div>
              </div>

              {/* Dynamic Issue Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {repairIssues.map((issue) => {
                  const IssueIcon = issue.icon;
                  const isSelected = selectedIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedIssueId(issue.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedIssueId(issue.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 tap-target text-left group ${
                        isSelected
                          ? 'border-2 border-[#155EEF] bg-blue-50/30 ring-2 ring-blue-500/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/70 transition-transform group-hover:scale-105 ${issue.iconBg} ${issue.iconColor}`}
                      >
                        <IssueIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 text-sm line-clamp-1">
                            {issue.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#155EEF] shrink-0 stroke-[3]" />
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                          {(() => {
                            const bMult = getBrandMultiplier(selectedBrand, issue.category);
                            const startsAt = Math.round((issue.baseMin * bMult) / 50) * 50;
                            return (
                              <div className="flex flex-col">
                                <span className="font-bold text-emerald-600 text-xs">
                                  Starts at ₹{startsAt.toLocaleString('en-IN')}{' '}
                                  <span className="text-[10px] font-normal text-slate-500">
                                    ({selectedBrand})
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  Base Estimate: ₹{issue.baseMin.toLocaleString('en-IN')} – ₹{issue.baseMax.toLocaleString('en-IN')}
                                </span>
                              </div>
                            );
                          })()}
                          {issue.tag && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                              {issue.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: PART QUALITY / GRADE TIERS (If available) */}
            {activeIssue.hasTiers && activeIssue.tierOptions && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-[#155EEF] font-black text-sm flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Select Part Grade or Specification Tier
                    </h2>
                    <p className="text-xs text-slate-500">
                      Customize according to your budget or performance expectations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {activeIssue.tierOptions.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer tap-target flex flex-col justify-between ${
                          isSelected
                            ? 'border-2 border-[#155EEF] bg-blue-50/40 ring-1 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 leading-snug">
                            {tier.label}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#155EEF] shrink-0 stroke-[3]" />
                          )}
                        </div>
                        {tier.note && (
                          <div className="text-[10px] text-slate-500 mt-2 font-medium">
                            {tier.note}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CASUAL FAQ & TRANSPARENT PRICING GUARANTEE */}
            <div className="bg-slate-100/70 rounded-3xl p-6 sm:p-7 border border-slate-200/70 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Info className="w-4 h-4 text-[#155EEF]" />
                <span>How Our Transparent Pricing Works</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
                <div className="space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    1. Zero Walk-in Diagnostic Fee
                  </strong>
                  You can bring your laptop to our workshop or book courier pickup. We physically inspect first and give an exact quotation before touching a screw.
                </div>
                <div className="space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    2. No Fix, No Pay Policy
                  </strong>
                  If a motherboard or water-damaged chip cannot be restored to healthy working condition, you owe us nothing. 100% guarantee.
                </div>
                <div className="space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    3. Genuine Replacement Parts
                  </strong>
                  We use OEM-grade panels, genuine batteries, and verified power controllers backed by up to 90 days replacement warranty.
                </div>
                <div className="space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    4. Fast Doorstep Pickup in Kolkata
                  </strong>
                  Can't leave your office or home? Safe boxed courier pickup is free across Salt Lake, New Town, South & North Kolkata.
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: STICKY COMPACT ESTIMATE CARD (4 Cols) ================= */}
          <div className="lg:col-span-4 sticky top-24 space-y-3 max-w-[380px] w-full lg:ml-auto">
            
            {/* Main Calculated Quote Box */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-[#091122] text-white p-4 sm:p-5 shadow-xl border border-slate-800/90 ring-1 ring-white/10 space-y-3.5">
              
              {/* Subtle ambient decorative glows */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-3.5">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-bold text-sky-400 tracking-wider uppercase">
                      Live Repair Estimate
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] font-medium text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-sky-400" />
                    <span>Kolkata Zone</span>
                  </div>
                </div>

                {/* Selected Hardware Summary */}
                <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-700/50 backdrop-blur-sm space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Selected Gear</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      {selectedBrand}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white tracking-tight">
                    {selectedBrand} {selectedDevice}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-sky-300 pt-0.5">
                    <activeIssue.icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{activeIssue.name}</span>
                    {activeTierLabel && (
                      <span className="text-[10px] text-slate-400 font-normal truncate">
                        • {activeTierLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Calculated Price Display */}
                <div className="relative rounded-xl bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80 p-3.5 border border-slate-800/90 shadow-inner space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Estimated Repair Cost</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Parts + Labor Included
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 tracking-tight py-0.5">
                    ₹{calculatedEstimate.min.toLocaleString('en-IN')} – ₹{calculatedEstimate.max.toLocaleString('en-IN')}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 leading-tight pt-1 border-t border-slate-800/70">
                    <Info className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">
                      Confirmed after diagnostic triage. Zero upfront charge.
                    </span>
                  </div>
                </div>

                {/* 4 Guarantee Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block leading-tight">Turnaround</span>
                      <span className="font-bold text-slate-200 truncate block text-[11px] leading-tight">{calculatedEstimate.turnaround}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block leading-tight">Warranty</span>
                      <span className="font-bold text-slate-200 truncate block text-[11px] leading-tight">{calculatedEstimate.warranty || '90 Days Included'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block leading-tight">Pickup & Drop</span>
                      <span className="font-bold text-slate-200 truncate block text-[11px] leading-tight">Free in Kolkata</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 block leading-tight">No Fix No Pay</span>
                      <span className="font-bold text-slate-200 truncate block text-[11px] leading-tight">100% Refundable</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-0.5">
                  <button
                    type="button"
                    onClick={handleProceedToBooking}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#155EEF] via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 ring-1 ring-white/20 tap-target cursor-pointer group"
                  >
                    <span>Book Repair with this Estimate</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-all hover:text-white tap-target"
                    >
                      <Phone className="w-3.5 h-3.5 text-sky-400" />
                      <span>Call Technician</span>
                    </a>

                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                        `Hi TechFix! I calculated repair cost for ${selectedBrand} ${selectedDevice} (${activeIssue.name}) around ₹${calculatedEstimate.min} - ₹${calculatedEstimate.max}. Can you help me?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/50 transition-all hover:text-emerald-200 tap-target"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Tech</span>
                    </a>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-0.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Pay only after complete fix & verification</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs text-[11px] text-slate-600 space-y-0.5">
              <span className="font-bold text-slate-900 block">Need a custom business quote?</span>
              <p className="text-[10px] text-slate-500">
                For corporate fleets, multiple PCs, or AMCs,{' '}
                <Link href="/contact" className="text-[#155EEF] font-semibold underline underline-offset-2">
                  contact our enterprise team.
                </Link>
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ================= MOBILE BOTTOM FLOATING ESTIMATE DOCK ================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-slate-400 truncate">
            {selectedBrand} {selectedDevice} • {activeIssue.name}
          </div>
          <div className="text-lg font-black text-emerald-400">
            ₹{calculatedEstimate.min.toLocaleString('en-IN')} – ₹{calculatedEstimate.max.toLocaleString('en-IN')}
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceedToBooking}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3894] transition-all shadow-md shadow-blue-500/25 tap-target shrink-0"
        >
          <span>Book Estimate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ================= REPAIR BOOKING MODAL ================= */}
      <RepairBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        problem={bookingProblem}
        services={services}
        serviceAreas={serviceAreas}
        isFromCalculator={true}
        selectedBrand={selectedBrand}
        selectedDevice={selectedDevice}
        estimateRange={`₹${calculatedEstimate.min.toLocaleString('en-IN')} – ₹${calculatedEstimate.max.toLocaleString('en-IN')}`}
      />
    </div>
  );
}
