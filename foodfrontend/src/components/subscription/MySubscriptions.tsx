'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTheme } from 'next-themes';
import {
  RefreshCcw, Pause, Play, X, Calendar, ChevronDown, ChevronUp,
  Package, Mail, Search, Loader2, AlertTriangle, CheckCircle,
  Clock, XCircle, CreditCard, ShoppingBag, Truck, MapPin,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillingEntry {
  date: string;
  amount: number;
  status: 'success' | 'failed';
  orderId?: string;
  paymentIntentId?: string;
  failureReason?: string;
}

interface ShippingAddress {
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
  billingHistory: BillingEntry[];
  shippingAddress: ShippingAddress;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
}

type FilterTab = 'all' | 'active' | 'paused' | 'cancelled';

// ─── Constants ────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL;
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STATUS_STYLE: Record<string, string> = {
  active:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  paused:         'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  payment_failed: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled:      'bg-slate-100 text-slate-500 dark:bg-slate-900/20 dark:text-slate-400',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active', paused: 'Paused', payment_failed: 'Payment Failed', cancelled: 'Cancelled',
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  confirmed:  'text-emerald-600', processing: 'text-blue-600',  shipped:   'text-purple-600',
  delivered:  'text-emerald-700', cancelled:  'text-slate-400', pending:   'text-amber-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getUpcomingDates(nextBillingDate: string, intervalWeeks: number, count = 3): Date[] {
  const dates: Date[] = [];
  const d = new Date(nextBillingDate);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + intervalWeeks * 7);
  }
  return dates;
}

// ─── Update Card Form (inside Stripe Elements) ────────────────────────────────

function UpdateCardForm({
  email, subscriptionId, onSuccess, onCancel,
}: { email: string; subscriptionId: string; onSuccess: () => void; onCancel: () => void; }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const { error: stripeErr, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (stripeErr) { setError(stripeErr.message ?? 'Card confirmation failed.'); return; }

      if (setupIntent?.status === 'succeeded') {
        const pmId = typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : (setupIntent.payment_method as { id: string } | null)?.id;

        if (!pmId) { setError('Could not retrieve payment method.'); return; }

        const res = await fetch(`${API}/customer/subscriptions/${subscriptionId}/update-payment`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, paymentMethodId: pmId }),
        });
        if (!res.ok) { setError(`Server error (${res.status}). Please try again.`); return; }
        const data = await res.json();
        if (data.success) { onSuccess(); }
        else { setError(data.message || 'Failed to update payment method.'); }
      } else {
        setError('Payment setup incomplete. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="submit" disabled={loading || !stripe || !elements}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#2f1e14] dark:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
          {loading ? 'Saving…' : 'Save Card'}
        </button>
        <button
          type="button" onClick={onCancel}
          className="px-4 py-2.5 border border-[#e8e3dc] dark:border-[#2e2420] text-[#555] dark:text-[#aaa] text-xs rounded-lg hover:bg-[#f5f0eb] dark:hover:bg-[#2e2420] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  sub, onConfirm, onAbort, loading,
}: { sub: Subscription; onConfirm: () => void; onAbort: () => void; loading: boolean; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onAbort} />
      <div className="relative bg-white dark:bg-[#1e1812] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-600" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Cancel subscription?</h3>
              <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mt-1">This action cannot be undone.</p>
            </div>
          </div>
          <div className="bg-[#faf8f4] dark:bg-[#17120e] rounded-xl p-4 mb-5 border border-[#f0ebe4] dark:border-[#2e2420]">
            <div className="flex items-center gap-3">
              {sub.productImage ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={sub.productImage} alt={sub.productName} width={40} height={40} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-amber-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm">{sub.productName}</p>
                <p className="text-xs text-[#aaa]">{sub.size} · {sub.intervalLabel} · £{sub.unitPrice.toFixed(2)}/delivery</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 mb-6">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Not ready to cancel?</strong> You can pause your subscription instead to skip deliveries temporarily.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onAbort} disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-[#e8e3dc] dark:border-[#2e2420] text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] hover:bg-[#f5f0eb] dark:hover:bg-[#2e2420] transition-colors disabled:opacity-50"
            >
              Keep subscription
            </button>
            <button
              onClick={onConfirm} disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Yes, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subscription Card ────────────────────────────────────────────────────────

function SubscriptionCard({
  sub, email, isDark, onUpdated, onCancelRequest,
}: {
  sub: Subscription;
  email: string;
  isDark: boolean;
  onUpdated: (updated: Subscription) => void;
  onCancelRequest: (sub: Subscription) => void;
}) {
  const [expanded,      setExpanded]      = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders,        setOrders]        = useState<Order[] | null>(null);
  const [ordersError,   setOrdersError]   = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError,   setActionError]   = useState<string | null>(null);
  const [setupSecret,   setSetupSecret]   = useState<string | null>(null);
  const [setupLoading,  setSetupLoading]  = useState(false);
  const [cardSuccess,   setCardSuccess]   = useState(false);

  const total = +(sub.unitPrice * sub.quantity).toFixed(2);

  const handleExpand = async () => {
    const opening = !expanded;
    setExpanded(opening);
    if (opening && orders === null) {
      setOrdersLoading(true);
      setOrdersError(false);
      try {
        const r = await fetch(`${API}/customer/subscriptions/${sub.subscriptionId}/orders?email=${encodeURIComponent(email)}`);
        if (!r.ok) { setOrdersError(true); return; }
        const d = await r.json();
        if (d.success) { setOrders(d.data.orders ?? []); }
        else { setOrdersError(true); }
      } catch { setOrdersError(true); }
      finally { setOrdersLoading(false); }
    }
  };

  const doAction = async (action: 'cancel' | 'pause' | 'resume') => {
    setActionLoading(action);
    setActionError(null);
    try {
      const r = await fetch(`${API}/customer/subscriptions/${sub.subscriptionId}/${action}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) { setActionError(`Server error (${r.status}). Please try again.`); return; }
      const d = await r.json();
      if (d.success) { onUpdated(d.data.subscription); }
      else { setActionError(d.message || 'Something went wrong.'); }
    } catch { setActionError('Network error. Please try again.'); }
    finally { setActionLoading(null); }
  };

  const handleUpdateCard = async () => {
    setSetupLoading(true);
    setActionError(null);
    try {
      const r = await fetch(`${API}/customer/subscriptions/${sub.subscriptionId}/setup-intent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) { setActionError(`Server error (${r.status}). Please try again.`); return; }
      const d = await r.json();
      if (d.success) { setSetupSecret(d.data.clientSecret); }
      else { setActionError(d.message || 'Failed to initialise card update.'); }
    } catch { setActionError('Network error. Please try again.'); }
    finally { setSetupLoading(false); }
  };

  const handleCardSuccess = () => {
    setSetupSecret(null);
    setCardSuccess(true);
    if (sub.status === 'payment_failed') {
      onUpdated({ ...sub, status: 'active', failureCount: 0, failureReason: '' });
    }
  };

  const upcoming = sub.status !== 'cancelled' && sub.status !== 'payment_failed'
    ? getUpcomingDates(sub.nextBillingDate, sub.intervalWeeks, 3)
    : [];

  const stripeAppearance = {
    theme: (isDark ? 'night' : 'stripe') as 'stripe' | 'night',
    variables: {
      colorPrimary:    isDark ? '#f5e9dc' : '#2f1e14',
      colorBackground: isDark ? '#2a2a2a' : '#ffffff',
      colorText:       isDark ? '#f5e9dc' : '#2f1e14',
      borderRadius: '6px', fontSizeBase: '13px',
    },
  };

  return (
    <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl overflow-hidden shadow-sm">

      {/* Status bar */}
      <div className={`h-[3px] ${
        sub.status === 'active' ? 'bg-amber-500' :
        sub.status === 'paused' ? 'bg-amber-300' :
        sub.status === 'payment_failed' ? 'bg-red-400' : 'bg-slate-200 dark:bg-slate-700'
      }`} />

      <div className="p-5">
        {/* ── Header row ── */}
        <div className="flex gap-4 mb-4">
          {sub.productImage ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#f0ebe4] dark:bg-[#2a2a2a] shrink-0 border border-[#e8e3dc] dark:border-[#3a3a3a]">
              <Image src={sub.productImage} alt={sub.productName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-amber-50 dark:bg-[#2d221c] flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                {sub.productSlug ? (
                  <Link href={`/products/${sub.productSlug}`} className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-1">
                    {sub.productName}
                  </Link>
                ) : (
                  <p className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm line-clamp-1">{sub.productName}</p>
                )}
                {sub.size && sub.size !== 'Default' && (
                  <p className="text-xs text-[#888] dark:text-[#666] mt-0.5">{sub.size} · Qty {sub.quantity}</p>
                )}
              </div>
              <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[sub.status]}`}>
                {STATUS_LABEL[sub.status]}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#555] dark:text-[#aaa]">
              <span className="flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" />
                {sub.intervalLabel} · <strong className="text-[#2f1e14] dark:text-[#f5e9dc]">£{total.toFixed(2)}</strong>
              </span>
              {sub.status === 'active' && sub.nextBillingDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Next: <strong className="text-[#2f1e14] dark:text-[#f5e9dc]">{fmt(sub.nextBillingDate)}</strong>
                </span>
              )}
              {sub.status === 'paused' && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Clock className="w-3 h-3" /> Paused — no charges until resumed
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#aaa] dark:text-[#555] mt-1 font-mono">{sub.subscriptionId}</p>
          </div>
        </div>

        {/* ── Upcoming deliveries calendar ── */}
        {upcoming.length > 0 && (
          <div className="bg-[#faf8f4] dark:bg-[#17120e] rounded-xl p-3.5 mb-4 border border-[#f0ebe4] dark:border-[#2e2420]">
            <div className="flex items-center gap-2 mb-2.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-semibold text-[#2f1e14] dark:text-[#f5e9dc] uppercase tracking-wider">
                Upcoming deliveries
              </span>
            </div>
            <div className="flex gap-3">
              {upcoming.map((date, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                    i === 0 ? 'bg-amber-500 shadow-sm' : 'bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420]'
                  }`}>
                    <span className={`text-[9px] font-bold uppercase leading-none ${i === 0 ? 'text-white/80' : 'text-[#aaa]'}`}>
                      {date.toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className={`text-base font-bold leading-none mt-0.5 ${i === 0 ? 'text-white' : 'text-[#2f1e14] dark:text-[#f5e9dc]'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  {i === 0 && <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">Next</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Payment failed alert ── */}
        {sub.status === 'payment_failed' && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Payment failed</p>
              {sub.failureReason && <p className="text-xs text-red-500 mt-0.5">{sub.failureReason}</p>}
              <p className="text-xs text-[#888] dark:text-[#666] mt-0.5">Update your card below to reactivate.</p>
            </div>
          </div>
        )}

        {/* ── Action error ── */}
        {actionError && <p className="mb-3 text-xs text-red-500 dark:text-red-400">{actionError}</p>}

        {/* ── Card update success ── */}
        {cardSuccess && (
          <div className="mb-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" /> Card updated successfully.
          </div>
        )}

        {/* ── Actions ── */}
        {sub.status !== 'cancelled' && (
          <div className="flex flex-wrap gap-2">
            {sub.status === 'active' && (
              <button
                onClick={() => doAction('pause')} disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#d8d0c8] dark:border-[#3a3a3a] text-[#555] dark:text-[#aaa] rounded-lg hover:bg-[#f0ebe4] dark:hover:bg-[#2a211b] transition-colors disabled:opacity-50"
              >
                {actionLoading === 'pause' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                Pause
              </button>
            )}
            {(sub.status === 'paused' || sub.status === 'payment_failed') && (
              <button
                onClick={() => doAction('resume')} disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#2f1e14] dark:bg-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {actionLoading === 'resume' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Resume
              </button>
            )}
            {!setupSecret && (
              <button
                onClick={handleUpdateCard} disabled={setupLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#d8d0c8] dark:border-[#3a3a3a] text-[#555] dark:text-[#aaa] rounded-lg hover:bg-[#f0ebe4] dark:hover:bg-[#2a211b] transition-colors disabled:opacity-50"
              >
                {setupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                Update Card
              </button>
            )}
            <button
              onClick={() => onCancelRequest(sub)} disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 ml-auto"
            >
              {actionLoading === 'cancel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Cancel
            </button>
          </div>
        )}

        {sub.status === 'cancelled' && (
          <div className="flex items-center gap-2 text-xs text-[#aaa] dark:text-[#555]">
            <XCircle className="w-3.5 h-3.5" /> This subscription has been cancelled.
          </div>
        )}

        {/* ── Stripe card update form ── */}
        {setupSecret && (
          <div className="mt-4 border border-[#e0e0e0] dark:border-[#3a3a3a] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Enter new card details
            </p>
            <Elements stripe={stripePromise} options={{ clientSecret: setupSecret, appearance: stripeAppearance, loader: 'auto' }}>
              <UpdateCardForm
                email={email} subscriptionId={sub.subscriptionId}
                onSuccess={handleCardSuccess} onCancel={() => setSetupSecret(null)}
              />
            </Elements>
          </div>
        )}
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={handleExpand}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} billing history and orders`}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-[#f0ebe4] dark:border-[#2e2420] text-xs text-[#888] dark:text-[#666] hover:bg-[#faf8f4] dark:hover:bg-[#1a1410] transition-colors"
      >
        <span>Billing history &amp; orders</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="px-5 pb-6 pt-4 border-t border-[#f0ebe4] dark:border-[#2e2420] space-y-5">

          {/* Shipping address */}
          {sub.shippingAddress?.addressLine1 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#555] font-medium mb-2 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Delivery Address
              </p>
              <div className="text-sm text-[#555] dark:text-[#aaa] space-y-0.5">
                {sub.shippingAddress.fullName && <p className="font-medium text-[#2f1e14] dark:text-[#f5e9dc]">{sub.shippingAddress.fullName}</p>}
                {sub.shippingAddress.addressLine1 && <p>{sub.shippingAddress.addressLine1}</p>}
                {sub.shippingAddress.addressLine2 && <p>{sub.shippingAddress.addressLine2}</p>}
                <p>{[sub.shippingAddress.city, sub.shippingAddress.county, sub.shippingAddress.postcode].filter(Boolean).join(', ')}</p>
                {sub.shippingAddress.country && <p>{sub.shippingAddress.country}</p>}
              </div>
            </div>
          )}

          {/* Billing history */}
          {sub.billingHistory?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#555] font-medium mb-2">Billing History</p>
              <div className="border border-[#e8e3dc] dark:border-[#2e2420] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#faf8f4] dark:bg-[#1a1410]">
                    <tr>
                      {['Date', 'Amount', 'Status', 'Note'].map((h) => (
                        <th key={h} className={`text-left px-3 py-2 text-[#888] dark:text-[#666] font-medium ${h === 'Note' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ebe4] dark:divide-[#2e2420]">
                    {[...sub.billingHistory].reverse().map((entry, i) => (
                      <tr key={i} className="hover:bg-[#faf8f4] dark:hover:bg-[#1a1410] transition-colors">
                        <td className="px-3 py-2.5 text-[#555] dark:text-[#aaa]">{fmt(entry.date)}</td>
                        <td className="px-3 py-2.5 text-[#2f1e14] dark:text-[#f5e9dc] font-medium">£{entry.amount.toFixed(2)}</td>
                        <td className="px-3 py-2.5">
                          {entry.status === 'success'
                            ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3 h-3" />Paid</span>
                            : (
                              <div>
                                <span className="flex items-center gap-1 text-red-500"><XCircle className="w-3 h-3" />Failed</span>
                                {entry.failureReason && (
                                  <p className="sm:hidden text-[10px] text-red-400 mt-0.5 leading-snug">{entry.failureReason}</p>
                                )}
                              </div>
                            )}
                        </td>
                        <td className="px-3 py-2.5 text-[#aaa] dark:text-[#555] hidden sm:table-cell truncate max-w-[180px]">
                          {entry.failureReason || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#555] font-medium mb-2 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3" /> Orders
            </p>
            {ordersLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#aaa]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading orders…
              </div>
            ) : ordersError ? (
              <div className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                Failed to load orders.{' '}
                <button
                  onClick={() => { setOrders(null); setOrdersError(false); handleExpand(); }}
                  className="underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="border border-[#e8e3dc] dark:border-[#2e2420] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#faf8f4] dark:bg-[#1a1410]">
                    <tr>
                      {['Order', 'Date', 'Total', 'Status', 'Tracking'].map((h) => (
                        <th key={h} className={`text-left px-3 py-2 text-[#888] dark:text-[#666] font-medium ${h === 'Tracking' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ebe4] dark:divide-[#2e2420]">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-[#faf8f4] dark:hover:bg-[#1a1410] transition-colors">
                        <td className="px-3 py-2.5">
                          <Link href={`/track-order?order=${order.orderNumber}`} className="font-mono text-[#2f1e14] dark:text-[#f5e9dc] hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-[#555] dark:text-[#aaa]">{fmt(order.createdAt)}</td>
                        <td className="px-3 py-2.5 text-[#2f1e14] dark:text-[#f5e9dc] font-medium">£{order.grandTotal.toFixed(2)}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-medium capitalize ${ORDER_STATUS_COLOR[order.orderStatus] ?? 'text-[#888]'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          {order.trackingNumber ? (
                            <span className="flex items-center gap-1 text-[#555] dark:text-[#aaa]">
                              <Truck className="w-3 h-3" />
                              <span className="font-mono">{order.trackingNumber}</span>
                            </span>
                          ) : <span className="text-[#ccc]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#aaa] dark:text-[#555]">No orders found.</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MySubscriptions({ prefillEmail }: { prefillEmail?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [emailInput,    setEmailInput]    = useState(prefillEmail || '');
  const [email,         setEmail]         = useState('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [fetched,       setFetched]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [filterTab,     setFilterTab]     = useState<FilterTab>('all');
  const [cancelTarget,  setCancelTarget]  = useState<Subscription | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLookup = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setFetched(false);
    setSubscriptions([]);
    try {
      const res  = await fetch(`${API}/customer/subscriptions/lookup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setEmail(trimmed);
        setSubscriptions(data.data.subscriptions || []);
        setFetched(true);
        setFilterTab('all');
      } else {
        setError(data.message || 'Could not find subscriptions for that email.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailInput, loading]);

  // Auto-lookup if prefillEmail provided
  React.useEffect(() => {
    if (prefillEmail) { handleLookup(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdated = useCallback((updated: Subscription) => {
    setSubscriptions((prev) => prev.map((s) => s.subscriptionId === updated.subscriptionId ? updated : s));
    showToast('Subscription updated.', true);
  }, []);

  const handleCancelRequest = useCallback((sub: Subscription) => {
    setCancelTarget(sub);
  }, []);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const res  = await fetch(`${API}/customer/subscriptions/${cancelTarget.subscriptionId}/cancel`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) => prev.map((s) =>
          s.subscriptionId === cancelTarget.subscriptionId ? { ...s, status: 'cancelled' } : s
        ));
        showToast('Subscription cancelled.', true);
      } else { showToast(data.message || 'Cancellation failed.', false); }
    } catch { showToast('Network error. Please try again.', false); }
    finally { setCancelLoading(false); setCancelTarget(null); }
  }, [cancelTarget, email]);

  const filtered = subscriptions.filter((s) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'cancelled') return s.status === 'cancelled';
    return s.status === filterTab;
  });

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${toast.ok ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.ok ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <CancelModal
          sub={cancelTarget}
          onConfirm={handleCancelConfirm}
          onAbort={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}

      {/* Email lookup form */}
      <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Find your subscriptions</h3>
        </div>
        <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mb-4">
          Enter the email address you used at checkout to see your active subscriptions.
        </p>
        <form onSubmit={handleLookup} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#aaa]" />
            <input
              type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com" required aria-label="Find subscriptions by email"
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#e8e3dc] dark:border-[#2e2420] bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit" disabled={loading || !emailInput.trim()}
            className="flex items-center gap-2 px-4 py-3 bg-[#2f1e14] dark:bg-amber-600 hover:bg-[#3d2a1c] dark:hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {loading ? 'Searching…' : 'Find'}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </p>
        )}
      </div>

      {/* Results */}
      {fetched && (
        <div>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <RefreshCcw className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] mb-1">No subscriptions found</p>
              <p className="text-xs text-[#aaa] dark:text-[#555] mb-6 max-w-xs mx-auto">
                No subscriptions were found for <strong>{email}</strong>.
              </p>
              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                Browse products →
              </Link>
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
                  Found <strong className="text-[#2f1e14] dark:text-[#f5e9dc]">{subscriptions.length}</strong> subscription{subscriptions.length !== 1 ? 's' : ''} for {email}
                </p>
                <button onClick={() => handleLookup()} className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                  <RefreshCcw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {TABS.map(({ key, label }) => {
                  const count = key === 'all' ? subscriptions.length : subscriptions.filter((s) =>
                    key === 'cancelled' ? s.status === 'cancelled' : s.status === key
                  ).length;
                  return (
                    <button
                      key={key} onClick={() => setFilterTab(key)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                        filterTab === key
                          ? 'bg-[#2f1e14] dark:bg-amber-700 text-white border-transparent'
                          : 'text-[#7A5C4F] dark:text-[#c8b6a6] border-[#e8e3dc] dark:border-[#2e2420] hover:border-[#2f1e14]/40'
                      }`}
                    >
                      {label}{count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Cards */}
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-[#aaa] py-8">No {filterTab} subscriptions.</p>
              ) : (
                <div className="space-y-4">
                  {filtered.map((sub) => (
                    <SubscriptionCard
                      key={sub._id}
                      sub={sub}
                      email={email}
                      isDark={isDark}
                      onUpdated={handleUpdated}
                      onCancelRequest={handleCancelRequest}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Initial state */}
      {!fetched && !loading && (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-[#f5f0ea] dark:bg-[#2a2018] flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
            Enter your email above to view your subscriptions.
          </p>
        </div>
      )}
    </div>
  );
}
