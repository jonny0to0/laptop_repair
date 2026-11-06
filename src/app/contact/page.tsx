import { prisma } from '@/lib/prisma';
import ContactForm from './ContactForm';
import { MapPin, Phone, MessageCircle, Mail, Clock, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Workshop & Location | ProTech IT',
  description:
    'Visit our workshop or reach our certified technicians via phone, WhatsApp, or contact form. Fast response during business hours.',
};

export default async function ContactPage() {
  const settingsList = await prisma.setting.findMany();
  const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));

  const phone = settings.phone || '+91 98765 43210';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const whatsapp = settings.whatsapp || '919876543210';
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');
  const email = settings.email || 'support@protechrepairs.com';
  const address = settings.address || 'Shop 14, Silicon Arcade, Tech Avenue, Metro Plaza';
  const workingHours = settings.working_hours || 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          Direct Workshop Access
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
          Contact Our Technical Team
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Need a quick question answered before scheduling? Call our service desk, message on
          WhatsApp, or send a message through the form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6">
            <h2 className="text-xl font-bold">Workshop Headquarters</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">Physical Address:</strong>
                  <span className="text-slate-300 mt-0.5 block leading-relaxed">{address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">Direct Phone:</strong>
                  <a href={`tel:${cleanPhone}`} className="text-sky-300 hover:underline mt-0.5 block">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">Instant WhatsApp:</strong>
                  <a
                    href={`https://wa.me/${cleanWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 hover:underline mt-0.5 block"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">Official Email:</strong>
                  <a href={`mailto:${email}`} className="text-slate-300 hover:underline mt-0.5 block">
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">Workshop Operating Hours:</strong>
                  <span className="text-slate-300 mt-0.5 block leading-relaxed">{workingHours}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Free diagnostic walk-ins welcomed during open hours</span>
            </div>
          </div>

          {/* Map info placeholder card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Directions & Parking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Located on the 1st floor of Silicon Arcade. Customer parking available in the building basement.
              Metro Station Exit 2 is a 2-minute walk away.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
