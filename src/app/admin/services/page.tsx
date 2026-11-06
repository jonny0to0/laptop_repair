import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ServicesClient from './ServicesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Services Catalog | ProTech Admin',
};

export default async function AdminServicesPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const services = await prisma.service.findMany({
    include: {
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const serialized = services.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <ServicesClient initialServices={serialized} />;
}
