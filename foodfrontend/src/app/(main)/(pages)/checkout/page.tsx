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
import {
  Loader2, Tag, X, ChevronRight, ChevronLeft, Lock,
  RefreshCcw, Truck, ShieldCheck, CheckCircle2, Package,
} from 'lucide-react';
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

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: 'information' | 'payment' }) {
  const steps = [
    { key: 'information', label: 'Information', num: 1 },
    { key: 'payment',     label: 'Payment',     num: 2 },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mt-2 mb-8">
      <Link
        href="/cart"
        className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-amber-600 dark:hover:text-amber-400 transition-colors mr-3 flex items-center gap-1"
      >
        <ChevronLeft className="w-3 h-3" />
        Cart
      </Link>

      {steps.map((s, i) => {
        const isActive   = step === s.key;
        const isDone     = step === 'payment' && s.key === 'information';
        return (
          <React.Fragment key={s.key}>
            {i > 0 && (
              <div className={`h-px w-8 mx-2 transition-colors duration-300 ${isDone ? 'bg-amber-500' : 'bg-[#e0d8d0] dark:bg-[#3a2c23]'}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                isDone
                  ? 'bg-amber-500 text-white'
                  : isActive
                  ? 'bg-[#2f1e14] dark:bg-amber-600 text-white'
                  : 'bg-[#e8e0d8] dark:bg-[#2d221c] text-[#7A5C4F] dark:text-[#c8b6a6]'
              }`}>
                {isDone ? <CheckCircle2 className="w-3 h-3" /> : s.num}
              </div>
              <span className={`text-xs font-medium transition-colors duration-300 ${
                isActive
                  ? 'text-[#2f1e14] dark:text-[#f5e9dc]'
                  : isDone
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50'
              }`}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Field wrapper (label + input) ────────────────────────────────────────────

function Field({
  label, required, children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#7A5C4F] dark:text-[#c8b6a6] mb-1">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
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
  breakdown: { subtotal: number; discount: number; totalTax: number; totalDelivery: number; grandTotal: number };
  paymentIntentId: string;
  updateToken: string;
  step: 'information' | 'payment';
  onStepChange: (s: 'information' | 'payment') => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const { items } = useCart();
  const [paying, setPaying] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const inputClass =
    'w-full bg-white dark:bg-[#1e1510] text-[#2f1e14] dark:text-[#f5e9dc] border border-[#d8ccba] dark:border-[#3a2c23] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 dark:focus:border-amber-500 placeholder-[#b0a090] dark:placeholder-[#4a3828] transition-all duration-200';

  const selectClass = inputClass + ' appearance-none cursor-pointer';

  const validateInformation = () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!shipping.email.trim() || !emailRe.test(shipping.email.trim())) return 'A valid email address is required.';
    if (!shipping.firstName.trim()) return 'First name is required.';
    if (!shipping.lastName.trim())  return 'Last name is required.';
    if (!shipping.address.trim())   return 'Address is required.';
    if (!shipping.city.trim())      return 'City is required.';
    if (!shipping.postcode.trim())  return 'Postcode is required.';
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

  const saveShippingToSession = (details: {
    firstName: string; lastName: string; email: string; phone: string;
    addressLine1: string; addressLine2: string;
    city: string; county: string; postcode: string; country: string;
  }) => {
    try {
      sessionStorage.setItem('hdc_pending_order', JSON.stringify(details));
    } catch { /* storage unavailable */ }
  };

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
      const firstName    = nameParts[0]              || shipping.firstName;
      const lastName     = nameParts.slice(1).join(' ') || shipping.lastName;
      const email        = bd.email                  || shipping.email;
      const phone        = bd.phone                  || shipping.phone;
      const addressLine1 = addr.line1                || shipping.address;
      const city         = addr.city                 || shipping.city;
      const postcode     = addr.postal_code          || shipping.postcode;
      const country      = addr.country              || shipping.country;

      saveShippingToSession({
        firstName, lastName, email, phone,
        addressLine1, addressLine2: shipping.apartment,
        city, county: shipping.county, postcode, country,
      });
      await attachMetaToPaymentIntent({
        firstName, lastName, email, phone, address: addressLine1, city, postcode, country,
      }).catch((err: unknown) => { console.error('[checkout] metadata update failed:', err); });

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url:    `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);
    try {
      saveShippingToSession({
        firstName: shipping.firstName, lastName:  shipping.lastName,
        email:     shipping.email,     phone:     shipping.phone,
        addressLine1: shipping.address, addressLine2: shipping.apartment,
        city: shipping.city, county: shipping.county,
        postcode: shipping.postcode,   country:   shipping.country,
      });
      await attachMetaToPaymentIntent().catch(
        (err: unknown) => { console.error('[checkout] metadata update failed:', err); }
      );
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url:    `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
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
          <p className="text-[10px] uppercase tracking-[0.22em] text-center text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 mb-3 font-semibold">
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
          <div className="flex-1 h-px bg-[#e8ddd0] dark:bg-[#3a2c23]" />
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 font-semibold">or</span>
          <div className="flex-1 h-px bg-[#e8ddd0] dark:bg-[#3a2c23]" />
        </div>

        {/* ── Contact section ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-antique text-base text-[#2f1e14] dark:text-[#f5e9dc]">Contact</h2>
            <Link
              href="/login"
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline transition-opacity"
            >
              Sign in
            </Link>
          </div>
          <Field label="Email address" required>
            <input
              type="email"
              placeholder="you@example.com"
              value={shipping.email}
              onChange={(e) => onShippingChange('email', e.target.value)}
              className={inputClass}
            />
          </Field>
          <label className="flex items-center gap-2 mt-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={shipping.emailOffers}
              onChange={(e) => onShippingChange('emailOffers', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#d8ccba] dark:border-[#3a2c23] accent-amber-600"
            />
            <span className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] group-hover:text-[#2f1e14] dark:group-hover:text-[#f5e9dc] transition-colors">
              Email me with news and offers
            </span>
          </label>
        </div>

        {/* ── Shipping address ── */}
        <div className="mb-6">
          <h2 className="font-antique text-base text-[#2f1e14] dark:text-[#f5e9dc] mb-3">Shipping address</h2>
          <div className="space-y-3">
            <Field label="Country / Region" required>
              <select
                value={shipping.country}
                onChange={(e) => onShippingChange('country', e.target.value)}
                className={selectClass}
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
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" required>
                <input
                  type="text"
                  placeholder="Jane"
                  value={shipping.firstName}
                  onChange={(e) => onShippingChange('firstName', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Last name" required>
                <input
                  type="text"
                  placeholder="Smith"
                  value={shipping.lastName}
                  onChange={(e) => onShippingChange('lastName', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Address" required>
              <input
                type="text"
                placeholder="123 Highland Road"
                value={shipping.address}
                onChange={(e) => onShippingChange('address', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Apartment, suite, etc.">
              <input
                type="text"
                placeholder="Optional"
                value={shipping.apartment}
                onChange={(e) => onShippingChange('apartment', e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="City" required>
                <input
                  type="text"
                  placeholder="London"
                  value={shipping.city}
                  onChange={(e) => onShippingChange('city', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="County">
                <input
                  type="text"
                  placeholder="Optional"
                  value={shipping.county}
                  onChange={(e) => onShippingChange('county', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Postcode" required>
                <input
                  type="text"
                  placeholder="SW1A 1AA"
                  value={shipping.postcode}
                  onChange={(e) => onShippingChange('postcode', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Phone">
              <input
                type="tel"
                placeholder="+44 7700 000000 (optional)"
                value={shipping.phone}
                onChange={(e) => onShippingChange('phone', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <Link
            href="/cart"
            className="flex items-center gap-1 text-xs text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-amber-400 transition-colors shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Return to cart
          </Link>
          <button
            type="button"
            onClick={handleContinueToPayment}
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Continue to Payment
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure checkout</span>
          <span>·</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SSL encrypted</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> UK delivery</span>
        </div>

        {/* Footer links */}
        <div className="mt-6 pt-5 border-t border-[#e8ddd0] dark:border-[#3a2c23] flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {['Refund policy', 'Shipping policy', 'Privacy policy', 'Terms of service', 'Contact'].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase().replace(/ /g, '-')}`}
              className="text-[11px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════ STEP 2 — Payment ══════════ */}
      <div className={step === 'payment' ? 'block' : 'hidden'}>
        <form onSubmit={handleSubmit}>

          {/* Shipping summary card */}
          <div className="bg-amber-50/60 dark:bg-[#2d221c] border border-amber-200/60 dark:border-[#3a2c23] rounded-xl overflow-hidden divide-y divide-amber-100 dark:divide-[#3a2c23] mb-6 text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex gap-3 min-w-0">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] shrink-0">Contact</span>
                <span className="text-[#2f1e14] dark:text-[#f5e9dc] truncate text-sm">{shipping.email}</span>
              </div>
              <button
                type="button"
                onClick={() => onStepChange('information')}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline shrink-0 ml-2"
              >
                Change
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex gap-3 min-w-0">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A5C4F] dark:text-[#c8b6a6] shrink-0">Ship to</span>
                <span className="text-[#2f1e14] dark:text-[#f5e9dc] truncate text-sm">
                  {[shipping.address, shipping.city, shipping.postcode].filter(Boolean).join(', ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onStepChange('information')}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline shrink-0 ml-2"
              >
                Change
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex gap-3 items-center">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A5C4F] dark:text-[#c8b6a6]">Shipping</span>
                <span className="text-[#2f1e14] dark:text-[#f5e9dc] text-sm flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  UK Standard
                </span>
              </div>
              <span className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                £{breakdown.totalDelivery.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment section */}
          <div className="mb-6">
            <h2 className="font-antique text-base text-[#2f1e14] dark:text-[#f5e9dc] mb-3">Payment</h2>
            <div className="border border-[#d8ccba] dark:border-[#3a2c23] rounded-xl p-4 bg-white dark:bg-[#1e1510]">
              <div className="flex items-center gap-1.5 mb-3 text-[11px] text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">
                <Lock className="w-3 h-3 text-amber-500" />
                All transactions are secure and encrypted
              </div>
              <PaymentElement />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <button
              type="button"
              onClick={() => onStepChange('information')}
              className="flex items-center gap-1 text-xs text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2f1e14] dark:hover:text-amber-400 transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Return to information
            </button>
            <button
              type="submit"
              disabled={paying || !stripe || !elements}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay £{breakdown.grandTotal.toFixed(2)}
                </>
              )}
            </button>
          </div>

          {/* Footer links */}
          <div className="mt-6 pt-5 border-t border-[#e8ddd0] dark:border-[#3a2c23] flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {['Refund policy', 'Shipping policy', 'Privacy policy', 'Terms of service', 'Contact'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase().replace(/ /g, '-')}`}
                className="text-[11px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
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
  const router       = useRouter();
  const { resolvedTheme } = useTheme();
  const {
    items, hydrated,
    subtotal, discount, totalTax, totalDelivery, grandTotal,
    promoCode, promoInfo,
    setPromoCode, applyPromoCode, removePromoCode,
  } = useCart();

  const [step,          setStep]          = useState<'information' | 'payment'>('information');
  const [shipping,      setShipping]      = useState<ShippingForm>(initialShipping);
  const [clientSecret,  setClientSecret]  = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [updateToken,   setUpdateToken]   = useState<string | null>(null);
  // True when grandTotal=0 (100%-off promo). Stripe rejects sub-£0.30 charges,
  // so the checkout switches to a direct "place order" flow against /checkout-free.
  const [freeOrder,     setFreeOrder]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [promoError,    setPromoError]    = useState<string | null>(null);
  const [promoLoading,  setPromoLoading]  = useState(false);
  const [serverBreakdown, setServerBreakdown] = useState<{
    subtotal: number; discount: number; totalTax: number; totalDelivery: number; grandTotal: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  // Only redirect once the cart has finished loading from localStorage. Otherwise
  // a fresh render bounces users back to /cart before their saved cart hydrates.
  useEffect(() => {
    if (hydrated && items.length === 0) router.push('/cart');
  }, [hydrated, items, router]);

  const cartKey  = items.map((i) => `${i.productId}:${i.size}:${i.quantity}`).join('|');
  const promoKey = promoInfo?.code ?? '';

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    const createIntent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart-payments/create-payment-intent`, {
          method:  'POST',
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
        if (data.success && data.data?.free) {
          // 100%-off promo path — Stripe is bypassed entirely.
          setFreeOrder(true);
          setClientSecret(null);
          setPaymentIntentId(null);
          setUpdateToken(null);
          setServerBreakdown(data.data.breakdown);
        } else if (data.success && data.data?.clientSecret) {
          setFreeOrder(false);
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
    if (promoLoading) return; // guard against double-submit (Enter + click)
    setPromoLoading(true);
    setPromoError(null);
    const err = await applyPromoCode();
    if (err) setPromoError(err);
    setPromoLoading(false);
  };

  // Mirror the server-side charset so the user sees exactly the value that
  // will be sent. Strips whitespace/punctuation paste artefacts, caps at 24.
  const handlePromoChange = (raw: string) => {
    setPromoCode(raw.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24));
    if (promoError) setPromoError(null);
  };

  if (!hydrated || items.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f8f3ea] dark:bg-[#1a1410]">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    );
  }

  const breakdown = serverBreakdown || { subtotal, discount, totalTax, totalDelivery, grandTotal };
  const isDark    = mounted && resolvedTheme === 'dark';
  const preDiscountTotal = +(breakdown.subtotal + breakdown.totalTax + breakdown.totalDelivery).toFixed(2);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col-reverse lg:flex-row overflow-y-auto lg:overflow-hidden bg-white dark:bg-[#1a1410] transition-colors duration-300">

      {/* ══════════ LEFT PANEL — Form ══════════ */}
      <div className="w-full lg:max-w-[58%] lg:flex-1 lg:h-full lg:overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 sm:px-10 pt-10 pb-10 lg:pt-14 lg:pb-14">

          {/* Brand logo */}
          <Link href="/" className="block text-center mb-1">
            <span className="font-antique text-3xl sm:text-4xl text-[#2f1e14] dark:text-[#f5e9dc] leading-none select-none">
              Highland Yak Chew
            </span>
          </Link>

          {/* Step indicator */}
          <StepBar step={step} />

          {/* Global error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">Setting up secure checkout…</span>
            </div>
          ) : freeOrder ? (
            <FreeCheckoutForm
              shipping={shipping}
              onShippingChange={handleShippingChange}
              breakdown={breakdown}
              promoCode={promoKey}
              step={step}
              onStepChange={setStep}
              onSuccess={(orderNumber, orderPayload) => {
                try {
                  sessionStorage.setItem(`hyk_free_order_${orderNumber}`, JSON.stringify(orderPayload));
                } catch { /* storage unavailable */ }
                router.push(`/checkout/success?free=1&order=${encodeURIComponent(orderNumber)}`);
              }}
            />
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

      {/* ══════════ RIGHT PANEL — Order summary ══════════ */}
      <div className="w-full lg:w-[42%] lg:h-full lg:overflow-y-auto bg-[#f8f3ea] dark:bg-[#1e1510] border-b lg:border-b-0 lg:border-l border-amber-200/60 dark:border-[#3a2c23]">

        {/* Amber top accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        <div className="max-w-md mx-auto px-5 sm:px-10 py-8 lg:py-14">

          {/* Panel title */}
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-antique text-lg text-[#2f1e14] dark:text-[#f5e9dc]">Order Summary</h2>
          </div>

          {/* ── Product items ── */}
          <div className="space-y-4 mb-6">
            {items.map((item, index) => {
              const lineSubtotal = +(item.unitPrice * item.quantity).toFixed(2);
              return (
                <div
                  key={`${item.productId}-${item.size}-${item.isSubscription ? 'sub' : 'once'}-${index}`}
                  className="flex gap-3.5 bg-white dark:bg-[#241b16] rounded-xl border border-amber-100 dark:border-[#3a2c23] p-3 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-50 dark:bg-[#2d221c] border border-amber-100 dark:border-[#3a2c23] shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 bg-[#2f1e14] dark:bg-amber-600 text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2f1e14] dark:text-[#f5e9dc] leading-snug line-clamp-2">
                      {item.name}
                    </p>

                    {/* Chips row */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="text-[10px] font-medium text-[#7A5C4F] dark:text-[#c8b6a6] bg-amber-50 dark:bg-[#2d221c] border border-amber-100 dark:border-[#3a2c23] px-1.5 py-0.5 rounded">
                        {item.size}
                      </span>
                      {item.isSubscription && item.subscriptionInterval && (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <RefreshCcw className="w-2.5 h-2.5" />
                          {item.subscriptionInterval}
                        </span>
                      )}
                    </div>

                    {/* Price row */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">
                        £{item.unitPrice.toFixed(2)} × {item.quantity}
                      </span>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        £{lineSubtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Promo code ── */}
          <div className="mb-5">
            {promoInfo ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                    {promoInfo.code} — −£{promoInfo.discount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={removePromoCode}
                  className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => handlePromoChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!promoLoading && promoCode.trim().length >= 3) handleApplyPromo();
                      }
                    }}
                    placeholder="Discount or gift card code"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={24}
                    inputMode="text"
                    aria-label="Promo code"
                    aria-invalid={!!promoError}
                    aria-describedby={promoError ? 'promo-error' : undefined}
                    disabled={promoLoading}
                    className="flex-1 bg-white dark:bg-[#1e1510] text-[#2f1e14] dark:text-[#f5e9dc] font-mono tracking-wide border border-[#d8ccba] dark:border-[#3a2c23] rounded-xl px-3.5 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 placeholder-[#b0a090] dark:placeholder-[#4a3828] placeholder:normal-case disabled:opacity-60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || promoCode.trim().length < 3}
                    className="px-5 py-2.5 bg-[#2f1e14] dark:bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-[#4a2f1e] dark:hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {promoError && (
                  <p id="promo-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1.5 pl-1">{promoError}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Price breakdown ── */}
          <div className="space-y-0 border-t border-amber-200/60 dark:border-[#3a2c23] pt-4">
            <div className="flex justify-between items-center py-2.5 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
              <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">Subtotal</span>
              <span className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
              <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
                VAT <span className="text-[10px] opacity-70">(20%)</span>
              </span>
              <span className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.totalTax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
              <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                Delivery · UK Standard
              </span>
              <span className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.totalDelivery.toFixed(2)}</span>
            </div>

            {breakdown.discount > 0 && (
              <>
                <div className="flex justify-between items-center py-2.5 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
                  <span className="text-xs italic text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">Total before discount</span>
                  <span className="text-xs font-medium text-[#2f1e14] dark:text-[#f5e9dc]">£{preDiscountTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-dashed border-amber-100 dark:border-[#3a2c23] text-emerald-600 dark:text-emerald-400">
                  <span className="text-sm flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Discount
                  </span>
                  <span className="text-sm font-semibold">−£{breakdown.discount.toFixed(2)}</span>
                </div>
              </>
            )}

            {/* Grand total */}
            <div className="pt-4 flex items-end justify-between">
              <span className="text-base font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 leading-none">
                  £{breakdown.grandTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 mt-0.5">
                  GBP · incl. VAT &amp; delivery
                </div>
              </div>
            </div>
          </div>

          {/* Subscription notice */}
          {items.some((i) => i.isSubscription) && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                <RefreshCcw className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                  Total shown is <strong>per delivery</strong>. Recurring charges apply on schedule. Cancel anytime.
                </span>
              </p>
            </div>
          )}

          {/* Trust row */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-bit SSL · Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Free-checkout form (no Stripe — used when grandTotal=0) ─────────────────
//
// Mirrors CheckoutForm's two-step UX (information → payment) but the "Payment"
// step contains no card field. The user confirms and we POST directly to
// /cart-payments/checkout-free; the server re-validates that the order really
// is free before creating it.

function FreeCheckoutForm({
  shipping,
  onShippingChange,
  breakdown,
  promoCode,
  step,
  onStepChange,
  onSuccess,
}: {
  shipping: ShippingForm;
  onShippingChange: (field: keyof ShippingForm, value: string | boolean) => void;
  breakdown: { subtotal: number; discount: number; totalTax: number; totalDelivery: number; grandTotal: number };
  promoCode: string;
  step: 'information' | 'payment';
  onStepChange: (s: 'information' | 'payment') => void;
  onSuccess: (orderNumber: string, orderPayload: unknown) => void;
}) {
  const { items, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const inputClass =
    'w-full bg-white dark:bg-[#1e1510] text-[#2f1e14] dark:text-[#f5e9dc] border border-[#d8ccba] dark:border-[#3a2c23] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 dark:focus:border-amber-500 placeholder-[#b0a090] dark:placeholder-[#4a3828] transition-all duration-200';

  const validateInformation = () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!shipping.email.trim() || !emailRe.test(shipping.email.trim())) return 'A valid email address is required.';
    if (!shipping.firstName.trim()) return 'First name is required.';
    if (!shipping.lastName.trim())  return 'Last name is required.';
    if (!shipping.address.trim())   return 'Address is required.';
    if (!shipping.city.trim())      return 'City is required.';
    if (!shipping.postcode.trim())  return 'Postcode is required.';
    const ukPostcodeRe = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
    if (shipping.country === 'United Kingdom' && !ukPostcodeRe.test(shipping.postcode.trim())) {
      return 'Please enter a valid UK postcode (e.g. SW1A 1AA).';
    }
    return null;
  };

  const handleContinue = () => {
    const err = validateInformation();
    if (err) { setError(err); return; }
    setError(null);
    onStepChange('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart-payments/checkout-free`, {
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
          promoCode,
          customer: {
            firstName: shipping.firstName,
            lastName:  shipping.lastName,
            email:     shipping.email,
            phone:     shipping.phone,
          },
          shipping: {
            address:   shipping.address,
            apartment: shipping.apartment,
            city:      shipping.city,
            county:    shipping.county,
            postcode:  shipping.postcode,
            country:   shipping.country,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order');
      }
      const order = data.data?.order;
      if (!order?.orderNumber) throw new Error('Order created but no order number returned');
      clearCart();
      onSuccess(order.orderNumber, order);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      {/* STEP 1 — Information */}
      <div className={step === 'information' ? 'block' : 'hidden'}>
        <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Your promo code makes this order free. No payment required.
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="font-antique text-base text-[#2f1e14] dark:text-[#f5e9dc] mb-3">Contact</h2>
          <Field label="Email address" required>
            <input type="email" placeholder="you@example.com" value={shipping.email}
              onChange={(e) => onShippingChange('email', e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="mb-6">
          <h2 className="font-antique text-base text-[#2f1e14] dark:text-[#f5e9dc] mb-3">Shipping address</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" required>
                <input type="text" value={shipping.firstName}
                  onChange={(e) => onShippingChange('firstName', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Last name" required>
                <input type="text" value={shipping.lastName}
                  onChange={(e) => onShippingChange('lastName', e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Address" required>
              <input type="text" value={shipping.address}
                onChange={(e) => onShippingChange('address', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Apartment, suite, etc.">
              <input type="text" value={shipping.apartment}
                onChange={(e) => onShippingChange('apartment', e.target.value)} className={inputClass} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" required>
                <input type="text" value={shipping.city}
                  onChange={(e) => onShippingChange('city', e.target.value)} className={inputClass} />
              </Field>
              <Field label="County">
                <input type="text" value={shipping.county}
                  onChange={(e) => onShippingChange('county', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Postcode" required>
                <input type="text" value={shipping.postcode}
                  onChange={(e) => onShippingChange('postcode', e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Phone">
              <input type="tel" value={shipping.phone}
                onChange={(e) => onShippingChange('phone', e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow hover:from-amber-600 hover:to-orange-600 transition-all"
        >
          Continue to confirmation <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* STEP 2 — Place free order */}
      <div className={step === 'payment' ? 'block' : 'hidden'}>
        <button
          type="button"
          onClick={() => onStepChange('information')}
          className="inline-flex items-center gap-1 text-sm text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-amber-600 dark:hover:text-amber-400 mb-5"
        >
          <ChevronLeft className="w-4 h-4" /> Back to information
        </button>

        <div className="mb-5 px-4 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
            <Tag className="w-4 h-4" /> 100% off — total £0.00
          </div>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70">
            Your promo covers the full order. Click below to confirm — we&apos;ll send your confirmation to {shipping.email}.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 transition-all"
        >
          {placing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</>
            : <><Lock className="w-4 h-4" /> Place order — £0.00</>}
        </button>

        <p className="mt-3 text-[11px] text-center text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">
          Breakdown: subtotal £{breakdown.subtotal.toFixed(2)} · VAT £{breakdown.totalTax.toFixed(2)} · delivery £{breakdown.totalDelivery.toFixed(2)} · discount −£{breakdown.discount.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
