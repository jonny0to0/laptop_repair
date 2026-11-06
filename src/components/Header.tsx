'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Calendar, Menu, X, Shield, Wrench, Search } from 'lucide-react';
import BusinessHoursBadge from './BusinessHoursBadge';

interface HeaderProps {
  businessName?: string;
  phone?: string;
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/calculate-repair-cost', label: 'Cost Calculator' },
  { href: '/service-areas', label: 'Areas Covered' },
  { href: '/track-booking', label: 'Track Repair' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
];

export default function Header({
  businessName = 'ProTech IT & Computer Repair',
  phone = '+91 98765 43210',
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide public header on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  return (
    <>
      {/* Top micro bar for operating hours & announcements */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BusinessHoursBadge />
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              Verified Parts & Diagnostic Warranty
            </span>
            <span>•</span>
            <Link
              href="/track-booking"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <Search className="w-3 h-3" />
              Track Device Status
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-tight">
                {businessName}
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                Laptops • Desktops • Chip-Level Service
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-sky-600 bg-sky-50 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors tap-target"
            >
              <Phone className="w-4 h-4 text-sky-600" />
              <span>{phone}</span>
            </a>
            <Link
              href="/book-repair"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 transition-all shadow-md shadow-sky-600/20 tap-target"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Repair</span>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/book-repair"
              className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 tap-target"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 tap-target flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Full-Height Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-white z-50 flex flex-col justify-between p-6 overflow-y-auto border-t border-slate-200 shadow-xl">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Navigation
              </div>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium tap-target ${
                      isActive
                        ? 'bg-sky-50 text-sky-600 font-semibold'
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-3 pb-16">
              <a
                href={`tel:${cleanPhone}`}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-semibold text-sm tap-target"
              >
                <Phone className="w-4 h-4 text-sky-600" />
                <span>Call {phone}</span>
              </a>
              <Link
                href="/book-repair"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 text-white font-semibold text-sm shadow-md tap-target"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule a Repair Wizard</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
