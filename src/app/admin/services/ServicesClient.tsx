'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Laptop,
  Monitor,
  Cpu,
  Wifi,
  HardDrive,
  Check,
  X,
  ExternalLink,
  Save,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export interface ServiceItem {
  id: number;
  name: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  image: string | null;
  priceMode: string;
  priceText: string | null;
  faqJson: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    bookings: number;
    reviews: number;
  };
}

interface ServicesClientProps {
  initialServices: ServiceItem[];
}

const AVAILABLE_ICONS = [
  'Wrench',
  'Laptop',
  'Monitor',
  'Cpu',
  'HardDrive',
  'Wifi',
];

export default function ServicesClient({ initialServices }: ServicesClientProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDesc: '',
    fullDesc: '',
    icon: 'Wrench',
    priceMode: 'starts_from',
    priceText: '',
    metaTitle: '',
    metaDescription: '',
    sortOrder: 0,
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingService(null);
    setFormData({
      name: '',
      slug: '',
      shortDesc: '',
      fullDesc: '',
      icon: 'Wrench',
      priceMode: 'starts_from',
      priceText: 'From ₹499',
      metaTitle: '',
      metaDescription: '',
      sortOrder: services.length + 1,
      isActive: true,
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setIsCreatingNew(false);
    setFormData({
      name: s.name,
      slug: s.slug,
      shortDesc: s.shortDesc,
      fullDesc: s.fullDesc,
      icon: s.icon || 'Wrench',
      priceMode: s.priceMode || 'starts_from',
      priceText: s.priceText || '',
      metaTitle: s.metaTitle || '',
      metaDescription: s.metaDescription || '',
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    });
    setErrorMsg(null);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => {
      const slugVal = isCreatingNew
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : prev.slug;
      return { ...prev, name: val, slug: slugVal };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const url = isCreatingNew
        ? '/api/admin/services'
        : `/api/admin/services/${editingService?.id}`;
      const method = isCreatingNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save service');
        setIsSaving(false);
        return;
      }

      if (isCreatingNew) {
        setServices((prev) => [...prev, { ...data.service, _count: { bookings: 0, reviews: 0 } }]);
      } else {
        setServices((prev) =>
          prev.map((s) => (s.id === data.service.id ? { ...s, ...data.service } : s))
        );
      }

      setIsCreatingNew(false);
      setEditingService(null);
    } catch {
      setErrorMsg('Network error while saving service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (s: ServiceItem) => {
    try {
      const nextActive = !s.isActive;
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });

      if (res.ok) {
        setServices((prev) =>
          prev.map((item) => (item.id === s.id ? { ...item, isActive: nextActive } : item))
        );
      }
    } catch {
      alert('Failed to toggle active status');
    }
  };

  const handleDelete = async (s: ServiceItem) => {
    if (!confirm(`Are you sure you want to delete "${s.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/services/${s.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete service');
        return;
      }

      setServices((prev) => prev.filter((item) => item.id !== s.id));
    } catch {
      alert('Network error while deleting service');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-sky-400" />
            <span>Repair Services Catalog</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage public repair offerings, custom pricing labels, descriptions, and SEO details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
              s.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                  <Wrench className="w-4.5 h-4.5" />
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(s)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      s.isActive
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                    }`}
                  >
                    {s.isActive ? 'Active' : 'Hidden'}
                  </button>

                  <span className="text-xs font-mono text-slate-500">#{s.sortOrder}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{s.name}</h3>
                <span className="text-[11px] font-mono text-sky-400/80 block">/services/{s.slug}</span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {s.shortDesc || s.fullDesc}
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Price Label:</span>
                <span className="font-bold text-emerald-400 font-mono">{s.priceText || 'Custom Quote'}</span>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span>{s._count.bookings} Bookings</span>
                <span>•</span>
                <span>{s._count.reviews} Reviews</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <Link
                href={`/services/${s.slug}`}
                target="_blank"
                className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(s)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Service Modal */}
      {(isCreatingNew || editingService) && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-left overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/95 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {isCreatingNew ? 'Create New Repair Service' : `Edit: ${editingService?.name}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingService(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Broken Screen Replacement"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. broken-screen-replacement"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Display Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Price Mode</label>
                  <select
                    value={formData.priceMode}
                    onChange={(e) => setFormData({ ...formData, priceMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="starts_from">Starts From (e.g. From ₹499)</option>
                    <option value="quote">Free Diagnostic Quote</option>
                    <option value="fixed">Fixed Price</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Price Label Text</label>
                  <input
                    type="text"
                    value={formData.priceText}
                    onChange={(e) => setFormData({ ...formData, priceText: e.target.value })}
                    placeholder="e.g. From ₹1,499"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Short Description (Cards & Lists)</label>
                <input
                  type="text"
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="Quick 1-sentence overview"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full Description (Service Detail Page)</label>
                <textarea
                  rows={3}
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  placeholder="Detailed explanation of repair processes, components, warranty, and turnarounds..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-500"
                    />
                    <span>Active on Public Website</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
