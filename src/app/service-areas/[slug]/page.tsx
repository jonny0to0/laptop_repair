import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Truck, ShieldCheck, Calendar, ArrowRight, Phone } from 'lucide-react';
import type { Metadata } from 'next';

interface AreaLandingProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AreaLandingProps): Promise<Metadata> {
  const { slug } = await params;
  const area = await prisma.serviceArea.findUnique({
    where: { slug },
  });

  if (!area) return { title: 'Area Not Found' };

  return {
    title: `Computer & Laptop Repair in ${area.name} | Doorstep Pickup`,
    description: `Doorstep laptop & desktop repair in ${area.name} (Pincodes: ${area.pincodes}). Genuine parts, 90-day warranty, and fast turnaround.`,
  };
}

export default async function AreaDetailPage({ params }: AreaLandingProps) {
  const { slug } = await params;
  const area = await prisma.serviceArea.findUnique({
    where: { slug },
  });

  if (!area || !area.isActive) {
    notFound();
  }

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link href="/" className="hover:text-slate-800">
          Home
        </Link>
        <span>/</span>
        <Link href="/service-areas" className="hover:text-slate-800">
          Service Areas
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{area.name}</span>
      </nav>

      {/* Hero */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span>Doorstep Pickup Active</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Computer & Laptop Repair in {area.name}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          {area.description}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href={`/book-repair?area=${area.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors shadow-lg tap-target text-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Pickup in {area.name}</span>
          </Link>

          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors tap-target text-sm"
          >
            <Phone className="w-4 h-4 text-sky-400" />
            <span>Call Workshop</span>
          </a>
        </div>
      </div>

      {/* Available Services in this area */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Available Repair Services in {area.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            All services include secure doorstep transit, ESD protection, and 90-day warranty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{s.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4">{s.shortDesc}</p>
              </div>
              <Link
                href={`/book-repair?service=${s.slug}&area=${area.slug}`}
                className="w-full text-center py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-semibold text-xs transition-colors"
              >
                Book in {area.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
