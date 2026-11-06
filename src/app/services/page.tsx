import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Laptop, Monitor, Cpu, Wifi, Wrench, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Computer Repair & IT Services',
  description:
    'Comprehensive computer, laptop, desktop, and networking services. View details, pricing, FAQs, and book online.',
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  const iconMap: Record<string, typeof Laptop> = {
    Laptop: Laptop,
    Monitor: Monitor,
    Cpu: Cpu,
    Wifi: Wifi,
    Wrench: Wrench,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          What We Fix
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
          Specialized Hardware & Software Repair Services
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          From screen and motherboard chip-level micro-soldering to data recovery and custom gaming PC
          diagnostics. Select a service below to view common fixes and book an inspection.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((s) => {
          const Icon = iconMap[s.icon] || Wrench;
          return (
            <div
              key={s.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-8 flex flex-col justify-between hover:shadow-xl hover:border-sky-500/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {s.priceText || 'Diagnostic Quote'}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">
                  {s.name}
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {s.fullDesc}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>90-Day Written Warranty on Repaired Components</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Original & Certified OEM Replacement Hardware</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors"
                >
                  <span>Symptoms & FAQs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/book-repair?service=${s.slug}`}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-600 text-white hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/20"
                >
                  Book This Service
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
