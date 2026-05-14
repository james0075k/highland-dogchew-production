'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  FiShoppingBag, FiRefreshCw, FiSearch, FiEye,
  FiClock, FiTruck, FiDollarSign,
  FiChevronLeft, FiChevronRight, FiFilter, FiRepeat,
  FiArrowLeft, FiAlertCircle,
} from 'react-icons/fi';
import { formatMoney } from '@/lib/format';

interface Order {
  _id: string;
  orderNumber: string;
  shippingAddress?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  items: { name: string; quantity: number }[];
  grandTotal: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'backordered' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  totalRevenue: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const ORDER_STATUSES = ['all', 'pending', 'confirmed', 'backordered', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const paymentBadge: Record<string, string> = {
  paid:     'bg-emerald-100 text-emerald-700',
  pending:  'bg-amber-100 text-amber-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
};

const orderBadge: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700',
  confirmed:   'bg-blue-100 text-blue-700',
  backordered: 'bg-orange-100 text-orange-700',
  processing:  'bg-purple-100 text-purple-700',
  shipped:     'bg-teal-100 text-teal-700',
  delivered:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-red-100 text-red-700',
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const cap = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

type Bucket = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'older';
const BUCKET_LABEL: Record<Bucket, string> = {
  today:     'Today',
  yesterday: 'Yesterday',
  thisWeek:  'Earlier This Week',
  thisMonth: 'This Month',
  older:     'Older',
};

function bucketOf(dateStr: string): Bucket {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayMs = 86400000;
  const diffDays = Math.floor((startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / dayMs);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays <= 6) return 'thisWeek';
  if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return 'thisMonth';
  return 'older';
}

const BUCKET_ORDER: Bucket[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'];

export default function AdminOrdersPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [orders, setOrders]         = useState<Order[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const token = Cookies.get('token');
      if (!token) return;
      const res = await fetch(`${API}/admin/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [API]);

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setFetchError(false);
      const token = Cookies.get('token');
      if (!token) { setFetchError(true); return; }

      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (filterStatus !== 'all') params.set('orderStatus', filterStatus);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`${API}/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setFetchError(true); return; }
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders ?? []);
        setPagination(data.data.pagination ?? { total: 0, page: 1, limit: 20, pages: 1 });
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [API, filterStatus, searchTerm]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(1); }, [filterStatus, searchTerm, fetchOrders]);

  const handleSearch = () => setSearchTerm(searchInput.trim());
  const handleRefresh = () => { fetchStats(); fetchOrders(pagination.page); };

  const grouped = useMemo(() => {
    const map = new Map<Bucket, Order[]>();
    for (const o of orders) {
      const b = bucketOf(o.createdAt);
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(o);
    }
    return BUCKET_ORDER.filter(b => map.has(b)).map(b => [b, map.get(b)!] as const);
  }, [orders]);

  const STAT_CARDS = [
    { label: 'Total Orders',  value: stats?.totalOrders ?? 0,                              icon: FiShoppingBag, text: 'text-blue-600',     bg: 'bg-blue-50',     ring: 'ring-blue-100' },
    { label: 'Total Revenue', value: formatMoney(stats?.totalRevenue ?? 0),                icon: FiDollarSign,  text: 'text-emerald-600',  bg: 'bg-emerald-50',  ring: 'ring-emerald-100' },
    { label: 'Pending',       value: stats?.pendingOrders ?? 0,                            icon: FiClock,       text: 'text-amber-600',    bg: 'bg-amber-50',    ring: 'ring-amber-100' },
    { label: 'Shipped',       value: stats?.shippedOrders ?? 0,                            icon: FiTruck,       text: 'text-teal-600',     bg: 'bg-teal-50',     ring: 'ring-teal-100' },
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
              <FiShoppingBag className="text-amber-500" size={18} />
              Orders
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Customer orders &amp; delivery statuses — grouped by date
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STAT_CARDS.map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 ring-1 ${card.ring}`}>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon size={15} className={card.text} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              {statsLoading ? (
                <div className="h-5 w-16 mt-1 rounded bg-gray-100 animate-pulse" />
              ) : (
                <p className={`text-lg font-bold tabular-nums ${card.text}`}>{card.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm flex-wrap">
          <FiFilter size={13} className="text-gray-400 ml-1 flex-shrink-0" />
          {ORDER_STATUSES.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                ${filterStatus === tab ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              {tab === 'all' ? 'All' : cap(tab)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 lg:ml-auto">
          <div className="relative flex-1 lg:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by email or name…"
              aria-label="Search orders by email or name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading orders…</p>
        </div>
      ) : fetchError ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiAlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-red-500 font-medium">Failed to load orders</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiShoppingBag size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400 font-medium">No orders found</p>
          <p className="text-xs text-gray-400">
            {filterStatus !== 'all' || searchTerm ? 'Try adjusting your filters.' : 'Orders will appear here after customers pay.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([bucket, items]) => (
            <section key={bucket} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <header className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{BUCKET_LABEL[bucket]}</span>
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700 tabular-nums">{items.length}</span> {items.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-semibold tabular-nums">
                  {formatMoney(items.reduce((s, o) => s + (o.grandTotal ?? 0), 0))}
                </span>
              </header>

              <ul className="divide-y divide-gray-50">
                {items.map(order => {
                  const customerName =
                    order.shippingAddress?.fullName ||
                    [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(' ') ||
                    '—';
                  const email = order.shippingAddress?.email ?? '';
                  const phone = order.shippingAddress?.phone ?? '';
                  const itemQty = (order.items ?? []).reduce((s, i) => s + i.quantity, 0);

                  return (
                    <li key={order._id} className="flex items-center gap-4 px-5 py-3 hover:bg-amber-50/30 transition-colors">

                      {/* Avatar + customer + email */}
                      <div className="flex items-center gap-3 min-w-0 flex-[1.6]">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 text-[11px] font-bold ring-1 ring-amber-100">
                          {initials(customerName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{customerName}</p>
                          <p className="text-xs text-gray-400 truncate font-mono">{order.orderNumber}</p>
                          {(email || phone) && (
                            <p className="text-[11px] text-gray-500 truncate">
                              {email}{email && phone ? ' · ' : ''}{phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Items + total */}
                      <div className="hidden md:flex flex-col items-end w-24 flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">{formatMoney(order.grandTotal ?? 0)}</p>
                        <p className="text-[11px] text-gray-400">{itemQty} item{itemQty !== 1 ? 's' : ''}</p>
                      </div>

                      {/* Status badges */}
                      <div className="hidden sm:flex flex-col items-start gap-1 w-28 flex-shrink-0">
                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${paymentBadge[order.paymentStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {cap(order.paymentStatus)}
                        </span>
                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${orderBadge[order.orderStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {cap(order.orderStatus)}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="hidden lg:flex flex-col items-end w-24 flex-shrink-0">
                        <p className="text-xs text-gray-600 tabular-nums">{fmtDate(order.createdAt)}</p>
                        <p className="text-[11px] text-gray-400 tabular-nums">{fmtTime(order.createdAt)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          title="View order"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          <FiEye size={13} />
                          View
                        </Link>
                        {email && (
                          <Link
                            href={`/dashboard/subscriptions?search=${encodeURIComponent(email)}`}
                            title={`Subscriptions for ${email}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            <FiRepeat size={12} />
                            Subs
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
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
            of <span className="font-semibold text-gray-700 tabular-nums">{pagination.total}</span> orders
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
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
                  onClick={() => fetchOrders(p)}
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
              onClick={() => fetchOrders(pagination.page + 1)}
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
