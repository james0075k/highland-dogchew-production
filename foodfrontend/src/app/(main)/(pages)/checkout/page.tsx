'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from 'next-themes';
import StripeProvider from '@/components/providers/StripeProvider';
import {
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Tag, X, ChevronRight, ChevronLeft, Lock, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingForm {
  email: string;
  emailOffers: boolean;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  county: string;
  postcode: string;
  phone: string;
}

const initialShipping: ShippingForm = {
  email: '',
  emailOffers: false,
  firstName: '',
  lastName: '',
  country: 'United Kingdom',
  address: '',
  apartment: '',
  city: '',
  county: '',
  postcode: '',
  phone: '',
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ step }: { step: 'information' | 'payment' }) {
  return (
    <nav className="flex items-center justify-center gap-1.5 text-xs mt-3 mb-8">
      <Link href="/cart" className="text-[#2f1e14] dark:text-[#f5e9dc] hover:underline opacity-60 hover:opacity-100 transition-opacity">
        Cart
      </Link>
      <ChevronRight className="w-3 h-3 text-[#aaa]" />
      <span
        className={
          step === 'information'
            ? 'text-[#2f1e14] dark:text-[#f5e9dc] font-medium'
            : 'text-[#aaa] dark:text-[#666]'
        }
      >
        Information
      </span>
      <ChevronRight className="w-3 h-3 text-[#aaa]" />
      <span
        className={
          step === 'payment'
            ? 'text-[#2f1e14] dark:text-[#f5e9dc] font-medium'
            : 'text-[#aaa] dark:text-[#666]'
        }
      >
        Payment
      </span>
    </nav>
  );
}

// ─── Inner form (inside StripeProvider / Elements context) ───────────────────

function CheckoutForm({
  shipping,
  onShippingChange,
  breakdown,
  paymentIntentId,
  updateToken,
  step,
  onStepChange,
}: {
  shipping: ShippingForm;
  onShippingChange: (field: keyof ShippingForm, value: string | boolean) => void;
  breakdown: {
    subtotal: number;
    discount: number;
    totalTax: number;
    totalDelivery: number;
    grandTotal: number;
  };
  paymentIntentId: string;
  updateToken: string;
  step: 'information' | 'payment';
  onStepChange: (s: 'information' | 'payment') => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { items } = useCart();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    'w-full bg-white dark:bg-[#2a2a2a] text-[#2f1e14] dark:text-[#f5e9dc] border border-[#d0d0d0] dark:border-[#444] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f1e14]/30 dark:focus:ring-[#f5e9dc]/30 focus:border-[#2f1e14] dark:focus:border-[#f5e9dc] placeholder-[#bbb] dark:placeholder-[#555] transition-colors';

  const validateInformation = () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!shipping.email.trim() || !emailRe.test(shipping.email.trim())) return 'A valid email address is required.';
    if (!shipping.firstName.trim()) return 'First name is required.';
    if (!shipping.lastName.trim()) return 'Last name is required.';
    if (!shipping.address.trim()) return 'Address is required.';
    if (!shipping.city.trim()) return 'City is required.';
    if (!shipping.postcode.trim()) return 'Postcode is required.';
    const ukPostcodeRe = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
    if (shipping.country === 'United Kingdom' && !ukPostcodeRe.test(shipping.postcode.trim())) {
      return 'Please enter a valid UK postcode (e.g. SW1A 1AA).';
    }
    if (shipping.phone.trim()) {
      const phoneRe = /^[\+\d\s\(\)\-]{7,20}$/;
      if (!phoneRe.test(shipping.phone.trim())) return 'Please enter a valid phone number.';
    }
    return null;
  };

  const handleContinueToPayment = () => {
    const err = validateInformation();
    if (err) { setError(err); return; }
    setError(null);
    onStepChange('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Attach customer + shipping to the PaymentIntent metadata so the
  // webhook can create the order after payment — no frontend order creation.
  // H-1 fix: updateToken is required to prove this client created the PI.
  const attachMetaToPaymentIntent = async (overrideDetails?: Partial<{
    firstName: string; lastName: string; email: string; phone: string;
    address: string; city: string; postcode: string; country: string;
  }>) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart-payments/update-meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        updateToken,
        customer: {
          firstName: overrideDetails?.firstName ?? shipping.firstName,
          lastName:  overrideDetails?.lastName  ?? shipping.lastName,
          email:     overrideDetails?.email     ?? shipping.email,
          phone:     overrideDetails?.phone     ?? shipping.phone,
        },
        shipping: {
          address:   overrideDetails?.address   ?? shipping.address,
          apartment: shipping.apartment,
          city:      overrideDetails?.city      ?? shipping.city,
          county:    shipping.county,
          postcode:  overrideDetails?.postcode  ?? shipping.postcode,
          country:   overrideDetails?.country   ?? shipping.country,
        },
      }),
    });
    return res.json();
  };

  // ── Persist customer details to sessionStorage so the success page can
  //    recover them even if the Stripe metadata update races or fails.
  const saveShippingToSession = (details: {
    firstName: string; lastName: string; email: string; phone: string;
    addressLine1: string; addressLine2: string;
    city: string; county: string; postcode: string; country: string;
  }) => {
    try {
      sessionStorage.setItem('hdc_pending_order', JSON.stringify(details));
    } catch { /* storage unavailable — not critical */ }
  };

  // Express checkout (Apple Pay / Google Pay) confirm handler
  const handleExpressConfirm = async (event: {
    billingDetails?: {
      name?: string; email?: string; phone?: string;
      address?: { line1?: string; city?: string; postal_code?: string; country?: string };
    };
  }) => {
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);
    try {
      const bd   = event.billingDetails || {};
      const addr = bd.address || {};
      const nameParts = (bd.name || '').trim().split(' ');

      const firstName  = nameParts[0]              || shipping.firstName;
      const lastName   = nameParts.slice(1).join(' ') || shipping.lastName;
      const email      = bd.email                  || shipping.email;
      const phone      = bd.phone                  || shipping.phone;
      const addressLine1 = addr.line1              || shipping.address;
      const city       = addr.city                 || shipping.city;
      const postcode   = addr.postal_code          || shipping.postcode;
      const country    = addr.country              || shipping.country;

      // ── Save to sessionStorage FIRST — before anything async ─────────────
      saveShippingToSession({
        firstName, lastName, email, phone,
        addressLine1, addressLine2: shipping.apartment,
        city, county: shipping.county, postcode, country,
      });

      // ── Attempt to attach to PI metadata (best-effort) ────────────────────
      await attachMetaToPaymentIntent({
        firstName, lastName, email, phone, address: addressLine1, city, postcode, country,
      }).catch((err: unknown) => { console.error('[checkout] metadata update failed:', err); });

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
          receipt_email: email,
        },
      });
      if (stripeError) setError(stripeError.message || 'Payment failed. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  // Card payment submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);
    try {
      // ── Save to sessionStorage FIRST — guaranteed before the redirect ─────
      saveShippingToSession({
        firstName: shipping.firstName,
        lastName:  shipping.lastName,
        email:     shipping.email,
        phone:     shipping.phone,
        addressLine1: shipping.address,
        addressLine2: shipping.apartment,
        city:     shipping.city,
        county:   shipping.county,
        postcode: shipping.postcode,
        country:  shipping.country,
      });

      // ── Attempt to attach to PI metadata (best-effort) ────────────────────
      await attachMetaToPaymentIntent().catch(
        (err: unknown) => { console.error('[checkout] metadata update failed:', err); }
      );

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
          receipt_email: shipping.email,
        },
      });
      if (stripeError) setError(stripeError.message || 'Payment failed. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      {/* ══════════ STEP 1 — Information ══════════ */}
      <div className={step === 'information' ? 'block' : 'hidden'}>

        {/* Express checkout */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-center text-[#aaa] dark:text-[#666] mb-3">
            Express checkout
          </p>
          <ExpressCheckoutElement
            onConfirm={handleExpressConfirm}
            options={{
              buttonType: { applePay: 'buy', googlePay: 'buy' },
              layout: { maxColumns: 3, maxRows: 1, overflow: 'auto' },
            }}
          />
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#e0e0e0] dark:bg-[#3a3a3a]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#aaa] dark:text-[#666]">or</span>
          <div className="flex-1 h-px bg-[#e0e0e0] dark:bg-[#3a3a3a]" />
        </div>

        {/* Contact */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-[#2f1e14] dark:text-[#f5e9dc]">Contact</h2>
            <Link
              href="/login"
              className="text-xs text-[#2f1e14] dark:text-[#f5e9dc] underline opacity-60 hover:opacity-100 transition-opacity"
            >
              Sign in
            </Link>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={shipping.email}
            onChange={(e) => onShippingChange('email', e.target.value)}
            className={inputClass}
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shipping.emailOffers}
              onChange={(e) => onShippingChange('emailOffers', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#d0d0d0] dark:border-[#444] accent-[#2f1e14] dark:accent-amber-500"
            />
            <span className="text-xs text-[#555] dark:text-[#aaa]">Email me with news and offers</span>
          </label>
        </div>

        {/* Shipping address */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-[#2f1e14] dark:text-[#f5e9dc] mb-3">Shipping address</h2>
          <div className="space-y-2.5">
            <select
              value={shipping.country}
              onChange={(e) => onShippingChange('country', e.target.value)}
              className={inputClass}
            >
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Ireland">Ireland</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Sweden">Sweden</option>
              <option value="Norway">Norway</option>
              <option value="Denmark">Denmark</option>
              <option value="Belgium">Belgium</option>
            </select>

            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="First name"
                value={shipping.firstName}
                onChange={(e) => onShippingChange('firstName', e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Last name"
                value={shipping.lastName}
                onChange={(e) => onShippingChange('lastName', e.target.value)}
                className={inputClass}
              />
            </div>

            <input
              type="text"
              placeholder="Address"
              value={shipping.address}
              onChange={(e) => onShippingChange('address', e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              value={shipping.apartment}
              onChange={(e) => onShippingChange('apartment', e.target.value)}
              className={inputClass}
            />

            <div className="grid grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="City"
                value={shipping.city}
                onChange={(e) => onShippingChange('city', e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="County (optional)"
                value={shipping.county}
                onChange={(e) => onShippingChange('county', e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Postcode"
                value={shipping.postcode}
                onChange={(e) => onShippingChange('postcode', e.target.value)}
                className={inputClass}
              />
            </div>

            <input
              type="tel"
              placeholder="Phone (optional)"
              value={shipping.phone}
              onChange={(e) => onShippingChange('phone', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <Link
            href="/cart"
            className="flex items-center gap-1 text-xs text-[#555] dark:text-[#aaa] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Return to cart
          </Link>
          <button
            type="button"
            onClick={handleContinueToPayment}
            className="bg-[#2f1e14] dark:bg-amber-600 text-white font-semibold py-3 px-7 rounded text-sm hover:opacity-90 transition-opacity"
          >
            Continue to payment
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-8 pt-6 border-t border-[#e8e8e8] dark:border-[#333] flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {['Refund policy', 'Shipping policy', 'Privacy policy', 'Terms of service', 'Contact'].map((label) => (
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

      {/* ══════════ STEP 2 — Payment ══════════ */}
      <div className={step === 'payment' ? 'block' : 'hidden'}>
        <form onSubmit={handleSubmit}>

          {/* Shipping summary */}
          <div className="border border-[#e0e0e0] dark:border-[#3a3a3a] rounded divide-y divide-[#e0e0e0] dark:divide-[#3a3a3a] mb-6 text-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex gap-3">
                <span className="text-[#aaa] dark:text-[#666] min-w-[52px]">Contact</span>
                <span className="text-[#2f1e14] dark:text-[#f5e9dc] truncate">{shipping.email}</span>
              </div>
              <button
                type="button"
                onClick={() => onStepChange('information')}
                className="text-xs text-[#2f1e14] dark:text-[#f5e9dc] underline opacity-60 hover:opacity-100 transition-opacity shrink-0 ml-2"
              >
                Change
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex gap-3">
                <span className="text-[#aaa] dark:text-[#666] min-w-[52px]">Ship to</span>
                <span className="text-[#2f1e14] dark:text-[#f5e9dc] truncate">
                  {[shipping.address, shipping.city, shipping.postcode].filter(Boolean).join(', ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onStepChange('information')}
                className="text-xs text-[#2f1e14] dark:text-[#f5e9dc] underline opacity-60 hover:opacity-100 transition-opacity shrink-0 ml-2"
              >
                Change
              </button>
            </div>
          </div>

          {/* Payment section */}
          <div className="mb-6">
            <h2 className="font-semibold text-sm text-[#2f1e14] dark:text-[#f5e9dc] mb-3">Payment</h2>
            <div className="border border-[#e0e0e0] dark:border-[#3a3a3a] rounded p-4">
              <div className="flex items-center gap-1.5 mb-3 text-[11px] text-[#aaa] dark:text-[#666]">
                <Lock className="w-3 h-3" />
                All transactions are secure and encrypted
              </div>
              <PaymentElement />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => onStepChange('information')}
              className="flex items-center gap-1 text-xs text-[#555] dark:text-[#aaa] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Return to information
            </button>
            <button
              type="submit"
              disabled={paying || !stripe || !elements}
              className="bg-[#2f1e14] dark:bg-amber-600 text-white font-semibold py-3 px-7 rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay £${breakdown.grandTotal.toFixed(2)}`
              )}
            </button>
          </div>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-[#e8e8e8] dark:border-[#333] flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {['Refund policy', 'Shipping policy', 'Privacy policy', 'Terms of service', 'Contact'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase().replace(/ /g, '-')}`}
                className="text-[11px] text-[#aaa] dark:text-[#555] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main checkout page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const {
    items,
    subtotal,
    discount,
    totalTax,
    totalDelivery,
    grandTotal,
    promoCode,
    promoInfo,
    setPromoCode,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [step, setStep] = useState<'information' | 'payment'>('information');
  const [shipping, setShipping] = useState<ShippingForm>(initialShipping);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [updateToken, setUpdateToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [serverBreakdown, setServerBreakdown] = useState<{
    subtotal: number; discount: number; totalTax: number; totalDelivery: number; grandTotal: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (items.length === 0) router.push('/cart');
  }, [items, router]);

  // Use a stable key derived from cart contents + promo so the effect only
  // re-runs when something meaningful actually changes (not on every render).
  const cartKey = items.map((i) => `${i.productId}:${i.size}:${i.quantity}`).join('|');
  const promoKey = promoInfo?.code ?? '';

  useEffect(() => {
    if (items.length === 0) return;
    const createIntent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart-payments/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId:            i.productId,
              size:                 i.size,
              quantity:             i.quantity,
              unitPrice:            i.unitPrice,
              isSubscription:       i.isSubscription       || false,
              subscriptionInterval: i.subscriptionInterval || null,
            })),
            promoCode: promoKey,
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.clientSecret) {
          setClientSecret(data.data.clientSecret);
          setPaymentIntentId(data.data.paymentIntentId);
          setUpdateToken(data.data.updateToken);
          setServerBreakdown(data.data.breakdown);
        } else {
          setError(data.message || 'Failed to initialize payment');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(createIntent, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, promoKey]);

  const handleShippingChange = (field: keyof ShippingForm, value: string | boolean) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPromo = async () => {
    setPromoLoading(true);
    setPromoError(null);
    const err = await applyPromoCode();
    if (err) setPromoError(err);
    setPromoLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2f1e14] dark:text-[#f5e9dc]" />
      </div>
    );
  }

  const breakdown = serverBreakdown || { subtotal, discount, totalTax, totalDelivery, grandTotal };
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="fixed inset-0 z-[200] flex flex-col-reverse lg:flex-row overflow-y-auto lg:overflow-hidden bg-white dark:bg-[#1a1a1a] transition-colors duration-300">

      {/* ── LEFT PANEL ── */}
      <div className="w-full lg:max-w-[58%] lg:flex-1 lg:h-full lg:overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 sm:px-10 pt-10 pb-8 lg:py-14">

          {/* Rhode-style logo */}
          <Link href="/" className="block text-center mb-1">
            <span className="text-[2.6rem] sm:text-[3.2rem] font-extralight tracking-[0.18em] text-[#2f1e14] dark:text-[#f5e9dc] lowercase leading-none select-none"
              style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif', fontWeight: 200 }}
            >
              Highland Yak Chew
            </span>
          </Link>

          {/* Breadcrumb */}
          <Breadcrumb step={step} />

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#2f1e14] dark:text-[#f5e9dc]" />
              <span className="text-sm text-[#aaa] dark:text-[#666]">Setting up secure checkout…</span>
            </div>
          ) : clientSecret && paymentIntentId && updateToken ? (
            <StripeProvider key={paymentIntentId} clientSecret={clientSecret} theme={isDark ? 'night' : 'stripe'}>
              <CheckoutForm
                shipping={shipping}
                onShippingChange={handleShippingChange}
                breakdown={breakdown}
                paymentIntentId={paymentIntentId}
                updateToken={updateToken}
                step={step}
                onStepChange={setStep}
              />
            </StripeProvider>
          ) : null}
        </div>
      </div>

      {/* ── RIGHT PANEL — Order Summary ── */}
      <div className="w-full lg:w-[42%] lg:h-full lg:overflow-y-auto bg-[#f6f5f2] dark:bg-[#222] border-t lg:border-t-0 lg:border-l border-[#e8e8e3] dark:border-[#333]">
        <div className="max-w-md mx-auto px-6 sm:px-10 py-8 lg:py-14">

          {/* Cart items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.isSubscription ? 'sub' : 'once'}`} className="flex items-center gap-4">
                {/* Thumbnail with quantity badge */}
                <div className="relative w-14 h-14 rounded-md overflow-hidden bg-white dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#444] shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 bg-[#888] dark:bg-[#666] text-white text-[9px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] truncate">{item.name}</p>
                  <p className="text-xs text-[#aaa] dark:text-[#666] mt-0.5">{item.size}</p>
                  {item.isSubscription && item.subscriptionInterval && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <RefreshCcw className="w-2.5 h-2.5 flex-shrink-0" />
                      {item.subscriptionInterval}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] shrink-0">
                  £{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] mb-4" />

          {/* Promo code */}
          <div className="mb-4">
            {promoInfo ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    {promoInfo.code} — -£{promoInfo.discount.toFixed(2)}
                  </span>
                </div>
                <button onClick={removePromoCode} className="text-green-600 dark:text-green-400 hover:opacity-70 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Discount code or gift card"
                    className="flex-1 bg-white dark:bg-[#2a2a2a] text-[#2f1e14] dark:text-[#f5e9dc] border border-[#d0d0d0] dark:border-[#444] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2f1e14]/30 dark:focus:ring-[#f5e9dc]/30 focus:border-[#2f1e14] dark:focus:border-[#f5e9dc] placeholder-[#bbb] dark:placeholder-[#555] transition-colors"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-5 py-2.5 bg-[#2f1e14] dark:bg-[#f5e9dc] text-white dark:text-[#2f1e14] text-sm font-medium rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{promoError}</p>}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] mb-4" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888] dark:text-[#777]">Subtotal</span>
              <span className="text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.subtotal.toFixed(2)}</span>
            </div>
            {breakdown.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-£{breakdown.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888] dark:text-[#777]">Tax (VAT 20%)</span>
              <span className="text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888] dark:text-[#777]">Shipping</span>
              <span className="text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.totalDelivery.toFixed(2)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] mt-4 mb-4" />

          {/* Grand total */}
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-[#aaa] dark:text-[#666]">GBP</span>
              <span className="text-2xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
                £{breakdown.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-[#aaa] dark:text-[#666] text-center">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
