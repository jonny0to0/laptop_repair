'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Phone, MessageCircle, Calendar } from 'lucide-react';

interface MobileBottomBarProps {
  phone?: string;
  whatsapp?: string;
}

export default function MobileBottomBar({
  phone = '+91 98765 43210',
  whatsapp = '919876543210',
}: MobileBottomBarProps) {
  const pathname = usePathname();

  // Hide on admin routes or when pages have their own dedicated sticky dock
  if (
    pathname.startsWith('/admin') ||
    pathname === '/book-repair' ||
    pathname === '/calculate-repair-cost'
  ) {
    return null;
  }

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  const defaultMsg = encodeURIComponent(
    'Hi ProTech, I would like to inquire about booking a repair for my device.'
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-2xl">
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`tel:${cleanPhone}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors tap-target text-center"
        >
          <Phone className="w-4 h-4 text-sky-600 mb-0.5" />
          <span className="text-[11px] font-semibold leading-tight">Call Now</span>
        </a>

        <a
          href={`https://wa.me/${cleanWhatsApp}?text=${defaultMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors tap-target text-center"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span className="text-[11px] font-semibold leading-tight">WhatsApp</span>
        </a>

        <Link
          href="/book-repair"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/20 transition-all tap-target text-center"
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] leading-tight">Book Repair</span>
        </Link>
      </div>
    </div>
  );
}
