'use client';

import React, { useState } from 'react';
import {
  Settings,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Megaphone,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SettingsClientProps {
  initialSettings: Record<string, string>;
  currentUserRole: 'owner' | 'staff';
}

export default function SettingsClient({ initialSettings, currentUserRole }: SettingsClientProps) {
  const [formData, setFormData] = useState({
    business_name: initialSettings.business_name || 'ProTech IT & Computer Repair',
    phone: initialSettings.phone || '+91 98765 43210',
    whatsapp: initialSettings.whatsapp || '919876543210',
    email: initialSettings.email || 'support@protechrepairs.com',
    address: initialSettings.address || 'Shop 14, Silicon Arcade, Tech Avenue, Metro Plaza',
    working_hours: initialSettings.working_hours || 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed',
    warranty_days: initialSettings.warranty_days || '90',
    announcement: initialSettings.announcement || 'Verified Parts & 90-Day Diagnostic Warranty Included Across Kolkata',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'owner') {
      setErrorMsg('Only business owners have permission to edit business settings.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save settings');
        setIsSaving(false);
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMsg('Network error while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-sky-400" />
            <span>Business Settings & Contact Configuration</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure workshop phone numbers, WhatsApp dispatch, public address, and warranty terms.
          </p>
        </div>
      </div>

      {currentUserRole !== 'owner' && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/50 rounded-2xl text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You are signed in as Staff. Only accounts with the Owner role can modify business settings.</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings successfully updated across the website!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Contact Numbers */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-400" />
            <span>Customer Contact Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Helpline Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Displayed on the header, hero section, and footer.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp Dispatch Number *</label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">International format without symbols (e.g. 919876543210).</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Support Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Standard Warranty Period (Days)</label>
              <input
                type="number"
                value={formData.warranty_days}
                onChange={(e) => setFormData({ ...formData, warranty_days: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Physical Workshop Details */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Workshop Location & Hours</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Operating Hours String</label>
            <input
              type="text"
              value={formData.working_hours}
              onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Top Banner Announcement */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-400" />
            <span>Top Bar Announcement</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Announcement Message</label>
            <input
              type="text"
              value={formData.announcement}
              onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || currentUserRole !== 'owner'}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Business Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
}
