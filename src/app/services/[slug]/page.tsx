import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Phone,
  Laptop,
  Monitor,
  Cpu,
  Wifi,
} from 'lucide-react';
import type { Metadata } from 'next';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    return { title: 'Service Not Found' };
  }

  return {
    title: service.metaTitle || service.name,
    description: service.metaDescription || service.shortDesc,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service || !service.isActive) {
    notFound();
  }

  // Related services
  const otherServices = await prisma.service.findMany({
    where: { slug: { not: slug }, isActive: true },
    take: 3,
  });

  interface FAQ {
    q: string;
    a: string;
  }
  let faqs: FAQ[] = [];
  try {
    if (service.faqJson) {
      faqs = JSON.parse(service.faqJson);
    }
  } catch (e) {
    console.error('Failed to parse FAQ JSON', e);
  }

  const brands = [
    'Apple MacBook',
    'Dell',
    'HP',
    'Lenovo ThinkPad',
    'Asus',
    'Acer',
    'MSI',
    'Custom Assembled',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link href="/" className="hover:text-slate-800">
          Home
        </Link>
        <span>/</span>
        <Link href="/services" className="hover:text-slate-800">
          Services
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{service.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <span>Specialized Service</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {service.name}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {service.fullDesc}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href={`/book-repair?service=${service.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors shadow-lg shadow-sky-500/20 tap-target text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Repair</span>
            </Link>

            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors tap-target text-sm"
            >
              <Phone className="w-4 h-4 text-sky-400" />
              <span>Call Technician</span>
            </a>

            {service.priceText && (
              <div className="text-xs text-slate-400 px-3 py-2 bg-slate-800/60 rounded-xl">
                Pricing: <span className="font-semibold text-white">{service.priceText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* How this repair works */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              Diagnostic & Repair Procedure
            </h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Step 1: Thorough Intake & Diagnostic</strong>
                  <p className="mt-0.5">
                    We log your device into our system, record serial numbers, test electrical rails,
                    and perform thermal and hardware diagnostic tests.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Step 2: Quotation Approval</strong>
                  <p className="mt-0.5">
                    You receive an itemized quote detailing part costs and turnaround time. Work
                    proceeds only after your authorization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Step 3: Component Replacement & Bench Testing</strong>
                  <p className="mt-0.5">
                    Genuine parts are installed under strict ESD prevention. We execute a comprehensive
                    24-point hardware stress test before release.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Step 4: Return with 90-Day Warranty</strong>
                  <p className="mt-0.5">
                    Collect your device at our workshop or receive doorstep delivery. Backed by our
                    90-day parts and service guarantee.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Supported Brands */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Brands & Devices We Service</h2>
            <p className="text-xs text-slate-500">
              We carry specialized diagnostic tooling and replacement inventory for all major computer brands.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {brands.map((b) => (
                <div
                  key={b}
                  className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  {b}
                </div>
              ))}
            </div>
          </section>

          {/* FAQs Accordion */}
          {faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-600" />
                <span>Frequently Asked Questions</span>
              </h2>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2"
                  >
                    <h3 className="font-bold text-slate-900 text-sm">{faq.q}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Booking Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base">Schedule This Repair</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skip the queue. Book an appointment online or request doorstep pickup.
            </p>

            <Link
              href={`/book-repair?service=${service.slug}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all tap-target"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </Link>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>90-Day Parts & Labor Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Zero charge if diagnosis isn't approved</span>
              </div>
            </div>
          </div>

          {/* Other Services */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Other Repair Services</h3>
            <div className="space-y-3">
              {otherServices.map((os) => (
                <Link
                  key={os.id}
                  href={`/services/${os.slug}`}
                  className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{os.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mt-1 line-clamp-1">{os.shortDesc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
