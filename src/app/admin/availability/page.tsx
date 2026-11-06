import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AvailabilityClient from './AvailabilityClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workshop Operating Hours & Capacity | ProTech Admin',
};

export default async function AdminAvailabilityPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [rules, holidays] = await Promise.all([
    prisma.availabilityRule.findMany({
      orderBy: { weekday: 'asc' },
    }),
    prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    }),
  ]);

  const serializedHolidays = holidays.map((h) => ({
    ...h,
    date: h.date.toISOString(),
  }));

  return (
    <AvailabilityClient
      initialRules={rules}
      initialHolidays={serializedHolidays}
      currentUserRole={session.role}
    />
  );
}
