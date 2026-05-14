'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  FiStar, FiCheck, FiX, FiTrash2, FiFilter,
  FiRefreshCw, FiSearch, FiArrowLeft, FiAlertCircle,
  FiClock, FiCheckCircle, FiXCircle,
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

type StatusKey = 'all' | 'pending' | 'approved' | 'rejected';
const STATUSES: StatusKey[] = ['all', 'pending', 'approved', 'rejected'];

const STATUS_META: Record<Exclude<StatusKey, 'all'>, { label: string; chip: string; ring: string; tint: string; icon: typeof FiClock }> = {
  pending:  { label: 'Pending',  chip: 'bg-amber-100 text-amber-700',     ring: 'ring-amber-200',    tint: 'from-amber-50 to-white',    icon: FiClock },
  approved: { label: 'Approved', chip: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-200',  tint: 'from-emerald-50 to-white',  icon: FiCheckCircle },
  rejected: { label: 'Rejected', chip: 'bg-red-100 text-red-700',         ring: 'ring-red-200',      tint: 'from-red-50 to-white',      icon: FiXCircle },
};
const SECTION_ORDER: Array<Exclude<StatusKey, 'all'>> = ['pending', 'approved', 'rejected'];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function initials(s: string): string {
  return s.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await fetch(`${API}/reviews${params}`);
      const data = await res.json();
      if (data.success) {
        setReviews(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to load reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [API, filterStatus]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: status as Review['status'] } : r));
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/reviews/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(prev => prev.filter(r => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const filtered = useMemo(() => reviews.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.guestInfo.name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      !!r.product?.name?.toLowerCase().includes(q)
    );
  }), [reviews, searchTerm]);

  const grouped = useMemo(() => {
    const map = new Map<Exclude<StatusKey, 'all'>, Review[]>();
    for (const r of filtered) {
      if (!map.has(r.status)) map.set(r.status, []);
      map.get(r.status)!.push(r);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return SECTION_ORDER.filter(k => map.has(k)).map(k => [k, map.get(k)!] as const);
  }, [filtered]);

  const counts = useMemo(() => ({
    total:    reviews.length,
    pending:  reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: reviews.length
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length)
      : 0,
  }), [reviews]);

  const STAT_CARDS = [
    { label: 'Total',    value: counts.total,    icon: FiStar,        text: 'text-slate-700',   bg: 'bg-slate-50',   ring: 'ring-slate-100' },
    { label: 'Avg Rating', value: counts.avgRating.toFixed(1), icon: FiStar, text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
    { label: 'Pending',  value: counts.pending,  icon: FiClock,       text: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-100' },
    { label: 'Approved', value: counts.approved, icon: FiCheckCircle, text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'Rejected', value: counts.rejected, icon: FiXCircle,     text: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-100' },
  ];

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiStar className="text-amber-500" size={18} />
              Reviews
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Approve, reject, or delete customer reviews — grouped by status</p>
          </div>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {STAT_CARDS.map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 ring-1 ${card.ring}`}>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon size={15} className={card.text} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className={`text-lg font-bold tabular-nums ${card.text}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
          <FiFilter size={13} className="text-gray-400 ml-1 flex-shrink-0" />
          {STATUSES.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                ${filterStatus === tab ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search reviewer, product, or comment…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading reviews…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiAlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={fetchReviews} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors">
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiStar size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([key, items]) => {
            const meta = STATUS_META[key];
            const SectionIcon = meta.icon;
            return (
              <section key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <header className={`flex items-center justify-between px-5 py-3 bg-gradient-to-r ${meta.tint} border-b border-gray-100`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.chip}`}>
                      <SectionIcon size={11} />
                      {meta.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700 tabular-nums">{items.length}</span> {items.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </header>

                <ul className="divide-y divide-gray-50">
                  {items.map(review => (
                    <li key={review._id} className="flex items-center gap-4 px-5 py-3 hover:bg-amber-50/30 transition-colors">

                      <div className="flex items-center gap-3 min-w-0 flex-[1.5]">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold ring-1 ${meta.chip} ${meta.ring}`}>
                          {initials(review.guestInfo.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{review.guestInfo.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <FiStar key={s} size={11} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                            ))}
                            <span className="text-[10px] text-gray-400 ml-1 tabular-nums">{review.rating}/5</span>
                          </div>
                          {review.guestInfo.email && (
                            <p className="text-[11px] text-gray-400 truncate">{review.guestInfo.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:block min-w-0 flex-1">
                        <p className="text-sm text-gray-700 truncate" title={review.product?.name || ''}>
                          {review.product?.name || '— product deleted —'}
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{review.comment || 'No comment'}</p>
                      </div>

                      <div className="hidden lg:block w-20 flex-shrink-0">
                        <p className="text-xs text-gray-500 tabular-nums">{fmtDate(review.createdAt)}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(review._id, 'approved')}
                            title="Approve"
                            className="p-2 rounded-lg border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <FiCheck size={13} />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(review._id, 'rejected')}
                            title="Reject"
                            className="p-2 rounded-lg border border-amber-200 bg-white text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <FiX size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(review)}
                          title="Delete"
                          className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrash2 className="text-red-600" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete review?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Permanently delete the {deleteTarget.rating}★ review by <span className="font-semibold">{deleteTarget.guestInfo.name}</span>?
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
