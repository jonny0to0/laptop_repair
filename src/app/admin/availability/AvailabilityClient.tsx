'use client';

import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarDays,
} from 'lucide-react';

export interface WeekdayRule {
  id?: number;
  weekday: number; // 0 Sunday, 1 Monday... 6 Saturday
  openTime: string;
  closeTime: string;
  slotCapacity: number;
  isClosed: boolean;
}

export interface HolidayItem {
  id: number;
  date: string;
  reason: string | null;
}

interface AvailabilityClientProps {
  initialRules: WeekdayRule[];
  initialHolidays: HolidayItem[];
  currentUserRole: 'owner' | 'staff';
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function AvailabilityClient({
  initialRules,
  initialHolidays,
  currentUserRole,
}: AvailabilityClientProps) {
  // Ensure all 7 days exist in local state
  const [rules, setRules] = useState<WeekdayRule[]>(() => {
    const list: WeekdayRule[] = [];
    for (let i = 0; i < 7; i++) {
      const match = initialRules.find((r) => r.weekday === i);
      if (match) {
        list.push(match);
      } else {
        list.push({
          weekday: i,
          openTime: '09:00',
          closeTime: '19:00',
          slotCapacity: 5,
          isClosed: i === 0, // Sunday closed by default
        });
      }
    }
    return list;
  });

  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);

  // New holiday inputs
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRuleChange = (
    weekdayIndex: number,
    field: keyof WeekdayRule,
    value: string | number | boolean
  ) => {
    setRules((prev) =>
      prev.map((r) => (r.weekday === weekdayIndex ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRules = async () => {
    if (currentUserRole !== 'owner') {
      setErrorMsg('Only owners can modify workshop schedule');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save schedule');
        setIsSaving(false);
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMsg('Network error while saving schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate) return;
    if (currentUserRole !== 'owner') {
      setErrorMsg('Only owners can add holidays');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newHoliday: { date: holidayDate, reason: holidayReason },
        }),
      });

      if (res.ok) {
        // Optimistic refresh
        setHolidays((prev) => [
          ...prev,
          {
            id: Date.now(),
            date: new Date(holidayDate).toISOString(),
            reason: holidayReason,
          },
        ]);
        setHolidayDate('');
        setHolidayReason('');
      }
    } catch {
      alert('Failed to add holiday');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (currentUserRole !== 'owner') return;

    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteHolidayId: id }),
      });

      if (res.ok) {
        setHolidays((prev) => prev.filter((h) => h.id !== id));
      }
    } catch {
      alert('Failed to remove holiday');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-sky-400" />
            <span>Operating Hours & Workshop Capacity</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure weekly operating hours, slot capacities, and workshop holiday closures.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveRules}
          disabled={isSaving || currentUserRole !== 'owner'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors shadow-md shadow-sky-500/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Schedule</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Weekly schedule updated successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Weekday Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-sky-400" />
          <span>Weekly Working Hours</span>
        </h3>

        <div className="divide-y divide-slate-800/70">
          {rules.map((r) => (
            <div
              key={r.weekday}
              className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                r.isClosed ? 'opacity-50' : ''
              }`}
            >
              <div className="w-32 font-bold text-white text-sm">
                {WEEKDAYS[r.weekday]}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Opens:</span>
                  <input
                    type="time"
                    disabled={r.isClosed}
                    value={r.openTime}
                    onChange={(e) => handleRuleChange(r.weekday, 'openTime', e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Closes:</span>
                  <input
                    type="time"
                    disabled={r.isClosed}
                    value={r.closeTime}
                    onChange={(e) => handleRuleChange(r.weekday, 'closeTime', e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Max Slots / Day:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    disabled={r.isClosed}
                    value={r.slotCapacity}
                    onChange={(e) =>
                      handleRuleChange(r.weekday, 'slotCapacity', parseInt(e.target.value, 10) || 1)
                    }
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-center disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={r.isClosed}
                    onChange={(e) => handleRuleChange(r.weekday, 'isClosed', e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500"
                  />
                  <span>Mark Closed</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holiday Closures Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Special Holidays & Maintenance Closures</span>
        </h3>

        {/* Add Holiday Form */}
        <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Date *</label>
            <input
              type="date"
              required
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Reason (Optional)</label>
            <input
              type="text"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              placeholder="e.g. Durga Puja, Republic Day, Annual Inventory"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSaving || currentUserRole !== 'owner'}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Date</span>
            </button>
          </div>
        </form>

        {/* Holidays List */}
        <div className="pt-2 space-y-2">
          {holidays.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-2">No upcoming holiday closures set.</div>
          ) : (
            holidays.map((h) => (
              <div
                key={h.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-300">
                    {new Date(h.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-slate-300">{h.reason || 'Workshop Closed'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteHoliday(h.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400"
                  title="Remove holiday"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
