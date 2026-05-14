'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft, FiRefreshCw, FiCheckCircle, FiPauseCircle,
  FiAlertCircle, FiXCircle, FiMail, FiMapPin, FiClock, FiRepeat,
} from 'react-icons/fi';
import { formatMoney } from '@/lib/format';
import { authHeader, jsonAuthHeader } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillingEntry {
  date: string;
  amount: number;
  status: 'success' | 'failed';
  orderId?: { _id: string; orderNumber: string } | string;
  paymentIntentId?: string;
  failureReason?: string;
}

interface Address {
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
}

interface Subscription {
  _id: string;
  subscriptionId: string;
  email: string;
  stripeCustomerId: string;
  paymentMethodId: string;
  productName: string;
  productImage?: string;
  productSlug?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  intervalLabel: string;
  intervalWeeks: number;
  status: 'active' | 'paused' | 'payment_failed' | 'cancelled';
  nextBillingDate: string;
  lastBilledAt?: string;
  failureCount: number;
  failureReason?: string;
  firstOrderId?: { _id?: string; orderNumber: string; grandTotal: number; createdAt: string };
  billingHistory: BillingEntry[];
  shippingAddress: Address;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const statusMeta: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  active:         { label: 'Active',         icon: FiCheckCircle,  cls: 'bg-emerald-100 text-emerald-700' },
  paused:         { label: 'Paused',         icon: FiPauseCircle,  cls: 'bg-amber-100 text-amber-700' },
  payment_failed: { label: 'Payment Failed', icon: FiAlertCircle,  cls: 'bg-red-100 text-red-700' },
  cancelled:      { label: 'Cancelled',      icon: FiXCircle,      cls: 'bg-slate-100 text-slate-600' },
};

const ALLOWED_STATUSES = ['active', 'paused', 'payment_failed', 'cancelled'] as const;

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sub, setSub]         = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const base = process.env.NEXT_PUBLIC_API_URL;

  const fetchSub = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res  = await fetch(`${base}/admin/subscriptions/${id}`, { headers: authHeader() });
      if (!res.ok) { setFetchError(`Server error (${res.status}). Please try again.`); return; }
      const data = await res.json();
      if (data.success && data.data?.subscription) {
        setSub(data.data.subscription);
        setNewStatus(data.data.subscription.status);
      } else {
        setFetchError(data.message || 'Subscription not found.');
      }
    } catch {
      setFetchError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [id, base]);

  useEffect(() => { fetchSub(); }, [fetchSub]);

  const handleStatusUpdate = async () => {
    if (!sub || !newStatus || newStatus === sub.status) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const res  = await fetch(`${base}/admin/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: jsonAuthHeader(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { setUpdateError(`Server error (${res.status}). Please try again.`); return; }
      const data = await res.json();
      if (data.success) { fetchSub(); }
      else { setUpdateError(data.message || 'Update failed.'); }
    } catch {
      setUpdateError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">
        <div className="h-10 w-64 bg-white rounded-xl animate-pulse mb-5 border border-gray-100" />
        <div className="grid lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center gap-4 text-center">
        <FiAlertCircle size={48} className="text-gray-300" />
        <h2 className="text-lg font-bold text-gray-700">{fetchError || 'Subscription not found.'}</h2>
        <button onClick={() => router.back()} className="px-5 py-2.5 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors">
          Go back
        </button>
      </div>
    );
  }

  const sm = statusMeta[sub.status] || statusMeta.active;
  const StatusIcon = sm.icon;
  const addr = sub.shippingAddress;

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/subscriptions"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiRepeat className="text-amber-500" size={18} />
              {sub.productName}
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{sub.subscriptionId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${sm.cls}`}>
            <StatusIcon size={11} />
            {sm.label}
          </span>
          <button
            onClick={fetchSub}
            className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Per Delivery', value: formatMoney(sub.unitPrice * sub.quantity), color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
          { label: 'Next Billing', value: fmt(sub.nextBillingDate), color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
          { label: 'Last Billed',  value: fmt(sub.lastBilledAt),   color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
          { label: 'Active Since', value: fmt(sub.createdAt),       color: 'text-slate-700', bg: 'bg-slate-50', ring: 'ring-slate-100' },
        ].map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-100 px-4 py-3 ring-1 ${card.ring}`}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-lg font-bold tabular-nums mt-0.5 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Billing History */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FiClock size={16} className="text-slate-400" />
                  Billing History ({sub.billingHistory.length})
                </h2>
              </div>
              {sub.billingHistory.length === 0 ? (
                <p className="px-6 py-8 text-center text-slate-400 text-sm">No billing records yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Date', 'Amount', 'Status', 'Order', 'Payment Intent'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...sub.billingHistory].reverse().map((entry, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDateTime(entry.date)}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums">{formatMoney(entry.amount)}</td>
                        <td className="px-4 py-3">
                          {entry.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <FiCheckCircle size={10} /> Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                              <FiAlertCircle size={10} /> Failed
                            </span>
                          )}
                          {entry.failureReason && (
                            <p className="text-xs text-red-500 mt-0.5">{entry.failureReason}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {entry.orderId ? (() => {
                            const id   = typeof entry.orderId === 'object' ? entry.orderId._id   : entry.orderId;
                            const num  = typeof entry.orderId === 'object' ? entry.orderId.orderNumber : entry.orderId;
                            return id ? (
                              <Link href={`/dashboard/orders/${id}`} className="text-blue-600 hover:underline font-mono text-xs">
                                {num}
                              </Link>
                            ) : <span className="font-mono text-xs">{num}</span>;
                          })() : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">
                          {entry.paymentIntentId ? entry.paymentIntentId.slice(0, 27) + '…' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Status control */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Update Status</h2>
              {sub.failureCount > 0 && (
                <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                  <strong>Failures:</strong> {sub.failureCount} · {sub.failureReason || 'No reason recorded'}
                </div>
              )}
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 mb-3"
              >
                {ALLOWED_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusMeta[s].label}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus || newStatus === sub.status}
                className="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {updating ? 'Updating…' : 'Update Status'}
              </button>
              {updateError && (
                <p className="text-xs text-red-500 mt-2">{updateError}</p>
              )}
            </div>

            {/* Customer */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FiMail size={15} className="text-slate-400" /> Customer
              </h2>
              <p className="text-sm font-medium text-slate-900">
                {addr.firstName || ''} {addr.lastName || ''}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">{sub.email}</p>
              {addr.phone && <p className="text-sm text-slate-500 mt-0.5">{addr.phone}</p>}

              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-mono break-all">
                  <span className="text-slate-500 not-italic">Stripe: </span>
                  {sub.stripeCustomerId}
                </p>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FiMapPin size={15} className="text-slate-400" /> Shipping Address
              </h2>
              <div className="text-sm text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-900">{addr.fullName}</p>
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>{addr.city}{addr.county ? `, ${addr.county}` : ''}</p>
                <p>{addr.postcode}</p>
                <p>{addr.country}</p>
              </div>
            </div>

            {/* First order link */}
            {sub.firstOrderId && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-3">Initial Order</h2>
                <Link
                  href={`/dashboard/orders/${typeof sub.firstOrderId === 'object' ? sub.firstOrderId._id || '' : sub.firstOrderId}`}
                  className="text-blue-600 hover:underline font-mono text-sm"
                >
                  {typeof sub.firstOrderId === 'object' ? sub.firstOrderId.orderNumber : '—'}
                </Link>
                {typeof sub.firstOrderId === 'object' && sub.firstOrderId.grandTotal && (
                  <p className="text-sm text-slate-500 mt-1 tabular-nums">{formatMoney(sub.firstOrderId.grandTotal)}</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
