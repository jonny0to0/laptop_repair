'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Clock,
  User,
  Activity,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';

export interface AuditLogItem {
  id: number;
  userId: number | null;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  details: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AuditClientProps {
  initialLogs: AuditLogItem[];
}

export default function AuditClient({ initialLogs }: AuditClientProps) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all');

  const entities = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.entity) set.add(l.entity);
    });
    return Array.from(set);
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (selectedEntityFilter !== 'all' && l.entity !== selectedEntityFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        (l.details && l.details.toLowerCase().includes(q)) ||
        (l.user && l.user.name.toLowerCase().includes(q)) ||
        (l.user && l.user.email.toLowerCase().includes(q))
      );
    });
  }, [logs, selectedEntityFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span>Security & Operational Audit Log</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Immutable tracking of staff status changes, quote edits, service updates, and system activity.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by action, staff member, or details..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <select
            value={selectedEntityFilter}
            onChange={(e) => setSelectedEntityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 w-full sm:w-auto"
          >
            <option value="all">All Entities</option>
            {entities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs font-bold">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Entity</th>
                <th className="py-3.5 px-4 font-semibold">Actor / Staff</th>
                <th className="py-3.5 px-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">No audit entries found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800/40 text-xs">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {log.entity} {log.entityId ? `#${log.entityId}` : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {log.user ? (
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block text-sm">{log.user.name}</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 italic text-xs">System Automation</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-md">
                      <p className="line-clamp-2 text-xs leading-relaxed">{log.details || '—'}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
