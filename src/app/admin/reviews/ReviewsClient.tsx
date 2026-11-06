'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Trash2,
  Filter,
  Check,
  X,
  Save,
  Loader2,
  Sparkles,
} from 'lucide-react';

export interface ReviewItem {
  id: number;
  customerName: string;
  bookingId: number | null;
  serviceId: number | null;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  ownerReply: string | null;
  createdAt: string;
  updatedAt: string;
  service: { name: string; slug: string } | null;
  booking: { bookingCode: string; deviceType: string } | null;
}

interface ReviewsClientProps {
  initialReviews: ReviewItem[];
}

export default function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [replyingReview, setReplyingReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Metrics
  const counts = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === 'pending').length,
      approved: reviews.filter((r) => r.status === 'approved').length,
      rejected: reviews.filter((r) => r.status === 'rejected').length,
      featured: reviews.filter((r) => r.isFeatured).length,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    if (selectedFilter === 'all') return reviews;
    if (selectedFilter === 'featured') return reviews.filter((r) => r.isFeatured);
    return reviews.filter((r) => r.status === selectedFilter);
  }, [reviews, selectedFilter]);

  const handleUpdateStatus = async (review: ReviewItem, nextStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r))
        );
      }
    } catch {
      alert('Failed to update review status');
    }
  };

  const handleToggleFeatured = async (review: ReviewItem) => {
    try {
      const nextFeatured = !review.isFeatured;
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, isFeatured: nextFeatured } : r))
        );
      }
    } catch {
      alert('Failed to toggle featured status');
    }
  };

  const handleOpenReply = (review: ReviewItem) => {
    setReplyingReview(review);
    setReplyText(review.ownerReply || '');
  };

  const handleSaveReply = async () => {
    if (!replyingReview) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/reviews/${replyingReview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerReply: replyText }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === replyingReview.id ? { ...r, ownerReply: replyText } : r))
        );
        setReplyingReview(null);
      }
    } catch {
      alert('Failed to save owner reply');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (review: ReviewItem) => {
    if (!confirm(`Delete review from "${review.customerName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
      }
    } catch {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400" />
            <span>Customer Reviews Moderation</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Approve public testimonials, pin positive ratings to the homepage, and reply to customers.
          </p>
        </div>

        <Link
          href="/reviews"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-white transition-colors"
        >
          <span>View Public Reviews</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            selectedFilter === 'all'
              ? 'bg-sky-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Reviews ({counts.total})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('pending')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            selectedFilter === 'pending'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
          }`}
        >
          Pending Review ({counts.pending})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('approved')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            selectedFilter === 'approved'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Approved ({counts.approved})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('featured')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            selectedFilter === 'featured'
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Featured on Homepage ({counts.featured})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            selectedFilter === 'rejected'
              ? 'bg-rose-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No reviews in this filter.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className={`bg-slate-900 border rounded-3xl p-5 space-y-3 transition-colors ${
                r.status === 'pending'
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : r.status === 'rejected'
                  ? 'border-rose-900/40 opacity-60'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-bold text-white text-sm">{r.customerName}</span>

                  {r.booking && (
                    <span className="text-[11px] font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                      {r.booking.bookingCode}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'approved'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                        : r.status === 'rejected'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                    }`}
                  >
                    {r.status}
                  </span>

                  <span className="text-slate-500 text-[11px]">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "{r.comment}"
              </p>

              {r.service && (
                <div className="text-[11px] text-slate-400">
                  Reviewed Service: <strong className="text-slate-200">{r.service.name}</strong>
                </div>
              )}

              {/* Owner Reply if exists */}
              {r.ownerReply && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-sky-400 text-[11px]">ProTech Owner Response:</div>
                  <p className="text-slate-300 italic">"{r.ownerReply}"</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {r.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r, 'approved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold border border-emerald-800/50 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 font-semibold border border-rose-800/50 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(r)}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                      r.isFeatured
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{r.isFeatured ? 'Featured Pin' : 'Feature'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenReply(r)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{r.ownerReply ? 'Edit Reply' : 'Add Reply'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
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

      {/* Reply Modal */}
      {replyingReview && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Reply to Review from {replyingReview.customerName}
              </h3>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl italic">
              "{replyingReview.comment}"
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Owner Response (Visible under review)
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="e.g. Thank you so much for your feedback! Glad we could fix your laptop display within 2 hours."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveReply}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-sky-400 hover:bg-sky-300 text-slate-950"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
