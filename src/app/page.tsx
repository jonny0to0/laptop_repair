import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Wrench,
  ShieldCheck,
  Clock,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowRight,
  Cpu,
  Laptop,
  Monitor,
  Wifi,
  Sparkles,
  MapPin,
  Star,
} from 'lucide-react';
import ProblemPicker from '@/components/ProblemPicker';
import PincodeChecker from '@/components/PincodeChecker';
import HeroSection from '@/components/HeroSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query dynamic data from MySQL
  const [services, serviceAreas, approvedReviews, totalCompletedCount, settings] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.review.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.booking.count({ where: { status: 'completed' } }),
    prisma.setting.findMany({
      where: {
        key: {
          in: ['calculator_button_active', 'phone', 'whatsapp', 'address', 'working_hours'],
        },
      },
    }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const isCalculatorActive = settingsMap.calculator_button_active !== 'false';
  const phone = settingsMap.phone || '8345822352';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const whatsapp = settingsMap.whatsapp || '6295763758';
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');
  const address = settingsMap.address || 'West Bengal, Murshidabad';
  const workingHours = settingsMap.working_hours || 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed';

  const iconMap: Record<string, typeof Laptop> = {
    Laptop: Laptop,
    Monitor: Monitor,
    Cpu: Cpu,
    Wifi: Wifi,
    Wrench: Wrench,
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION (Redesigned with TechFix Diagnostic Hub & Conversion Copy) */}
      <HeroSection
        services={services.map((s) => ({ id: s.id, name: s.name, slug: s.slug }))}
        serviceAreas={serviceAreas.map((a) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          pincodes: a.pincodes,
        }))}
        isCalculatorActive={isCalculatorActive}
        phone={phone}
        whatsapp={cleanWhatsApp}
        address={address}
        workingHours={workingHours}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28 relative z-20">
        {/* 2. QUICK PROBLEM PICKER (Fast Diagnostic Triage) */}
        <section className="scroll-mt-24" id="select-issue" aria-label="Device repair issue diagnostic triage">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Step 1 of 2 Eyebrow Badge matching image */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#0284C7] border border-sky-200/80 mb-3.5 shadow-2xs">
              <span className="font-mono text-xs font-black">#</span>
              <span>STEP 1 OF 2 • FAST DIAGNOSTIC TRIAGE</span>
            </div>

            {/* Primary Headline */}
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              What issue is your device facing?
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 mt-3.5 max-w-2xl mx-auto leading-relaxed">
              Tap a symptom below to pre-fill your doorstep repair booking in seconds. Every repair includes a thorough diagnostic inspection, transparent quote, and 90-day warranty.
            </p>

            {/* 3 Trust Pills matching uploaded image */}
            <div className="pt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Diagnostic Fee Walk-ins</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50/90 text-sky-800 border border-sky-200/80 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>90-Day Parts & Labor Warranty</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50/90 text-amber-800 border border-amber-200/80 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Same-Day Turnaround Available</span>
              </span>
            </div>
          </div>
          <ProblemPicker services={services} serviceAreas={serviceAreas} />
        </section>

        {/* 3. DYNAMIC SERVICES GRID */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Our Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Full-Service Computer Diagnostic & Repair
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                All repairs are performed by trained technicians in our clean, ESD-safe workshop
                using professional diagnostic tools and genuine replacement components.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700 shrink-0"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = iconMap[service.icon] || Wrench;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-lg hover:border-sky-500/40 transition-all group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {service.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-800 mb-3">
                      {service.priceText || 'Quote after diagnosis'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/book-repair?service=${service.slug}`}
                        className="flex-1 text-center py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white font-semibold text-xs transition-colors"
                      >
                        Book This
                      </Link>
                      <Link
                        href={`/services/${service.slug}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. HOW IT WORKS (HONEST PROCESS) */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Transparent Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              How Repair Works at ProTech
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              No surprises. We follow a strict 4-step diagnostic and quotation protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center border border-sky-500/30 text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">Book or Consult</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Schedule online in 2 minutes or call. Choose workshop walk-in or doorstep courier
                pickup.
              </p>
            </div>

            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center border border-sky-500/30 text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">Diagnostic Testing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our technicians test circuits, voltage rails, screens, storage and thermals to pinpoint
                the exact fault.
              </p>
            </div>

            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center border border-sky-500/30 text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">Clear Itemized Quote</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You receive a clear breakdown of required parts and labor. We never start work without
                your explicit approval.
              </p>
            </div>

            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 text-lg">
                4
              </div>
              <h3 className="text-base font-bold text-white">Repair & Warranty</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Work completed with genuine components, stress-tested, and returned with a 90-day
                written warranty.
              </p>
            </div>
          </div>
        </section>

        {/* 5. COVERAGE & PINCODE CHECKER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Service Areas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Areas We Cover for Doorstep Pickup & On-Site IT
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We offer courier collection and express technician visits across 4 major regions.
              Check if your pincode qualifies for doorstep pickup.
            </p>

            <div className="space-y-2 pt-2">
              {serviceAreas.map((area) => (
                <div
                  key={area.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div className="font-semibold text-slate-800">{area.name}</div>
                  <div className="text-slate-500 font-mono">{area.pincodes}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <PincodeChecker
              areas={serviceAreas.map((a) => ({
                id: a.id,
                name: a.name,
                slug: a.slug,
                pincodes: a.pincodes,
              }))}
            />
          </div>
        </section>

        {/* 6. REVIEWS & REAL DATA PROOF */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Verified Feedback
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Real Customer Experiences
              </h2>
            </div>
            <Link
              href="/reviews"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Read all verified reviews
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {approvedReviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-3">
              <Star className="w-8 h-8 text-amber-400 mx-auto fill-amber-400" />
              <h3 className="font-bold text-slate-900">Be the First to Review</h3>
              <p className="text-xs text-slate-600">
                We maintain strict integrity and never display manufactured ratings. All reviews on
                our site come from verified service customers.
              </p>
              <Link
                href="/reviews"
                className="inline-block mt-2 text-xs font-semibold text-sky-600 hover:underline"
              >
                Submit feedback on a completed repair →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {approvedReviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic mb-4">
                      "{r.comment}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{r.customerName}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="bg-sky-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-sky-600/10">
          <h2 className="text-2xl sm:text-4xl font-extrabold max-w-2xl mx-auto">
            Ready to Get Your Computer Running Like New?
          </h2>
          <p className="text-sm sm:text-base text-sky-100 max-w-xl mx-auto">
            Book online in under 2 minutes. We'll diagnose the issue and share a transparent quote
            before you spend a single rupee.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/book-repair"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-white text-sky-900 hover:bg-sky-50 transition-colors shadow-md tap-target"
            >
              Start Guided Booking
            </Link>
            <a
              href={`tel:${cleanPhone}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-sky-700/80 hover:bg-sky-700 text-white transition-colors tap-target"
            >
              Call {phone}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
