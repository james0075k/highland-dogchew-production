'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Package, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface OrderData {
  orderNumber: string;
  items: {
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalDelivery: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    fullName: string;
    email: string;
    city: string;
    postcode: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const { clearCart } = useCart();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!paymentIntent) {
      setError('No payment reference found');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/payment-intent/${paymentIntent}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          setError('Order not found. It may take a moment to process.');
        }
      } catch {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchOrder, 1500);
    return () => clearTimeout(timer);
  }, [paymentIntent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 dark:text-amber-400 mx-auto mb-4" />
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">Payment Received</h1>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6] mb-6">
            Your payment was successful but we&apos;re still processing your order. You&apos;ll receive a confirmation email shortly.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] py-12 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">Order Confirmed!</h1>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">
            Thank you for your order. We&apos;ll send you an email confirmation shortly.
          </p>
        </div>

        {order && (
          <div className="bg-white dark:bg-[#241b16] rounded-xl shadow-sm dark:shadow-[0_10px_25px_rgba(0,0,0,0.4)] border border-amber-100 dark:border-[#3a2c23] overflow-hidden transition-colors">
            {/* Order number */}
            <div className="bg-[#2f1e14] dark:bg-[#2a1f18] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                <span className="font-bold">Order {order.orderNumber}</span>
              </div>
              <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full capitalize">
                {order.paymentStatus}
              </span>
            </div>

            {/* Items */}
            <div className="p-6">
              <h3 className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-3">Items</h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-[#2f1e14] dark:text-[#f5e9dc]">{item.name}</p>
                      <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">{item.size} x {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                      £{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-amber-200 dark:border-[#3a2c23] mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Subtotal</span>
                  <span className="text-[#2f1e14] dark:text-[#f5e9dc]">£{order.subtotal.toFixed(2)}</span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-£{order.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Tax</span>
                  <span className="text-[#2f1e14] dark:text-[#f5e9dc]">£{order.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Delivery</span>
                  <span className="text-[#2f1e14] dark:text-[#f5e9dc]">£{order.totalDelivery.toFixed(2)}</span>
                </div>
                <div className="border-t border-amber-200 dark:border-[#3a2c23] pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      £{order.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="border-t border-amber-200 dark:border-[#3a2c23] mt-4 pt-4">
                <h3 className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">Shipping To</h3>
                <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postcode}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
