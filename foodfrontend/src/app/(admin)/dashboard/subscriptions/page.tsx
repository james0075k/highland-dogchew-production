'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  FiRefreshCw, FiSearch, FiEye,
  FiTrendingUp, FiCheckCircle, FiPauseCircle, FiAlertCircle, FiXCircle,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subscription {
  _id: string;
  subscriptionId: string;
  email: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  intervalLabel: string;
  status: 'active' | 'paused' | 'payment_failed' | 'cancelled';
  nextBillingDate: string;
  lastBilledAt?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  paused: number;
  payment_failed: number;
  cancelled: number;
  mrr: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = ['all', 'active', 'paused', 'payment_failed', 'cancelled'] as const;

const statusBadge: Record<string, string> = {
  active:         'bg-emerald-100 text-emerald-700',
  paused:         'bg-amber-100 text-amber-700',
  payment_failed: 'bg-red-100 text-red-700',
  cancelled:      'bg-slate-100 text-slate-600',
};

const statusLabel: Record<string, string> = {
  active:         'Active',
  paused:         'Paused',
  payment_failed: 'Payment Failed',
  cancelled:      'Cancelled',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const token = Cookies.get('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base = process.env.NEXT_PUBLIC_API_URL;

  const fetchStats = useCallback(async () => {
    const res = await fetch(`${base}/admin/subscriptions/stats`, { headers });
    const data = await res.json();
    if (data.success) setStats(data.data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  const fetchSubs = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status !== 'all') params.set('status', status);
    if (search) params.set('search', search);

    const res = await fetch(`${base}/admin/subscriptions?${params}`, { headers });
    const data = await res.json();
    if (data.success) {
      setSubscriptions(data.data.subscriptions);
      setPagination(data.data.pagination);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, status, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchSubs(1); }, [fetchSubs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
            <p className="text-slate-500 text-sm mt-1">Manage recurring deliveries</p>
          </div>
          <button
            onClick={() => { fetchStats(); fetchSubs(pagination.page); }}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 transition-colors"
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Total',          value: stats.total,          icon: FiRefreshCw,    color: 'text-slate-600' },
              { label: 'Active',         value: stats.active,         icon: FiCheckCircle,  color: 'text-emerald-600' },
              { label: 'Paused',         value: stats.paused,         icon: FiPauseCircle,  color: 'text-amber-600' },
              { label: 'Failed',         value: stats.payment_failed, icon: FiAlertCircle,  color: 'text-red-600' },
              { label: 'Cancelled',      value: stats.cancelled,      icon: FiXCircle,      color: 'text-slate-400' },
              { label: 'MRR',            value: `£${stats.mrr.toFixed(2)}`, icon: FiTrendingUp, color: 'text-blue-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className={`${color} mb-2`}><Icon size={18} /></div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  status === s
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s === 'payment_failed' ? 'Failed' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search email, product…"
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-56"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <FiRefreshCw className="animate-spin mr-2" /> Loading…
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No subscriptions found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Subscription ID', 'Customer', 'Product', 'Interval', 'Amount/del.', 'Status', 'Next Billing', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{sub.subscriptionId}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900 font-medium truncate max-w-[160px]">{sub.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900 font-medium truncate max-w-[140px]">{sub.productName}</p>
                      <p className="text-xs text-slate-400">{sub.size} · Qty {sub.quantity}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{sub.intervalLabel}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      £{(sub.unitPrice * sub.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[sub.status]}`}>
                        {statusLabel[sub.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(sub.nextBillingDate)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/subscriptions/${sub._id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <FiEye size={12} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchSubs(pagination.page - 1)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <FiChevronLeft size={14} />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchSubs(pagination.page + 1)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
