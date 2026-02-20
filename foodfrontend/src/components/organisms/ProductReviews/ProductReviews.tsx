'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, Loader2, CheckCircle } from 'lucide-react';

interface Review {
  _id: string;
  guestInfo: { name: string; email?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const ProductReviews = ({ productId }: { productId?: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: '',
  });

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/reviews/product/${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.comment || !productId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: productId,
          guestInfo: { name: formData.name, email: formData.email },
          rating: formData.rating,
          comment: formData.comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', rating: 5, comment: '' });
        setTimeout(() => {
          setShowForm(false);
          setSubmitted(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats from reviews
  const avgRating = reviews.length > 0
    ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const breakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, pct };
  });

  if (!productId) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-center mb-10">Customer Reviews</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
            {/* Overall Rating */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-10 h-10 ${i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-[#d1c5b8] text-[#d1c5b8] dark:fill-[#3a2c23] dark:text-[#3a2c23]'}`}
                  />
                ))}
              </div>
              <p className="text-xl font-semibold text-[#5b4636] dark:text-[#c8b6a6]">
                {avgRating}/5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5">
              {breakdown.map(item => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= item.stars ? 'fill-yellow-400 text-yellow-400' : 'fill-[#d1c5b8] text-[#d1c5b8] dark:fill-[#3a2c23] dark:text-[#3a2c23]'}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 h-3 bg-amber-100 dark:bg-[#3a2c23] rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] min-w-[40px] text-right">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Write Review */}
            <div className="flex items-center justify-center lg:justify-end">
              <button
                onClick={() => setShowForm(true)}
                className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg"
              >
                Write A Review
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-amber-200 dark:bg-[#3a2c23] mb-10" />

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-[#7A5C4F] dark:text-[#c8b6a6]">
              <Star className="w-12 h-12 mx-auto mb-3 text-amber-200 dark:text-[#3a2c23]" />
              <p className="text-lg font-medium">No reviews yet</p>
              <p className="text-sm">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review._id} className="border-b border-amber-100 dark:border-[#3a2c23] pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {review.guestInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">{review.guestInfo.name}</h3>
                        <span className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-[#d1c5b8] text-[#d1c5b8] dark:fill-[#3a2c23] dark:text-[#3a2c23]'}`}
                          />
                        ))}
                      </div>
                      <p className="text-[#5b4636] dark:text-[#c8b6a6] leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#241b16] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl dark:shadow-[0_25px_50px_rgba(0,0,0,0.6)]">
            <div className="sticky top-0 bg-white dark:bg-[#241b16] border-b border-amber-100 dark:border-[#3a2c23] p-6 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Write a Review</h3>
              <button onClick={() => { setShowForm(false); setSubmitted(false); }} className="text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">Thank you!</h4>
                  <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">Your review has been submitted and will appear after approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">Rating *</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: r }))}
                          className="transition-transform hover:scale-110"
                        >
                          <Star className={`w-9 h-9 ${r <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-[#d1c5b8] text-[#d1c5b8] dark:fill-[#3a2c23] dark:text-[#3a2c23]'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] border border-amber-200 dark:border-[#3a2c23] rounded-xl focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 focus:border-amber-500 dark:focus:border-amber-400 outline-none placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/30 transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-1">Email (optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] border border-amber-200 dark:border-[#3a2c23] rounded-xl focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 focus:border-amber-500 dark:focus:border-amber-400 outline-none placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/30 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-1">Your Review *</label>
                    <textarea
                      value={formData.comment}
                      onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] border border-amber-200 dark:border-[#3a2c23] rounded-xl focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-amber-400/30 focus:border-amber-500 dark:focus:border-amber-400 outline-none resize-none placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/30 transition-colors"
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
