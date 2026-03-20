'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  RefreshCcw, Pause, Play, X, Calendar, ChevronRight,
  Package, Mail, Search, Loader2, AlertTriangle, CheckCircle,
  Clock, XCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillingEntry {
  date: string;
  amount: number;
  status: 'success' | 'failed';
  failureReason?: string;
}

interface BackendSubscription {
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
  billingHistory?: BillingEntry[];
}

type FilterTab = 'all' | 'active' | 'paused' | 'cancelled';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL;

function getUpcomingDates(nextBillingDate: string, intervalWeeks: number, count = 3): Date[] {
  const dates: Date[] = [];
  let d = new Date(nextBillingDate);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + intervalWeeks * 7);
  }
  return dates;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_STYLE: Record<string, string> = {
  active:         'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  paused:         'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  payment_failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  cancelled:      'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-700',
};

const STATUS_LABEL: Record<string, string> = {
  active:         'Active',
  paused:         'Paused',
  payment_failed: 'Payment Failed',
  cancelled:      'Cancelled',
};

const BAR_COLOR: Record<string, string> = {
  active:         'bg-amber-500',
  paused:         'bg-amber-300',
  payment_failed: 'bg-red-400',
  cancelled:      'bg-slate-200 dark:bg-slate-700',
};

// ─── Cancel Confirmation Modal ────────────────────────────────────────────────

function CancelModal({
  sub,
  email,
  onConfirm,
  onAbort,
  loading,
}: {
  sub: BackendSubscription;
  email: string;
  onConfirm: () => void;
  onAbort: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onAbort} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e1812] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Red top bar */}
        <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-600" />

        <div className="p-6">
          {/* Warning icon */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
                Cancel subscription?
              </h3>
              <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Subscription summary */}
          <div className="bg-[#faf8f4] dark:bg-[#17120e] rounded-xl p-4 mb-5 border border-[#f0ebe4] dark:border-[#2e2420]">
            <div className="flex items-center gap-3">
              {sub.productImage ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-[#2e2420]">
                  <Image src={sub.productImage} alt={sub.productName} width={40} height={40} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-amber-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm">{sub.productName}</p>
                <p className="text-xs text-[#aaa] dark:text-[#666]">{sub.size} · {sub.intervalLabel} · £{sub.unitPrice.toFixed(2)}/delivery</p>
              </div>
            </div>
          </div>

          {/* What you'll lose */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-wider">
              By cancelling you will lose:
            </p>
            {[
              'Your subscription discount on every delivery',
              'Your scheduled delivery on ' + fmt(sub.nextBillingDate),
              'Priority subscription pricing',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">{item}</span>
              </div>
            ))}
          </div>

          {/* Pause suggestion */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 mb-6">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Not ready to cancel?</strong> You can pause your subscription instead to skip deliveries temporarily without losing your benefits.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onAbort}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-[#e8e3dc] dark:border-[#2e2420] text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] hover:bg-[#f5f0eb] dark:hover:bg-[#2e2420] transition-colors disabled:opacity-50"
            >
              Keep subscription
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
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
  sub,
  email,
  onStatusChange,
  onCancelRequest,
}: {
  sub: BackendSubscription;
  email: string;
  onStatusChange: (subscriptionId: string, action: 'pause' | 'resume') => void;
  onCancelRequest: (sub: BackendSubscription) => void;
}) {
  const upcoming = sub.status !== 'cancelled' && sub.status !== 'payment_failed'
    ? getUpcomingDates(sub.nextBillingDate, sub.intervalWeeks, 3)
    : [];

  return (
    <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm">
      <div className={`h-[3px] ${BAR_COLOR[sub.status] || 'bg-amber-500'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {sub.productImage ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F0EAE1] dark:bg-[#2d221c] flex-shrink-0 border border-gray-100 dark:border-[#2e2420]">
                <Image src={sub.productImage} alt={sub.productName} width={48} height={48} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-[#2d221c] flex-shrink-0 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div className="min-w-0">
              {sub.productSlug ? (
                <Link
                  href={`/products/${sub.productSlug}`}
                  className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-1"
                >
                  {sub.productName}
                </Link>
              ) : (
                <p className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm line-clamp-1">{sub.productName}</p>
              )}
              <p className="text-xs text-[#aaa] dark:text-[#666] mt-0.5">
                {sub.size} · Qty {sub.quantity}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                <RefreshCcw className="w-2.5 h-2.5" />
                {sub.intervalLabel}
              </p>
            </div>
          </div>

          <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[sub.status]}`}>
            {STATUS_LABEL[sub.status]}
          </span>
        </div>

        {/* Payment failed warning */}
        {sub.status === 'payment_failed' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-xs text-red-700 dark:text-red-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Payment failed · {sub.failureReason || 'Please contact support'}
            </p>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="font-mono text-[#aaa] dark:text-[#555] truncate max-w-[130px]">{sub.subscriptionId}</span>
          <span className="font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
            £{(sub.unitPrice * sub.quantity).toFixed(2)}<span className="font-normal text-[#aaa]">/delivery</span>
          </span>
        </div>

        {/* Upcoming deliveries */}
        {upcoming.length > 0 && (
          <div className="bg-[#faf8f4] dark:bg-[#17120e] rounded-xl p-3.5 mb-4 border border-[#f0ebe4] dark:border-[#2e2420]">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-semibold text-[#2f1e14] dark:text-[#f5e9dc] uppercase tracking-wider">
                Upcoming deliveries
              </span>
            </div>
            <div className="flex gap-3">
              {upcoming.map((date, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                      i === 0
                        ? 'bg-amber-500 shadow-sm'
                        : 'bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420]'
                    }`}
                  >
                    <span className={`text-[9px] font-bold uppercase leading-none ${i === 0 ? 'text-white/80' : 'text-[#aaa]'}`}>
                      {date.toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className={`text-base font-bold leading-none mt-0.5 ${i === 0 ? 'text-white' : 'text-[#2f1e14] dark:text-[#f5e9dc]'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  {i === 0 && (
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">
                      Next
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last billed */}
        {sub.lastBilledAt && (
          <p className="text-xs text-[#aaa] dark:text-[#555] mb-4 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Last charged: {fmt(sub.lastBilledAt)}
          </p>
        )}

        {/* Actions */}
        {sub.status === 'active' && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onStatusChange(sub.subscriptionId, 'pause')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-amber-600 dark:hover:text-amber-400 px-3 py-2 rounded-lg border border-[#e8e3dc] dark:border-[#2e2420] hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
            >
              <Pause className="w-3 h-3" /> Pause
            </button>
            <div className="ml-auto">
              <button
                onClick={() => onCancelRequest(sub)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30 hover:border-red-300 transition-colors"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        )}

        {sub.status === 'paused' && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onStatusChange(sub.subscriptionId, 'resume')}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 transition-colors"
            >
              <Play className="w-3 h-3" /> Resume
            </button>
            <div className="ml-auto">
              <button
                onClick={() => onCancelRequest(sub)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30 hover:border-red-300 transition-colors"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        )}

        {sub.status === 'cancelled' && (
          <div className="flex items-center gap-2 text-xs text-[#aaa] dark:text-[#555]">
            <XCircle className="w-3.5 h-3.5" />
            This subscription has been cancelled.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MySubscriptions({ prefillEmail }: { prefillEmail?: string }) {
  const [emailInput, setEmailInput]     = useState(prefillEmail || '');
  const [lookedUpEmail, setLookedUpEmail] = useState(prefillEmail || '');
  const [subscriptions, setSubscriptions] = useState<BackendSubscription[]>([]);
  const [loading, setLoading]           = useState(false);
  const [fetched, setFetched]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [filterTab, setFilterTab]       = useState<FilterTab>('all');
  const [cancelTarget, setCancelTarget] = useState<BackendSubscription | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLookup = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    setLoading(true);
    setError(null);
    setFetched(false);
    setSubscriptions([]);

    try {
      const res  = await fetch(`${API}/subscriptions/lookup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.data.subscriptions || []);
        setLookedUpEmail(email);
        setFetched(true);
        setFilterTab('all');
      } else {
        setError(data.message || 'Could not find subscriptions for that email.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [emailInput]);

  // Auto-lookup if prefillEmail is provided
  React.useEffect(() => {
    if (prefillEmail) {
      handleLookup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = useCallback(async (subscriptionId: string, action: 'pause' | 'resume') => {
    try {
      const res  = await fetch(`${API}/subscriptions/${subscriptionId}/${action}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: lookedUpEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.subscriptionId === subscriptionId
              ? { ...s, status: action === 'pause' ? 'paused' : 'active' }
              : s
          )
        );
        showToast(action === 'pause' ? 'Subscription paused.' : 'Subscription resumed!', true);
      } else {
        showToast(data.message || 'Action failed.', false);
      }
    } catch {
      showToast('Network error. Please try again.', false);
    }
  }, [lookedUpEmail]);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const res  = await fetch(`${API}/subscriptions/${cancelTarget.subscriptionId}/cancel`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: lookedUpEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.subscriptionId === cancelTarget.subscriptionId
              ? { ...s, status: 'cancelled' }
              : s
          )
        );
        showToast('Subscription cancelled.', true);
      } else {
        showToast(data.message || 'Cancellation failed.', false);
      }
    } catch {
      showToast('Network error. Please try again.', false);
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
    }
  }, [cancelTarget, lookedUpEmail]);

  const filtered = subscriptions.filter((s) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'cancelled') return s.status === 'cancelled';
    return s.status === filterTab;
  });

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',       label: 'All' },
    { key: 'active',    label: 'Active' },
    { key: 'paused',    label: 'Paused' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${
          toast.ok ? 'bg-emerald-600' : 'bg-red-500'
        }`}>
          {toast.ok
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          sub={cancelTarget}
          email={lookedUpEmail}
          onConfirm={handleCancelConfirm}
          onAbort={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}

      {/* Email lookup form */}
      <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
            Find your subscriptions
          </h3>
        </div>
        <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] mb-4">
          Enter the email address you used at checkout to see your active subscriptions.
        </p>
        <form onSubmit={handleLookup} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#aaa]" />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#e8e3dc] dark:border-[#2e2420] bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !emailInput.trim()}
            className="flex items-center gap-2 px-4 py-3 bg-[#2f1e14] dark:bg-amber-600 hover:bg-[#3d2a1c] dark:hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {loading ? 'Searching…' : 'Find'}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
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
              <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] mb-1">
                No subscriptions found
              </p>
              <p className="text-xs text-[#aaa] dark:text-[#555] mb-6 max-w-xs mx-auto">
                No subscriptions were found for <strong>{lookedUpEmail}</strong>. Try a different email, or subscribe on a product page to get started.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
              >
                Browse products <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
                  Found <strong className="text-[#2f1e14] dark:text-[#f5e9dc]">{subscriptions.length}</strong> subscription{subscriptions.length !== 1 ? 's' : ''} for {lookedUpEmail}
                </p>
                <button
                  onClick={() => handleLookup()}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCcw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {TABS.map(({ key, label }) => {
                  const count = key === 'all'
                    ? subscriptions.length
                    : subscriptions.filter((s) => s.status === (key === 'cancelled' ? 'cancelled' : key)).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterTab(key)}
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
                      email={lookedUpEmail}
                      onStatusChange={handleStatusChange}
                      onCancelRequest={setCancelTarget}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Initial state — not yet searched */}
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
