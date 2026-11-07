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
  Sun,
  Moon,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface SettingsClientProps {
  initialSettings: Record<string, string>;
  currentUserRole: 'owner' | 'staff';
}

export default function SettingsClient({ initialSettings, currentUserRole }: SettingsClientProps) {
  const { theme, setTheme, isDark } = useAdminTheme();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-sky-500 dark:text-sky-400" />
            <span>Business Settings & Preferences</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Configure workshop contact channels, address, warranty policies, and dashboard appearance.
          </p>
        </div>
      </div>

      {currentUserRole !== 'owner' && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You are signed in as Staff. Only accounts with the Owner role can modify business settings.</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings successfully updated across the website!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ================= THEME & DISPLAY PREFERENCES ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Dashboard Theme & Appearance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch between high-contrast dark workshop mode and clean daytime light mode.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
            {isDark ? 'Dark Theme Active' : 'Light Theme Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              isDark
                ? 'bg-slate-950 border-sky-500 ring-2 ring-sky-500/30 shadow-md'
                : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600 opacity-75 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                {isDark && (
                  <span className="flex items-center gap-1 text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-white text-sm">Dark Theme (Default)</div>
              <p className="text-xs text-slate-400 mt-1">
                Optimized for repair technician benches, OLED displays, and low-light workshop environments.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-950 border border-slate-700" />
              <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <span className="text-xs text-slate-500 font-mono ml-auto">#020617 / #0F172A</span>
            </div>
          </button>

          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              !isDark
                ? 'bg-white border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 opacity-75 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                {!isDark && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">Light Theme</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Crisp, clean daylight interface with high contrast and readable text for office and reception desks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-50 border border-slate-200" />
              <span className="w-3 h-3 rounded-full bg-white border border-slate-200" />
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <span className="text-xs text-slate-500 font-mono ml-auto">#F8FAFC / #FFFFFF</span>
            </div>
          </button>
        </div>
      </div>

      {/* ================= BUSINESS CONTACT FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl transition-colors duration-150"
      >
        {/* Contact Numbers */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Customer Contact Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Helpline Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500 transition-colors"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                Displayed on the header, hero section, and footer.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                WhatsApp Dispatch Number *
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500 transition-colors"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                International format without symbols (e.g. 919876543210).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Standard Warranty Period (Days)
              </label>
              <input
                type="number"
                value={formData.warranty_days}
                onChange={(e) => setFormData({ ...formData, warranty_days: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Physical Workshop Details */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Workshop Location & Hours</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Physical Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Operating Hours String
            </label>
            <input
              type="text"
              value={formData.working_hours}
              onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Top Banner Announcement */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Top Bar Announcement</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Announcement Message
            </label>
            <input
              type="text"
              value={formData.announcement}
              onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || currentUserRole !== 'owner'}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 transition-colors shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Business Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
