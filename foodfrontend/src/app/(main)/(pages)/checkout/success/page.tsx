'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

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
      // If the order exists but is missing customer info (race with confirm),
      // a sync call will patch it. Only do this if we have session data.
      if (customer && !order.shippingAddress.email) {
        // Fall through to sync to trigger the patch logic
      } else {
        console.log('[success] ✅ Order found via GET (webhook was faster)');
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
      console.log('[success] ✅ Order obtained via sync');
      return data.data as OrderData;
    }
  } catch { /* fall through */ }

  // ── Step 3: Final retry ───────────────────────────────────────────────────────
  await sleep(2000);
  try {
    const res  = await fetch(`${apiBase}/orders/payment-intent/${paymentIntentId}`);
    const data = await res.json();
    if (data.success && data.data) {
      console.log('[success] ✅ Order found on final retry');
      return data.data as OrderData;
    }
  } catch { /* give up */ }

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutSuccessPage() {
  const searchParams  = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const { clearCart } = useCart();

  const [order,   setOrder]   = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear cart once on mount
  useEffect(() => { clearCart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!paymentIntent) { setLoading(false); return; }
    loadOrder(paymentIntent, process.env.NEXT_PUBLIC_API_URL!).then((result) => {
      if (result) setOrder(result);
      setLoading(false);
    });
  }, [paymentIntent]);

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300 print:hidden">
        <div className="text-center px-4">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <Loader2 className="w-14 h-14 animate-spin text-amber-500/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] mb-1">
            Confirming your order…
          </p>
          <p className="text-xs text-[#aaa] dark:text-[#666]">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // ─── Fallback — payment ok but order not yet in DB ─────────────────────────

  if (!order) {
    return (
      <div className="min-h-screen bg-[#faf8f4] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300 print:hidden">
        <div className="text-center max-w-md px-6">
          <div className="w-18 h-18 mx-auto mb-6 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center" style={{ width: 72, height: 72 }}>
            <CheckCircle className="w-9 h-9 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2f1e14] dark:text-[#f5e9dc] mb-3 tracking-tight">
            Payment Received
          </h1>
          <p className="text-sm text-[#888] dark:text-[#aaa] leading-relaxed mb-8">
            Your payment was successful. A confirmation email will be sent to you shortly with your full order details.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#2f1e14] dark:bg-amber-600 text-white text-sm font-medium py-3 px-8 rounded hover:opacity-90 transition-opacity"
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
      {/* ══════ Screen layout ══════ */}
      <div className="min-h-screen bg-[#faf8f4] dark:bg-[#1a1410] transition-colors duration-300 print:hidden">
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">

          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/">
              <span
                className="text-[2rem] font-extralight tracking-[0.18em] text-[#2f1e14] dark:text-[#f5e9dc] lowercase leading-none select-none"
                style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif', fontWeight: 200 }}
              >
                highland dogchew
              </span>
            </Link>
          </div>

          {/* Confirmation header */}
          <div className="text-center mb-10">
            <div
              className="mx-auto mb-5 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center"
              style={{ width: 64, height: 64 }}
            >
              <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#aaa] dark:text-[#666] mb-2">
              Order {order.orderNumber}
            </p>
            <h1
              className="text-2xl md:text-3xl font-light text-[#2f1e14] dark:text-[#f5e9dc] tracking-tight mb-3"
              style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}
            >
              Thank you, {firstName}!
            </h1>
            <p className="text-sm text-[#888] dark:text-[#aaa] leading-relaxed max-w-sm mx-auto">
              Your order is confirmed. A receipt has been sent to{' '}
              <span className="text-[#2f1e14] dark:text-[#f5e9dc]">{addr.email}</span>.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl overflow-hidden shadow-sm">

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
              <div className="hidden sm:grid grid-cols-[1fr_48px_72px_72px] gap-2 text-[11px] uppercase tracking-[0.12em] text-[#aaa] dark:text-[#666] pb-2 mb-1 border-b border-[#f0ebe4] dark:border-[#2e2420]">
                <span>Product</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit</span>
                <span className="text-right">Total</span>
              </div>

              <div className="space-y-4 sm:space-y-2">
                {order.items.map((item, idx) => {
                  const total = item.lineTotal ?? item.unitPrice * item.quantity;
                  return (
                    <div
                      key={idx}
                      className="sm:grid sm:grid-cols-[1fr_48px_72px_72px] sm:gap-2 sm:items-center"
                    >
                      {/* Product name + size */}
                      <div className="mb-1 sm:mb-0">
                        <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#aaa] dark:text-[#666]">{item.size}</p>
                      </div>

                      {/* Mobile: inline labels; Desktop: grid columns */}
                      <div className="flex sm:block justify-between items-center text-sm">
                        <span className="sm:hidden text-xs text-[#aaa] dark:text-[#666]">Qty</span>
                        <span className="text-[#2f1e14] dark:text-[#f5e9dc] sm:text-right">
                          × {item.quantity}
                        </span>
                      </div>
                      <div className="flex sm:block justify-between items-center text-sm">
                        <span className="sm:hidden text-xs text-[#aaa] dark:text-[#666]">Unit price</span>
                        <span className="text-[#2f1e14] dark:text-[#f5e9dc] sm:text-right">
                          £{item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex sm:block justify-between items-center text-sm">
                        <span className="sm:hidden text-xs text-[#aaa] dark:text-[#666]">Line total</span>
                        <span className="font-medium text-[#2f1e14] dark:text-[#f5e9dc] sm:text-right">
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
              <div className="space-y-2 text-sm">
                <PriceRow label="Subtotal"   value={`£${order.subtotal.toFixed(2)}`} />
                {order.totalDiscount > 0 && (
                  <PriceRow
                    label="Discount"
                    value={`−£${order.totalDiscount.toFixed(2)}`}
                    green
                  />
                )}
                <PriceRow label="VAT (20%)"  value={`£${order.totalTax.toFixed(2)}`} />
                <PriceRow label="Shipping"   value={`£${order.totalDelivery.toFixed(2)}`} />
                <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-[#f0ebe4] dark:border-[#2e2420]">
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-[#aaa] dark:text-[#666]">GBP</span>
                    <span className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
                      £{order.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer meta ── */}
            <div className="px-6 py-4 space-y-1">
              {formattedDate && (
                <div className="flex justify-between text-xs text-[#aaa] dark:text-[#666]">
                  <span>Order date</span>
                  <span>{formattedDate}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#aaa] dark:text-[#666]">
                <span>Payment reference</span>
                <span className="font-mono">
                  {order.paymentIntentId
                    ? `…${order.paymentIntentId.slice(-16)}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#aaa] dark:text-[#666]">
                <span>Status</span>
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 border border-[#d8d0c8] dark:border-[#2e2420] rounded py-3 px-5 text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] hover:bg-[#f0ebe4] dark:hover:bg-[#2a211b] transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print receipt
            </button>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 bg-[#2f1e14] dark:bg-amber-600 text-white rounded py-3 px-5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue shopping
            </Link>
          </div>

          {/* Footer links */}
          <div className="mt-10 pt-6 border-t border-[#e8e3dc] dark:border-[#2e2420] flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {['Refund policy', 'Shipping policy', 'Privacy policy', 'Contact'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase().replace(/ /g, '-')}`}
                className="text-[11px] text-[#aaa] dark:text-[#555] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
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
            highland dogchew
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
              <td style={{ color: '#888', paddingBottom: '5px' }}>VAT (20%)</td>
              <td style={{ textAlign: 'right', paddingBottom: '5px' }}>£{order.totalTax.toFixed(2)}</td>
            </tr>
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
      <span className="text-[#aaa] dark:text-[#666]">{icon}</span>
      <h2 className="text-[11px] uppercase tracking-[0.18em] text-[#aaa] dark:text-[#666] font-medium">
        {text}
      </h2>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#aaa] dark:text-[#666] mb-0.5">{label}</p>
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
      <span className={green ? 'text-green-600 dark:text-green-400' : 'text-[#888] dark:text-[#777]'}>
        {label}
      </span>
      <span className={green ? 'text-green-600 dark:text-green-400' : 'text-[#2f1e14] dark:text-[#f5e9dc]'}>
        {value}
      </span>
    </div>
  );
}
