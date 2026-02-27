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
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-amber-300 dark:text-amber-700 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-4">Your cart is empty</h1>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6] mb-8">
            Looks like you haven&apos;t added any items yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] pt-32 pb-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Shopping Cart</h1>
            <p className="text-[#7A5C4F] dark:text-[#c8b6a6] mt-1">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors"
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
                className="bg-white dark:bg-[#241b16] rounded-xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-amber-100 dark:border-[#3a2c23] p-4 sm:p-6 transition-colors duration-300"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-amber-50 dark:bg-[#2d221c] flex-shrink-0">
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
                          className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mt-1">Size: {item.size}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity + Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-amber-200 dark:border-[#3a2c23] rounded-lg bg-white dark:bg-[#2d221c]">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-amber-50 dark:hover:bg-[#3a2c23] disabled:opacity-30 transition-colors rounded-l-lg text-[#2f1e14] dark:text-[#f5e9dc]"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-[#2f1e14] dark:text-[#f5e9dc] min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="p-2 hover:bg-amber-50 dark:hover:bg-[#3a2c23] transition-colors rounded-r-lg text-[#2f1e14] dark:text-[#f5e9dc]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-lg text-[#2f1e14] dark:text-[#f5e9dc]">
                        £{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Per-item breakdown */}
                    <div className="mt-3 text-xs text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 flex gap-4">
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
              className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#241b16] rounded-xl shadow-sm dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-amber-100 dark:border-[#3a2c23] p-6 sticky top-28 transition-colors duration-300">
              <h2 className="text-xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Subtotal</span>
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-semibold">-£{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Tax (VAT 20%)</span>
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6]">Delivery</span>
                  <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">£{totalDelivery.toFixed(2)}</span>
                </div>
                <div className="border-t border-amber-200 dark:border-[#3a2c23] pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc]">Total</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      £{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-600 dark:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>

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
