'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FiArrowLeft, FiUser, FiMapPin, FiShoppingBag, FiDollarSign,
  FiTruck, FiCreditCard, FiCopy, FiCheck, FiRefreshCw,
  FiChevronDown, FiPackage, FiCalendar, FiPhone, FiMail,
  FiExternalLink,
} from 'react-icons/fi';
import { formatMoney } from '@/lib/format';
import { authHeader, getAuthToken } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkedSubscription {
  _id: string;
  subscriptionId: string;
  productName: string;
  size: string;
  quantity: number;
  intervalLabel: string;
  status: 'active' | 'paused' | 'payment_failed' | 'cancelled';
  nextBillingDate: string;
}

interface OrderItem {
  _id?: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  shippingAddress?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
  items: OrderItem[];
  subtotal?: number;
  totalTax?: number;
  totalDelivery?: number;
  totalDiscount?: number;
  grandTotal?: number;
  paymentIntentId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus?: 'pending' | 'confirmed' | 'backordered' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string | null;
  courier?: string;
  shippedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ['pending', 'confirmed', 'backordered', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const paymentBadge: Record<string, string> = {
  paid:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending:  'bg-amber-100 text-amber-700 border-amber-200',
  failed:   'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-blue-100 text-blue-700 border-blue-200',
};

const orderBadge: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700 border-amber-200',
  confirmed:   'bg-blue-100 text-blue-700 border-blue-200',
  backordered: 'bg-orange-100 text-orange-700 border-orange-200',
  processing:  'bg-purple-100 text-purple-700 border-purple-200',
  shipped:     'bg-teal-100 text-teal-700 border-teal-200',
  delivered:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:   'bg-red-100 text-red-700 border-red-200',
};

// Colour accent for the top bar of each section card
const sectionBar: Record<string, string> = {
  customer:     'bg-blue-500',
  address:      'bg-teal-500',
  products:     'bg-amber-500',
  pricing:      'bg-emerald-500',
  controls:     'bg-purple-500',
  stripe:       'bg-indigo-500',
  tracking:     'bg-teal-600',
  subscription: 'bg-emerald-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cap = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  barColor,
  children,
}: {
  title: string;
  icon: React.ElementType;
  barColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-[3px] ${barColor}`} />
      <div className="px-6 pt-5 pb-1 flex items-center gap-2 border-b border-gray-50">
        <div className="p-1.5 rounded-lg bg-gray-100">
          <Icon size={15} className="text-gray-500" />
        </div>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-gray-800 font-medium break-all">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params.id as string;
  const API      = process.env.NEXT_PUBLIC_API_URL;

  const [order, setOrder]           = useState<Order | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [newStatus, setNewStatus]         = useState<string>('');
  const [trackingInput, setTrackingInput] = useState<string>('');
  const [updating, setUpdating]           = useState(false);
  const [updateMsg, setUpdateMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied]               = useState(false);
  const [linkedSubs, setLinkedSubs]       = useState<LinkedSubscription[]>([]);
  const [subsLoading, setSubsLoading]     = useState(false);
  const [subsError,   setSubsError]       = useState(false);

  // ── Fetch order ──────────────────────────────────────────────────────────
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) { setError('Not authenticated. Please log in again.'); return; }
      const res   = await fetch(`${API}/admin/orders/${id}`, {
        headers: authHeader(),
      });
      const data  = await res.json();

      if (data.success && data.data) {
        setOrder(data.data);
        setNewStatus(data.data.orderStatus);
        setTrackingInput(data.data.trackingNumber || '');
      } else {
        setError(data.message || 'Order not found');
      }
    } catch {
      setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API, id]);

  const fetchLinkedSubscriptions = useCallback(async (email: string) => {
    if (!email) return;
    setSubsLoading(true);
    setSubsError(false);
    try {
      const token = getAuthToken();
      if (!token) { setSubsError(true); return; }
      const res = await fetch(`${API}/admin/subscriptions?search=${encodeURIComponent(email)}&limit=10`, {
        headers: authHeader(),
      });
      if (!res.ok) { setSubsError(true); return; }
      const data = await res.json();
      if (data.success) setLinkedSubs(data.data.subscriptions || []);
      else setSubsError(true);
    } catch { setSubsError(true); }
    finally { setSubsLoading(false); }
  }, [API]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  useEffect(() => {
    if (order?.shippingAddress?.email) {
      fetchLinkedSubscriptions(order.shippingAddress.email);
    }
  }, [order, fetchLinkedSubscriptions]);

  // ── Update status ────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!order || newStatus === order.orderStatus) return;
    try {
      setUpdating(true);
      setUpdateMsg(null);
      const token = getAuthToken();
      if (!token) { setUpdateMsg({ type: 'error', text: 'Not authenticated. Please log in again.' }); return; }
      const body: Record<string, string> = { orderStatus: newStatus };
      if (newStatus === 'shipped' && trackingInput.trim()) {
        body.trackingNumber = trackingInput.trim();
      }

      const res = await fetch(`${API}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
        setTrackingInput(data.data.trackingNumber || '');
        setUpdateMsg({ type: 'success', text: `Status updated to "${cap(newStatus)}"` });
        setTimeout(() => setUpdateMsg(null), 3000);
      } else {
        setUpdateMsg({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch {
      setUpdateMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  // ── Copy PI to clipboard ─────────────────────────────────────────────────
  const copyPI = async () => {
    if (!order?.paymentIntentId) return;
    await navigator.clipboard.writeText(order.paymentIntentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">
        <div className="h-10 w-64 bg-white rounded-xl animate-pulse mb-5 border border-gray-100" />
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
        <FiPackage size={56} className="text-gray-200" />
        <h2 className="text-xl font-bold text-gray-700">Order not found</h2>
        <p className="text-gray-400 text-sm">{error}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
        >
          <FiArrowLeft size={15} />
          Go back
        </button>
      </div>
    );
  }

  const addr = order.shippingAddress ?? {};
  const addrName = addr.fullName ||
    [addr.firstName, addr.lastName].filter(Boolean).join(' ') ||
    'Customer';
  const itemTotal = (order.items ?? []).reduce((s, i) => s + i.quantity * (i.unitPrice ?? 0), 0);

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-mono">
              <FiShoppingBag className="text-amber-500" size={18} />
              {order.orderNumber}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${paymentBadge[order.paymentStatus ?? ''] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {cap(order.paymentStatus)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${orderBadge[order.orderStatus ?? ''] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {cap(order.orderStatus)}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiCalendar size={11} />
                {fmtDate(order.createdAt)} at {fmtTime(order.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={fetchOrder}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ════════ LEFT COLUMN ════════ */}
          <div className="space-y-6">

            {/* ── Customer Details ───────────────────────────────────── */}
            <SectionCard title="Customer Details" icon={FiUser} barColor={sectionBar.customer}>
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-lg uppercase">
                    {addrName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">{addrName}</p>
                  <p className="text-xs text-gray-400">Customer</p>
                </div>
              </div>
              <InfoRow label="Email"    value={addr.email} />
              <InfoRow label="Phone"    value={addr.phone} />
              <InfoRow label="First"    value={addr.firstName} />
              <InfoRow label="Last"     value={addr.lastName} />

              {/* Quick-action mailto */}
              {addr.email && (
                <a
                  href={`mailto:${addr.email}`}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <FiMail size={13} />
                  Email Customer
                </a>
              )}
            </SectionCard>

            {/* ── Shipping Address ───────────────────────────────────── */}
            <SectionCard title="Shipping Address" icon={FiMapPin} barColor={sectionBar.address}>
              <div className="space-y-1 text-sm text-gray-800 leading-relaxed font-medium">
                <p className="font-bold text-gray-900">{addrName}</p>
                {addr.addressLine1 && <p>{addr.addressLine1}</p>}
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                {(addr.city || addr.county) && (
                  <p>
                    {addr.city}
                    {addr.county ? `, ${addr.county}` : ''}
                  </p>
                )}
                {addr.postcode && <p>{addr.postcode}</p>}
                {addr.country && <p className="text-gray-400">{addr.country}</p>}
              </div>
              {addr.phone && (
                <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
                  <FiPhone size={12} />
                  {addr.phone}
                </p>
              )}
            </SectionCard>

            {/* ── Stripe Reference ───────────────────────────────────── */}
            <SectionCard title="Stripe Reference" icon={FiCreditCard} barColor={sectionBar.stripe}>
              {order.paymentIntentId ? (
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono text-gray-600 truncate">
                    {order.paymentIntentId}
                  </code>
                  <button
                    onClick={copyPI}
                    title="Copy to clipboard"
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-amber-100 hover:text-amber-700 text-gray-500 transition-colors shrink-0"
                  >
                    {copied ? <FiCheck size={15} className="text-emerald-600" /> : <FiCopy size={15} />}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No Stripe reference available</p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                Use this ID in the{' '}
                <a
                  href="https://dashboard.stripe.com/payments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline"
                >
                  Stripe Dashboard
                </a>{' '}
                to view payment details or issue a refund.
              </p>
            </SectionCard>

            {/* ── Shipping & Tracking ─────────────────────────────────── */}
            {(['shipped', 'delivered'] as string[]).includes(order.orderStatus ?? '') && order.trackingNumber && (
              <SectionCard title="Shipping & Tracking" icon={FiTruck} barColor={sectionBar.tracking}>
                <div className="space-y-3">
                  <div className="flex gap-4 py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">
                      Courier
                    </span>
                    <span className="text-sm text-gray-800 font-medium capitalize">
                      {order.courier || 'Evri'}
                    </span>
                  </div>
                  <div className="flex gap-4 py-2.5 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">
                      Tracking No.
                    </span>
                    <span className="text-sm text-gray-800 font-mono font-medium">
                      {order.trackingNumber}
                    </span>
                  </div>
                  {order.shippedAt && (
                    <div className="flex gap-4 py-2.5 border-b border-gray-50">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">
                        Shipped At
                      </span>
                      <span className="text-sm text-gray-800 font-medium">
                        {fmtDate(order.shippedAt)} at {fmtTime(order.shippedAt)}
                      </span>
                    </div>
                  )}
                  <a
                    href={`https://www.evri.com/track/parcel/${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <FiExternalLink size={14} />
                    Track Parcel on Evri
                  </a>
                </div>
              </SectionCard>
            )}
          </div>

          {/* ════════ RIGHT COLUMN ════════ */}
          <div className="space-y-6">

            {/* ── Products Ordered ───────────────────────────────────── */}
            <SectionCard title="Products Ordered" icon={FiPackage} barColor={sectionBar.products}>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[360px]">
                  <thead>
                    <tr className="bg-gray-50 rounded-xl">
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Size</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Unit</th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.items.map((item, idx) => (
                      <tr key={item._id ?? idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-3.5">
                          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                            {item.size || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span className="text-sm font-bold text-gray-700">{item.quantity}</span>
                        </td>
                        <td className="px-3 py-3.5 text-right text-sm text-gray-500 tabular-nums">
                          {formatMoney(item.unitPrice ?? 0)}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <span className="text-sm font-bold text-gray-900 tabular-nums">
                            {formatMoney((item.unitPrice ?? 0) * item.quantity)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-100">
                      <td colSpan={4} className="px-3 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase">
                        Items subtotal
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm font-bold text-gray-900 tabular-nums">
                        {formatMoney(itemTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </SectionCard>

            {/* ── Pricing Breakdown ──────────────────────────────────── */}
            <SectionCard title="Pricing Breakdown" icon={FiDollarSign} barColor={sectionBar.pricing}>
              <div className="space-y-0">
                {[
                  { label: 'Subtotal',   value: order.subtotal ?? 0 },
                  (order.totalDiscount ?? 0) > 0
                    ? { label: 'Discount',  value: -(order.totalDiscount ?? 0), negative: true }
                    : null,
                  { label: 'VAT (20%)',  value: order.totalTax ?? 0 },
                  { label: 'Shipping',   value: order.totalDelivery ?? 0 },
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div
                      key={row!.label}
                      className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm text-gray-500">{row!.label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${(row as { negative?: boolean }).negative ? 'text-emerald-600' : 'text-gray-800'}`}>
                        {(row as { negative?: boolean }).negative ? '-' : ''}{formatMoney(Math.abs(row!.value))}
                      </span>
                    </div>
                  ))}

                {/* Grand total */}
                <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-gray-200">
                  <span className="text-base font-bold text-gray-900">Grand Total</span>
                  <span className="text-xl font-bold text-amber-600 tabular-nums">
                    {formatMoney(order.grandTotal ?? 0)}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* ── Linked Subscriptions ───────────────────────────────── */}
            <SectionCard title="Linked Subscriptions" icon={FiRefreshCw} barColor={sectionBar.subscription}>
              {subsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <FiRefreshCw className="animate-spin" size={14} /> Loading subscriptions…
                </div>
              ) : subsError ? (
                <div className="text-center py-6">
                  <p className="text-sm text-red-500 mb-2">Failed to load subscriptions.</p>
                  <button
                    onClick={() => addr.email && fetchLinkedSubscriptions(addr.email)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : linkedSubs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">No subscriptions linked to this order&apos;s email.</p>
                  {addr.email && (
                    <Link
                      href={`/dashboard/subscriptions?search=${encodeURIComponent(addr.email)}`}
                      className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-600 hover:underline"
                    >
                      Search subscriptions for {addr.email}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedSubs.map((sub) => {
                    const statusColors: Record<string, string> = {
                      active:         'bg-emerald-100 text-emerald-700 border-emerald-200',
                      paused:         'bg-amber-100 text-amber-700 border-amber-200',
                      payment_failed: 'bg-red-100 text-red-700 border-red-200',
                      cancelled:      'bg-slate-100 text-slate-600 border-slate-200',
                    };
                    const statusLabels: Record<string, string> = {
                      active: 'Active', paused: 'Paused',
                      payment_failed: 'Failed', cancelled: 'Cancelled',
                    };
                    return (
                      <div key={sub._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{sub.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {sub.size} · Qty {sub.quantity} · {sub.intervalLabel}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">{sub.subscriptionId}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[sub.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {statusLabels[sub.status] ?? sub.status}
                          </span>
                          <Link
                            href={`/dashboard/subscriptions/${sub._id}`}
                            className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            View <FiExternalLink size={9} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  {addr.email && (
                    <Link
                      href={`/dashboard/subscriptions?search=${encodeURIComponent(addr.email)}`}
                      className="block text-center text-xs text-emerald-600 hover:underline mt-1"
                    >
                      View all subscriptions for {addr.email}
                    </Link>
                  )}
                </div>
              )}
            </SectionCard>

            {/* ── Order Controls ─────────────────────────────────────── */}
            <SectionCard title="Order Controls" icon={FiTruck} barColor={sectionBar.controls}>
              <div className="space-y-4">
                {/* Current status display */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-400 font-medium">Current status</div>
                  <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${orderBadge[order.orderStatus ?? ''] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {cap(order.orderStatus)}
                  </span>
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Update Status
                  </label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 pr-10 font-medium text-gray-800 cursor-pointer"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{cap(s)}</option>
                      ))}
                    </select>
                    <FiChevronDown
                      size={15}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Tracking number — visible when "shipped" is selected */}
                {newStatus === 'shipped' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Evri Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                      placeholder="e.g. H0679A0000008849"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono bg-white outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 text-gray-800 placeholder-gray-300"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Courier will be set to <strong>Evri</strong> automatically.
                    </p>
                  </div>
                )}

                {/* Update button */}
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === order.orderStatus}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200
                    ${updating || newStatus === order.orderStatus
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30'
                    }`}
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <FiTruck size={15} />
                      Update Status
                    </>
                  )}
                </button>

                {/* Feedback message */}
                {updateMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
                    ${updateMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {updateMsg.type === 'success'
                      ? <FiCheck size={14} />
                      : <span className="font-bold">!</span>
                    }
                    {updateMsg.text}
                  </div>
                )}

                {/* Refund placeholder */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-2 font-medium">Payment Actions</p>
                  <button
                    disabled
                    title="Refund via Stripe Dashboard"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed"
                  >
                    <FiCreditCard size={14} />
                    Issue Refund (via Stripe Dashboard)
                  </button>
                  <p className="text-[10px] text-gray-300 mt-1.5 text-center">
                    Use the Stripe PI reference above to refund in Stripe&apos;s dashboard.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
