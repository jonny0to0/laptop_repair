import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AreasClient from './AreasClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service Areas & Pincodes Manager | ProTech Admin',
};

export default async function AdminAreasPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const areas = await prisma.serviceArea.findMany({
    include: {
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const serialized = areas.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return <AreasClient initialAreas={serialized} />;
}
