'use client';

import { useState } from 'react';
import { Star, CheckCircle, ShieldCheck, MessageCircle, Send, AlertCircle } from 'lucide-react';

interface ReviewItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  ownerReply: string | null;
  createdAt: string | Date;
  service?: { name: string } | null;
}

interface ReviewsClientProps {
  initialReviews: ReviewItem[];
}

export default function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews] = useState<ReviewItem[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          rating,
          comment,
          bookingCode: bookingCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Failed to submit review', isError: true });
        setLoading(false);
        return;
      }

      setMessage({ text: data.message });
      setCustomerName('');
      setComment('');
      setBookingCode('');
      setRating(5);
      setLoading(false);
    } catch {
      setMessage({ text: 'Network error. Please try again.', isError: true });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Overview & Average Rating Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xs">
        <div className="flex items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-900 shrink-0">
            <span className="text-3xl font-extrabold">{averageRating}</span>
            <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
              out of 5
            </span>
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Verified Customer Rating ({reviews.length} approved)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly unmanipulated ratings from genuine repair clients.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-md shadow-sky-600/20 shrink-0 tap-target"
        >
          {showForm ? 'Close Review Form' : 'Write a Review'}
        </button>
      </div>

      {/* Review Submission Form Modal / Box */}
      {showForm && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl animate-in fade-in duration-200">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="text-center">
              <h3 className="text-xl font-bold">Share Your Repair Experience</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your feedback helps us continuously improve our workshop standards.
              </p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                  message.isError
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                {message.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star rating selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-amber-400 ml-2">
                    {rating} Star{rating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Booking ID (Optional for verification)
                  </label>
                  <input
                    type="text"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    placeholder="e.g. BK-20261101-0001"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Review / Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the problem, the turnaround time, communication, and overall repair experience..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md tap-target"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review for Verification</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">
          All Approved Customer Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <Star className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-900">No Reviews Yet</h4>
            <p className="text-xs text-slate-500">
              We never fabricate customer reviews. Completed a repair with us? Be the first to share
              your genuine feedback using the button above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{r.customerName}</span>
                    {r.service && (
                      <span className="text-[11px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-medium">
                        {r.service.name}
                      </span>
                    )}
                  </div>

                  {/* Owner Reply if present */}
                  {r.ownerReply && (
                    <div className="bg-slate-50 border-l-2 border-sky-500 p-3 rounded-r-xl text-xs space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-[11px]">
                        <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                        <span>Response from ProTech Workshop:</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {r.ownerReply}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
