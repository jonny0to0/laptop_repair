'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/admin/ThemeToggle';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        setTimeout(() => {
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
        return;
      }

      setSuccess('Authentication successful! Redirecting to operations dashboard...');
      // Use window.location for full document navigation to guarantee cookie is attached
      setTimeout(() => {
        window.location.href = '/admin';
      }, 400);
    } catch {
      setError('Network connection error. Unable to reach authentication server.');
      setLoading(false);
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden transition-colors duration-150">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors tap-target"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Website</span>
        </Link>
        <ThemeToggle variant="button" />
      </div>

      <div className="w-full max-w-md relative z-10 mt-8 sm:mt-0">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 mb-4 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            ProTech Staff Portal
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-xs mx-auto">
            Authorized technician and management access to repair jobs and workshop queues.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-black/40">
          {error && (
            <div
              ref={errorRef}
              className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs sm:text-sm animate-in fade-in"
              role="alert"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-in fade-in"
              role="status"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
              >
                Administrator / Staff Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@protechrepairs.com"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-colors tap-target"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-11 pr-11 py-3 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-colors tap-target"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 p-1.5 transition-colors tap-target flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-60 text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-lg dark:shadow-sky-500/20 tap-target cursor-pointer touch-manipulation"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Default seeded owner credentials: <br />
              <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold select-all">
                admin@protechrepairs.com
              </span>{' '}
              /{' '}
              <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold select-all">
                Admin@12345
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>Protected by ProTech Enterprise Access Control & Audit Logging</p>
        </div>
      </div>
    </div>
  );
}
