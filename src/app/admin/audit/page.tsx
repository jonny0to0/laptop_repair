import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AuditClient from './AuditClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Activity & Audit Log | ProTech Admin',
};

export default async function AdminAuditPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: { name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const serialized = logs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return <AuditClient initialLogs={serialized} />;
}
