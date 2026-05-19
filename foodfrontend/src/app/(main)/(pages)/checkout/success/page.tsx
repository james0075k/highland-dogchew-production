'use client';

// Per-request page (reads payment_intent from URL, calls APIs) — opt out of static rendering.
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Loader2,
  Package,
  MapPin,
  User,
  CreditCard,
  Printer,
  ShoppingBag,
  Truck,
  RefreshCcw,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSubscriptionContext, type Subscription } from '@/context/SubscriptionContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

interface ShippingAddress {
  fullName: string;
  firstName?: string;
  email: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

interface OrderData {
  orderNumber: string;
  paymentIntentId: string;
  items: OrderItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalDelivery: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: ShippingAddress;
  createdAt?: string;
}

// ─── Dual-path order loader ───────────────────────────────────────────────────
//
// Implements the "webhook primary / sync fallback" strategy:
//
//   Step 1 — GET  (instant, no Stripe API call)
//            Webhook may have already created the order. If so, return it.
//
//   Step 2 — POST /sync  (fallback: creates via Stripe if not in DB yet)
//            Idempotent — safe even if webhook fires concurrently.
//            Unique index at DB level prevents any duplicate.
//
//   Step 3 — GET retry  (last resort: ~3 s after redirect)
//            In rare cases sync itself can fail (network). One final read.
//
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Read & clear the customer details saved by the checkout page ─────────────
function popSessionCustomer(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem('hdc_pending_order');
    if (!raw) return null;
    sessionStorage.removeItem('hdc_pending_order'); // consume once
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Dual-path order loader ───────────────────────────────────────────────────
//
//   Step 1 — GET  (free DB read — returns instantly if webhook already fired)
//   Step 2 — POST /sync  (creates via Stripe API + patches customer details
//                          from sessionStorage if PI metadata was empty)
//   Step 3 — GET retry  (last resort if sync itself had a network blip)
//
async function loadOrder(
  paymentIntentId: string,
  apiBase: string,
): Promise<OrderData | null> {

  // Read saved customer details ONCE — cleared from storage immediately
  const customer = popSessionCustomer();

  // ── Step 1: Quick DB read — webhook may already be done ──────────────────────
  await sleep(600);
  try {
    const res  = await fetch(`${apiBase}/orders/payment-intent/${paymentIntentId}`);
    const data = await res.json();
    if (data.success && data.data) {
      const order = data.data as OrderData;
      if (customer && !order.shippingAddress.email) {
        // Fall through to sync to trigger the patch logic
      } else {
        return order;
      }
    }
  } catch { /* network blip — fall through */ }

  // ── Step 2: Sync — create (or patch missing details) via Stripe ──────────────
  try {
    const res  = await fetch(`${apiBase}/orders/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId, customer }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      return data.data as OrderData;
    }
  } catch { /* fall through */ }

  // ── Step 3: Final retry ───────────────────────────────────────────────────────
  await sleep(2000);
  try {
    const res  = await fetch(`${apiBase}/orders/payment-intent/${paymentIntentId}`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data as OrderData;
    }
  } catch { /* give up */ }

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutSuccessPage() {
  const searchParams     = useSearchParams();
  const router           = useRouter();
  const paymentIntent    = searchParams.get('payment_intent');
  const piClientSecret   = searchParams.get('payment_intent_client_secret');
  const redirectStatus   = searchParams.get('redirect_status');
  // Free-order path: when grandTotal was £0 the checkout bypassed Stripe and
  // stashed the full order in sessionStorage under hyk_free_order_<orderNumber>.
  const freeOrderNumber  = searchParams.get('order');
  const isFreeOrder      = searchParams.get('free') === '1' && !!freeOrderNumber;
  const { clearCart } = useCart();
  const { addSubscription } = useSubscriptionContext();

  const [order,       setOrder]       = useState<OrderData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [createdSubs, setCreatedSubs] = useState<Subscription[]>([]);

  // Redirect to failed page immediately when redirect_status=failed
  useEffect(() => {
    if (redirectStatus === 'failed' && paymentIntent) {
      const params = new URLSearchParams({ payment_intent: paymentIntent });
      if (piClientSecret) params.set('payment_intent_client_secret', piClientSecret);
      router.replace(`/checkout/failed?${params.toString()}`);
    }
  }, [redirectStatus, paymentIntent, piClientSecret, router]);

  // Capture subscription cart items BEFORE clearing, then clear.
  useEffect(() => {
    if (!paymentIntent) return;
    const piKey = paymentIntent;
    if (!sessionStorage.getItem(`hyk_sub_created_${piKey}`)) {
      try {
        const raw = localStorage.getItem('highland-dogchew-cart');
        if (raw) {
          const cartItems = JSON.parse(raw);
          const subItems = cartItems.filter(
            (i: { isSubscription?: boolean; subscriptionInterval?: string }) =>
              i.isSubscription && i.subscriptionInterval
          );
          if (subItems.length > 0) {
            sessionStorage.setItem(
              `hyk_sub_pending_${piKey}`,
              JSON.stringify(subItems)
            );
          }
        }
      } catch { /* ignore */ }
    }
    clearCart();
  }, [paymentIntent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Free-order path — pull the snapshot from sessionStorage written by checkout.
    if (isFreeOrder && freeOrderNumber) {
      try {
        const raw = sessionStorage.getItem(`hyk_free_order_${freeOrderNumber}`);
        if (raw) setOrder(JSON.parse(raw) as OrderData);
      } catch { /* ignore */ }
      setLoading(false);
      return;
    }
    if (!paymentIntent) { setLoading(false); return; }
    loadOrder(paymentIntent, process.env.NEXT_PUBLIC_API_URL!).then((result) => {
      if (result) setOrder(result);
      setLoading(false);
    });
  }, [paymentIntent, isFreeOrder, freeOrderNumber]);

  // Create subscription records once order is confirmed
  useEffect(() => {
    if (!order || !paymentIntent) return;
    const createdKey = `hyk_sub_created_${paymentIntent}`;
    const pendingKey = `hyk_sub_pending_${paymentIntent}`;
    if (sessionStorage.getItem(createdKey)) return;
    try {
      const raw = sessionStorage.getItem(pendingKey);
      if (raw) {
        const pendingSubs = JSON.parse(raw);
        const newSubs: Subscription[] = pendingSubs.map((item: any) =>
          addSubscription({
            productId:     item.productId,
            productName:   item.name,
            productSlug:   item.slug,
            productImage:  item.image,
            size:          item.size,
            quantity:      item.quantity,
            unitPrice:     item.unitPrice,
            intervalLabel: item.subscriptionInterval,
            orderNumber:   order.orderNumber,
          })
        );
        setCreatedSubs(newSubs);
        sessionStorage.removeItem(pendingKey);
        sessionStorage.setItem(createdKey, '1');
      }
    } catch { /* ignore */ }
  }, [order, paymentIntent, addSubscription]);

  // ─── Redirecting to failed page ────────────────────────────────────────────

  if (redirectStatus === 'failed') {
    return (
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600 dark:text-amber-400" />
      </div>
    );
  }

  // ─── Processing state ──────────────────────────────────────────────────────

  if (redirectStatus === 'processing') {
    return (
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-md px-6">
          <div
            className="mx-auto mb-6 rounded-full flex items-center justify-center ring-8 ring-amber-100/60 dark:ring-amber-900/30 bg-amber-50 dark:bg-amber-900/20"
            style={{ width: 80, height: 80 }}
          >
            <Clock className="w-9 h-9 text-amber-500 dark:text-amber-400" />
          </div>
          <h1 className="font-antique text-3xl text-[#2f1e14] dark:text-[#f5e9dc] mb-3">
            Payment Processing
          </h1>
          <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed mb-2">
            Your payment is being processed. This can take a moment depending on your payment method.
          </p>
          <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed mb-8">
            You will receive an email confirmation once your order is confirmed. No further action is needed.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-sm font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300 print:hidden">
        <div className="text-center px-4">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <Loader2 className="w-16 h-16 animate-spin text-amber-400/30 dark:text-amber-600/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] mb-1">
            Confirming your order…
          </p>
          <p className="text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // ─── Fallback — payment ok but order not yet in DB ─────────────────────────

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300 print:hidden">
        <div className="text-center max-w-md px-6">
          <div
            className="mx-auto mb-6 rounded-full flex items-center justify-center ring-8 ring-green-100/60 dark:ring-green-900/30 bg-green-50 dark:bg-green-900/20"
            style={{ width: 80, height: 80 }}
          >
            <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="font-antique text-3xl text-[#2f1e14] dark:text-[#f5e9dc] mb-3">
            Payment Received
          </h1>
          <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed mb-8">
            Your payment was successful. A confirmation email will be sent to you shortly with your full order details.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-sm font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Derived values ────────────────────────────────────────────────────────

  const addr = order.shippingAddress;
  const firstName = addr.firstName || addr.fullName.split(' ')[0];
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  // ─── Main success page ─────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes successFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .success-fade { animation: successFadeUp 0.5s ease both; }
      `}</style>

      {/* ══════ Screen layout ══════ */}
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] transition-colors duration-300 print:hidden">
        <div className="max-w-2xl mx-auto px-4 pt-40 pb-12 md:pb-16">

          {/* Logo */}
          <div className="text-center mb-10 success-fade" style={{ animationDelay: '0ms' }}>
            <Link href="/">
              <span className="font-antique text-3xl text-[#2f1e14] dark:text-[#f5e9dc] select-none hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                Highland Yak Chew
              </span>
            </Link>
          </div>

          {/* Confirmation header */}
          <div className="text-center mb-10 success-fade" style={{ animationDelay: '80ms' }}>
            <div
              className="mx-auto mb-6 rounded-full flex items-center justify-center ring-8 ring-green-100/70 dark:ring-green-900/30 bg-green-50 dark:bg-green-900/20"
              style={{ width: 80, height: 80 }}
            >
              <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400 font-semibold mb-2">
              Order {order.orderNumber}
            </p>
            <h1 className="font-antique text-3xl md:text-4xl text-[#2f1e14] dark:text-[#f5e9dc] mb-3">
              Thank you, {firstName}!
            </h1>
            <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed max-w-sm mx-auto">
              Your order is confirmed. A receipt has been sent to{' '}
              <span className="text-[#2f1e14] dark:text-[#f5e9dc] font-medium">{addr.email}</span>.
            </p>
          </div>

          {/* Card */}
          <div
            className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm success-fade"
            style={{ animationDelay: '160ms' }}
          >
            {/* Amber accent stripe */}
            <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

            {/* ── Customer ── */}
            <div className="px-6 py-5 border-b border-[#f0ebe4] dark:border-[#2e2420]">
              <SectionLabel icon={<User className="w-3.5 h-3.5" />} text="Customer" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <Field label="Name"  value={addr.fullName} />
                <Field label="Email" value={addr.email} />
                {addr.phone && <Field label="Phone" value={addr.phone} />}
              </div>
            </div>

            {/* ── Shipping address ── */}
            <div className="px-6 py-5 border-b border-[#f0ebe4] dark:border-[#2e2420]">
              <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} text="Shipping address" />
              <address className="not-italic text-sm text-[#2f1e14] dark:text-[#f5e9dc] leading-relaxed">
                {addr.fullName}<br />
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                {addr.city}
                {addr.county ? `, ${addr.county}` : ''}<br />
                {addr.postcode}<br />
                {addr.country}
              </address>
            </div>

            {/* ── Items ── */}
            <div className="px-6 py-5 border-b border-[#f0ebe4] dark:border-[#2e2420]">
              <SectionLabel icon={<Package className="w-3.5 h-3.5" />} text="Items ordered" />

              {/* Column headers — desktop only */}
              <div className="hidden sm:grid grid-cols-[1fr_48px_72px_72px] gap-2 text-[11px] uppercase tracking-[0.12em] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 pb-2 mb-1 border-b border-dashed border-[#e8e3dc] dark:border-[#2e2420]">
                <span>Product</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit</span>
                <span className="text-right">Total</span>
              </div>

              <div className="space-y-4 sm:space-y-0 sm:divide-y sm:divide-dashed sm:divide-[#f0ebe4] dark:sm:divide-[#2e2420]">
                {order.items.map((item, idx) => {
                  const total = item.lineTotal ?? item.unitPrice * item.quantity;
                  return (
                    <div
                      key={idx}
                      className="sm:grid sm:grid-cols-[1fr_48px_72px_72px] sm:gap-2 sm:items-center sm:py-3"
                    >
                      {/* Product name + size */}
                      <div className="mb-1 sm:mb-0">
                        <p className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">{item.size}</p>
                      </div>

                      {/* Mobile: inline labels; Desktop: grid columns */}
                      <div className="flex sm:block justify-between items-center text-sm">
                        <span className="sm:hidden text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">Qty</span>
                        <span className="text-[#2f1e14] dark:text-[#f5e9dc] sm:text-right">
                          × {item.quantity}
                        </span>
                      </div>
                      <div className="flex sm:block justify-between items-center text-sm">
                        <span className="sm:hidden text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">Unit price</span>
                        <span className="text-[#2f1e14] dark:text-[#f5e9dc] sm:text-right">
                          £{item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex sm:block justify-between items-center text-sm">
                        <span className="sm:hidden text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">Line total</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 sm:text-right">
                          £{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Pricing summary ── */}
            <div className="px-6 py-5 border-b border-[#f0ebe4] dark:border-[#2e2420]">
              <SectionLabel icon={<CreditCard className="w-3.5 h-3.5" />} text="Order summary" />
              <div className="space-y-2.5 text-sm">
                <PriceRow label="Subtotal"   value={`£${order.subtotal.toFixed(2)}`} />
                {order.totalDiscount > 0 && (
                  <PriceRow
                    label="Discount"
                    value={`−£${order.totalDiscount.toFixed(2)}`}
                    green
                  />
                )}
                <PriceRow label="Shipping"   value={`£${order.totalDelivery.toFixed(2)}`} />
                <div className="flex justify-between items-baseline pt-3 mt-1 border-t-2 border-dashed border-amber-200 dark:border-amber-900/40">
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">GBP</span>
                    <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                      £{order.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer meta ── */}
            <div className="px-6 py-4 bg-amber-50/40 dark:bg-amber-900/10 space-y-1.5">
              {formattedDate && (
                <div className="flex justify-between text-xs text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">
                  <span>Order date</span>
                  <span>{formattedDate}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">
                <span>Payment reference</span>
                <span className="font-mono">
                  {order.paymentIntentId
                    ? `…${order.paymentIntentId.slice(-16)}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">
                <span>Status</span>
                <span className="capitalize text-green-600 dark:text-green-400 font-medium">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* ── Subscription confirmation (if any) ── */}
          {createdSubs.length > 0 && (
            <div
              className="mt-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 success-fade"
              style={{ animationDelay: '240ms' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <RefreshCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-antique text-lg text-emerald-800 dark:text-emerald-300">
                  Subscribe &amp; Save activated
                </h2>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-4 leading-relaxed">
                Your recurring deliveries are set up. You can manage, skip or cancel them anytime.
              </p>
              <div className="space-y-3">
                {createdSubs.map((sub) => {
                  const nextDate = new Date(sub.nextDelivery);
                  const nextFormatted = nextDate.toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  });
                  return (
                    <div
                      key={sub.id}
                      className="bg-white dark:bg-[#1e1812] rounded-xl p-3.5 border border-emerald-100 dark:border-emerald-900/40"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc] line-clamp-1">
                          {sub.productName}
                        </p>
                        <span className="text-[10px] font-mono text-[#aaa] dark:text-[#555] flex-shrink-0">
                          {sub.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
                        <span className="flex items-center gap-1">
                          <RefreshCcw className="w-3 h-3 text-emerald-500" />
                          {sub.intervalLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          Next delivery: <strong className="text-[#2f1e14] dark:text-[#f5e9dc] ml-0.5">{nextFormatted}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href={`/my-orders?tab=subscriptions${addr.email ? `&email=${encodeURIComponent(addr.email)}` : ''}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Manage subscriptions
              </Link>
            </div>
          )}

          {/* Actions */}
          <div
            className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 success-fade"
            style={{ animationDelay: '300ms' }}
          >
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 border border-[#d8ccba] dark:border-[#3a2c23] rounded-xl py-3 px-5 text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] hover:bg-amber-50 dark:hover:bg-[#2a211b] transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print receipt
            </button>
            <Link
              href={`/my-orders?tab=track&order=${encodeURIComponent(order.orderNumber)}${addr.email ? `&email=${encodeURIComponent(addr.email)}` : ''}`}
              className="flex items-center justify-center gap-2 border border-[#d8ccba] dark:border-[#3a2c23] rounded-xl py-3 px-5 text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] hover:bg-amber-50 dark:hover:bg-[#2a211b] transition-colors"
            >
              <Truck className="w-4 h-4" />
              Track your order
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 text-white rounded-xl py-3 px-5 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue shopping
            </Link>
          </div>

          {/* Sparkle delight line */}
          <div
            className="mt-6 flex items-center justify-center gap-2 success-fade"
            style={{ animationDelay: '380ms' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">
              Thank you for supporting Highland Yak Chew
            </p>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Footer links */}
          <div
            className="mt-8 pt-6 border-t border-[#e8e3dc] dark:border-[#2e2420] flex flex-wrap gap-x-4 gap-y-2 justify-center success-fade"
            style={{ animationDelay: '420ms' }}
          >
            {['Refund policy', 'Shipping policy', 'Privacy policy', 'Contact'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase().replace(/ /g, '-')}`}
                className="text-[11px] text-[#7A5C4F]/50 dark:text-[#c8b6a6]/40 hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* ══════ Print receipt — hidden on screen, visible when printing ══════ */}
      <div
        className="hidden print:block"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', padding: '40px', maxWidth: '600px', margin: '0 auto', color: '#111' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #ccc' }}>
          <p style={{ margin: '0 0 2px', fontFamily: 'system-ui, sans-serif', fontWeight: 200, letterSpacing: '0.18em', fontSize: '20px', textTransform: 'lowercase' }}>
            Highland Yak Chew
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Order Receipt
          </p>
        </div>

        {/* Order meta */}
        <table style={{ width: '100%', fontSize: '13px', marginBottom: '24px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ color: '#888', paddingBottom: '5px' }}>Order</td>
              <td style={{ textAlign: 'right', paddingBottom: '5px' }}>{order.orderNumber}</td>
            </tr>
            {formattedDate && (
              <tr>
                <td style={{ color: '#888', paddingBottom: '5px' }}>Date</td>
                <td style={{ textAlign: 'right', paddingBottom: '5px' }}>{formattedDate}</td>
              </tr>
            )}
            <tr>
              <td style={{ color: '#888', paddingBottom: '5px' }}>Status</td>
              <td style={{ textAlign: 'right', paddingBottom: '5px', textTransform: 'capitalize' }}>
                {order.paymentStatus}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bill to */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888' }}>
            Bill to
          </p>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7 }}>
            {addr.fullName}<br />
            {addr.email}{addr.phone ? ` · ${addr.phone}` : ''}<br />
            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
            {addr.city}{addr.county ? `, ${addr.county}` : ''}&nbsp;{addr.postcode}<br />
            {addr.country}
          </p>
        </div>

        {/* Items table */}
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              {['Product', 'Qty', 'Unit', 'Total'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '5px 0',
                    fontWeight: 500,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#888',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => {
              const total = item.lineTotal ?? item.unitPrice * item.quantity;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 0' }}>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{item.size}</div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 0' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '8px 0' }}>£{item.unitPrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 500 }}>
                    £{total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse', marginBottom: '36px' }}>
          <tbody>
            <tr>
              <td style={{ color: '#888', paddingBottom: '5px' }}>Subtotal</td>
              <td style={{ textAlign: 'right', paddingBottom: '5px' }}>£{order.subtotal.toFixed(2)}</td>
            </tr>
            {order.totalDiscount > 0 && (
              <tr>
                <td style={{ color: '#888', paddingBottom: '5px' }}>Discount</td>
                <td style={{ textAlign: 'right', paddingBottom: '5px', color: '#16a34a' }}>
                  −£{order.totalDiscount.toFixed(2)}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ color: '#888', paddingBottom: '5px' }}>Shipping</td>
              <td style={{ textAlign: 'right', paddingBottom: '5px' }}>£{order.totalDelivery.toFixed(2)}</td>
            </tr>
            <tr style={{ borderTop: '1px solid #ccc' }}>
              <td style={{ paddingTop: '8px', fontWeight: 600 }}>Total (GBP)</td>
              <td style={{ textAlign: 'right', paddingTop: '8px', fontWeight: 700, fontSize: '16px' }}>
                £{order.grandTotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Print footer */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <p style={{ margin: '0 0 3px' }}>Thank you for your order!</p>
          <p style={{ margin: 0 }}>highlanddogchew.co.uk</p>
        </div>
      </div>
    </>
  );
}

// ─── Small shared sub-components ─────────────────────────────────────────────

function SectionLabel({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-amber-500 dark:text-amber-400">{icon}</span>
      <h2 className="text-[11px] uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400 font-semibold">
        {text}
      </h2>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 mb-0.5">{label}</p>
      <p className="text-[#2f1e14] dark:text-[#f5e9dc] font-medium break-all">{value}</p>
    </div>
  );
}

function PriceRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={green ? 'text-green-600 dark:text-green-400' : 'text-[#7A5C4F] dark:text-[#c8b6a6]'}>
        {label}
      </span>
      <span className={green ? 'text-green-600 dark:text-green-400' : 'text-[#2f1e14] dark:text-[#f5e9dc]'}>
        {value}
      </span>
    </div>
  );
}
