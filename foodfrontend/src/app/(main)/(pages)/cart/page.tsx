'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
    discount,
    totalTax,
    totalDelivery,
    grandTotal,
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added any items yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity + Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 disabled:opacity-30 transition-colors rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-gray-900 min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-lg text-gray-900">
                        £{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Per-item breakdown */}
                    <div className="mt-3 text-xs text-gray-400 flex gap-4">
                      <span>Tax: £{item.tax.toFixed(2)}</span>
                      <span>Delivery: £{item.delivery.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">£{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-£{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (VAT 20%)</span>
                  <span className="font-semibold text-gray-900">£{totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold text-gray-900">£{totalDelivery.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-orange-600">
                      £{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>

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
