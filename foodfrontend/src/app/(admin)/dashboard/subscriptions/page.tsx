'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FiRefreshCw, FiSearch, FiEye, FiFilter,
  FiTrendingUp, FiCheckCircle, FiPauseCircle, FiAlertCircle, FiXCircle,
  FiChevronLeft, FiChevronRight, FiArrowLeft, FiCalendar, FiRepeat,
} from 'react-icons/fi';
import { formatMoney } from '@/lib/format';

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

type StatusKey = 'all' | 'active' | 'paused' | 'payment_failed' | 'cancelled';
const STATUSES: StatusKey[] = ['all', 'active', 'paused', 'payment_failed', 'cancelled'];

const STATUS_META: Record<Exclude<StatusKey, 'all'>, { label: string; chip: string; ring: string; tint: string; icon: typeof FiCheckCircle }> = {
  active:         { label: 'Active',         chip: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-200', tint: 'from-emerald-50 to-white', icon: FiCheckCircle },
  paused:         { label: 'Paused',         chip: 'bg-amber-100 text-amber-700',     ring: 'ring-amber-200',   tint: 'from-amber-50 to-white',   icon: FiPauseCircle },
  payment_failed: { label: 'Payment Failed', chip: 'bg-red-100 text-red-700',         ring: 'ring-red-200',     tint: 'from-red-50 to-white',     icon: FiAlertCircle },
  cancelled:      { label: 'Cancelled',      chip: 'bg-slate-100 text-slate-600',     ring: 'ring-slate-200',   tint: 'from-slate-50 to-white',   icon: FiXCircle },
};

const STATUS_ORDER: Array<Exclude<StatusKey, 'all'>> = ['active', 'payment_failed', 'paused', 'cancelled'];

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThen  = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((startOfThen.getTime() - startOfToday.getTime()) / 86400000);
}

function dueLabel(dateStr: string, status: Subscription['status']): { text: string; cls: string } {
  if (status === 'cancelled') return { text: '—',          cls: 'text-slate-400' };
  if (status === 'paused')    return { text: 'Paused',     cls: 'text-amber-600' };
  const d = daysUntil(dateStr);
  if (Number.isNaN(d))        return { text: '—',          cls: 'text-slate-400' };
  if (d < 0)                  return { text: `${-d}d overdue`, cls: 'text-red-600 font-semibold' };
  if (d === 0)                return { text: 'Due today',  cls: 'text-red-600 font-semibold' };
  if (d === 1)                return { text: 'Due tomorrow', cls: 'text-amber-700 font-semibold' };
  if (d <= 7)                 return { text: `Due in ${d}d`, cls: 'text-amber-600' };
  return { text: `In ${d}d`,  cls: 'text-slate-500' };
}

function initials(s: string): string {
  return s
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

function AdminSubscriptionsContent() {
  const searchParams = useSearchParams();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [status, setStatus] = useState<StatusKey>('all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const token = Cookies.get('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch(`${API}/admin/subscriptions/stats`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* non-critical */ }
    finally { setStatsLoading(false); }
  }, [API]);

  const fetchSubs = useCallback(async (page = 1) => {
    setLoading(true);
    setFetchError(false);
    try {
      const token = Cookies.get('token');
      if (!token) { setFetchError(true); return; }
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`${API}/admin/subscriptions?${params}`, { headers });
      if (!res.ok) { setFetchError(true); return; }
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.data.subscriptions ?? []);
        setPagination(data.data.pagination ?? { total: 0, page: 1, limit: 20, pages: 1 });
      } else {
        setFetchError(true);
      }
    } catch { setFetchError(true); }
    finally { setLoading(false); }
  }, [API, status, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchSubs(1); }, [fetchSubs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleRefresh = () => { fetchStats(); fetchSubs(pagination.page); };

  // Group by status; active subs further sorted by nextBillingDate ascending.
  const grouped = useMemo(() => {
    const map = new Map<Exclude<StatusKey, 'all'>, Subscription[]>();
    for (const s of subscriptions) {
      if (!map.has(s.status)) map.set(s.status, []);
      map.get(s.status)!.push(s);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
    }
    return STATUS_ORDER.filter(k => map.has(k)).map(k => [k, map.get(k)!] as const);
  }, [subscriptions]);

  const STAT_CARDS = [
    { label: 'MRR',       value: formatMoney(stats?.mrr ?? 0),       icon: FiTrendingUp,   text: 'text-blue-600',     bg: 'bg-blue-50',     ring: 'ring-blue-100' },
    { label: 'Total',     value: stats?.total ?? 0,                  icon: FiRepeat,       text: 'text-slate-700',    bg: 'bg-slate-50',    ring: 'ring-slate-100' },
    { label: 'Active',    value: stats?.active ?? 0,                 icon: FiCheckCircle,  text: 'text-emerald-600',  bg: 'bg-emerald-50',  ring: 'ring-emerald-100' },
    { label: 'Paused',    value: stats?.paused ?? 0,                 icon: FiPauseCircle,  text: 'text-amber-600',    bg: 'bg-amber-50',    ring: 'ring-amber-100' },
    { label: 'Failed',    value: stats?.payment_failed ?? 0,         icon: FiAlertCircle,  text: 'text-red-600',      bg: 'bg-red-50',      ring: 'ring-red-100' },
    { label: 'Cancelled', value: stats?.cancelled ?? 0,              icon: FiXCircle,      text: 'text-slate-500',    bg: 'bg-slate-50',    ring: 'ring-slate-100' },
  ];

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiRepeat className="text-amber-500" size={18} />
              Subscriptions
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Recurring deliveries — grouped by status, sorted by next billing
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
        >
          <FiRefreshCw size={14} className={(loading || statsLoading) ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {STAT_CARDS.map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 ring-1 ${card.ring}`}>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon size={15} className={card.text} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              {statsLoading ? (
                <div className="h-5 w-14 mt-1 rounded bg-gray-100 animate-pulse" />
              ) : (
                <p className={`text-lg font-bold tabular-nums truncate ${card.text}`}>{card.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm flex-wrap">
          <FiFilter size={13} className="text-gray-400 ml-1 flex-shrink-0" />
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                ${status === s ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              {s === 'all' ? 'All' : s === 'payment_failed' ? 'Failed' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search email or product…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading subscriptions…</p>
        </div>
      ) : fetchError ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiAlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-red-500 font-medium">Failed to load subscriptions</p>
          <button
            onClick={() => fetchSubs(pagination.page)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiRepeat size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No subscriptions found</p>
          <p className="text-xs text-gray-400">
            {status !== 'all' || search ? 'Try adjusting your filters.' : 'Subscriptions will appear here after customers subscribe.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([key, items]) => {
            const meta = STATUS_META[key];
            const SectionIcon = meta.icon;
            const groupTotal = items.reduce((s, sub) => s + sub.unitPrice * sub.quantity, 0);
            return (
              <section key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <header className={`flex items-center justify-between px-5 py-3 bg-gradient-to-r ${meta.tint} border-b border-gray-100`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.chip}`}>
                      <SectionIcon size={11} />
                      {meta.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700 tabular-nums">{items.length}</span> {items.length === 1 ? 'subscription' : 'subscriptions'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-semibold tabular-nums">
                    {formatMoney(groupTotal)} / cycle
                  </span>
                </header>

                <ul className="divide-y divide-gray-50">
                  {items.map(sub => {
                    const due = dueLabel(sub.nextBillingDate, sub.status);
                    const amount = sub.unitPrice * sub.quantity;
                    return (
                      <li key={sub._id} className="flex items-center gap-4 px-5 py-3 hover:bg-amber-50/30 transition-colors">

                        {/* Avatar + customer + sub id */}
                        <div className="flex items-center gap-3 min-w-0 flex-[1.6]">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold ring-1 ${meta.chip} ${meta.ring}`}>
                            {initials(sub.email)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{sub.email}</p>
                            <p className="text-[11px] text-gray-400 truncate font-mono">{sub.subscriptionId}</p>
                          </div>
                        </div>

                        {/* Product */}
                        <div className="hidden md:block min-w-0 flex-1">
                          <p className="text-sm text-gray-800 truncate">{sub.productName}</p>
                          <p className="text-[11px] text-gray-400 truncate">{sub.size} · Qty {sub.quantity} · {sub.intervalLabel}</p>
                        </div>

                        {/* Amount */}
                        <div className="hidden sm:flex flex-col items-end w-24 flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900 tabular-nums">{formatMoney(amount)}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">per cycle</p>
                        </div>

                        {/* Next billing */}
                        <div className="hidden lg:flex flex-col items-end w-32 flex-shrink-0">
                          <p className="text-xs text-gray-600 tabular-nums flex items-center gap-1">
                            <FiCalendar size={11} className="text-gray-400" />
                            {fmt(sub.nextBillingDate)}
                          </p>
                          <p className={`text-[11px] tabular-nums ${due.cls}`}>{due.text}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Link
                            href={`/dashboard/subscriptions/${sub._id}`}
                            title="View subscription"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            <FiEye size={13} />
                            View
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-3 mt-4">
          <p className="text-sm text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-700 tabular-nums">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-gray-700 tabular-nums">{pagination.total}</span> subscriptions
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchSubs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => fetchSubs(p)}
                  aria-label={`Page ${p}`}
                  aria-current={pagination.page === p ? 'page' : undefined}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors tabular-nums
                    ${pagination.page === p ? 'bg-[#0c1e35] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => fetchSubs(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              aria-label="Next page"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <FiRefreshCw className="animate-spin mr-2" /> Loading…
      </div>
    }>
      <AdminSubscriptionsContent />
    </Suspense>
  );
}
