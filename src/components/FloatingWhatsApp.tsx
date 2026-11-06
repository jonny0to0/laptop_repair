'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  whatsapp?: string;
}

export default function FloatingWhatsApp({ whatsapp = '919876543210' }: FloatingWhatsAppProps) {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  let customMsg = 'Hi ProTech, I would like to inquire about a computer repair service.';
  if (pathname.includes('/services/laptop-repair')) {
    customMsg = 'Hi ProTech, I need assistance with a laptop repair (screen/battery/motherboard).';
  } else if (pathname.includes('/services/desktop-repair')) {
    customMsg = 'Hi ProTech, I need help troubleshooting a desktop/gaming PC issue.';
  } else if (pathname.includes('/services/software-os-services')) {
    customMsg = 'Hi ProTech, I need support with data recovery or operating system reinstallation.';
  } else if (pathname.includes('/services/networking-services')) {
    customMsg = 'Hi ProTech, I want to book an on-site networking or Wi-Fi troubleshooting visit.';
  } else if (pathname.includes('/track-booking')) {
    customMsg = 'Hi ProTech, I would like an update on my repair status.';
  }

  const encodedMsg = encodeURIComponent(customMsg);

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-40">
      <a
        href={`https://wa.me/${cleanWhatsApp}?text=${encodedMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-sm font-semibold tracking-wide">Chat with Tech</span>
      </a>
    </div>
  );
}
