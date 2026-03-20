'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Search,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  ChevronLeft,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react';
import MySubscriptions from '@/components/subscription/MySubscriptions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrackItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

interface TrackResult {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber: string | null;
  courier: string;
  shippedAt: string | null;
  createdAt: string;
  items: TrackItem[];
  subtotal: number;
  totalTax: number;
  totalDelivery: number;
  grandTotal: number;
  shippingAddress: {
    fullName?: string;
    addressLine1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending:    'Order received',
  confirmed:  'Order confirmed',
  processing: 'Preparing your order',
  shipped:    'Out for delivery',
  delivered:  'Order delivered',
  cancelled:  'Order cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-teal-50 text-teal-700 border-teal-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:    <Clock className="w-5 h-5" />,
  confirmed:  <CheckCircle className="w-5 h-5" />,
  processing: <Package className="w-5 h-5" />,
  shipped:    <Truck className="w-5 h-5" />,
  delivered:  <CheckCircle className="w-5 h-5" />,
  cancelled:  <AlertCircle className="w-5 h-5" />,
};

// Timeline steps
const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
type Step = typeof STEPS[number];

function getStepIndex(status: string): number {
  return STEPS.indexOf(status as Step);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageTab = 'track' | 'subscriptions';

export default function TrackOrderPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const searchParams = useSearchParams();
  const [pageTab, setPageTab]         = useState<PageTab>('track');
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [result, setResult]           = useState<TrackResult | null>(null);

  // Support ?tab=subscriptions deep-link (e.g. from success page)
  useEffect(() => {
    if (searchParams.get('tab') === 'subscriptions') setPageTab('subscriptions');
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res  = await fetch(`${API}/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNumber.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setResult(data.data as TrackResult);
      } else {
        setError(data.message || 'Order not found. Please check your details and try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = result ? getStepIndex(result.orderStatus) : -1;

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

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-1">My Orders</h1>
          <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
            Track your deliveries and manage your subscriptions.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-[#f0ebe4] dark:bg-[#2a2018] rounded-xl mb-7">
          <button
            onClick={() => setPageTab('track')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
              pageTab === 'track'
                ? 'bg-white dark:bg-[#1e1812] text-[#2f1e14] dark:text-[#f5e9dc] shadow-sm'
                : 'text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc]'
            }`}
          >
            <Truck className="w-4 h-4" />
            Track Order
          </button>
          <button
            onClick={() => setPageTab('subscriptions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
              pageTab === 'subscriptions'
                ? 'bg-white dark:bg-[#1e1812] text-[#2f1e14] dark:text-[#f5e9dc] shadow-sm'
                : 'text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc]'
            }`}
          >
            <RefreshCcw className="w-4 h-4" />
            My Subscriptions
          </button>
        </div>

        {/* Subscriptions tab */}
        {pageTab === 'subscriptions' && (
          <MySubscriptions prefillEmail={result?.shippingAddress?.email || email || ''} />
        )}

        {/* Track Order tab */}
        {pageTab === 'track' && (<>

        {/* Search form */}
        <form
          onSubmit={handleTrack}
          className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl p-6 shadow-sm mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-wider mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. HD-ABC123-XY12"
                required
                className="w-full border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="The email you used at checkout"
                required
                className="w-full border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#17120e] text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#c8b6a6] dark:placeholder-[#5a4a40] outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderNumber.trim() || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#2f1e14] dark:bg-amber-600 hover:bg-[#3d2a1c] dark:hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Order
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-700 dark:text-red-400 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">

            {/* Status card */}
            <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm">
              <div className="h-[3px] bg-amber-500" />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#666] mb-1">
                      Order
                    </p>
                    <p className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc] font-mono">
                      {result.orderNumber}
                    </p>
                    <p className="text-xs text-[#aaa] dark:text-[#666] mt-1">
                      Placed on{' '}
                      {new Date(result.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${STATUS_COLORS[result.orderStatus] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {STATUS_ICON[result.orderStatus]}
                    {STATUS_LABELS[result.orderStatus] ?? result.orderStatus}
                  </span>
                </div>

                {/* Progress timeline */}
                {result.orderStatus !== 'cancelled' && (
                  <div className="mb-6">
                    <div className="flex items-center">
                      {STEPS.map((step, idx) => {
                        const done    = idx <= currentStep;
                        const active  = idx === currentStep;
                        const isLast  = idx === STEPS.length - 1;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors
                                ${done
                                  ? active
                                    ? 'bg-amber-500 border-amber-500'
                                    : 'bg-emerald-500 border-emerald-500'
                                  : 'bg-white dark:bg-[#17120e] border-gray-200 dark:border-[#3a2c23]'
                                }`}
                              >
                                {done && !active ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                ) : active ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-[#3a2c23]" />
                                )}
                              </div>
                              <span className={`text-[9px] font-medium uppercase tracking-wide text-center max-w-[52px] leading-tight
                                ${done ? 'text-[#2f1e14] dark:text-[#f5e9dc]' : 'text-[#aaa] dark:text-[#666]'}`}
                              >
                                {STATUS_LABELS[step]}
                              </span>
                            </div>
                            {!isLast && (
                              <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-colors
                                ${idx < currentStep ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-[#3a2c23]'}`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tracking info — only when shipped + tracking number exists */}
                {result.orderStatus === 'shipped' && result.trackingNumber ? (
                  <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400 font-semibold">
                      Shipping Information
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                      <div>
                        <span className="text-[#aaa] dark:text-[#666]">Courier: </span>
                        <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] capitalize">
                          {result.courier || 'Evri'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#aaa] dark:text-[#666]">Tracking No: </span>
                        <span className="font-mono font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                          {result.trackingNumber}
                        </span>
                      </div>
                      {result.shippedAt && (
                        <div>
                          <span className="text-[#aaa] dark:text-[#666]">Shipped: </span>
                          <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                            {new Date(result.shippedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <a
                      href={`https://www.evri.com/track/parcel/${result.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      Track Parcel on Evri
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  </div>
                ) : result.orderStatus === 'shipped' ? (
                  <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
                    Your order has been shipped. Tracking details will appear here once available.
                  </p>
                ) : null}

                {/* Shipping address */}
                {result.shippingAddress?.addressLine1 && (
                  <div className="mt-4 pt-4 border-t border-[#f0ebe4] dark:border-[#2e2420]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[#aaa] dark:text-[#666]" />
                      <span className="text-[11px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#666] font-medium">
                        Shipping to
                      </span>
                    </div>
                    <address className="not-italic text-sm text-[#2f1e14] dark:text-[#f5e9dc] leading-relaxed">
                      {result.shippingAddress.fullName && <p className="font-medium">{result.shippingAddress.fullName}</p>}
                      {result.shippingAddress.addressLine1 && <p>{result.shippingAddress.addressLine1}</p>}
                      {result.shippingAddress.city && (
                        <p>
                          {result.shippingAddress.city}
                          {result.shippingAddress.postcode ? `, ${result.shippingAddress.postcode}` : ''}
                        </p>
                      )}
                      {result.shippingAddress.country && (
                        <p className="text-[#aaa] dark:text-[#666]">{result.shippingAddress.country}</p>
                      )}
                    </address>
                  </div>
                )}
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm">
              <div className="h-[3px] bg-amber-400" />
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-3.5 h-3.5 text-[#aaa] dark:text-[#666]" />
                  <h2 className="text-[11px] uppercase tracking-[0.18em] text-[#aaa] dark:text-[#666] font-medium">
                    Items ordered
                  </h2>
                </div>
                <div className="space-y-3">
                  {result.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-[#f0ebe4] dark:border-[#2e2420] last:border-0">
                      <div>
                        <p className="font-medium text-[#2f1e14] dark:text-[#f5e9dc]">{item.name}</p>
                        <p className="text-xs text-[#aaa] dark:text-[#666]">{item.size} × {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                        £{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#e8e3dc] dark:border-[#2e2420] flex justify-between items-baseline">
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    £{result.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        </>)}

      </div>
    </div>
  );
}
