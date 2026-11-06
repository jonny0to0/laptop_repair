import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Multipliers relative to master Catalog Issues Base Estimate
const BRAND_CATEGORY_MULTIPLIERS = {
  Dell: {
    'Display & Glass Panel': 1.15,
    'Battery & Charging': 1.10,
    'Power & Logic Board': 1.10,
    'Liquid & Water Damage': 1.05,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 1.10,
    'Thermal & Cooling': 1.00,
    'System & Software': 1.00,
  },
  HP: {
    'Display & Glass Panel': 1.00,
    'Battery & Charging': 1.00,
    'Power & Logic Board': 1.00,
    'Liquid & Water Damage': 1.00,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 1.00,
    'Thermal & Cooling': 1.00,
    'System & Software': 1.00,
  },
  Lenovo: {
    'Display & Glass Panel': 0.95,
    'Battery & Charging': 0.95,
    'Power & Logic Board': 0.95,
    'Liquid & Water Damage': 1.00,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 0.95,
    'Thermal & Cooling': 1.00,
    'System & Software': 1.00,
  },
  Apple: {
    'Display & Glass Panel': 2.40,
    'Battery & Charging': 2.00,
    'Power & Logic Board': 2.20,
    'Liquid & Water Damage': 1.80,
    'Hardware & Storage': 1.50,
    'Chassis & Keyboard': 2.00,
    'Thermal & Cooling': 1.30,
    'System & Software': 1.20,
  },
  ASUS: {
    'Display & Glass Panel': 1.10,
    'Battery & Charging': 1.05,
    'Power & Logic Board': 1.05,
    'Liquid & Water Damage': 1.00,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 1.05,
    'Thermal & Cooling': 1.05,
    'System & Software': 1.00,
  },
  Acer: {
    'Display & Glass Panel': 0.90,
    'Battery & Charging': 0.90,
    'Power & Logic Board': 0.90,
    'Liquid & Water Damage': 1.00,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 0.90,
    'Thermal & Cooling': 1.00,
    'System & Software': 1.00,
  },
  MSI: {
    'Display & Glass Panel': 1.25,
    'Battery & Charging': 1.15,
    'Power & Logic Board': 1.20,
    'Liquid & Water Damage': 1.10,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 1.20,
    'Thermal & Cooling': 1.25,
    'System & Software': 1.00,
  },
  Samsung: {
    'Display & Glass Panel': 1.20,
    'Battery & Charging': 1.10,
    'Power & Logic Board': 1.10,
    'Liquid & Water Damage': 1.00,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 1.10,
    'Thermal & Cooling': 1.00,
    'System & Software': 1.00,
  },
  Toshiba: {
    'Display & Glass Panel': 0.95,
    'Battery & Charging': 0.95,
    'Power & Logic Board': 0.95,
    'Liquid & Water Damage': 1.00,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 0.95,
    'Thermal & Cooling': 1.00,
    'System & Software': 1.00,
  },
  'Other Brand': {
    'Display & Glass Panel': 1.00,
    'Battery & Charging': 1.00,
    'Power & Logic Board': 1.00,
    'Liquid & Water Damage': 1.00,
    'Hardware & Storage': 1.00,
    'Chassis & Keyboard': 1.00,
    'Thermal & Cooling': 1.00,
    'System & Software': 1.00,
  },
};

async function seedBrandCategoryCosts() {
  console.log('Seeding brand category multipliers into settings...');
  await prisma.setting.upsert({
    where: { key: 'calculator_brand_category_costs' },
    update: { value: JSON.stringify(BRAND_CATEGORY_MULTIPLIERS) },
    create: {
      key: 'calculator_brand_category_costs',
      value: JSON.stringify(BRAND_CATEGORY_MULTIPLIERS),
    },
  });
  console.log('Brand category multipliers successfully seeded!');
}

seedBrandCategoryCosts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
