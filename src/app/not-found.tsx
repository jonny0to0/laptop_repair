import Link from 'next/link';
import { Wrench, Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 shadow-inner">
        <Wrench className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
        404 Page Not Found
      </span>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-2 mb-4 tracking-tight">
        Looking for a Repair or Service?
      </h1>

      <p className="text-sm text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
        The page you requested may have moved or been updated. You can explore our services or track
        an existing repair below.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-md shadow-sky-600/20 tap-target"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors tap-target"
        >
          <span>All Services</span>
        </Link>

        <Link
          href="/track-booking"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors tap-target"
        >
          <Search className="w-4 h-4" />
          <span>Track Repair</span>
        </Link>
      </div>
    </div>
  );
}
