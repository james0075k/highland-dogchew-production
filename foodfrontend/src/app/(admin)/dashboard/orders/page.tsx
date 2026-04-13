'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  FiShoppingBag, FiRefreshCw, FiSearch, FiEye,
  FiTrendingUp, FiClock, FiTruck, FiDollarSign,
  FiChevronLeft, FiChevronRight, FiFilter, FiRepeat,
} from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

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

const statCards = (s: Stats) => [
  {
    label: 'Total Orders',
    value: s.totalOrders,
    icon: FiShoppingBag,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    bar: 'bg-blue-500',
    format: (v: number) => v.toString(),
  },
  {
    label: 'Total Revenue',
    value: s.totalRevenue,
    icon: FiDollarSign,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    bar: 'bg-emerald-500',
    format: (v: number) => `£${v.toFixed(2)}`,
  },
  {
    label: 'Pending',
    value: s.pendingOrders,
    icon: FiClock,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    format: (v: number) => v.toString(),
  },
  {
    label: 'Shipped',
    value: s.shippedOrders,
    icon: FiTruck,
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    bar: 'bg-teal-500',
    format: (v: number) => v.toString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const cap = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

// ─── Component ────────────────────────────────────────────────────────────────

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

  // ── Fetch stats ──────────────────────────────────────────────────────────
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

  // ── Fetch orders ─────────────────────────────────────────────────────────
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

  // Search: only apply after pressing Enter or clicking Search
  const handleSearch = () => setSearchTerm(searchInput.trim());

  const handleRefresh = () => {
    fetchStats();
    fetchOrders(pagination.page);
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50/50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0c1e35] via-[#132f4f] to-[#0e2640] px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FiShoppingBag className="text-amber-400" />
              Orders
            </h1>
            <p className="text-blue-200/60 mt-1 text-sm">
              Manage customer orders and delivery statuses
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="self-start flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10 text-sm font-medium"
          >
            <FiRefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 space-y-6">

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats
            ? statCards(stats).map((card) => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.color} rounded-t-2xl`} />
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                    <div className={`p-2 rounded-xl ${card.bg}`}>
                      <card.icon size={16} className={card.text} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${card.text}`}>
                    {card.format(card.value)}
                  </p>
                </div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse h-[96px]" />
              ))}
        </div>

        {/* ── Filters + Search ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm flex-wrap">
            <FiFilter size={13} className="text-gray-400 ml-1" />
            {ORDER_STATUSES.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${filterStatus === tab
                    ? 'bg-[#0c1e35] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                {tab === 'all' ? 'All' : cap(tab)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-2 ml-auto w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search by email or name…"
                aria-label="Search orders by email or name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading orders…</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-20 text-gray-400">
              <FiShoppingBag className="mx-auto mb-3 opacity-30" size={48} />
              <p className="font-semibold text-base text-red-500">Failed to load orders</p>
              <p className="text-sm mt-1 mb-4">Check your connection and try again.</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
              >
                <FiRefreshCw size={14} /> Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiShoppingBag className="mx-auto mb-3 opacity-30" size={48} />
              <p className="font-semibold text-base">No orders found</p>
              <p className="text-sm mt-1">
                {filterStatus !== 'all' || searchTerm
                  ? 'Try adjusting your filters'
                  : 'Orders will appear here after customers pay'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Order', 'Customer', 'Email', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-amber-50/30 transition-colors group">

                      {/* Order # */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-[#0c1e35] font-mono tracking-tight">
                          {order.orderNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {order.shippingAddress?.fullName ||
                            [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(' ') ||
                            '—'}
                        </p>
                        {order.shippingAddress?.phone && (
                          <p className="text-xs text-gray-400 mt-0.5">{order.shippingAddress.phone}</p>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-600 max-w-[180px] truncate">
                          {order.shippingAddress?.email ?? '—'}
                        </p>
                      </td>

                      {/* Items count */}
                      <td className="px-5 py-4">
                        {(() => {
                          const qty = (order.items ?? []).reduce((s, i) => s + i.quantity, 0);
                          return <span className="text-sm text-gray-500">{qty} item{qty !== 1 ? 's' : ''}</span>;
                        })()}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                          £{(order.grandTotal ?? 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Payment status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${paymentBadge[order.paymentStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {cap(order.paymentStatus)}
                        </span>
                      </td>

                      {/* Order / delivery status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${orderBadge[order.orderStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {cap(order.orderStatus)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {order.createdAt ? fmtDate(order.createdAt) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/orders/${order._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            <FiEye size={13} />
                            View
                          </Link>
                          {order.shippingAddress?.email && (
                            <Link
                              href={`/dashboard/subscriptions?search=${encodeURIComponent(order.shippingAddress.email)}`}
                              title={`Subscriptions for ${order.shippingAddress.email}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              <FiRepeat size={12} />
                              Subs
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-3">
            <p className="text-sm text-gray-400">
              Showing{' '}
              <span className="font-semibold text-gray-700">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-gray-700">{pagination.total}</span> orders
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
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors
                      ${pagination.page === p
                        ? 'bg-[#0c1e35] text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                      }`}
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

        {/* ── Results summary ──────────────────────────────────────────────── */}
        {!loading && orders.length > 0 && pagination.pages <= 1 && (
          <p className="text-center text-sm text-gray-400">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
    </div>
  );
}
