import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CustomersClient from './CustomersClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Directory & Profiles | ProTech Admin',
};

export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const customers = await prisma.customer.findMany({
    include: {
      bookings: {
        select: {
          id: true,
          bookingCode: true,
          status: true,
          deviceType: true,
          problem: true,
          finalAmount: true,
          quotedAmount: true,
          createdAt: true,
          service: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedCustomers = customers.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    bookings: c.bookings.map((b) => ({
      ...b,
      finalAmount: b.finalAmount ? Number(b.finalAmount) : null,
      quotedAmount: b.quotedAmount ? Number(b.quotedAmount) : null,
      createdAt: b.createdAt.toISOString(),
    })),
  }));

  return <CustomersClient initialCustomers={serializedCustomers} currentUser={session} />;
}
