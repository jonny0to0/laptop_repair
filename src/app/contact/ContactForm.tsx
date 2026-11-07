'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, email, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ text: data.error || 'Failed to send message', isError: true });
        setLoading(false);
        return;
      }

      setFeedback({ text: data.message });
      setName('');
      setMobile('');
      setEmail('');
      setMessage('');
      setLoading(false);
    } catch {
      setFeedback({ text: 'Network connection error. Please try again.', isError: true });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-1">Send a Message</h3>
      <p className="text-xs text-slate-500 mb-6">
        Have a question before booking? Drop your details and we will get back to you promptly.
      </p>

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-2.5 ${
            feedback.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Nair"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Your Enquiry / Device Issue *
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what device model you have and what troubleshooting assistance you need..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all tap-target cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Enquiry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
