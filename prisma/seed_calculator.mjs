import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CALCULATOR_ITEMS = [
  {
    code: 'screen_replacement',
    name: 'Screen / Display Replacement',
    category: 'Display & Glass Panel',
    serviceSlug: 'laptop-repair',
    description: 'Cracked glass, glitching horizontal lines, ink bleed, or pitch black screen',
    baseMin: 2499,
    baseMax: 4800,
    turnaround: '1 - 2 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'Monitor',
    tag: 'Quick 2-Hour Swap',
    sortOrder: 1,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'screen_standard', label: 'OEM Standard HD Screen (Grade A)', priceMultiplier: 1.0, note: 'Best value replacement' },
      { id: 'screen_ips', label: 'FHD / IPS 144Hz High-Gamut Panel', priceMultiplier: 1.35, note: 'Vibrant color reproduction' },
      { id: 'screen_oem_plus', label: 'Original Manufacturer Grade (Apple / Dell)', priceMultiplier: 1.7, note: 'Factory original specs' },
    ]),
  },
  {
    code: 'battery_replacement',
    name: 'Battery & Charging Port Fix',
    category: 'Battery & Charging',
    serviceSlug: 'laptop-repair',
    description: 'Rapid drain in under 30 mins, swollen battery case, loose Type-C or DC jack pin',
    baseMin: 1499,
    baseMax: 2999,
    turnaround: '45 - 60 Mins',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'BatteryCharging',
    tag: 'Same-Day Swap',
    sortOrder: 2,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'battery_standard', label: 'Standard High-Capacity Battery', priceMultiplier: 1.0, note: 'Grade A cells' },
      { id: 'battery_genuine', label: 'Genuine Grade Long-Life Battery', priceMultiplier: 1.4, note: 'Maximum cycle life' },
      { id: 'battery_port_only', label: 'Type-C / DC Charging Port Repair Only', priceMultiplier: 0.85, note: 'Component soldering fix' },
    ]),
  },
  {
    code: 'motherboard_repair',
    name: 'Motherboard Chip-Level Repair',
    category: 'Power & Logic Board',
    serviceSlug: 'laptop-repair',
    description: 'Completely dead, no power LED light, short circuits, or sudden automatic shutdown',
    baseMin: 1800,
    baseMax: 4500,
    turnaround: 'Same-Day Diagnostic',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'Cpu',
    tag: 'Micro-Soldering Lab',
    sortOrder: 3,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'mb_power_ic', label: 'Power IC & MOSFET Chip Repair', priceMultiplier: 1.0, note: 'Fixes charging & startup logic' },
      { id: 'mb_bios', label: 'BIOS Reprogramming & IO Controller', priceMultiplier: 1.15, note: 'Firmware & sensor recovery' },
      { id: 'mb_reball', label: 'Full Component Re-balling & Track Restoration', priceMultiplier: 1.5, note: 'Severe board short-circuit' },
    ]),
  },
  {
    code: 'liquid_damage',
    name: 'Spilled Liquid & Water Damage Clean',
    category: 'Liquid & Water Damage',
    serviceSlug: 'laptop-repair',
    description: 'Accidental water, tea, coffee, or juice spill causing short circuits or sticky keyboard',
    baseMin: 1200,
    baseMax: 3200,
    turnaround: 'Urgent Ultrasonic Clean',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'Droplet',
    tag: 'Ultrasonic Bath',
    sortOrder: 4,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'liquid_clean', label: 'Chemical Wash & Ultrasonic Board Deoxidation', priceMultiplier: 1.0, note: 'Corrosion removal & drying' },
      { id: 'liquid_clean_parts', label: 'Liquid Deoxidation + Keypad / Trackpad Repair', priceMultiplier: 1.6, note: 'Includes input repairs' },
    ]),
  },
  {
    code: 'ssd_ram_upgrade',
    name: 'NVMe SSD & High-Speed RAM Upgrade',
    category: 'Hardware & Storage',
    serviceSlug: 'laptop-repair',
    description: 'Supercharge slow boot times, eliminate 100% disk usage, and upgrade to lightning NVMe',
    baseMin: 1850,
    baseMax: 4200,
    turnaround: '30 - 45 Mins',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'HardDrive',
    tag: '5x Speed Boost',
    sortOrder: 5,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'ssd_512', label: '512GB Ultra NVMe SSD (up to 3,500 MB/s)', priceMultiplier: 1.0, note: 'Includes OS migration' },
      { id: 'ssd_1tb', label: '1TB Gen4 High-Speed NVMe (up to 7,000 MB/s)', priceMultiplier: 1.65, note: 'Maximum storage & speed' },
      { id: 'ram_16gb', label: '16GB DDR4 / DDR5 High-Speed RAM Upgrade', priceMultiplier: 1.25, note: 'Smooth multitasking' },
    ]),
  },
  {
    code: 'keyboard_hinge',
    name: 'Keyboard & Broken Hinge Fabrication',
    category: 'Chassis & Keyboard',
    serviceSlug: 'laptop-repair',
    description: 'Broken plastic screen hinges, chassis coming apart, stuck or missing keys',
    baseMin: 1199,
    baseMax: 2600,
    turnaround: '1 - 2 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'Keyboard',
    tag: 'Reinforced Steel Bushing',
    sortOrder: 6,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'hinge_fix', label: 'Broken Hinge Reinforcement & Base Fabrication', priceMultiplier: 1.0, note: 'Heavy-duty steel binding' },
      { id: 'kb_replace', label: 'Full Backlit Keyboard Replacement', priceMultiplier: 1.35, note: 'Genuine brand layout' },
    ]),
  },
  {
    code: 'thermal_service',
    name: 'Thermal Servicing & Overheating Fix',
    category: 'Thermal & Cooling',
    serviceSlug: 'laptop-repair',
    description: 'Loud roaring fan, laptop burning hot to touch, thermal throttling while working or gaming',
    baseMin: 799,
    baseMax: 1499,
    turnaround: '45 Mins Service',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'Flame',
    tag: 'Arctic MX-4 Paste',
    sortOrder: 7,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'thermal_standard', label: 'Deep Heat-Sink De-dusting + Arctic MX-4 Paste', priceMultiplier: 1.0, note: 'Drops temp by 15-20°C' },
      { id: 'thermal_dual_fan', label: 'Dual Cooling Fan Replacement + Thermal Pads', priceMultiplier: 1.8, note: 'Gaming / high-performance' },
    ]),
  },
  {
    code: 'os_software_bsod',
    name: 'OS Recovery, Virus & BSOD Crash Fix',
    category: 'System & Software',
    serviceSlug: 'software-os-services',
    description: 'Blue Screen of Death (BSOD), endless reboot loops, malware removal, or driver errors',
    baseMin: 699,
    baseMax: 1299,
    turnaround: '1 - 2 Hours',
    warranty: '90-Day Parts & Labor Warranty',
    icon: 'Wrench',
    tag: 'Clean Genuine Setup',
    sortOrder: 8,
    isActive: true,
    tierOptionsJson: JSON.stringify([
      { id: 'os_clean_install', label: 'Genuine Windows 11 / macOS Clean Reinstall', priceMultiplier: 1.0, note: 'Includes drivers & updates' },
      { id: 'os_virus_backup', label: 'Full Malware Disinfection + 100% Data Protection', priceMultiplier: 1.3, note: 'Keeps all files intact' },
    ]),
  },
];

const DEFAULT_SETTINGS = [
  {
    key: 'calculator_devices',
    value: JSON.stringify([
      { id: 'Laptop', label: 'Laptop', tagline: 'Windows / Mac / Chromebook', badge: 'Most Popular', multiplier: 1.0 },
      { id: 'Desktop', label: 'Desktop / PC', tagline: 'Tower / All-in-One PC', badge: 'Fast Triage', multiplier: 0.95 },
      { id: 'MacBook', label: 'Apple MacBook', tagline: 'Air / Pro / M1-M3 / Intel', badge: 'Retina & Silicon', multiplier: 1.35 },
      { id: 'Gaming Rig', label: 'Gaming PC', tagline: 'Custom Rig / High-End GPU', badge: 'High Performance', multiplier: 1.15 },
    ]),
  },
  {
    key: 'calculator_brands',
    value: JSON.stringify([
      'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple', 'MSI', 'Samsung', 'Toshiba', 'Other Brand'
    ]),
  },
  {
    key: 'calculator_brand_multipliers',
    value: JSON.stringify({
      Apple: 1.35,
      MSI: 1.05,
    }),
  },
];

async function seedCalculator() {
  console.log('Seeding calculator items...');
  for (const item of DEFAULT_CALCULATOR_ITEMS) {
    await prisma.costCalculatorItem.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
  }

  console.log('Seeding calculator settings...');
  for (const s of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('Calculator seeded successfully!');
}

seedCalculator()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
