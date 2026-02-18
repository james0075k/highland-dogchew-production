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
      // Create order in DB before confirming payment
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

      // Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
          receipt_email: shipping.email,
        },
      });

      // If we reach here, there was an error (success redirects automatically)
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={shipping.fullName}
              onChange={(e) => onShippingChange('fullName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={shipping.email}
              onChange={(e) => onShippingChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={shipping.phone}
              onChange={(e) => onShippingChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
            <input
              type="text"
              value={shipping.addressLine1}
              onChange={(e) => onShippingChange('addressLine1', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              value={shipping.addressLine2}
              onChange={(e) => onShippingChange('addressLine2', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={shipping.city}
              onChange={(e) => onShippingChange('city', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postcode *</label>
            <input
              type="text"
              value={shipping.postcode}
              onChange={(e) => onShippingChange('postcode', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
        <PaymentElement />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={paying || !stripe || !elements}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-lg"
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

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Create payment intent when page loads or promo changes
  useEffect(() => {
    if (items.length === 0) return;

    const createIntent = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Validate
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

        // Step 2: Create payment intent
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Forms */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <span className="ml-3 text-gray-600">Setting up payment...</span>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.size} x {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      £{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                {promoInfo ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{promoInfo.code}</span>
                      <span className="text-sm text-green-600">-£{promoInfo.discount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-800"
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
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                      >
                        {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 mt-1">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">£{breakdown.subtotal.toFixed(2)}</span>
                </div>
                {breakdown.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-£{breakdown.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (VAT 20%)</span>
                  <span className="font-semibold text-gray-900">£{breakdown.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold text-gray-900">£{breakdown.totalDelivery.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-orange-600">
                      £{breakdown.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400 text-center">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
