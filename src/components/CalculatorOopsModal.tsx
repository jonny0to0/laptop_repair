'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  Phone,
  MessageCircle,
  Wrench,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';

interface CalculatorOopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone?: string;
  whatsapp?: string;
  address?: string;
  workingHours?: string;
}

export default function CalculatorOopsModal({
  isOpen,
  onClose,
  phone = '8345822352',
  whatsapp = '6295763758',
  address = 'West Bengal, Murshidabad',
  workingHours = 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed',
}: CalculatorOopsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');
  const defaultWhatsAppMsg = encodeURIComponent(
    'Hi ProTech! I tried using the online repair cost calculator, but it seems to be under maintenance. Could you please give me a quick repair estimate for my laptop/desktop?'
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Dialog Card (stops propagation so clicking inside does NOT close) */}
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/90 z-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white text-center overflow-hidden">
          {/* Ambient circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/35 text-white/90 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Playful Warning Icon */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner mb-3">
            <Wrench className="w-7 h-7 text-white stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-amber-100 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>Calculator Under Maintenance</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            Oops!
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-md mx-auto leading-relaxed">
            Our instant price calculator is currently taking a quick tune-up break.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Friendly Note */}
          <div className="text-center space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              Get an Instant Manual Quote in 60 Seconds
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Don&apos;t worry! Our expert technicians are active right now. Connect via phone or WhatsApp for an exact price estimate and free pickup triage.
            </p>
          </div>

          {/* Quick Contact Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Phone Call Button */}
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-[#0284C7] hover:bg-[#0369a1] active:bg-[#075985] shadow-md shadow-sky-600/20 transition-all text-center tap-target group"
            >
              <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Call: {phone}</span>
            </a>

            {/* WhatsApp Chat Button */}
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${defaultWhatsAppMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 transition-all text-center tap-target group"
            >
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>WhatsApp Tech</span>
            </a>
          </div>

          {/* Quick Contact & Store Details Box */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Service Workshop & Doorstep Hub:</span>
                <span className="text-slate-600">{address}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1 border-t border-slate-200/60">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800 block">Operating Hours:</span>
                <span className="text-slate-600">{workingHours}</span>
              </div>
            </div>
          </div>

          {/* Alternative Booking Action */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <Link
              href="/book-repair"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-[#0284C7] hover:text-[#0369a1] py-2 px-3 rounded-xl hover:bg-sky-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Free Diagnostic Visit Instead &rarr;</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 px-4 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
