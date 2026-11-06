import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNav from './AdminNav';

export const metadata = {
  title: 'Admin Operations Dashboard | ProTech IT',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If there's no session, we let client pages like /admin/login handle or redirect
  // But for server components inside admin, check session
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      <AdminNav user={session} />
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
