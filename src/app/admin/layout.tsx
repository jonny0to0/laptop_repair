import { getSession } from '@/lib/auth';
import AdminNav from './AdminNav';
import { AdminThemeProvider, AdminTheme } from '@/context/AdminThemeContext';
import { cookies } from 'next/headers';

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
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('protech_admin_theme')?.value;
  const initialTheme: AdminTheme = themeCookie === 'light' ? 'light' : 'dark';

  return (
    <>
      {/* Anti-Flicker Script for Instant Zero-Flash Theme Initialization */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var key = 'protech_admin_theme';
                var saved = localStorage.getItem(key);
                if (!saved) {
                  var m = document.cookie.match(new RegExp('(?:^|;\\\\s*)' + key + '=([^;]+)'));
                  if (m) saved = m[1];
                }
                var theme = saved === 'light' ? 'light' : 'dark';
                var el = document.documentElement;
                if (theme === 'dark') {
                  el.classList.add('dark');
                  el.classList.remove('light');
                  el.style.colorScheme = 'dark';
                } else {
                  el.classList.remove('dark');
                  el.classList.add('light');
                  el.style.colorScheme = 'light';
                }
                el.setAttribute('data-theme', theme);
              } catch(e) {}
            })();
          `,
        }}
      />
      <AdminThemeProvider initialTheme={initialTheme}>
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-150">
          <AdminNav user={session} />
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8 min-h-screen transition-colors duration-150">
            {children}
          </main>
        </div>
      </AdminThemeProvider>
    </>
  );
}
