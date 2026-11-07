'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'pill' | 'switch' | 'compact';
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  variant = 'button',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, isDark, toggleTheme, setTheme } = useAdminTheme();

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 transition-colors ${className}`}
        role="group"
        aria-label="Theme mode switcher"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !isDark
              ? 'bg-white text-amber-600 shadow-sm shadow-black/5 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-pressed={!isDark}
          title="Switch to Light Theme"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isDark
              ? 'bg-slate-900 text-sky-400 shadow-sm shadow-black/40 font-bold border border-slate-700/50'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-pressed={isDark}
          title="Switch to Dark Theme"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
          isDark ? 'bg-slate-800 ring-offset-slate-900' : 'bg-amber-100 ring-offset-white'
        } ${className}`}
        role="switch"
        aria-checked={isDark}
        aria-label={`Toggle theme (currently ${theme})`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        <span
          className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            isDark ? 'translate-x-6 bg-slate-950 text-sky-400' : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </span>
      </button>
    );
  }

  // Default 'button' or 'compact' variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
        isDark
          ? 'bg-slate-800/80 text-amber-400 hover:bg-slate-800 hover:text-amber-300 border border-slate-700/70'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
        )}
        {showLabel && (
          <span className="text-xs font-semibold">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </div>
    </button>
  );
}
