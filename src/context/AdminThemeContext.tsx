'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type AdminTheme = 'dark' | 'light';

interface AdminThemeContextType {
  theme: AdminTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'protech_admin_theme';
const COOKIE_NAME = 'protech_admin_theme';

function getInitialTheme(): AdminTheme {
  if (typeof window === 'undefined') return 'dark';

  try {
    const saved = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    if (match && (match[1] === 'light' || match[1] === 'dark')) {
      return match[1] as AdminTheme;
    }
  } catch {
    // ignore local storage / cookie errors in restricted environments
  }

  // Default theme is 'dark' as required
  return 'dark';
}

function applyThemeToDOM(theme: AdminTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }

  root.setAttribute('data-theme', theme);
}

export function AdminThemeProvider({
  children,
  initialTheme = 'dark',
}: {
  children: React.ReactNode;
  initialTheme?: AdminTheme;
}) {
  const [theme, setThemeState] = useState<AdminTheme>(initialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read preference on client: check localStorage, fallback to initialTheme
    let currentTheme: AdminTheme = initialTheme;
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
      if (saved === 'light' || saved === 'dark') {
        currentTheme = saved;
      }
    } catch {
      // ignore storage access errors
    }

    setThemeState(currentTheme);
    applyThemeToDOM(currentTheme);
    setMounted(true);

    // Sync if other tabs change the theme
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        const nextTheme = e.newValue as AdminTheme;
        setThemeState(nextTheme);
        applyThemeToDOM(nextTheme);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      // Clean up theme classes on root when leaving admin pages
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.style.colorScheme = '';
        root.removeAttribute('data-theme');
      }
    };
  }, [initialTheme]);

  const setTheme = useCallback((nextTheme: AdminTheme) => {
    setThemeState(nextTheme);
    applyThemeToDOM(nextTheme);

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
      document.cookie = `${COOKIE_NAME}=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <div className={`admin-theme-wrapper w-full min-h-screen ${theme}`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme(): AdminThemeContextType {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
