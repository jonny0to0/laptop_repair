'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  MessageCircle,
  Mail,
  Check,
  Archive,
  Trash2,
  AlertCircle,
  Clock,
  User,
  X,
} from 'lucide-react';

export interface MessageItem {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface MessagesClientProps {
  initialMessages: MessageItem[];
}

export default function MessagesClient({ initialMessages }: MessagesClientProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const counts = useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter((m) => m.status === 'new').length,
      read: messages.filter((m) => m.status === 'read').length,
      replied: messages.filter((m) => m.status === 'replied').length,
      archived: messages.filter((m) => m.status === 'archived').length,
    };
  }, [messages]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (selectedFilter !== 'all' && m.status !== selectedFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        m.name.toLowerCase().includes(q) ||
        m.mobile.includes(q) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, selectedFilter, searchQuery]);

  const handleUpdateStatus = async (
    msg: MessageItem,
    status: 'new' | 'read' | 'replied' | 'archived'
  ) => {
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((item) => (item.id === msg.id ? { ...item, status } : item))
        );
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (msg: MessageItem) => {
    if (!confirm(`Delete message from ${msg.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((item) => item.id !== msg.id));
      }
    } catch {
      alert('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-sky-500 dark:text-sky-400" />
            <span>Contact Inquiries & Leads Inbox</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Questions and pre-booking inquiries submitted by visitors from the contact page.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm dark:shadow-none transition-colors duration-150">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages by sender name, mobile, email, or message keyword..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedFilter === 'all'
                ? 'bg-sky-500 text-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Messages ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('new')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedFilter === 'new'
                ? 'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950'
                : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
            }`}
          >
            New Unread ({counts.new})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('replied')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedFilter === 'replied'
                ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Replied ({counts.replied})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('archived')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedFilter === 'archived'
                ? 'bg-slate-700 text-white dark:bg-slate-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Archived ({counts.archived})
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-sm dark:shadow-none">
            <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No messages found in this view.</p>
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 space-y-3 shadow-sm dark:shadow-none transition-colors ${
                m.status === 'new'
                  ? 'border-amber-300 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10'
                  : m.status === 'archived'
                  ? 'border-slate-200/60 dark:border-slate-800/50 opacity-60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold border border-sky-100 dark:border-sky-500/20">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span>{m.name}</span>
                      {m.status === 'new' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{m.mobile}</span>
                      {m.email && <span>• {m.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(m.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>
                </div>
              </div>

              {/* Message body */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {m.message}
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Contact actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${m.mobile}`}
                    className="min-h-[32px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sky-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-sky-400 font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-transparent"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>

                  <a
                    href={`https://wa.me/${m.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hi ${m.name}, thank you for contacting ProTech Computer Repairs regarding your message: "${m.message.slice(0, 50)}..."`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[32px] px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Reply on WhatsApp</span>
                  </a>
                </div>

                {/* Status updates */}
                <div className="flex items-center gap-2">
                  {m.status !== 'read' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(m, 'read')}
                      className="min-h-[32px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold transition-colors border border-slate-200 dark:border-transparent"
                    >
                      Mark Read
                    </button>
                  )}

                  {m.status !== 'replied' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(m, 'replied')}
                      className="min-h-[32px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800/40 font-semibold transition-colors"
                    >
                      Mark Replied
                    </button>
                  )}

                  {m.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(m, 'archived')}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors border border-slate-200 dark:border-transparent"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(m)}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950 dark:text-slate-400 dark:hover:text-rose-400 flex items-center justify-center transition-colors border border-slate-200 dark:border-transparent"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
