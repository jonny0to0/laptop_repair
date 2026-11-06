import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import BookRepairClient from './BookRepairClient';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book a Device Repair | Select Your Issue | ProTech IT',
  description:
    'Select your laptop or desktop issue and book a certified diagnostic repair. Same-day service, genuine components, and 90-day warranty.',
};

export default async function BookRepairPage() {
  const [services, serviceAreas, settingsList] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, pincodes: true },
    }),
    prisma.setting.findMany(),
  ]);

  const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));

  const phone = settings.phone || '+91 98765 43210';
  const whatsapp = settings.whatsapp || '919876543210';
  const address = settings.address || 'Shop 14, Silicon Arcade, Tech Avenue, Metro Plaza';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />
            <span className="text-sm font-medium text-slate-500">Loading issue selector & booking wizard...</span>
          </div>
        }
      >
        <BookRepairClient
          services={services}
          serviceAreas={serviceAreas}
          phone={phone}
          whatsapp={whatsapp}
          address={address}
        />
      </Suspense>
    </div>
  );
}
