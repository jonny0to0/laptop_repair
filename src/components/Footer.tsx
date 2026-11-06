'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench, Phone, Mail, MapPin, Clock, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

interface FooterProps {
  businessName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  workingHours?: string;
}

export default function Footer({
  businessName = 'ProTech IT & Computer Repair',
  phone = '+91 98765 43210',
  email = 'support@protechrepairs.com',
  address = 'Shop 14, Silicon Arcade, Tech Avenue, Metro Plaza',
  workingHours = 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed',
}: FooterProps) {
  const pathname = usePathname();

  // Hide public footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pb-20 md:pb-8 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg">{businessName}</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Fast, transparent, and certified hardware & software diagnostics. We diagnose every issue first and provide itemized quotations before starting any repair.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Genuine parts • 90-day repair warranty • No hidden diagnostic fees</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  All Repair Services
                </Link>
              </li>
              <li>
                <Link href="/calculate-repair-cost" className="hover:text-white transition-colors">
                  Calculate Repair Cost
                </Link>
              </li>
              <li>
                <Link href="/service-areas" className="hover:text-white transition-colors">
                  Areas Covered
                </Link>
              </li>
              <li>
                <Link href="/track-booking" className="hover:text-white transition-colors">
                  Track Your Repair
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Services */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services/laptop-repair" className="hover:text-white transition-colors">
                  Laptop Screen & Battery
                </Link>
              </li>
              <li>
                <Link href="/services/desktop-repair" className="hover:text-white transition-colors">
                  Desktop & Gaming PC
                </Link>
              </li>
              <li>
                <Link href="/services/software-os-services" className="hover:text-white transition-colors">
                  Data Recovery & OS Fix
                </Link>
              </li>
              <li>
                <Link href="/services/networking-services" className="hover:text-white transition-colors">
                  Wi-Fi & Office Networks
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Contact & Hours
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
