import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business & Operating Settings | ProTech Admin',
};

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const settingsList = await prisma.setting.findMany();
  const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));

  return <SettingsClient initialSettings={settings} currentUserRole={session.role} />;
}
