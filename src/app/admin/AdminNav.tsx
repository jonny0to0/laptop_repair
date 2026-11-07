'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Wrench,
  MapPin,
  Star,
  MessageSquare,
  Clock,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import { AdminSessionUser } from '@/lib/auth';
import ThemeToggle from '@/components/admin/ThemeToggle';

interface AdminNavProps {
  user: AdminSessionUser | null;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/calculator', label: 'Cost Calculator', icon: Calculator },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/areas', label: 'Service Areas', icon: MapPin },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/availability', label: 'Availability', icon: Clock },
  { href: '/admin/settings', label: 'Business Settings', icon: Settings },
  { href: '/admin/audit', label: 'Audit Log', icon: Shield },
];

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, don't render navigation
  if (pathname?.startsWith('/admin/login')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/admin/login';
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-40 transition-colors duration-150">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            P
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">ProTech Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="button" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
              PT
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight leading-tight">
                ProTech IT
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Ops & Workshop
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 transition-colors duration-150">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Signed in as</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {user.name}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wider uppercase bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                {user.role}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-500 text-white dark:text-slate-950 font-semibold shadow-md shadow-sky-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions & Global Theme Switching Control */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors duration-150">
          {/* Theme Mode Switcher Box */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Appearance
            </span>
            <ThemeToggle variant="pill" />
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-400" />
              View Public Website
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}
    </>
  );
}
