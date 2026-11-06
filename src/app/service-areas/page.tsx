import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, CheckCircle, ArrowRight, Truck } from 'lucide-react';
import PincodeChecker from '@/components/PincodeChecker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service Areas & Doorstep Pickup Coverage',
  description:
    'Check our doorstep computer pickup and on-site IT support service areas. Instant pincode lookup for fast repair turnaround.',
};

export default async function ServiceAreasPage() {
  const serviceAreas = await prisma.serviceArea.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          Doorstep & On-Site
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
          Service Coverage & Pincode Lookup
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          We operate daily courier pickup and express on-site visits across key metropolitan zones.
          Verify your pincode below to check if doorstep collection is active in your neighborhood.
        </p>
      </div>

      {/* Interactive Checker */}
      <div className="max-w-2xl">
        <PincodeChecker
          areas={serviceAreas.map((a) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            pincodes: a.pincodes,
          }))}
        />
      </div>

      {/* Service Area Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Covered Regions & Pincodes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceAreas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-2.5 text-sky-600 mb-2 font-semibold text-xs">
                  <MapPin className="w-4 h-4" />
                  <span>Regional Zone</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{area.name}</h3>
                <p className="text-xs text-slate-600 mb-4">{area.description}</p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Covered Pincodes:
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {area.pincodes}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/service-areas/${area.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-sky-600 transition-colors"
                >
                  <span>Zone details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/book-repair?area=${area.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white transition-colors"
                >
                  Book Pickup Here
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
