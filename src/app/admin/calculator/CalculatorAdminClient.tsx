'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Tag,
  AlertCircle,
  ExternalLink,
  Laptop,
  Monitor,
  Cpu,
  Zap,
  BatteryCharging,
  Droplet,
  HardDrive,
  Keyboard,
  Flame,
  Wrench,
  Layers,
  Percent,
  Sliders,
  Play,
  RotateCcw,
  Check,
  X,
  Building2,
  Grid,
  Info,
  TrendingUp,
} from 'lucide-react';

export interface TierOption {
  id: string;
  label: string;
  priceMultiplier: number;
  note?: string;
}

export interface CalculatorItem {
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
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DeviceOption {
  id: string;
  label: string;
  tagline: string;
  badge?: string;
  multiplier: number;
}

interface ServiceOption {
  id: number;
  name: string;
  slug: string;
}

// Brand rule can be a direct number multiplier or { multiplier: number }
export type BrandCategoryCostRule = number | { multiplier: number; min?: number; max?: number };

interface CalculatorAdminClientProps {
  initialItems: CalculatorItem[];
  initialDevices: DeviceOption[];
  initialBrands: string[];
  initialBrandMultipliers: Record<string, number>;
  initialBrandCategoryCosts?: Record<string, Record<string, BrandCategoryCostRule>>;
  initialButtonActive?: boolean;
  services: ServiceOption[];
  userRole: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  BatteryCharging,
  Cpu,
  Droplet,
  HardDrive,
  Keyboard,
  Flame,
  Wrench,
  Laptop,
  Zap,
};

export default function CalculatorAdminClient({
  initialItems,
  initialDevices,
  initialBrands,
  initialBrandMultipliers,
  initialBrandCategoryCosts = {},
  initialButtonActive = true,
  services,
  userRole,
}: CalculatorAdminClientProps) {
  const [activeTab, setActiveTab] = useState<
    'items' | 'brand_categories' | 'devices' | 'brands' | 'simulator'
  >('brand_categories');
  const [items, setItems] = useState<CalculatorItem[]>(initialItems);
  const [devices, setDevices] = useState<DeviceOption[]>(initialDevices);
  const [brands, setBrands] = useState<string[]>(initialBrands);
  const [brandMultipliers, setBrandMultipliers] = useState<Record<string, number>>(initialBrandMultipliers);
  const [brandCategoryCosts, setBrandCategoryCosts] = useState<
    Record<string, Record<string, BrandCategoryCostRule>>
  >(initialBrandCategoryCosts);
  const [isButtonActive, setIsButtonActive] = useState<boolean>(initialButtonActive);
  const [isTogglingButton, setIsTogglingButton] = useState<boolean>(false);

  // Brand Category Matrix state
  const [selectedMatrixBrand, setSelectedMatrixBrand] = useState<string>(brands[0] || 'Dell');
  const [bulkMultiplier, setBulkMultiplier] = useState<number>(1.1);
  const [matrixViewMode, setMatrixViewMode] = useState<'editor' | 'overview'>('editor');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State for Issue Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalculatorItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Display & Glass Panel');
  const [formServiceSlug, setFormServiceSlug] = useState('laptop-repair');
  const [formDescription, setFormDescription] = useState('');
  const [formBaseMin, setFormBaseMin] = useState<number>(2000);
  const [formBaseMax, setFormBaseMax] = useState<number>(4000);
  const [formTurnaround, setFormTurnaround] = useState('1 - 2 Hours');
  const [formWarranty, setFormWarranty] = useState('90-Day Parts & Labor Warranty');
  const [formIcon, setFormIcon] = useState('Monitor');
  const [formTag, setFormTag] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formTiers, setFormTiers] = useState<TierOption[]>([]);

  // Simulator Test State
  const [simDevice, setSimDevice] = useState<string>(devices[0]?.id || 'Laptop');
  const [simBrand, setSimBrand] = useState<string>(brands[0] || 'Dell');
  const [simItemCode, setSimItemCode] = useState<string>(items[0]?.code || '');
  const [simTierId, setSimTierId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  const distinctCategories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category)));
  }, [items]);

  // Master baseline prices per category from Catalog Items
  const categoryBasePrices = useMemo(() => {
    const map: Record<string, { min: number; max: number; primaryItemName: string }> = {};
    for (const item of items) {
      if (!map[item.category]) {
        map[item.category] = { min: item.baseMin, max: item.baseMax, primaryItemName: item.name };
      } else {
        map[item.category].min = Math.min(map[item.category].min, item.baseMin);
        map[item.category].max = Math.max(map[item.category].max, item.baseMax);
      }
    }
    return map;
  }, [items]);

  // Helper to safely extract clean multiplier for any brand & category
  const getBrandMultiplier = (brand: string, category: string): number => {
    const raw = brandCategoryCosts[brand]?.[category];
    if (typeof raw === 'number') return raw;
    if (raw && typeof raw === 'object' && typeof raw.multiplier === 'number') return raw.multiplier;
    return brandMultipliers[brand] ?? 1.0;
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Display & Glass Panel');
    setFormServiceSlug(services[0]?.slug || 'laptop-repair');
    setFormDescription('');
    setFormBaseMin(1999);
    setFormBaseMax(3999);
    setFormTurnaround('1 - 2 Hours');
    setFormWarranty('90-Day Parts & Labor Warranty');
    setFormIcon('Monitor');
    setFormTag('');
    setFormSortOrder(items.length + 1);
    setFormIsActive(true);
    setFormTiers([
      { id: 'tier_standard', label: 'OEM Standard Replacement', priceMultiplier: 1.0, note: 'Best value' },
      { id: 'tier_premium', label: 'Premium / High-Grade Replacement', priceMultiplier: 1.4, note: 'Maximum durability' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CalculatorItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormServiceSlug(item.serviceSlug);
    setFormDescription(item.description);
    setFormBaseMin(item.baseMin);
    setFormBaseMax(item.baseMax);
    setFormTurnaround(item.turnaround);
    setFormWarranty(item.warranty);
    setFormIcon(item.icon);
    setFormTag(item.tag || '');
    setFormSortOrder(item.sortOrder);
    setFormIsActive(item.isActive);

    let parsedTiers: TierOption[] = [];
    if (item.tierOptionsJson) {
      try {
        parsedTiers = JSON.parse(item.tierOptionsJson);
      } catch (e) {
        console.error(e);
      }
    }
    setFormTiers(parsedTiers);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (item: CalculatorItem) => {
    try {
      const res = await fetch(`/api/admin/calculator/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isActive: !item.isActive } : i))
      );
      showToast(`${item.name} is now ${!item.isActive ? 'Active' : 'Hidden'}.`);
    } catch {
      alert('Error updating status');
    }
  };

  const handleDeleteItem = async (item: CalculatorItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.name}" from the cost calculator?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/calculator/${item.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete');
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(`Deleted ${item.name}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formName,
      category: formCategory,
      serviceSlug: formServiceSlug,
      description: formDescription,
      baseMin: Number(formBaseMin),
      baseMax: Number(formBaseMax),
      turnaround: formTurnaround,
      warranty: formWarranty,
      icon: formIcon,
      tag: formTag || null,
      sortOrder: Number(formSortOrder),
      isActive: formIsActive,
      tierOptionsJson: formTiers.length > 0 ? JSON.stringify(formTiers) : null,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/calculator/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save');
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.item : i)));
        showToast(`Updated "${formName}" Base Estimate (₹${payload.baseMin} - ₹${payload.baseMax})!`);
      } else {
        const res = await fetch('/api/admin/calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create');
        setItems((prev) => [...prev, data.item]);
        showToast(`Created new repair issue "${formName}"!`);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTier = () => {
    const id = `tier_${Date.now()}`;
    setFormTiers((prev) => [
      ...prev,
      { id, label: 'New Part Quality Tier', priceMultiplier: 1.2, note: 'Special feature' },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    setFormTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof TierOption, value: string | number) => {
    setFormTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  // Update Brand Multiplier directly for a Category
  const handleUpdateBrandMultiplier = (brand: string, category: string, mult: number) => {
    setBrandCategoryCosts((prev) => {
      const brandMap = prev[brand] ? { ...prev[brand] } : {};
      brandMap[category] = mult;
      return { ...prev, [brand]: brandMap };
    });
  };

  const handleBulkApplyMultiplier = (brand: string, mult: number) => {
    setBrandCategoryCosts((prev) => {
      const brandMap = prev[brand] ? { ...prev[brand] } : {};
      distinctCategories.forEach((cat) => {
        brandMap[cat] = mult;
      });
      return { ...prev, [brand]: brandMap };
    });
    showToast(`Applied ${mult}x multiplier across all categories for ${brand}!`);
  };

  const handleSaveBrandCategoryCosts = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/calculator/brand-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandCategoryCosts }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }
      showToast('Brand category multiplier rates saved successfully!');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Save Settings (Devices, Brands, Multipliers)
  const handleSaveDevices = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/calculator/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devices }),
      });
      if (!res.ok) throw new Error('Failed to save device settings');
      showToast('Device types and multipliers updated successfully!');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBrands = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/calculator/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brands, brandMultipliers }),
      });
      if (!res.ok) throw new Error('Failed to save brand settings');
      showToast('Brand list and multipliers updated successfully!');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Home Page Calculator Button Status
  const handleToggleCalculatorButton = async () => {
    setIsTogglingButton(true);
    const nextState = !isButtonActive;
    try {
      const res = await fetch('/api/admin/calculator/button-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState }),
      });
      if (!res.ok) throw new Error('Failed to update button status');
      setIsButtonActive(nextState);
      showToast(
        nextState
          ? 'Home page "Calculate Repair Cost" button is now Active!'
          : 'Home page "Calculate Repair Cost" button is now Deactivated (Maintenance Mode)!'
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update button status');
    } finally {
      setIsTogglingButton(false);
    }
  };

  // Simulator Calculation
  const simCalculation = useMemo(() => {
    const targetItem = items.find((i) => i.code === simItemCode) || items[0];
    if (!targetItem) return null;

    let multiplier = 1.0;
    const baseMin = targetItem.baseMin;
    const baseMax = targetItem.baseMax;

    // Brand category multiplier directly on Master Catalog Base Estimate
    const brandMult = getBrandMultiplier(simBrand, targetItem.category);
    multiplier *= brandMult;

    // Device multiplier
    const dev = devices.find((d) => d.id === simDevice);
    if (dev) {
      if (simDevice === 'MacBook' && simBrand === 'Apple') {
        multiplier *= 1.0;
      } else {
        multiplier *= dev.multiplier;
      }
    }

    // Tier multiplier
    let tierNote = '';
    let tierLabel = '';
    if (targetItem.tierOptionsJson) {
      try {
        const tiers: TierOption[] = JSON.parse(targetItem.tierOptionsJson);
        const activeTier = tiers.find((t) => t.id === simTierId) || tiers[0];
        if (activeTier) {
          multiplier *= activeTier.priceMultiplier;
          tierLabel = activeTier.label;
          tierNote = activeTier.note || '';
        }
      } catch (e) {
        console.error(e);
      }
    }

    const minRounded = Math.round((baseMin * multiplier) / 50) * 50;
    const maxRounded = Math.round((baseMax * multiplier) / 50) * 50;

    return {
      item: targetItem,
      baseMin,
      baseMax,
      brandMult,
      min: minRounded,
      max: maxRounded,
      totalMultiplier: multiplier.toFixed(2),
      turnaround: targetItem.turnaround,
      warranty: targetItem.warranty,
      tierLabel,
      tierNote,
    };
  }, [items, devices, brands, brandMultipliers, brandCategoryCosts, simDevice, simBrand, simItemCode, simTierId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cost Calculator Management
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage master base estimates, brand scaling multipliers, and hardware tiers in unified sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/calculate-repair-cost"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <span>Live Public Calculator</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Repair Issue</span>
          </button>
        </div>
      </div>

      {/* Unified Architecture Explainer Banner */}
      <div className="bg-sky-950/30 border border-sky-800/40 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-200/90 leading-relaxed">
          <strong className="text-white block font-semibold mb-0.5">
            Unified Pricing Formula:
          </strong>
          Every quote starts from the <strong>Master Base Estimate</strong> (set in the <em>Catalog Issues & Base Prices</em> tab) and is scaled by the <strong>Brand Multiplier</strong> (configured in the <em>Brand Category Pricing Matrix</em> tab). Updating the Base Estimate in the catalog immediately updates all brand quotes proportionally on the website!
        </div>
      </div>

      {/* Home Page "Calculate Repair Cost" Button Active / Deactivate Master Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
              isButtonActive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}
          >
            {isButtonActive ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white">
                Home Page &ldquo;Calculate Repair Cost&rdquo; Button Status
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isButtonActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isButtonActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isButtonActive ? 'Active (Live)' : 'Deactivated (Maintenance Mode)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isButtonActive
                ? 'The home page button is live. Visitors clicking "Calculate Repair Cost" are navigated to the cost calculator page.'
                : 'The home page button is deactivated. When clicked, visitors see a friendly "Oops!" modal with direct phone, WhatsApp, and shop contact details.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <span className="text-xs font-semibold text-slate-300">
            {isButtonActive ? 'Turn Off' : 'Turn On'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isButtonActive}
            disabled={isTogglingButton}
            onClick={handleToggleCalculatorButton}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
              isButtonActive ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isButtonActive ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('brand_categories')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'brand_categories'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Brand Category Pricing Matrix ({brands.length} Brands)</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'items'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catalog Issues & Base Prices ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'devices'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Device Multipliers ({devices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'brands'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Brand List ({brands.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Pricing Simulator & Live Test</span>
        </button>
      </div>

      {/* TAB: BRAND CATEGORY PRICING MATRIX */}
      {activeTab === 'brand_categories' && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <span>Brand Multipliers per Category</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust how much each manufacturer brand scales above or below the Master Base Estimate (e.g. Dell: 1.15x, Apple: 2.40x, HP: 1.00x).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setMatrixViewMode('editor')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    matrixViewMode === 'editor'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Brand Editor
                </button>
                <button
                  onClick={() => setMatrixViewMode('overview')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    matrixViewMode === 'overview'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All-Brands Matrix
                </button>
              </div>

              <button
                onClick={handleSaveBrandCategoryCosts}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save All Brand Rates'}
              </button>
            </div>
          </div>

          {matrixViewMode === 'editor' && (
            <div className="space-y-6">
              {/* Brand Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {brands.map((brand) => {
                  const isSelected = selectedMatrixBrand === brand;
                  return (
                    <button
                      key={brand}
                      onClick={() => setSelectedMatrixBrand(brand)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                        isSelected
                          ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span>{brand}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Bulk Adjust for this Brand */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-white">{selectedMatrixBrand}</span>
                  <span className="text-slate-500">•</span>
                  <span>Set uniform multiplier for all categories of {selectedMatrixBrand}:</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="3.0"
                    value={bulkMultiplier}
                    onChange={(e) => setBulkMultiplier(parseFloat(e.target.value) || 1.0)}
                    className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-sky-400 font-mono font-bold text-center"
                  />
                  <button
                    onClick={() => handleBulkApplyMultiplier(selectedMatrixBrand, bulkMultiplier)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Apply to all categories
                  </button>
                </div>
              </div>

              {/* Category Cards for Selected Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {distinctCategories.map((category) => {
                  const basePrice = categoryBasePrices[category] || { min: 2000, max: 4000 };
                  const currentMultiplier = getBrandMultiplier(selectedMatrixBrand, category);

                  const computedMin = Math.round((basePrice.min * currentMultiplier) / 50) * 50;
                  const computedMax = Math.round((basePrice.max * currentMultiplier) / 50) * 50;

                  return (
                    <div
                      key={category}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{category}</span>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            Base: ₹{basePrice.min.toLocaleString('en-IN')} – ₹{basePrice.max.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Master base price comes from Catalog Issues. Brand multiplier scales this base.
                        </div>
                      </div>

                      {/* Controls Box */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block">
                              {selectedMatrixBrand} Multiplier
                            </label>
                            <span className="text-[10px] text-slate-500">
                              {currentMultiplier > 1
                                ? `+${Math.round((currentMultiplier - 1) * 100)}% surcharge`
                                : currentMultiplier < 1
                                ? `-${Math.round((1 - currentMultiplier) * 100)}% discount`
                                : 'Exact Base Estimate'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.05"
                              min="0.5"
                              max="3.5"
                              value={currentMultiplier}
                              onChange={(e) => {
                                const mult = parseFloat(e.target.value) || 1.0;
                                handleUpdateBrandMultiplier(selectedMatrixBrand, category, mult);
                              }}
                              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-sky-400 text-center"
                            />
                            <span className="text-xs text-slate-400 font-bold">x</span>
                          </div>
                        </div>

                        {/* Optional target starting price helper */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400">Target Starting Quote (₹):</span>
                          <input
                            type="number"
                            step="50"
                            min="0"
                            placeholder={String(computedMin)}
                            onChange={(e) => {
                              const targetVal = parseFloat(e.target.value);
                              if (targetVal > 0 && basePrice.min > 0) {
                                const computedMult = Math.round((targetVal / basePrice.min) * 100) / 100;
                                handleUpdateBrandMultiplier(selectedMatrixBrand, category, computedMult);
                              }
                            }}
                            className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-300 text-center"
                            title="Typing a target starting price will automatically set the multiplier"
                          />
                        </div>
                      </div>

                      {/* Live Quote Output Badge */}
                      <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-3.5 py-2.5 rounded-xl border border-sky-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
                            Website Customer Quote ({selectedMatrixBrand})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Base ₹{basePrice.min} × {currentMultiplier}x
                          </span>
                        </div>
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          ₹{computedMin.toLocaleString('en-IN')} – ₹{computedMax.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OVERVIEW MATRIX TABLE */}
          {matrixViewMode === 'overview' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Cross-Brand Cost Comparison Matrix</h3>
                  <p className="text-xs text-slate-400">
                    Master Base Estimate vs Calculated Brand Quotes across all categories.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold sticky left-0 bg-slate-950 z-10">Category</th>
                      <th className="px-4 py-3 font-semibold text-center bg-slate-950/90 text-sky-400 border-r border-slate-800">
                        Master Base Estimate
                      </th>
                      {brands.map((b) => (
                        <th key={b} className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                          {b}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {distinctCategories.map((cat) => {
                      const base = categoryBasePrices[cat] || { min: 2000, max: 4000 };
                      return (
                        <tr key={cat} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white whitespace-nowrap sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                            {cat}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap bg-slate-950/40 border-r border-slate-800 font-mono font-bold text-sky-300">
                            ₹{base.min.toLocaleString('en-IN')} – ₹{base.max.toLocaleString('en-IN')}
                          </td>
                          {brands.map((b) => {
                            const mult = getBrandMultiplier(b, cat);
                            const minVal = Math.round((base.min * mult) / 50) * 50;
                            const maxVal = Math.round((base.max * mult) / 50) * 50;
                            const isDifferent = mult !== 1.0;

                            return (
                              <td key={b} className="px-3 py-3 text-center whitespace-nowrap">
                                <div
                                  className={`font-mono font-bold text-xs ${
                                    isDifferent ? 'text-emerald-400' : 'text-slate-300'
                                  }`}
                                >
                                  ₹{minVal.toLocaleString('en-IN')} – ₹{maxVal.toLocaleString('en-IN')}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {mult}x
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: REPAIR ISSUES */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Information Notice */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                <strong>Base Estimate Column:</strong> This is the master foundational price bracket. It is displayed on customer issue cards and scaled by the brand multipliers.
              </span>
            </div>
            <Link
              href="#brand-categories"
              onClick={() => setActiveTab('brand_categories')}
              className="text-sky-400 hover:underline font-semibold shrink-0"
            >
              Configure Brand Scaling →
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search issues, category, parts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Repair Issue</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold text-sky-400">Master Base Estimate</th>
                    <th className="px-5 py-3 font-semibold">Tiers</th>
                    <th className="px-5 py-3 font-semibold">Turnaround & Warranty</th>
                    <th className="px-5 py-3 font-semibold text-center">Active</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                        No repair issues match your criteria. Click &quot;Add Repair Issue&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const IconComponent = ICON_MAP[item.icon] || Wrench;
                      let tiers: TierOption[] = [];
                      if (item.tierOptionsJson) {
                        try {
                          tiers = JSON.parse(item.tierOptionsJson);
                        } catch (e) {
                          console.error(e);
                        }
                      }

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-xl bg-slate-800 text-sky-400 shrink-0 mt-0.5">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-2">
                                  <span>{item.name}</span>
                                  {item.tag && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                      {item.tag}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-mono font-bold text-sky-400 text-sm">
                              ₹{item.baseMin.toLocaleString('en-IN')} – ₹{item.baseMax.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Master Base (1.0x)</div>
                          </td>

                          <td className="px-5 py-4">
                            {tiers.length > 0 ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  {tiers.length} Tiers Configured
                                </span>
                                <div className="text-[10px] text-slate-400 line-clamp-1">
                                  {tiers.map((t) => `${t.label} (${t.priceMultiplier}x)`).join(', ')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Flat rate (No tiers)</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.turnaround}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{item.warranty}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleToggleActive(item)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                item.isActive
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                              }`}
                              title={item.isActive ? 'Active on public calculator' : 'Hidden from calculator'}
                            >
                              {item.isActive ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Edit Master Base Prices"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {userRole === 'owner' && (
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/20"
                                  title="Delete Issue"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVICE MULTIPLIERS */}
      {activeTab === 'devices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Device Architecture Multipliers</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust price scale multiplier based on hardware complexity (e.g. Apple MacBook logic boards and compact chassis take longer to service).
              </p>
            </div>
            <button
              onClick={handleSaveDevices}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Device Rules'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((dev, idx) => (
              <div
                key={dev.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{dev.label}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      ID: {dev.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{dev.tagline}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                      Display Tagline
                    </label>
                    <input
                      type="text"
                      value={dev.tagline}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDevices((prev) =>
                          prev.map((d, i) => (i === idx ? { ...d, tagline: val } : d))
                        );
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                      Multiplier (e.g. 1.35x)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="3.0"
                      value={dev.multiplier}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1.0;
                        setDevices((prev) =>
                          prev.map((d, i) => (i === idx ? { ...d, multiplier: val } : d))
                        );
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-sky-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BRAND LIST */}
      {activeTab === 'brands' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Brand Directory & Default Fallbacks</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage supported brands and general fallbacks. For category rates (Display, Battery, etc.), use the Brand Category Pricing Matrix.
              </p>
            </div>
            <button
              onClick={handleSaveBrands}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Brand Settings'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => {
              const currentMultiplier = brandMultipliers[brand] ?? 1.0;
              return (
                <div
                  key={brand}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white text-sm">{brand}</div>
                    <div className="text-[11px] text-slate-500">
                      {currentMultiplier > 1.0 ? `+${Math.round((currentMultiplier - 1) * 100)}% Global Markup` : 'Standard Base'}
                    </div>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      step="0.05"
                      min="0.8"
                      max="2.5"
                      value={currentMultiplier}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1.0;
                        setBrandMultipliers((prev) => ({
                          ...prev,
                          [brand]: val,
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-sky-400 text-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Simulate Customer Selections</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verify how the Master Base Estimate and Brand Multiplier combine into the customer quote.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Brand</label>
                <select
                  value={simBrand}
                  onChange={(e) => setSimBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Device Type</label>
                <select
                  value={simDevice}
                  onChange={(e) => setSimDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label} (Multiplier: {d.multiplier}x)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Repair Issue</label>
                <select
                  value={simItemCode}
                  onChange={(e) => {
                    setSimItemCode(e.target.value);
                    const selected = items.find((i) => i.code === e.target.value);
                    if (selected?.tierOptionsJson) {
                      try {
                        const parsed = JSON.parse(selected.tierOptionsJson);
                        if (parsed.length > 0) setSimTierId(parsed[0].id);
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {items.map((i) => (
                    <option key={i.code} value={i.code}>
                      {i.name} ({i.category})
                    </option>
                  ))}
                </select>
              </div>

              {simCalculation?.item.tierOptionsJson && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Quality Tier</label>
                  <select
                    value={simTierId}
                    onChange={(e) => setSimTierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {(() => {
                      try {
                        const tiers: TierOption[] = JSON.parse(simCalculation.item.tierOptionsJson);
                        return tiers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label} ({t.priceMultiplier}x)
                          </option>
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Live Calculation Output
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{simCalculation?.item.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                For <strong className="text-sky-300">{simBrand}</strong> {simDevice}{' '}
                {simCalculation?.tierLabel ? `• ${simCalculation.tierLabel}` : ''}
              </p>

              {/* Master Base to Brand Multiplier Breakdown */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Master Base Estimate (Catalog):</span>
                  <span className="font-mono font-bold text-white">
                    ₹{simCalculation?.baseMin.toLocaleString('en-IN')} – ₹{simCalculation?.baseMax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Brand Multiplier ({simBrand}):</span>
                  <span className="font-mono font-bold text-sky-400">
                    {simCalculation?.brandMult}x{' '}
                    <span className="text-slate-500 font-normal">
                      ({simCalculation?.item.category})
                    </span>
                  </span>
                </div>
              </div>

              <div className="my-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-medium">Resulting Customer Quote</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
                  ₹{simCalculation?.min.toLocaleString('en-IN')} – ₹{simCalculation?.max.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Compound Multiplier: {simCalculation?.totalMultiplier}x
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Turnaround Time</span>
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    {simCalculation?.turnaround}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Warranty Package</span>
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {simCalculation?.warranty}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-between text-xs text-slate-400">
              <span>Switching brands directly scales the Master Base Estimate.</span>
              <Link
                href="/calculate-repair-cost"
                target="_blank"
                className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Open Site Calculator <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? `Edit: ${editingItem.name}` : 'Create New Repair Issue'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Issue Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Broken Display / Screen Replacement"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Display & Glass Panel, Battery & Charging"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Associated Service Category
                  </label>
                  <select
                    value={formServiceSlug}
                    onChange={(e) => setFormServiceSlug(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {services.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Icon Symbol
                  </label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Monitor">Monitor / Screen</option>
                    <option value="BatteryCharging">BatteryCharging</option>
                    <option value="Cpu">Cpu / Motherboard</option>
                    <option value="Droplet">Droplet / Water Damage</option>
                    <option value="HardDrive">HardDrive / SSD</option>
                    <option value="Keyboard">Keyboard / Chassis</option>
                    <option value="Flame">Flame / Heating & Fan</option>
                    <option value="Wrench">Wrench / General Tool</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Symptoms & Problem Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the issue symptoms..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Master Price Bracket */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Master Base Min (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={formBaseMin}
                    onChange={(e) => setFormBaseMin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-sky-400 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Master Base Max (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={formBaseMax}
                    onChange={(e) => setFormBaseMax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-sky-400 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Turnaround *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1 - 2 Hours"
                    value={formTurnaround}
                    onChange={(e) => setFormTurnaround(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Highlight Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quick 2-Hour Swap"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Warranty Text *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 90-Day Parts & Labor Warranty"
                  value={formWarranty}
                  onChange={(e) => setFormWarranty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Part Quality Tiers */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Part Quality / Option Tiers ({formTiers.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formTiers.map((tier, idx) => (
                    <div
                      key={tier.id || idx}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Tier Name (e.g. Genuine Grade / High-End)"
                          value={tier.label}
                          onChange={(e) => handleTierChange(idx, 'label', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white mb-1"
                        />
                        <input
                          type="text"
                          placeholder="Short description note"
                          value={tier.note || ''}
                          onChange={(e) => handleTierChange(idx, 'note', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-400"
                        />
                      </div>

                      <div className="w-24 shrink-0 text-center">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Multiplier</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.5"
                          max="3.0"
                          value={tier.priceMultiplier}
                          onChange={(e) =>
                            handleTierChange(idx, 'priceMultiplier', parseFloat(e.target.value) || 1.0)
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-sky-400 font-bold font-mono text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Sort Order */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-800"
                  />
                  <span>Active & visible on public calculator</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Issue'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
