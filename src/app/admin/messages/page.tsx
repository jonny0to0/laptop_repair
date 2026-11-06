import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MessagesClient from './MessagesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inquiries & Contact Inbox | ProTech Admin',
};

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const serialized = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  return <MessagesClient initialMessages={serialized} />;
}
