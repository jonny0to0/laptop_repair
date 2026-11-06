'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Wrench,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  Shield,
  Trash2,
  Crown,
  UserCheck,
  UserX,
  SlidersHorizontal,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { STATUS_MAP, BookingStatus } from '@/types';
import { AdminSessionUser } from '@/lib/auth';

export interface BookingSnippet {
  id: number;
  bookingCode: string;
  status: BookingStatus;
  deviceType: string;
  problem: string;
  finalAmount: number | null;
  quotedAmount: number | null;
  createdAt: string;
  service: { name: string };
}

export interface SerializedCustomer {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  address: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  bookings: BookingSnippet[];
}

interface CustomersClientProps {
  initialCustomers: SerializedCustomer[];
  currentUser: AdminSessionUser;
}

export const CUSTOMER_STATUS_MAP: Record<
  string,
  { label: string; badgeClass: string; dotColor: string }
> = {
  active: {
    label: 'Active',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  vip: {
    label: 'VIP Client',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 font-bold',
    dotColor: 'bg-purple-400',
  },
  inactive: {
    label: 'Inactive',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-600/30',
    dotColor: 'bg-slate-500',
  },
  blocked: {
    label: 'Blocked',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dotColor: 'bg-rose-500',
  },
};

export default function CustomersClient({ initialCustomers, currentUser }: CustomersClientProps) {
  const [customers, setCustomers] = useState<SerializedCustomer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [onlyRepeat, setOnlyRepeat] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [activeCustomer, setActiveCustomer] = useState<SerializedCustomer | null>(null);
  const [modalTab, setModalTab] = useState<'profile' | 'history'>('profile');

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied feedback
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Quick stats
  const stats = useMemo(() => {
    const total = customers.length;
    const repeat = customers.filter((c) => c.bookings.length > 1).length;
    const vip = customers.filter((c) => c.status === 'vip').length;
    const totalSpent = customers.reduce((acc, c) => {
      return acc + c.bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    }, 0);

    return { total, repeat, vip, totalSpent };
  }, [customers]);

  // Filtered and Sorted list
  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    // Status filter
    if (selectedStatusTab !== 'all') {
      result = result.filter((c) => (c.status || 'active').toLowerCase() === selectedStatusTab);
    }

    // Repeat customers filter
    if (onlyRepeat) {
      result = result.filter((c) => c.bookings.length > 1);
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const custCode = `#cust-${String(c.id).padStart(4, '0')}`.toLowerCase();
        const matchesId = custCode.includes(q) || String(c.id) === q;
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.mobile.includes(q);
        const matchesEmail = c.email ? c.email.toLowerCase().includes(q) : false;
        const matchesAddress = c.address ? c.address.toLowerCase().includes(q) : false;
        const matchesNotes = c.notes ? c.notes.toLowerCase().includes(q) : false;
        return matchesId || matchesName || matchesPhone || matchesEmail || matchesAddress || matchesNotes;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'bookings_desc':
          return b.bookings.length - a.bookings.length;
        case 'spent_desc': {
          const spentA = a.bookings.reduce((sum, item) => sum + (item.finalAmount || 0), 0);
          const spentB = b.bookings.reduce((sum, item) => sum + (item.finalAmount || 0), 0);
          return spentB - spentA;
        }
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [customers, selectedStatusTab, onlyRepeat, searchQuery, sortBy]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedCustomers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedCustomers, safeCurrentPage, pageSize]);

  // Open modal and pre-fill state
  const handleOpenCustomer = (c: SerializedCustomer) => {
    setActiveCustomer(c);
    setEditName(c.name);
    setEditMobile(c.mobile);
    setEditEmail(c.email || '');
    setEditAddress(c.address || '');
    setEditStatus(c.status || 'active');
    setEditNotes(c.notes || '');
    setModalTab('profile');
    setSaveSuccess(false);
    setErrorMessage(null);
    setShowDeleteConfirm(false);
  };

  // Copy customer ID helper
  const handleCopyId = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save changes
  const handleSaveCustomer = async () => {
    if (!activeCustomer) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/customers/${activeCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          mobile: editMobile,
          email: editEmail,
          address: editAddress,
          status: editStatus,
          notes: editNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update customer record');
        setIsSaving(false);
        return;
      }

      const updated = customers.map((c) => {
        if (c.id === activeCustomer.id) {
          return {
            ...c,
            name: editName.trim(),
            mobile: editMobile.trim(),
            email: editEmail.trim() ? editEmail.trim() : null,
            address: editAddress.trim() ? editAddress.trim() : null,
            status: editStatus,
            notes: editNotes.trim() ? editNotes.trim() : null,
          };
        }
        return c;
      });

      setCustomers(updated);
      setActiveCustomer({
        ...activeCustomer,
        name: editName.trim(),
        mobile: editMobile.trim(),
        email: editEmail.trim() ? editEmail.trim() : null,
        address: editAddress.trim() ? editAddress.trim() : null,
        status: editStatus,
        notes: editNotes.trim() ? editNotes.trim() : null,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMessage('Network error while saving customer details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete customer (Owner permission)
  const handleDeleteCustomer = async () => {
    if (!activeCustomer) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/customers/${activeCustomer.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to delete customer record');
        setIsDeleting(false);
        return;
      }

      setCustomers((prev) => prev.filter((c) => c.id !== activeCustomer.id));
      setActiveCustomer(null);
      setShowDeleteConfirm(false);
    } catch {
      setErrorMessage('Network error while deleting customer.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = currentUser.role === 'owner';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ================= HEADER & OVERVIEW ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-sky-400" />
            <span>Customer Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centralized directory to search, review repair histories, manage contact profiles, and update client statuses.
          </p>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">All registered clients</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-sky-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Repeat Clients</span>
            <UserCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300">{stats.repeat}</div>
          <div className="text-[11px] text-sky-400/70 mt-0.5">Multiple repair bookings</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">VIP Members</span>
            <Crown className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">{stats.vip}</div>
          <div className="text-[11px] text-purple-400/70 mt-0.5">Priority corporate & VIPs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Billed Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 font-mono">
            ₹{stats.totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400/70 mt-0.5">Total completed repairs</div>
        </div>
      </div>

      {/* ================= CONTROLS: SEARCH, FILTERS & SORT ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Customer ID (e.g. #CUST-0001), full name, phone number, email, or address..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters and Sorting Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'vip', label: 'VIP' },
              { id: 'inactive', label: 'Inactive' },
              { id: 'blocked', label: 'Blocked' },
            ].map((tab) => {
              const active = selectedStatusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedStatusTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm shadow-sky-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Repeat Customer Toggle */}
            <button
              type="button"
              onClick={() => {
                setOnlyRepeat(!onlyRepeat);
                setCurrentPage(1);
              }}
              className={`ml-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5 ${
                onlyRepeat
                  ? 'bg-purple-950/60 border-purple-600/80 text-purple-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Repeat Clients Only</span>
            </button>
          </div>

          {/* Sort Selector & Page Size */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="newest">Registration: Newest</option>
                <option value="oldest">Registration: Oldest</option>
                <option value="name_asc">Name: A → Z</option>
                <option value="name_desc">Name: Z → A</option>
                <option value="bookings_desc">Total Bookings (High-Low)</option>
                <option value="spent_desc">Total Spent (High-Low)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CUSTOMERS CENTRALIZED LISTING TABLE ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Customer ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                <th className="py-3.5 px-4 font-semibold">Contact & Phone</th>
                <th className="py-3.5 px-4 font-semibold">Address</th>
                <th className="py-3.5 px-4 font-semibold">Repairs</th>
                <th className="py-3.5 px-4 font-semibold">Registered</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {pagedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No customers matching your criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filters.</p>
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((c) => {
                  const custCode = `#CUST-${String(c.id).padStart(4, '0')}`;
                  const statusConf =
                    CUSTOMER_STATUS_MAP[(c.status || 'active').toLowerCase()] || CUSTOMER_STATUS_MAP.active;
                  const totalSpent = c.bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleOpenCustomer(c)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* Customer ID */}
                      <td className="py-4 px-4 font-mono font-bold text-sky-400">
                        <div className="flex items-center gap-1.5">
                          <span>{custCode}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyId(c.id, custCode);
                            }}
                            className="text-slate-500 hover:text-white transition-colors"
                            title="Copy Customer ID"
                          >
                            {copiedId === c.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Full Name & Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-sky-400 font-bold flex items-center justify-center shrink-0 border border-slate-700">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {c.status === 'vip' && (
                                <Crown className="w-3 h-3 text-purple-400 shrink-0" />
                              )}
                            </div>
                            {c.email ? (
                              <div className="text-[11px] text-slate-400 mt-0.5">{c.email}</div>
                            ) : (
                              <div className="text-[11px] text-slate-600 mt-0.5 italic">No email</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone & Quick Contact */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${c.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-300 hover:text-sky-400 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3 h-3 text-sky-400" />
                            <span>{c.mobile}</span>
                          </a>
                          <a
                            href={`https://wa.me/${c.mobile.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors p-0.5"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Physical Address */}
                      <td className="py-4 px-4 max-w-xs">
                        {c.address ? (
                          <div className="text-slate-300 text-xs truncate flex items-center gap-1" title={c.address}>
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{c.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Total Bookings & Spent */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full text-[11px] border border-slate-700">
                            <Wrench className="w-3 h-3 text-sky-400" />
                            {c.bookings.length} {c.bookings.length === 1 ? 'job' : 'jobs'}
                          </span>
                        </div>
                        {totalSpent > 0 && (
                          <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1">
                            ₹{totalSpent.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-4 text-slate-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Customer Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor}`} />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenCustomer(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 transition-all border border-slate-700 hover:border-transparent cursor-pointer shadow-xs"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION CONTROLS ================= */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{' '}
            <strong className="text-white">
              {filteredAndSortedCustomers.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-white">
              {Math.min(safeCurrentPage * pageSize, filteredAndSortedCustomers.length)}
            </strong>{' '}
            of <strong className="text-white">{filteredAndSortedCustomers.length}</strong> customers
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-semibold text-slate-300">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= DETAILED CUSTOMER PROFILE & HISTORY MODAL ================= */}
      {activeCustomer && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex items-start sm:items-center justify-center overscroll-contain animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-left overflow-hidden my-4 sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                    #CUST-{String(activeCustomer.id).padStart(4, '0')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Registered on{' '}
                    {new Date(activeCustomer.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <span>{activeCustomer.name}</span>
                  {activeCustomer.status === 'vip' && (
                    <Crown className="w-4 h-4 text-purple-400" />
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActiveCustomer(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalTab('profile')}
                className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                  modalTab === 'profile'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Profile & Edit Details</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('history')}
                className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                  modalTab === 'history'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Repair History ({activeCustomer.bookings.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Quick Contact & Info Bar */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm border border-sky-500/20">
                    {activeCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-mono text-white font-bold">{activeCustomer.mobile}</div>
                    <div className="text-[11px] text-slate-400">
                      {activeCustomer.email || 'No email address on record'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeCustomer.mobile}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${activeCustomer.mobile.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* TAB 1: PROFILE & EDIT */}
              {modalTab === 'profile' && (
                <div className="space-y-5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Customer information updated successfully!</span>
                    </div>
                  )}

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Customer Profile Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                          placeholder="e.g. Ramesh Ghosh"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          value={editMobile}
                          onChange={(e) => setEditMobile(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                          placeholder="e.g. +91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                          placeholder="e.g. customer@example.com"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1.5">
                          Customer Status *
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-sky-500"
                        >
                          <option value="active">Active Customer (Standard)</option>
                          <option value="vip">VIP Client (Priority Service)</option>
                          <option value="inactive">Inactive (Dormant)</option>
                          <option value="blocked">Blocked / Blacklisted</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Address / Pickup Location
                      </label>
                      <textarea
                        rows={2}
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Street address, apartment, landmarks, pincode..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-300 block mb-1.5">
                        Internal Notes & Preferences (Confidential Staff Only)
                      </label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="e.g. Prefers UPI payment, company invoice required, corporate client, sensitive data..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveCustomer}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-400 hover:bg-sky-300 text-slate-950 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Customer Details</span>
                          </>
                        )}
                      </button>

                      {/* Danger Zone: Delete Customer Trigger */}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Customer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete Confirmation Alert Box */}
                  {showDeleteConfirm && (
                    <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 space-y-3 animate-in zoom-in-95 duration-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-white">Permanently Delete Customer?</h4>
                          <p className="text-xs text-rose-300 mt-1 leading-relaxed">
                            Deleting <strong className="text-white">{activeCustomer.name}</strong> will also permanently remove their complete repair history, {activeCustomer.bookings.length} ticket record(s), and related audit logs. This action cannot be undone.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={handleDeleteCustomer}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Yes, Delete Record</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REPAIR HISTORY */}
              {modalTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Past Repair Tickets ({activeCustomer.bookings.length})
                    </h3>
                    <Link
                      href="/admin/bookings"
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                    >
                      <span>Workshop Queue</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {activeCustomer.bookings.length === 0 ? (
                    <div className="py-8 text-center bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                      No repair tickets associated with this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeCustomer.bookings.map((b) => {
                        const statusMeta = STATUS_MAP[b.status] || STATUS_MAP.pending;
                        return (
                          <div
                            key={b.id}
                            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sky-400">
                                  {b.bookingCode}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}
                                >
                                  {statusMeta.label}
                                </span>
                              </div>
                              <div className="text-slate-200 font-medium">
                                {b.deviceType} • {b.service.name}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {b.problem}
                              </p>
                            </div>

                            <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                              <div className="font-mono font-bold text-emerald-400 text-sm">
                                {b.finalAmount ? (
                                  `₹${b.finalAmount.toLocaleString('en-IN')}`
                                ) : b.quotedAmount ? (
                                  <span className="text-slate-300">Quote: ₹{b.quotedAmount.toLocaleString('en-IN')}</span>
                                ) : (
                                  <span className="text-slate-500 text-xs">Unquoted</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                Booked on{' '}
                                {new Date(b.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
