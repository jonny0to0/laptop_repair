import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service & Repair Warranty Conditions',
  description:
    'Terms of service, diagnostic policy, 90-day warranty coverage, and repair authorization rules.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Terms of Service & Repair Conditions
        </h1>
        <p className="text-xs text-slate-500">Last updated: November 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Diagnostics & Quotation Approval</h2>
          <p>
            All repairs undergo an initial physical and electrical intake diagnostic. An itemized
            estimate detailing component replacement costs and labor will be provided to the customer.
            No physical repair will proceed without explicit customer approval via WhatsApp, phone, or
            written confirmation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. 90-Day Repair Warranty</h2>
          <p>
            Unless otherwise noted in your invoice, all replaced hardware components carry a 90-day
            limited warranty covering part defects and workmanship. The warranty does not cover
            subsequent physical impact, liquid immersion, or unauthorized third-party tampering after
            handover.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Customer Backup Responsibility</h2>
          <p>
            While ProTech exercises maximum caution, hardware failures (especially faulty hard drives
            and corrupted NAND chips) can result in data loss during stress testing. Customers are
            strongly advised to maintain backups of crucial files prior to check-in whenever possible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Device Collection & Storage</h2>
          <p>
            Repaired devices must be collected within 30 days of the "Ready for Collection" status
            notification unless alternate arrangements have been agreed in writing.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>ProTech IT & Computer Repair Workshop</span>
          <Link href="/" className="font-semibold text-sky-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
