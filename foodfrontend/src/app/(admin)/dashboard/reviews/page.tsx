'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  FiStar, FiCheck, FiX, FiTrash2, FiFilter,
  FiRefreshCw, FiSearch,
} from 'react-icons/fi';

interface Review {
  _id: string;
  product?: { _id: string; name: string; slug?: string } | null;
  guestInfo: { name: string; email?: string };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await fetch(`${API}/reviews${params}`);
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

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchReviews();
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.guestInfo.name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q)
    );
  });

  const statusCounts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  };

  const statusStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0c1e35] via-[#132f4f] to-[#0e2640] px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FiStar className="text-amber-400" />
              Reviews Management
            </h1>
            <p className="text-blue-200/60 mt-1">Approve, reject, or delete customer reviews</p>
          </div>
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 space-y-6">
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border
                ${filterStatus === tab
                  ? 'bg-[#0c1e35] text-white border-[#0c1e35] shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({statusCounts[tab]})</span>
            </button>
          ))}

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] ml-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiStar className="mx-auto mb-3" size={40} />
              <p className="font-medium">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {review.product?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{review.guestInfo.name}</p>
                          {review.guestInfo.email && (
                            <p className="text-xs text-gray-400">{review.guestInfo.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              size={14}
                              className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {review.comment || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[review.status]}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {review.status !== 'approved' && (
                            <button
                              onClick={() => updateStatus(review._id, 'approved')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <FiCheck size={16} />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button
                              onClick={() => updateStatus(review._id, 'rejected')}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <FiX size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteReview(review._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
