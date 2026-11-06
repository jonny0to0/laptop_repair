import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { Camera, Image as ImageIcon, Wrench, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workshop Gallery & Repair Work | ProTech IT',
  description:
    'Take a look inside our clean ESD-safe repair laboratory, chip-level micro-soldering stations, and completed desktop builds.',
};

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  const sampleWork = [
    {
      title: 'Precision Micro-soldering Bench',
      category: 'Workshop',
      desc: 'High-magnification stereo microscope setup for repairing corroded motherboard traces and replacing blown power ICs.',
    },
    {
      title: 'MacBook Liquid Spill Ultrasonic Bath',
      category: 'Laptop',
      desc: 'Complete logic board cleaning and de-oxidation treatment after coffee damage.',
    },
    {
      title: 'Custom Gaming Rig Thermal Repasting',
      category: 'Desktop',
      desc: 'Liquid metal re-pasting and dual-chamber cable management for RTX 4080 workstation.',
    },
    {
      title: 'Broken Laptop Hinge & Screen Restorations',
      category: 'Before/After',
      desc: 'Re-anchored display brass nuts and replaced bezel without costly chassis replacements.',
    },
    {
      title: 'Clean ESD Anti-Static Workstations',
      category: 'Workshop',
      desc: 'Grounded wrist straps and static-dissipative mats protect sensitive silicon during repairs.',
    },
    {
      title: 'High-Density SSD Upgrade & Cloning Station',
      category: 'Laptop',
      desc: 'Read-only drive imaging to transfer complete operating system environments to high-speed NVMe.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          Behind the Scenes
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
          Workshop Laboratory & Repair Showcase
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          See where your devices are diagnosed and repaired. Our laboratory is equipped with
          oscilloscopes, thermal cameras, ultrasonic cleaners, and genuine testing fixtures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleWork.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            <div className="h-48 bg-slate-900 relative flex items-center justify-center text-slate-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-slate-800" />
              <div className="relative z-10 flex flex-col items-center gap-2 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-400">{item.title}</span>
              </div>
              <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-sky-400 border border-slate-800 backdrop-blur-xs">
                {item.category}
              </span>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
