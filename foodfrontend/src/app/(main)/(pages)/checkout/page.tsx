'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import StripeProvider from '@/components/providers/StripeProvider';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Tag, X, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// --- Shipping form state ---
interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
}

const initialShipping: ShippingForm = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
};

// Shared input class
const inputClass =
  'w-full bg-white dark:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] border border-amber-200 dark:border-[#3a2c23] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 outline-none placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/30 transition-colors';

const labelClass = 'block text-sm font-medium text-[#5b4636] dark:text-[#c8b6a6] mb-1';

// --- Inner payment form (inside Stripe Elements context) ---
function CheckoutForm({
  shipping,
  onShippingChange,
  breakdown,
  paymentIntentId,
}: {
  shipping: ShippingForm;
  onShippingChange: (field: keyof ShippingForm, value: string) => void;
  breakdown: { subtotal: number; discount: number; totalTax: number; totalDelivery: number; grandTotal: number };
  paymentIntentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, clearCart, promoInfo } = useCart();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateShipping = () => {
    if (!shipping.fullName.trim()) return 'Full name is required';
    if (!shipping.email.trim() || !shipping.email.includes('@')) return 'Valid email is required';
    if (!shipping.addressLine1.trim()) return 'Address is required';
    if (!shipping.city.trim()) return 'City is required';
    if (!shipping.postcode.trim()) return 'Postcode is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const shippingError = validateShipping();
    if (shippingError) {
      setError(shippingError);
      return;
    }

    setPaying(true);
    setError(null);

    try {
      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              product: i.productId,
              name: i.name,
              image: i.image,
              size: i.size,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxAmount: i.tax,
              deliveryCharge: i.delivery,
            })),
            shippingAddress: {
              fullName: shipping.fullName,
              email: shipping.email,
              phone: shipping.phone,
              addressLine1: shipping.addressLine1,
              addressLine2: shipping.addressLine2,
              city: shipping.city,
              postcode: shipping.postcode,
            },
            subtotal: breakdown.subtotal,
            totalTax: breakdown.totalTax,
            totalDelivery: breakdown.totalDelivery,
            totalDiscount: breakdown.discount,
            grandTotal: breakdown.grandTotal,
            paymentIntentId,
          }),
        }
      );

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError(orderData.message || 'Failed to create order');
        setPaying(false);
        return;
      }

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
          receipt_email: shipping.email,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white dark:bg-[#241b16] rounded-xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-amber-200 dark:border-[#3a2c23] p-6 transition-colors duration-300">
        <h2 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              value={shipping.fullName}
              onChange={(e) => onShippingChange('fullName', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              value={shipping.email}
              onChange={(e) => onShippingChange('email', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={shipping.phone}
              onChange={(e) => onShippingChange('phone', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address Line 1 *</label>
            <input
              type="text"
              value={shipping.addressLine1}
              onChange={(e) => onShippingChange('addressLine1', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address Line 2</label>
            <input
              type="text"
              value={shipping.addressLine2}
              onChange={(e) => onShippingChange('addressLine2', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <input
              type="text"
              value={shipping.city}
              onChange={(e) => onShippingChange('city', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Postcode *</label>
            <input
              type="text"
              value={shipping.postcode}
              onChange={(e) => onShippingChange('postcode', e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white dark:bg-[#241b16] rounded-xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-amber-200 dark:border-[#3a2c23] p-6 transition-colors duration-300">
        <h2 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-4">Payment Details</h2>
        <PaymentElement />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={paying || !stripe || !elements}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-600 dark:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-lg"
      >
        {paying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay £${breakdown.grandTotal.toFixed(2)}`
        )}
      </button>
    </form>
  );
}

// --- Main checkout page ---
export default function CheckoutPage() {
  const router = useRouter();
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

  const [shipping, setShipping] = useState<ShippingForm>(initialShipping);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [serverBreakdown, setServerBreakdown] = useState<{
    subtotal: number; discount: number; totalTax: number; totalDelivery: number; grandTotal: number;
  } | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  useEffect(() => {
    if (items.length === 0) return;

    const createIntent = async () => {
      setLoading(true);
      setError(null);

      try {
        const validateRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart-payments/validate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i.productId,
                size: i.size,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              })),
              promoCode: promoInfo?.code || '',
            }),
          }
        );

        const validateData = await validateRes.json();
        if (!validateData.success) {
          setError(validateData.message || 'Price validation failed');
          setLoading(false);
          return;
        }

        const paymentRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart-payments/create-payment-intent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i.productId,
                size: i.size,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              })),
              promoCode: promoInfo?.code || '',
            }),
          }
        );

        const paymentData = await paymentRes.json();
        if (paymentData.success && paymentData.data?.clientSecret) {
          setClientSecret(paymentData.data.clientSecret);
          setPaymentIntentId(paymentData.data.paymentIntentId);
          setServerBreakdown(paymentData.data.breakdown);
        } else {
          setError(paymentData.message || 'Failed to initialize payment');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [items, promoInfo]);

  const handleShippingChange = (field: keyof ShippingForm, value: string) => {
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
    return null;
  }

  const breakdown = serverBreakdown || { subtotal, discount, totalTax, totalDelivery, grandTotal };

  return (
    <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] pt-32 pb-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Forms */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600 dark:text-amber-400" />
                <span className="ml-3 text-[#7A5C4F] dark:text-[#c8b6a6]">Setting up payment...</span>
              </div>
            ) : clientSecret && paymentIntentId ? (
              <StripeProvider clientSecret={clientSecret}>
                <CheckoutForm
                  shipping={shipping}
                  onShippingChange={handleShippingChange}
                  breakdown={breakdown}
                  paymentIntentId={paymentIntentId}
                />
              </StripeProvider>
            ) : null}
          </div>

          {/* Right column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#241b16] rounded-xl shadow-sm dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-amber-100 dark:border-[#3a2c23] p-6 sticky top-28 transition-colors duration-300">
              <h2 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-50 dark:bg-[#2d221c] flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2f1e14] dark:text-[#f5e9dc] truncate">{item.name}</p>
                      <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">{item.size} x {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                      £{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t border-amber-200 dark:border-[#3a2c23] pt-4 mb-4">
                {promoInfo ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">{promoInfo.code}</span>
                      <span className="text-sm text-green-600 dark:text-green-400">-£{promoInfo.discount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
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
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 bg-white dark:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] border border-amber-200 dark:border-[#3a2c23] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 outline-none placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/30 transition-colors"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 bg-[#2f1e14] dark:bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-[#3D2B1C] dark:hover:bg-amber-600 disabled:opacity-50 transition-colors"
                      >
                        {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-amber-200 dark:border-[#3a2c23] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Subtotal</span>
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.subtotal.toFixed(2)}</span>
                </div>
                {breakdown.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-semibold">-£{breakdown.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Tax (VAT 20%)</span>
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Delivery</span>
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{breakdown.totalDelivery.toFixed(2)}</span>
                </div>
                <div className="border-t border-amber-200 dark:border-[#3a2c23] pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      £{breakdown.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 text-center">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
