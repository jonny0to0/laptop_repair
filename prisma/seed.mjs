import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. First Admin User (Owner)
  const defaultPassword = 'Admin@12345';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@protechrepairs.com' },
    update: {},
    create: {
      name: 'Business Owner',
      email: 'admin@protechrepairs.com',
      passwordHash: passwordHash,
      role: 'owner',
    },
  });
  console.log(`Admin user ready: ${admin.email}`);

  // 2. Default Services
  const defaultServices = [
    {
      name: 'Laptop Repair',
      slug: 'laptop-repair',
      shortDesc: 'Screen replacement, battery issues, liquid damage, keyboard and motherboard chip-level repair.',
      fullDesc: 'Comprehensive laptop diagnostic and hardware repairs for all major brands including Dell, HP, Lenovo, Apple MacBook, Asus, and Acer. We fix broken displays, faulty charging ports, overheating fans, slow SSD upgrades, and water damage with precision micro-soldering.',
      icon: 'Laptop',
      priceMode: 'starts_from',
      priceText: 'From ₹499 (Free diagnostics with repair)',
      metaTitle: 'Expert Laptop Repair Services | ProTech IT',
      metaDescription: 'Fast, certified laptop repair services. Screen, battery, motherboard, and keyboard repairs with genuine parts and warranty.',
      sortOrder: 1,
      isActive: true,
      faqJson: JSON.stringify([
        { q: 'How long does a screen replacement take?', a: 'Most common laptop screens are replaced within 2 to 4 hours if parts are in stock.' },
        { q: 'Do you provide warranty on replaced parts?', a: 'Yes, we provide 3 to 12 months warranty on all genuine replacement hardware.' },
        { q: 'Can you fix water or liquid spill damage?', a: 'Yes, our technicians perform ultrasonic cleaning and chip-level motherboard restoration.' },
      ]),
    },
    {
      name: 'Desktop & PC Repair',
      slug: 'desktop-repair',
      shortDesc: 'Custom gaming PCs, PSU failures, motherboard diagnostics, CPU cooling and hardware upgrades.',
      fullDesc: 'Specialized desktop tower diagnostics and repair services. From custom gaming rigs crashing under load to office workstations that will not power on, we diagnose power supplies, GPU faults, RAM errors, and cooling system leaks.',
      icon: 'Monitor',
      priceMode: 'starts_from',
      priceText: 'From ₹399',
      metaTitle: 'Desktop & Gaming PC Repair Services | ProTech IT',
      metaDescription: 'Professional desktop and gaming PC repairs, component diagnostics, PSU/GPU upgrades, and thermal optimization.',
      sortOrder: 2,
      isActive: true,
      faqJson: JSON.stringify([
        { q: 'Do you assemble custom gaming PCs?', a: 'Yes, we build, stress test, and cable manage custom gaming and workstation rigs.' },
        { q: 'My PC turns on but shows no display, what is wrong?', a: 'This is usually caused by RAM seating, GPU failure, or BIOS corruption. We diagnose this same-day.' },
      ]),
    },
    {
      name: 'Software & OS Services',
      slug: 'software-os-services',
      shortDesc: 'OS installation, virus/malware removal, corrupted boot fixes, and secure data recovery.',
      fullDesc: 'Complete operating system solutions for Windows, macOS, and Linux. We handle blue screen crashes (BSOD), infected systems, ransomware threats, driver conflicts, slow boot times, and safe disk image cloning before major repairs.',
      icon: 'Cpu',
      priceMode: 'starts_from',
      priceText: 'From ₹299',
      metaTitle: 'OS & Software Repair, Virus Removal | ProTech IT',
      metaDescription: 'Windows & macOS reinstallation, malware/spyware elimination, data recovery, and performance tuning.',
      sortOrder: 3,
      isActive: true,
      faqJson: JSON.stringify([
        { q: 'Will I lose my files during Windows reinstallation?', a: 'No, we perform a complete local backup of your Documents, Desktop, and personal files before reinstalling.' },
        { q: 'Can you recover files from an unbootable drive?', a: 'Yes, we use read-only forensic cloning tools to safely extract your files.' },
      ]),
    },
    {
      name: 'Networking & IT Support',
      slug: 'networking-services',
      shortDesc: 'Wi-Fi coverage, router configuration, LAN cabling, NAS setup, and small business IT management.',
      fullDesc: 'Reliable network infrastructure and IT support for homes and small businesses. We troubleshoot unstable Wi-Fi, dead zones with mesh systems, configure firewall/VPNs, set up network-attached storage (NAS), and manage printer sharing.',
      icon: 'Wifi',
      priceMode: 'starts_from',
      priceText: 'From ₹599',
      metaTitle: 'Networking & On-Site IT Support | ProTech IT',
      metaDescription: 'Wi-Fi troubleshooting, office LAN setup, router security, and on-site technician visits.',
      sortOrder: 4,
      isActive: true,
      faqJson: JSON.stringify([
        { q: 'Do you do on-site visits for networking issues?', a: 'Yes, we provide doorstep on-site visits across our listed service areas.' },
        { q: 'Can you fix Wi-Fi dead spots in large houses or offices?', a: 'Yes, we design and install seamless Wi-Fi 6 mesh networks.' },
      ]),
    },
  ];

  for (const s of defaultServices) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`Configured ${defaultServices.length} default services.`);

  // 3. Default Service Areas
  const defaultAreas = [
    {
      name: 'Central Business District & Downtown',
      slug: 'downtown-central',
      pincodes: '110001, 110002, 110003',
      description: 'Full doorstep pickup, delivery, and express 2-hour on-site visit coverage.',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'North Tech Corridor & Suburbs',
      slug: 'north-tech-corridor',
      pincodes: '110004, 110005, 110006',
      description: 'Scheduled daily morning and afternoon courier pickup and on-site support.',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'South Commercial & Residential Hub',
      slug: 'south-commercial-hub',
      pincodes: '110007, 110008, 110009',
      description: 'Home pickup and workshop drop-off with priority diagnostic turnarounds.',
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'West Industrial & Tech Park',
      slug: 'west-tech-park',
      pincodes: '110010, 110011, 110012',
      description: 'Same-day corporate workstation and IT networking visits.',
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const a of defaultAreas) {
    await prisma.serviceArea.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
  }
  console.log(`Configured ${defaultAreas.length} default service areas.`);

  // 4. Default Availability Rules (Mon - Sat 09:00 - 19:00, Sun Closed)
  const days = [
    { weekday: 0, openTime: '00:00', closeTime: '00:00', slotCapacity: 0, isClosed: true }, // Sunday
    { weekday: 1, openTime: '09:00', closeTime: '19:00', slotCapacity: 6, isClosed: false }, // Monday
    { weekday: 2, openTime: '09:00', closeTime: '19:00', slotCapacity: 6, isClosed: false }, // Tuesday
    { weekday: 3, openTime: '09:00', closeTime: '19:00', slotCapacity: 6, isClosed: false }, // Wednesday
    { weekday: 4, openTime: '09:00', closeTime: '19:00', slotCapacity: 6, isClosed: false }, // Thursday
    { weekday: 5, openTime: '09:00', closeTime: '19:00', slotCapacity: 6, isClosed: false }, // Friday
    { weekday: 6, openTime: '09:00', closeTime: '18:00', slotCapacity: 4, isClosed: false }, // Saturday
  ];

  for (const day of days) {
    await prisma.availabilityRule.upsert({
      where: { weekday: day.weekday },
      update: day,
      create: day,
    });
  }
  console.log('Configured weekly availability schedule.');

  // 5. Default Business Settings
  const defaultSettings = [
    { key: 'business_name', value: 'ProTech IT & Computer Repair' },
    { key: 'phone', value: '+91 98765 43210' },
    { key: 'whatsapp', value: '919876543210' },
    { key: 'email', value: 'support@protechrepairs.com' },
    { key: 'address', value: 'Shop 14, Silicon Arcade, Tech Avenue, Metro Plaza' },
    { key: 'working_hours', value: 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: Closed' },
    { key: 'google_maps_embed', value: 'https://maps.google.com' },
    { key: 'default_whatsapp_msg', value: 'Hi ProTech, I would like to inquire about a repair for my device.' },
    { key: 'emergency_notice', value: '' },
    { key: 'currency_symbol', value: '₹' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('Configured default business settings.');

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
