import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CalculatorAdminClient from './CalculatorAdminClient';

export const metadata = {
  title: 'Repair Cost Calculator Manager | ProTech Admin',
};

export default async function AdminCalculatorPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [items, settings, services] = await Promise.all([
    prisma.costCalculatorItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
    prisma.setting.findMany({
      where: {
        key: {
          in: [
            'calculator_devices',
            'calculator_brands',
            'calculator_brand_multipliers',
            'calculator_brand_category_costs',
            'calculator_button_active',
          ],
        },
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  let devices = [
    { id: 'Laptop', label: 'Laptop', tagline: 'Windows / Mac / Chromebook', badge: 'Most Popular', multiplier: 1.0 },
    { id: 'Desktop', label: 'Desktop / PC', tagline: 'Tower / All-in-One PC', badge: 'Fast Triage', multiplier: 0.95 },
    { id: 'MacBook', label: 'Apple MacBook', tagline: 'Air / Pro / M1-M3 / Intel', badge: 'Retina & Silicon', multiplier: 1.35 },
    { id: 'Gaming Rig', label: 'Gaming PC', tagline: 'Custom Rig / High-End GPU', badge: 'High Performance', multiplier: 1.15 },
  ];
  if (settingsMap.calculator_devices) {
    try {
      devices = JSON.parse(settingsMap.calculator_devices);
    } catch (e) {
      console.error('Failed to parse calculator_devices:', e);
    }
  }

  let brands = ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple', 'MSI', 'Samsung', 'Toshiba', 'Other Brand'];
  if (settingsMap.calculator_brands) {
    try {
      brands = JSON.parse(settingsMap.calculator_brands);
    } catch (e) {
      console.error('Failed to parse calculator_brands:', e);
    }
  }

  let brandMultipliers: Record<string, number> = { Apple: 1.35, MSI: 1.05 };
  if (settingsMap.calculator_brand_multipliers) {
    try {
      brandMultipliers = JSON.parse(settingsMap.calculator_brand_multipliers);
    } catch (e) {
      console.error('Failed to parse calculator_brand_multipliers:', e);
    }
  }

  let brandCategoryCosts: Record<
    string,
    Record<string, { multiplier: number; min?: number; max?: number }>
  > = {};
  if (settingsMap.calculator_brand_category_costs) {
    try {
      brandCategoryCosts = JSON.parse(settingsMap.calculator_brand_category_costs);
    } catch (e) {
      console.error('Failed to parse calculator_brand_category_costs:', e);
    }
  }

  const isButtonActive = settingsMap.calculator_button_active !== 'false';

  return (
    <CalculatorAdminClient
      initialItems={items}
      initialDevices={devices}
      initialBrands={brands}
      initialBrandMultipliers={brandMultipliers}
      initialBrandCategoryCosts={brandCategoryCosts}
      initialButtonActive={isButtonActive}
      services={services}
      userRole={session.role}
    />
  );
}
