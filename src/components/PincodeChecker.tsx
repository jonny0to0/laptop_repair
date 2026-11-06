'use client';

import { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AreaSummary {
  id: number;
  name: string;
  slug: string;
  pincodes: string;
}

interface PincodeCheckerProps {
  areas: AreaSummary[];
}

export default function PincodeChecker({ areas }: PincodeCheckerProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{
    searched: boolean;
    covered: boolean;
    matchedArea?: AreaSummary;
  }>({
    searched: false,
    covered: false,
  });

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase();
    if (!clean) return;

    // Check if query is contained in pincodes or area name
    const found = areas.find(
      (a) =>
        a.pincodes.toLowerCase().includes(clean) ||
        a.name.toLowerCase().includes(clean)
    );

    if (found) {
      setResult({ searched: true, covered: true, matchedArea: found });
    } else {
      setResult({ searched: true, covered: false });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3 text-sky-600 font-semibold text-sm">
        <MapPin className="w-4 h-4" />
        <span>Doorstep Pickup & On-Site Availability</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        Check Service in Your Area
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Enter your 6-digit pincode or neighborhood name to check express doorstep coverage.
      </p>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (result.searched) setResult({ searched: false, covered: false });
            }}
            placeholder="e.g. 110001 or Downtown"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          <span>Check</span>
        </button>
      </form>

      {result.searched && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
          {result.covered && result.matchedArea ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900">
                  Great news! Doorstep service is available.
                </span>
                <p className="mt-0.5 text-emerald-700">
                  Covered under{' '}
                  <span className="font-semibold">{result.matchedArea.name}</span>. Both free
                  diagnostic drop-off and doorstep courier pickup are active.
                </p>
                <Link
                  href={`/book-repair?area=${result.matchedArea.slug}`}
                  className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 mt-2 underline"
                >
                  Book Doorstep Service Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Outside standard courier zone</span>
                <p className="mt-0.5 text-amber-800">
                  We welcome drop-ins at our central workshop, or you can still book an inspection
                  and our team will review custom transport options.
                </p>
                <Link
                  href="/book-repair?mode=shop_visit"
                  className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline mt-2"
                >
                  Schedule Workshop Visit
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
