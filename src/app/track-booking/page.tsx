import { Suspense } from 'react';
import TrackBookingClient from './TrackBookingClient';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Track Your Repair Status | ProTech IT',
  description: 'Enter your repair tracking code or registered mobile number to check real-time workshop diagnostic status.',
};

export default function TrackBookingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <Suspense
        fallback={
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />
            <span className="text-sm font-medium text-slate-500">Loading tracker...</span>
          </div>
        }
      >
        <TrackBookingClient />
      </Suspense>
    </div>
  );
}
