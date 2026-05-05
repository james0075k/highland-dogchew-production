'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FiPackage, FiAlertCircle, FiSearch, FiFilter,
  FiRefreshCw, FiXCircle, FiArrowLeft,
  FiChevronUp, FiChevronDown,
} from 'react-icons/fi';
import { GiDogBowl } from 'react-icons/gi';

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
  productType: 'yak-milk' | 'puff-treat' | 'highland-mix';
  trackStock: boolean;
  stockQuantity: number;
  sizes?: ProductSize[];
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

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  'yak-milk':     { label: 'Yak Milk',     cls: 'bg-sky-100 text-sky-700' },
  'puff-treat':   { label: 'Puff Treat',   cls: 'bg-purple-100 text-purple-700' },
  'highland-mix': { label: 'Highland Mix', cls: 'bg-teal-100 text-teal-700' },
};

const STATUS_BADGE: Record<StockStatus, { label: string; cls: string }> = {
  'in-stock':     { label: 'In Stock',     cls: 'bg-emerald-100 text-emerald-700' },
  'low-stock':    { label: 'Low Stock',    cls: 'bg-amber-100 text-amber-700' },
  'out-of-stock': { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' },
  'not-tracked':  { label: 'Not Tracked',  cls: 'bg-gray-100 text-gray-500' },
};

function sizeChipCls(qty: number): string {
  if (qty === 0) return 'bg-red-100 text-red-700';
  if (qty < LOW_STOCK_THRESHOLD) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

const STAT_CARDS = (total: number, totalStock: number, lowCount: number, outCount: number) => [
  {
    label: 'Total Products',
    value: total,
    icon: FiPackage,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    label: 'Total Stock',
    value: totalStock,
    icon: FiPackage,
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
  },
  {
    label: 'Low Stock',
    value: lowCount,
    icon: FiAlertCircle,
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    label: 'Out of Stock',
    value: outCount,
    icon: FiXCircle,
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    text: 'text-red-600',
  },
];

const TABLE_HEADERS = ['Product', 'Type', 'Sizes / Variants', 'Total Stock', 'Stock Level', 'Status'];

const FILTER_TABS: { key: 'all' | 'low-stock' | 'out-of-stock'; label: string }[] = [
  { key: 'all',          label: 'All Products' },
  { key: 'low-stock',    label: 'Low Stock' },
  { key: 'out-of-stock', label: 'Out of Stock' },
];

export default function StockTrackerPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<'all' | 'low-stock' | 'out-of-stock'>('all');
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState<'stock' | 'name'>('stock');
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.data) setProducts(Array.isArray(data.data) ? data.data : []);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const summaryStats = useMemo(() => {
    let totalStock = 0, lowCount = 0, outCount = 0;
    for (const p of products) {
      const stock = getEffectiveStock(p);
      totalStock += stock;
      if (!p.trackStock) continue;
      if (stock === 0) outCount++;
      else if (stock < LOW_STOCK_THRESHOLD) lowCount++;
    }
    return { totalStock, lowCount, outCount };
  }, [products]);

  const displayProducts = useMemo(() => {
    let list = [...products];

    if (filter === 'low-stock') {
      list = list.filter(
        p => p.trackStock && getEffectiveStock(p) > 0 && getEffectiveStock(p) < LOW_STOCK_THRESHOLD,
      );
    } else if (filter === 'out-of-stock') {
      list = list.filter(p => p.trackStock && getEffectiveStock(p) === 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (sortBy === 'name')
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const sa = getEffectiveStock(a), sb = getEffectiveStock(b);
      return sortDir === 'asc' ? sa - sb : sb - sa;
    });

    return list;
  }, [products, filter, search, sortBy, sortDir]);

  const maxStock = useMemo(
    () => Math.max(...products.map(getEffectiveStock), 1),
    [products],
  );

  function toggleSort(by: 'stock' | 'name') {
    if (sortBy === by) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(by); setSortDir('asc'); }
  }

  const statCards = STAT_CARDS(products.length, summaryStats.totalStock, summaryStats.lowCount, summaryStats.outCount);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#f5f7fa]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Stock Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Live inventory across all products &amp; variants
            </p>
          </div>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors disabled:opacity-60"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.color} rounded-t-2xl`} />
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {card.label}
              </p>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon size={16} className={card.text} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Controls row ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
          <FiFilter size={13} className="text-gray-400 ml-1 flex-shrink-0" />
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap
                ${filter === tab.key
                  ? 'bg-[#0c1e35] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
            />
          </div>

          {/* Sort controls */}
          <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm flex-shrink-0">
            <button
              onClick={() => toggleSort('stock')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${sortBy === 'stock' ? 'bg-[#0c1e35] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Stock
              {sortBy === 'stock' && (sortDir === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
            </button>
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${sortBy === 'name' ? 'bg-[#0c1e35] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Name
              {sortBy === 'name' && (sortDir === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading stock data…</p>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FiAlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Try again
            </button>
          </div>

        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FiPackage size={28} className="text-gray-300" />
            <p className="text-sm text-gray-400">No products match the current filter.</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-xs text-amber-600 font-semibold hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayProducts.map((product) => {
                  const totalStock  = getEffectiveStock(product);
                  const status      = getStockStatus(product);
                  const statusBadge = STATUS_BADGE[status];
                  const typeBadge   = TYPE_BADGE[product.productType] ?? { label: product.productType, cls: 'bg-gray-100 text-gray-600' };
                  const barPct      = Math.round((totalStock / maxStock) * 100);
                  const barColor    =
                    status === 'out-of-stock' ? 'bg-red-400' :
                    status === 'low-stock'    ? 'bg-amber-400' :
                    status === 'not-tracked'  ? 'bg-gray-200' :
                    'bg-emerald-400';
                  const stockTextColor =
                    status === 'out-of-stock' ? 'text-red-600' :
                    status === 'low-stock'    ? 'text-amber-600' :
                    'text-gray-800';

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.image
                            ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <GiDogBowl size={16} className="text-amber-500" />
                              </div>
                            )
                          }
                          <p className="text-sm font-semibold text-gray-800 max-w-[180px] truncate">
                            {product.name}
                          </p>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full ${typeBadge.cls}`}>
                          {typeBadge.label}
                        </span>
                      </td>

                      {/* Sizes / Variants */}
                      <td className="px-5 py-4">
                        {product.sizes && product.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {product.sizes.map((s) => (
                              <span
                                key={s.value}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${sizeChipCls(s.stockQuantity ?? 0)}`}
                              >
                                {s.label}
                                <span className="font-bold">{s.stockQuantity ?? 0}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No sizes</span>
                        )}
                      </td>

                      {/* Total Stock */}
                      <td className="px-5 py-4">
                        {product.trackStock
                          ? <p className={`text-sm font-bold tabular-nums ${stockTextColor}`}>{totalStock}</p>
                          : <span className="text-gray-300 text-sm">—</span>
                        }
                      </td>

                      {/* Stock Level bar */}
                      <td className="px-5 py-4 min-w-[120px]">
                        {product.trackStock ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium w-8 text-right tabular-nums">
                              {barPct}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300">Not tracked</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusBadge.cls}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {!loading && !error && displayProducts.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing{' '}
              <span className="font-semibold text-gray-600">{displayProducts.length}</span>
              {' '}of{' '}
              <span className="font-semibold text-gray-600">{products.length}</span>
              {' '}products
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="ml-3 text-amber-600 font-semibold hover:underline"
                >
                  Clear filter
                </button>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
