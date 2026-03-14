'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  MailOpen,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { PackageSearch } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

interface MyOrder {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  courier: string;
  shippedAt: string | null;
  createdAt: string;
  grandTotal: number;
  items: OrderItem[];
  shippingAddress: {
    fullName?: string;
    addressLine1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Order Received',       color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',    icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed:  { label: 'Order Confirmed',      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',          icon: <CheckCircle className="w-3.5 h-3.5" /> },
  processing: { label: 'Preparing Your Order', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', icon: <Package className="w-3.5 h-3.5" /> },
  shipped:    { label: 'Out for Delivery',     color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',           icon: <Truck className="w-3.5 h-3.5" /> },
  delivered:  { label: 'Delivered',            color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled:  { label: 'Cancelled',            color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',                 icon: <XCircle className="w-3.5 h-3.5" /> },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: MyOrder }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.pending;
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">

      {/* Status bar */}
      <div className={`h-[3px] ${
        order.orderStatus === 'shipped'   ? 'bg-teal-500' :
        order.orderStatus === 'delivered' ? 'bg-emerald-500' :
        order.orderStatus === 'cancelled' ? 'bg-red-400' :
        order.orderStatus === 'processing'? 'bg-purple-500' :
        order.orderStatus === 'confirmed' ? 'bg-blue-500' :
        'bg-amber-400'
      }`} />

      {/* Header row */}
      <div className="px-5 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#faf5ee] dark:bg-[#2a211b] flex items-center justify-center shrink-0 mt-0.5">
            <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
              {order.orderNumber}
            </p>
            <p className="text-xs text-[#aaa] dark:text-[#666] mt-0.5">
              {fmtDate(order.createdAt)} &middot; {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
          <span className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
            £{order.grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping line */}
      {order.shippingAddress?.city && (
        <div className="px-5 pb-3 flex items-center gap-1.5 text-xs text-[#aaa] dark:text-[#666]">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>
            {[
              order.shippingAddress.fullName,
              order.shippingAddress.addressLine1,
              order.shippingAddress.city,
              order.shippingAddress.postcode,
            ].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Tracking banner — only when shipped + tracking number */}
      {order.orderStatus === 'shipped' && order.trackingNumber && (
        <div className="mx-5 mb-3 px-4 py-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Truck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <div>
              <p className="font-semibold text-teal-800 dark:text-teal-300 text-xs uppercase tracking-wide">
                {order.courier || 'Evri'} · Tracking
              </p>
              <p className="font-mono text-sm text-teal-700 dark:text-teal-400 font-bold">
                {order.trackingNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://www.evri.com/track/parcel/${order.trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Track Parcel
            </a>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1.5 bg-white dark:bg-[#17120e] hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <PackageSearch className="w-3.5 h-3.5" />
              Track Order
            </Link>
          </div>
        </div>
      )}

      {/* Expand / collapse items */}
      <div className="border-t border-[#f0ebe4] dark:border-[#2e2420]">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
        >
          <span>View {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="px-5 pb-4 space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm py-2 border-b border-[#f8f3ee] dark:border-[#2a211b] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-[#2a211b] flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2f1e14] dark:text-[#f5e9dc] text-xs">{item.name}</p>
                    <p className="text-[11px] text-[#aaa] dark:text-[#666]">
                      {item.size} &middot; Qty {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-xs">
                  £{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Order total */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6]">Order Total</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                £{order.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyOrdersPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [orders, setOrders]     = useState<MyOrder[] | null>(null);
  const [searched, setSearched] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res  = await fetch(`${API}/orders/my-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders(data.data as MyOrder[]);
        setSearched(email.trim().toLowerCase());
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#1a1410] pt-32 pb-16 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-amber-600 dark:hover:text-amber-400 text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">My Orders</h1>
          </div>
          <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] ml-[52px]">
            Enter the email address you used at checkout to view all your orders.
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleLookup}
          className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-6 shadow-sm mb-6"
        >
          <label className="block text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MailOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c8b6a6] dark:text-[#5a4a40]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                required
                className="w-full border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl pl-10 pr-4 py-3 text-sm bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex items-center gap-2 bg-[#2f1e14] dark:bg-amber-600 hover:bg-[#3d2a1c] dark:hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3 px-5 rounded-xl transition-colors text-sm shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Searching…' : 'Find Orders'}
            </button>
          </div>

          {/* Quick link to track a specific order */}
          <p className="mt-4 text-xs text-[#aaa] dark:text-[#666]">
            Looking for a specific order?{' '}
            <Link
              href="/track-order"
              className="text-amber-600 dark:text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <PackageSearch className="w-3.5 h-3.5" />
              Track by order number
            </Link>
          </p>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-400 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {orders !== null && (
          <div>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                {orders.length > 0
                  ? `${orders.length} order${orders.length === 1 ? '' : 's'} found`
                  : 'No orders found'}
              </p>
              {searched && (
                <p className="text-xs text-[#aaa] dark:text-[#666] truncate max-w-[200px]">
                  for <span className="font-medium">{searched}</span>
                </p>
              )}
            </div>

            {/* Empty state */}
            {orders.length === 0 ? (
              <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#faf5ee] dark:bg-[#2a211b] rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-amber-300 dark:text-amber-700" />
                </div>
                <h3 className="text-base font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">
                  No orders found
                </h3>
                <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mb-6 max-w-xs mx-auto">
                  We couldn&apos;t find any orders for this email address. Make sure you&apos;re using the email you checked out with.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#2f1e14] dark:bg-amber-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.orderNumber} order={order} />
                ))}

                {/* Bottom CTA */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-[#aaa] dark:text-[#666] mb-3">
                    Need to track a parcel? Use the dedicated tracking page.
                  </p>
                  <Link
                    href="/track-order"
                    className="inline-flex items-center gap-2 border border-[#e8e3dc] dark:border-[#2e2420] text-[#2f1e14] dark:text-[#f5e9dc] hover:bg-[#f0ebe4] dark:hover:bg-[#2a211b] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <PackageSearch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Track an Order
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
