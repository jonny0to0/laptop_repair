'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Calculator,
  ShieldCheck,
  Clock,
  Truck,
  CheckCircle2,
  Wrench,
  Monitor,
  Laptop,
  Cpu,
  Sparkles,
  ArrowRight,
  Phone,
  HelpCircle,
  Zap,
  BatteryCharging,
  Droplet,
  HardDrive,
  Keyboard,
  Flame,
  Check,
} from 'lucide-react';
import { ProblemItem } from './ProblemPicker';

export interface CalculatedRepairQuote {
  deviceType: string;
  brand: string;
  issueId: string;
  issueTitle: string;
  serviceSlug: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  turnaround: string;
  warranty: string;
  tier: string;
}

interface CostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking?: (quote: CalculatedRepairQuote) => void;
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
  hasTiers?: boolean;
  tierOptions?: Array<{ id: string; label: string; priceMultiplier: number }>;
}

const DEVICE_OPTIONS = [
  { id: 'Laptop', label: 'Laptop', desc: 'Windows / Mac / Chrome', icon: Laptop },
  { id: 'Desktop', label: 'Desktop / PC', desc: 'Tower / All-in-One', icon: Monitor },
  { id: 'MacBook', label: 'MacBook', desc: 'Air / Pro / iMac', icon: Cpu },
  { id: 'Gaming Rig', label: 'Gaming PC', desc: 'Custom Rig / High-End', icon: Zap },
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
    description: 'Broken top glass, flickering lines, ink bleed, or pitch black screen',
    baseMin: 2499,
    baseMax: 4800,
    turnaround: '1 - 2 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Monitor,
    iconBg: 'bg-sky-50',
    iconColor: 'text-[#155EEF]',
    hasTiers: true,
    tierOptions: [
      { id: 'hd_standard', label: 'Standard HD Panel (1366x768)', priceMultiplier: 1.0 },
      { id: 'fhd_ips', label: 'Full HD / IPS Anti-Glare (1920x1080)', priceMultiplier: 1.35 },
    ],
  },
  {
    id: 'motherboard_dead',
    name: "Motherboard / Won't Turn On",
    category: 'Power & Logic Board',
    serviceSlug: 'laptop-repair',
    description: 'Completely dead, power LED unlit, power IC / Mosfet chip short circuit',
    baseMin: 1800,
    baseMax: 3500,
    turnaround: '2 - 4 Hours (Same Day)',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Zap,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    id: 'battery_replacement',
    name: 'Battery & Charging Port (DC Jack)',
    category: 'Battery & Power',
    serviceSlug: 'laptop-repair',
    description: 'Battery drains in 30 mins, swollen casing, or loose charger pin',
    baseMin: 1499,
    baseMax: 2800,
    turnaround: '45 - 60 Mins',
    warranty: '90-Day Parts & Labor Warranty',
    icon: BatteryCharging,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    hasTiers: true,
    tierOptions: [
      { id: 'oem_standard', label: 'OEM Grade Compatible Battery', priceMultiplier: 1.0 },
      { id: 'oem_original', label: 'Original Manufacturer Grade Battery', priceMultiplier: 1.4 },
    ],
  },
  {
    id: 'water_liquid_damage',
    name: 'Spilled Liquid / Water Damage Cleanup',
    category: 'Liquid & Water Damage',
    serviceSlug: 'laptop-repair',
    description: 'Emergency ultrasonic chemical wash & micro-corrosion oxidation removal',
    baseMin: 1200,
    baseMax: 2200,
    turnaround: 'Same-Day Priority Triage',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Droplet,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
  {
    id: 'ssd_ram_upgrade',
    name: 'SSD Speed Boost & RAM Upgrade',
    category: 'System & OS Recovery',
    serviceSlug: 'software-os-services',
    description: 'Slow PC, 5-minute boot time. 5X speed boost with NVMe SSD + OS clone',
    baseMin: 1899,
    baseMax: 3499,
    turnaround: '1 - 2 Hours',
    warranty: '3-Year Manufacturer Warranty + 90-Day Labor',
    icon: HardDrive,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    hasTiers: true,
    tierOptions: [
      { id: 'ssd_512gb', label: '512GB Ultra-Fast NVMe SSD + OS Clone', priceMultiplier: 1.0 },
      { id: 'ssd_1tb', label: '1TB High-Performance NVMe SSD + OS Clone', priceMultiplier: 1.55 },
    ],
  },
  {
    id: 'keyboard_hinge_casing',
    name: 'Keyboard, Touchpad or Hinge Repair',
    category: 'Hardware & Body Casing',
    serviceSlug: 'laptop-repair',
    description: 'Sticky/missing keys, cracked screen hinge, damaged body plastics',
    baseMin: 899,
    baseMax: 1899,
    turnaround: '2 - 3 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: Keyboard,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'overheating_fan_thermal',
    name: 'Overheating & Deep Thermal Service',
    category: 'Cooling & Maintenance',
    serviceSlug: 'laptop-repair',
    description: 'Loud fan noise, auto-shutdown. Heatsink de-dusting + Arctic MX-4 paste',
    baseMin: 499,
    baseMax: 899,
    turnaround: '45 Mins',
    warranty: '90-Day Performance Guarantee',
    icon: Flame,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    id: 'software_virus_bsod',
    name: 'Windows Crash, Virus & BSOD Recovery',
    category: 'Software & OS Recovery',
    serviceSlug: 'software-os-services',
    description: 'Blue Screen of Death, malware infection, boot loop, clean OS install',
    baseMin: 399,
    baseMax: 699,
    turnaround: '1 - 2 Hours',
    warranty: '30-Day Software Stability Guarantee',
    icon: Cpu,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
];

export default function CostCalculatorModal({
  isOpen,
  onClose,
  onProceedToBooking,
}: CostCalculatorModalProps) {
  // State
  const [selectedDevice, setSelectedDevice] = useState<string>('Laptop');
  const [selectedBrand, setSelectedBrand] = useState<string>('Dell');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('screen_replacement');
  const [selectedTierId, setSelectedTierId] = useState<string>('');

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

  // Selected issue item
  const activeIssue = useMemo(() => {
    return REPAIR_ISSUES.find((i) => i.id === selectedIssueId) || REPAIR_ISSUES[0];
  }, [selectedIssueId]);

  // Reset or select default tier when issue changes
  useEffect(() => {
    if (activeIssue.hasTiers && activeIssue.tierOptions && activeIssue.tierOptions.length > 0) {
      setSelectedTierId(activeIssue.tierOptions[0].id);
    } else {
      setSelectedTierId('');
    }
  }, [activeIssue]);

  // Dynamic price calculation
  const calculatedEstimate = useMemo(() => {
    let multiplier = 1.0;

    // Device multiplier
    if (selectedDevice === 'MacBook' || selectedBrand === 'Apple') {
      multiplier *= 1.35; // Genuine Apple architecture
    } else if (selectedDevice === 'Gaming Rig') {
      multiplier *= 1.15; // High-wattage / gaming parts
    } else if (selectedDevice === 'Desktop') {
      multiplier *= 0.95; // Desktop parts often have standard form-factors
    }

    // Part quality / tier multiplier if applicable
    if (activeIssue.hasTiers && activeIssue.tierOptions) {
      const activeTier = activeIssue.tierOptions.find((t) => t.id === selectedTierId);
      if (activeTier) {
        multiplier *= activeTier.priceMultiplier;
      }
    }

    const minRounded = Math.round((activeIssue.baseMin * multiplier) / 50) * 50;
    const maxRounded = Math.round((activeIssue.baseMax * multiplier) / 50) * 50;

    return {
      min: minRounded,
      max: maxRounded,
      turnaround: activeIssue.turnaround,
      warranty: activeIssue.warranty,
    };
  }, [activeIssue, selectedDevice, selectedBrand, selectedTierId]);

  if (!isOpen) return null;

  const handleBookWithEstimate = () => {
    if (onProceedToBooking) {
      onProceedToBooking({
        deviceType: selectedDevice,
        brand: selectedBrand,
        issueId: activeIssue.id,
        issueTitle: activeIssue.name,
        serviceSlug: activeIssue.serviceSlug,
        estimatedPriceMin: calculatedEstimate.min,
        estimatedPriceMax: calculatedEstimate.max,
        turnaround: calculatedEstimate.turnaround,
        warranty: calculatedEstimate.warranty,
        tier: selectedTierId,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-md p-2.5 sm:p-5 md:p-8 overscroll-contain animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-modal-title"
    >
      {/* Centering Flex Wrapper: items-start ensures the top header is never clipped */}
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-8">
        
        {/* Main Modal Card */}
        <div
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/30 overflow-hidden transform transition-all text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Header */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 sm:px-8 py-3.5 border-b border-slate-100 flex items-center justify-between shadow-2xs">
            {/* Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all tap-target group"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all" />
              <span>Back</span>
            </button>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#0284C7] bg-sky-50 border border-sky-200/80">
              <Calculator className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Instant Cost Calculator • Kolkata</span>
            </div>

            {/* Close X Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors tap-target"
              aria-label="Close calculator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-8 md:p-9 space-y-7">
            
            {/* Header Titles */}
            <div className="space-y-1.5">
              <h2
                id="calculator-modal-title"
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
              >
                Calculate Your Repair Cost
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                Choose your device, brand, and problem to get an instant, transparent price estimate with turnaround time and genuine parts warranty.
              </p>
            </div>

            {/* Step 1: Device Type Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                1. Select Device Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {DEVICE_OPTIONS.map((dev) => {
                  const DevIcon = dev.icon;
                  const isSelected = selectedDevice === dev.id;
                  return (
                    <button
                      key={dev.id}
                      type="button"
                      onClick={() => setSelectedDevice(dev.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all tap-target flex flex-col justify-between ${
                        isSelected
                          ? 'border-2 border-[#155EEF] bg-blue-50/30 ring-2 ring-[#155EEF]/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#155EEF] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <DevIcon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#155EEF] stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{dev.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{dev.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Brand Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                2. Select Brand / Manufacturer
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {BRAND_OPTIONS.map((brandName) => {
                  const isSelected = selectedBrand === brandName;
                  return (
                    <button
                      key={brandName}
                      type="button"
                      onClick={() => setSelectedBrand(brandName)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all tap-target ${
                        isSelected
                          ? 'bg-[#155EEF] text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                      }`}
                    >
                      {brandName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Repair Issue Grid */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                3. What needs fixing? (Choose Your Symptom)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {REPAIR_ISSUES.map((issue) => {
                  const IssueIcon = issue.icon;
                  const isSelected = selectedIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedIssueId(issue.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedIssueId(issue.id);
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 tap-target ${
                        isSelected
                          ? 'border-2 border-[#155EEF] bg-blue-50/25 ring-2 ring-[#155EEF]/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60 ${issue.iconBg} ${issue.iconColor}`}
                      >
                        <IssueIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {issue.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#155EEF] shrink-0 stroke-[3]" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                          {issue.description}
                        </p>
                        <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                          Starts at ₹{issue.baseMin.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Step 4: Tier Selection if issue has options */}
            {activeIssue.hasTiers && activeIssue.tierOptions && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Select Part / Quality Grade
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeIssue.tierOptions.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold border transition-all flex items-center justify-between tap-target ${
                          isSelected
                            ? 'bg-white border-[#155EEF] text-[#155EEF] shadow-xs ring-1 ring-[#155EEF]/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{tier.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#155EEF]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Calculated Estimate Display Box */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-900 text-white rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                    Calculated Doorstep Repair Estimate
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    {selectedBrand} {selectedDevice} • {activeIssue.name}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400">Estimated Price Range</div>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight text-emerald-400">
                    ₹{calculatedEstimate.min.toLocaleString('en-IN')} – ₹{calculatedEstimate.max.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    *Taxes & labor included. Exact quote confirmed after diagnostic.
                  </div>
                </div>
              </div>

              {/* Estimate Perks & Guarantees */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Turnaround</span>
                    <span className="font-bold text-slate-200">{calculatedEstimate.turnaround}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Warranty</span>
                    <span className="font-bold text-slate-200">90-Day Included</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pickup & Return</span>
                    <span className="font-bold text-slate-200">Free in Kolkata</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Inspection</span>
                    <span className="font-bold text-slate-200">Zero Fee Walk-in</span>
                  </div>
                </div>
              </div>

              {/* Conversion Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No upfront payment. You only pay after complete repair and testing.</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href="tel:+919876543210"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors tap-target"
                    title="Speak with a Senior Repair Technician"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Tech</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleBookWithEstimate}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#155EEF] hover:bg-[#1048bc] active:bg-[#0c3894] transition-all shadow-md shadow-blue-500/30 tap-target group"
                  >
                    <span>Book Repair with this Estimate</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}