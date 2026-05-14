'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  FiPackage, FiAlertCircle, FiSearch, FiFilter,
  FiRefreshCw, FiXCircle, FiArrowLeft,
  FiEdit2, FiEye, FiEyeOff, FiTrash2, FiX,
  FiChevronRight,
} from 'react-icons/fi';

const LOW_STOCK_THRESHOLD = 10;

interface ProductSize {
  label: string;
  value: string;
  stockQuantity?: number;
}

interface Product {
  _id: string;
  name: string;
  image?: string;
  productType: 'yak-milk' | 'puff-treat' | 'highland-mix' | string;
  trackStock: boolean;
  stockQuantity: number;
  sizes?: ProductSize[];
  isActive?: boolean;
}

function getEffectiveStock(p: Product): number {
  if (p.sizes && p.sizes.length > 0)
    return p.sizes.reduce((sum, s) => sum + (s.stockQuantity ?? 0), 0);
  return p.stockQuantity ?? 0;
}

type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'not-tracked';

function getStockStatus(p: Product): StockStatus {
  if (!p.trackStock) return 'not-tracked';
  const stock = getEffectiveStock(p);
  if (stock === 0) return 'out-of-stock';
  if (stock < LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}

const TYPE_META: Record<string, { label: string; chip: string; ring: string; tint: string }> = {
  'yak-milk':     { label: 'Yak Milk',     chip: 'bg-sky-100 text-sky-700',         ring: 'ring-sky-200',     tint: 'from-sky-50 to-white' },
  'puff-treat':   { label: 'Puff Treat',   chip: 'bg-purple-100 text-purple-700',   ring: 'ring-purple-200',  tint: 'from-purple-50 to-white' },
  'highland-mix': { label: 'Highland Mix', chip: 'bg-teal-100 text-teal-700',       ring: 'ring-teal-200',    tint: 'from-teal-50 to-white' },
};
const UNCLASSIFIED: { label: string; chip: string; ring: string; tint: string } = {
  label: 'Unclassified', chip: 'bg-gray-100 text-gray-600', ring: 'ring-gray-200', tint: 'from-gray-50 to-white',
};
function typeMeta(t: string) { return TYPE_META[t] ?? UNCLASSIFIED; }

const STATUS_BADGE: Record<StockStatus, { label: string; cls: string }> = {
  'in-stock':     { label: 'In Stock',     cls: 'bg-emerald-100 text-emerald-700' },
  'low-stock':    { label: 'Low Stock',    cls: 'bg-amber-100 text-amber-700' },
  'out-of-stock': { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' },
  'not-tracked':  { label: 'Not Tracked',  cls: 'bg-gray-100 text-gray-500' },
};

function sizeChipCls(qty: number): string {
  if (qty === 0) return 'bg-red-50 text-red-700 ring-red-100';
  if (qty < LOW_STOCK_THRESHOLD) return 'bg-amber-50 text-amber-700 ring-amber-100';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

type FilterKey = 'all' | 'low-stock' | 'out-of-stock' | 'hidden';
const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'low-stock',    label: 'Low Stock' },
  { key: 'out-of-stock', label: 'Out of Stock' },
  { key: 'hidden',       label: 'Hidden' },
];

export default function StockTrackerPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterKey>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'yak-milk' | 'puff-treat' | 'highland-mix'>('all');
  const [search, setSearch]     = useState('');

  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

      const [activeRes, archivedRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/products/archived`, { headers: authHeader }),
      ]);

      if (!activeRes.ok) throw new Error(`HTTP ${activeRes.status}`);
      const activeJson = await activeRes.json();
      const activeList: Product[] = Array.isArray(activeJson?.data) ? activeJson.data : [];
      const activeFlagged = activeList.map(p => ({ ...p, isActive: true }));

      let archivedFlagged: Product[] = [];
      if (archivedRes.ok) {
        const archivedJson = await archivedRes.json();
        const archivedList: Product[] = Array.isArray(archivedJson?.data) ? archivedJson.data : [];
        archivedFlagged = archivedList.map(p => ({ ...p, isActive: false }));
      }

      setProducts([...activeFlagged, ...archivedFlagged]);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const summary = useMemo(() => {
    let total = 0, hidden = 0, totalStock = 0, lowCount = 0, outCount = 0;
    for (const p of products) {
      total++;
      if (p.isActive === false) { hidden++; continue; }
      const stock = getEffectiveStock(p);
      totalStock += stock;
      if (!p.trackStock) continue;
      if (stock === 0) outCount++;
      else if (stock < LOW_STOCK_THRESHOLD) lowCount++;
    }
    return { total, visible: total - hidden, hidden, totalStock, lowCount, outCount };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;

    if (filter === 'hidden') {
      list = list.filter(p => p.isActive === false);
    } else if (filter === 'low-stock') {
      list = list.filter(
        p => p.isActive !== false && p.trackStock && getEffectiveStock(p) > 0 && getEffectiveStock(p) < LOW_STOCK_THRESHOLD,
      );
    } else if (filter === 'out-of-stock') {
      list = list.filter(p => p.isActive !== false && p.trackStock && getEffectiveStock(p) === 0);
    } else {
      list = list.filter(p => p.isActive !== false);
    }

    if (typeFilter !== 'all') list = list.filter(p => p.productType === typeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, typeFilter, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const p of filtered) {
      const key = p.productType || 'unclassified';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    const order = ['yak-milk', 'puff-treat', 'highland-mix'];
    return [
      ...order.filter(k => groups.has(k)).map(k => [k, groups.get(k)!] as const),
      ...Array.from(groups.entries()).filter(([k]) => !order.includes(k)),
    ];
  }, [filtered]);

  const toggleVisibility = async (product: Product) => {
    const token = Cookies.get('token');
    if (!token) { setToast({ type: 'error', text: 'You must be logged in as admin.' }); return; }
    const makeVisible = product.isActive === false;
    const endpoint = makeVisible ? 'restore' : 'archive';
    try {
      setBusyId(product._id);
      const res = await fetch(`${API}/products/${product._id}/${endpoint}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setToast({ type: 'success', text: `"${product.name}" is now ${makeVisible ? 'visible' : 'hidden'}.` });
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: makeVisible } : p));
      } else {
        setToast({ type: 'error', text: result.message || 'Failed to update visibility' });
      }
    } catch {
      setToast({ type: 'error', text: 'Network error while updating visibility' });
    } finally {
      setBusyId(null);
    }
  };

  const confirmPermanentDelete = async () => {
    if (!deleteTarget) return;
    const token = Cookies.get('token');
    if (!token) { setToast({ type: 'error', text: 'You must be logged in as admin.' }); return; }
    try {
      setBusyId(deleteTarget._id);
      const res = await fetch(`${API}/products/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setToast({ type: 'success', text: `"${deleteTarget.name}" deleted permanently.` });
        setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        setToast({ type: 'error', text: result.message || 'Failed to delete product' });
      }
    } catch {
      setToast({ type: 'error', text: 'Network error while deleting' });
    } finally {
      setBusyId(null);
    }
  };

  const STAT_CARDS = [
    { label: 'Visible',      value: summary.visible,    icon: FiEye,         text: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-100' },
    { label: 'Hidden',       value: summary.hidden,     icon: FiEyeOff,      text: 'text-gray-600',    bg: 'bg-gray-50',    ring: 'ring-gray-100' },
    { label: 'Total Stock',  value: summary.totalStock, icon: FiPackage,     text: 'text-teal-600',    bg: 'bg-teal-50',    ring: 'ring-teal-100' },
    { label: 'Low Stock',    value: summary.lowCount,   icon: FiAlertCircle, text: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-100' },
    { label: 'Out of Stock', value: summary.outCount,   icon: FiXCircle,     text: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-100' },
  ];

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {toast.text}
        </div>
      )}

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
            <h1 className="text-xl font-bold text-gray-900">Stock &amp; Catalogue</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Inventory, visibility &amp; permanent delete — grouped by product type
            </p>
          </div>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors disabled:opacity-60"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat strip — denser, 5 cards */}
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

      {/* Controls — status tabs + type chips + search */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
          <FiFilter size={13} className="text-gray-400 ml-1 flex-shrink-0" />
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                ${filter === tab.key ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
          {(['all','yak-milk','puff-treat','highland-mix'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                ${typeFilter === t ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              {t === 'all' ? 'All Types' : typeMeta(t).label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-0 lg:ml-auto lg:max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
          />
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading stock data…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiAlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button onClick={fetchProducts} className="text-xs text-blue-600 font-semibold hover:underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
          <FiPackage size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400">No products match the current filter.</p>
          {(filter !== 'all' || typeFilter !== 'all' || search.trim()) && (
            <button
              onClick={() => { setFilter('all'); setTypeFilter('all'); setSearch(''); }}
              className="text-xs text-amber-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([type, items]) => {
            const meta = typeMeta(type);
            return (
              <section key={type} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <header className={`flex items-center justify-between px-5 py-3 bg-gradient-to-r ${meta.tint} border-b border-gray-100`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.chip}`}>{meta.label}</span>
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700 tabular-nums">{items.length}</span> {items.length === 1 ? 'product' : 'products'}
                    </span>
                  </div>
                  <FiChevronRight size={14} className="text-gray-300" />
                </header>

                <ul className="divide-y divide-gray-50">
                  {items.map(product => {
                    const status      = getStockStatus(product);
                    const statusBadge = STATUS_BADGE[status];
                    const totalStock  = getEffectiveStock(product);
                    const isHidden    = product.isActive === false;
                    const isBusy      = busyId === product._id;
                    const stockText   =
                      status === 'out-of-stock' ? 'text-red-600' :
                      status === 'low-stock'    ? 'text-amber-600' :
                      status === 'not-tracked'  ? 'text-gray-400' :
                      'text-emerald-700';

                    return (
                      <li
                        key={product._id}
                        className={`flex items-center gap-4 px-5 py-3 hover:bg-amber-50/30 transition-colors ${isHidden ? 'opacity-60' : ''}`}
                      >
                        {/* Thumb + name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold ring-1 ${meta.chip} ${meta.ring}`}>
                              {initials(product.name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.cls}`}>
                                {statusBadge.label}
                              </span>
                              {isHidden && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                  <FiEyeOff size={9} /> Hidden
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sizes / variants */}
                        <div className="hidden md:block flex-1 min-w-0">
                          {product.sizes && product.sizes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.sizes.map(s => (
                                <span
                                  key={s.value}
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ring-1 ${sizeChipCls(s.stockQuantity ?? 0)}`}
                                >
                                  {s.label}
                                  <span className="font-bold">{s.stockQuantity ?? 0}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">No sizes</span>
                          )}
                        </div>

                        {/* Total stock */}
                        <div className="w-20 text-right flex-shrink-0">
                          {product.trackStock ? (
                            <p className={`text-sm font-bold tabular-nums ${stockText}`}>{totalStock}</p>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{product.trackStock ? 'in stock' : 'untracked'}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Link
                            href={`/dashboard/products?edit=${product._id}`}
                            title="Edit product"
                            className="p-2 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <FiEdit2 size={13} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleVisibility(product)}
                            disabled={isBusy}
                            title={isHidden ? 'Make visible on product page' : 'Hide from product page'}
                            className={`p-2 rounded-lg border transition-colors disabled:opacity-50 ${
                              isHidden
                                ? 'border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50'
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {isHidden ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            disabled={isBusy}
                            title="Delete permanently"
                            className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          <p className="text-xs text-gray-400 px-1">
            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-gray-600">{products.length}</span> products
          </p>
        </div>
      )}

      {/* Permanent delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FiTrash2 className="text-red-600" size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Delete permanently?</h3>
                  <p className="text-xs text-gray-500">This cannot be undone.</p>
                </div>
              </div>
              <button type="button" onClick={() => setDeleteTarget(null)} className="p-1 rounded hover:bg-gray-100">
                <FiX size={18} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">{deleteTarget.name}</span> and all of its images will be removed from the database and disk.
              If you only want to hide it from the storefront, use the Hide action instead.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === deleteTarget._id}
                onClick={confirmPermanentDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-60"
              >
                {busyId === deleteTarget._id ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
