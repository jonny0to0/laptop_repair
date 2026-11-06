import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Customer Data Safeguards',
  description:
    'Our privacy policy detailing how your device data, personal contact information, and repair logs are protected.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          Data Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Privacy Policy & Customer Data Safeguards
        </h1>
        <p className="text-xs text-slate-500">Last updated: November 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Customer Data Privacy First</h2>
          <p>
            At ProTech IT, we treat your device data with absolute confidentiality. We never access,
            copy, browse, or disclose any personal photos, documents, emails, browser histories, or
            applications stored on customer drives without your direct and explicit request (e.g. for
            data recovery or system migration).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
          <p>
            When you book a repair, submit a message, or request doorstep courier service, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Your name and contact phone / WhatsApp number for booking confirmation and status alerts.</li>
            <li>Your physical address or area pincode (only if home pickup or on-site service is requested).</li>
            <li>Device hardware details (brand, model, reported symptoms, serial numbers).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. How Your Information is Used</h2>
          <p>
            Your information is used strictly to fulfill the requested repair, provide real-time status
            tracking via Booking ID, and honor our 90-day warranty. We do not sell, rent, or distribute
            your contact details to any third-party marketing services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Right to Data Erasure</h2>
          <p>
            Upon completion of your repair and warranty cycle, you may request the deletion of your
            personal contact profile from our system by messaging us with your Booking ID.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Need clarification? Contact support@protechrepairs.com</span>
          <Link href="/" className="font-semibold text-sky-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
