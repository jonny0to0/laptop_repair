'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  X,
  Save,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';

export interface AreaItem {
  id: number;
  name: string;
  slug: string;
  pincodes: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    bookings: number;
  };
}

interface AreasClientProps {
  initialAreas: AreaItem[];
}

export default function AreasClient({ initialAreas }: AreasClientProps) {
  const [areas, setAreas] = useState<AreaItem[]>(initialAreas);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    pincodes: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtered
  const filteredAreas = useMemo(() => {
    if (!searchQuery.trim()) return areas;
    const q = searchQuery.toLowerCase().trim();
    return areas.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.pincodes.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q)
    );
  }, [areas, searchQuery]);

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingArea(null);
    setFormData({
      name: '',
      slug: '',
      pincodes: '',
      description: '',
      sortOrder: areas.length + 1,
      isActive: true,
    });
    setErrorMsg(null);
  };

  const handleOpenEdit = (a: AreaItem) => {
    setEditingArea(a);
    setIsCreatingNew(false);
    setFormData({
      name: a.name,
      slug: a.slug,
      pincodes: a.pincodes,
      description: a.description || '',
      sortOrder: a.sortOrder,
      isActive: a.isActive,
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
      const url = isCreatingNew ? '/api/admin/areas' : `/api/admin/areas/${editingArea?.id}`;
      const method = isCreatingNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save area');
        setIsSaving(false);
        return;
      }

      if (isCreatingNew) {
        setAreas((prev) => [...prev, { ...data.area, _count: { bookings: 0 } }]);
      } else {
        setAreas((prev) =>
          prev.map((a) => (a.id === data.area.id ? { ...a, ...data.area } : a))
        );
      }

      setIsCreatingNew(false);
      setEditingArea(null);
    } catch {
      setErrorMsg('Network error while saving area');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (a: AreaItem) => {
    try {
      const nextActive = !a.isActive;
      const res = await fetch(`/api/admin/areas/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextActive }),
      });

      if (res.ok) {
        setAreas((prev) =>
          prev.map((item) => (item.id === a.id ? { ...item, isActive: nextActive } : item))
        );
      }
    } catch {
      alert('Failed to toggle active status');
    }
  };

  const handleDelete = async (a: AreaItem) => {
    if (!confirm(`Are you sure you want to delete "${a.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/areas/${a.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete area');
        return;
      }

      setAreas((prev) => prev.filter((item) => item.id !== a.id));
    } catch {
      alert('Network error while deleting area');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-sky-400" />
            <span>Service Areas & Pincode Coverage</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure doorstep technician delivery zones and supported Kolkata postal codes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Area</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search zones by name (e.g. Salt Lake, New Town) or pincode (e.g. 700091)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAreas.map((a) => {
          const pincodeList = a.pincodes.split(',').map((p) => p.trim());

          return (
            <div
              key={a.id}
              className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                a.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                    <MapPin className="w-4.5 h-4.5" />
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(a)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        a.isActive
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      {a.isActive ? 'Active Zone' : 'Disabled'}
                    </button>
                    <span className="text-xs font-mono text-slate-500">#{a.sortOrder}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{a.name}</h3>
                  <span className="text-[11px] font-mono text-sky-400/80 block">/service-areas/{a.slug}</span>
                </div>

                {a.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {a.description}
                  </p>
                )}

                {/* Covered Pincodes */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Covered Pincodes:</div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {pincodeList.map((pin) => (
                      <span
                        key={pin}
                        className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300"
                      >
                        {pin}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  {a._count.bookings} total repair bookings in this area
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/service-areas/${a.slug}`}
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public View</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(a)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(a)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Area Modal */}
      {(isCreatingNew || editingArea) && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-left overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/95 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {isCreatingNew ? 'Add Service Area' : `Edit: ${editingArea?.name}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingArea(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Area Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Salt Lake (Bidhannagar)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. salt-lake"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Supported Pincodes (Comma separated) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.pincodes}
                  onChange={(e) => setFormData({ ...formData, pincodes: e.target.value })}
                  placeholder="e.g. 700064, 700091, 700097, 700098, 700106"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Used by the Pincode Checker tool on the homepage to verify doorstep serviceability.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of service coverage and average doorstep arrival time..."
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
                    <span>Active Zone</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingArea(null);
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
                  <span>Save Area</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
