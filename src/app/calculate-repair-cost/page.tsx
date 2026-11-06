import { Suspense } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import CalculateCostClient from './CalculateCostClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Calculate Repair Cost | Instant Transparent Pricing | TechFix Kolkata',
  description:
    'Calculate upfront, realistic repair costs for your Laptop, Desktop, MacBook, or Gaming PC. Select your brand and symptoms for instant pricing, turnaround time, and 90-day repair warranty.',
  keywords: [
    'laptop repair cost calculator',
    'computer repair price kolkata',
    'screen replacement cost laptop',
    'laptop battery price kolkata',
    'macbook repair cost estimate',
    'desktop repair price calculator',
  ],
};

export default async function CalculateRepairCostPage() {
  const [services, serviceAreas, settingsList, calculatorItems] = await Promise.all([
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
    prisma.costCalculatorItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
  ]);

  const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));

  const phone = settings.phone || '+91 98765 43210';
  const whatsapp = settings.whatsapp || '919876543210';

  let devices;
  if (settings.calculator_devices) {
    try {
      devices = JSON.parse(settings.calculator_devices);
    } catch (e) {
      console.error('Failed to parse calculator_devices:', e);
    }
  }

  let brands;
  if (settings.calculator_brands) {
    try {
      brands = JSON.parse(settings.calculator_brands);
    } catch (e) {
      console.error('Failed to parse calculator_brands:', e);
    }
  }

  let brandMultipliers;
  if (settings.calculator_brand_multipliers) {
    try {
      brandMultipliers = JSON.parse(settings.calculator_brand_multipliers);
    } catch (e) {
      console.error('Failed to parse calculator_brand_multipliers:', e);
    }
  }

  let brandCategoryCosts;
  if (settings.calculator_brand_category_costs) {
    try {
      brandCategoryCosts = JSON.parse(settings.calculator_brand_category_costs);
    } catch (e) {
      console.error('Failed to parse calculator_brand_category_costs:', e);
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#155EEF] animate-spin" />
          <span className="text-sm font-medium text-slate-500">
            Loading interactive repair cost calculator...
          </span>
        </div>
      }
    >
      <CalculateCostClient
        services={services}
        serviceAreas={serviceAreas}
        phone={phone}
        whatsapp={whatsapp}
        calculatorItems={calculatorItems}
        calculatorDevices={devices}
        calculatorBrands={brands}
        calculatorBrandMultipliers={brandMultipliers}
        calculatorBrandCategoryCosts={brandCategoryCosts}
      />
    </Suspense>
  );
}
