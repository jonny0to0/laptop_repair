import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BookingsClient from './BookingsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Bookings & Workshop Queue | ProTech Admin',
};

export default async function AdminBookingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  // Fetch all bookings with customer, service, area, and status history
  const [bookings, services, serviceAreas] = await Promise.all([
    prisma.booking.findMany({
      include: {
        customer: true,
        service: true,
        area: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.serviceArea.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  // Convert Decimals to numbers for serializability
  const serializedBookings = bookings.map((b) => ({
    ...b,
    quotedAmount: b.quotedAmount ? Number(b.quotedAmount) : null,
    finalAmount: b.finalAmount ? Number(b.finalAmount) : null,
    preferredDate: b.preferredDate ? b.preferredDate.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    statusHistory: b.statusHistory.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  return (
    <BookingsClient
      initialBookings={serializedBookings}
      services={services}
      serviceAreas={serviceAreas}
      currentUser={session}
    />
  );
}
