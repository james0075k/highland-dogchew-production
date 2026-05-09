'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  Trash2,
  ShoppingBag,
  ChevronLeft,
  RefreshCcw,
  Truck,
  Receipt,
  Tag,
  ShieldCheck,
  Lock,
  ArrowRight,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import SizeGuideSection from '@/components/organisms/SizeGuideSection/SizeGuideSection';

/* ─── tiny CSS-only entrance animation ─── */
const fadeUp = {
  animation: 'cartFadeUp 0.4s ease both',
} as React.CSSProperties;

const makeDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
  ...fadeUp,
});

export default function CartPage() {
  const router = useRouter();
  const {
    items, hydrated,
    removeFromCart,
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

  /* mirrors backend math exactly — tax on (subtotal − discount) */
  const discountedSubtotal = +(subtotal - discount).toFixed(2);

  /* ── pre-hydration: show nothing until localStorage cart is loaded
        (prevents a flash of "your cart is empty" on hard reload) ── */
  if (!hydrated) {
    return <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410]" />;
  }

  /* ── empty state ── */
  if (items.length === 0) {
    return (
      <>
        <style>{`
          @keyframes cartFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {/* pt-40 = 160px — safely below the fixed navbar (~144px on desktop) */}
        <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center pt-40 pb-16 transition-colors duration-300">
          <div className="text-center px-4" style={fadeUp}>
            {/* decorative ring */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/30 scale-[1.4] blur-md" />
              <div className="relative w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <h1 className="font-antique text-3xl sm:text-4xl text-[#2f1e14] dark:text-[#f5e9dc] mb-3">
              Your cart is empty
            </h1>
            <p className="text-[#7A5C4F] dark:text-[#c8b6a6] mb-10 max-w-xs mx-auto leading-relaxed">
              Looks like your pup is still waiting for their Highland Yak Chew treat!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#2f1e14] hover:bg-[#4a2f1e] dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold py-3.5 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Keyframe injected once at the top */}
      <style>{`
        @keyframes cartFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] transition-colors duration-300">

        {/* ── Page header banner ── */}
        {/* pt-40 = 160px clears the fixed navbar (~144px) on all laptop views */}
        <div className="pt-40 pb-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto" style={fadeUp}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  Highland Yak Chew
                </p>
                <h1 className="font-antique text-4xl sm:text-5xl text-[#2f1e14] dark:text-[#f5e9dc] leading-none">
                  Your Order
                </h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    <PackageCheck className="w-3 h-3" />
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 text-xs">·</span>
                  <span className="text-[#7A5C4F] dark:text-[#c8b6a6] text-xs">
                    {items.length} {items.length === 1 ? 'product line' : 'product lines'}
                  </span>
                </div>
              </div>
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 hover:text-red-500 dark:hover:text-red-400 text-xs font-medium transition-colors pb-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>

            {/* thin decorative rule */}
            <div className="mt-6 h-px bg-gradient-to-r from-amber-300 via-amber-200 to-transparent dark:from-amber-800 dark:via-amber-900/40 dark:to-transparent" />
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="pb-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

              {/* ── Left: item list ── */}
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const lineSubtotal = +(item.unitPrice * item.quantity).toFixed(2);
                  const savedPerUnit = +(item.originalPrice - item.unitPrice).toFixed(2);
                  const totalSaved   = +(savedPerUnit * item.quantity).toFixed(2);

                  return (
                    <div
                      key={`${item.productId}-${item.size}-${item.isSubscription ? 'sub' : 'once'}-${item.tierMinQty || 1}`}
                      style={makeDelay(idx * 80)}
                      className="group bg-white dark:bg-[#241b16] rounded-2xl border border-amber-100/80 dark:border-[#3a2c23] shadow-sm hover:shadow-lg dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] hover:border-amber-200 dark:hover:border-[#4a3829] transition-all duration-300 overflow-hidden"
                    >
                      {/* amber accent top stripe */}
                      <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

                      <div className="flex flex-col sm:flex-row gap-0 p-5">

                        {/* Product image */}
                        <div className="relative w-full sm:w-[130px] h-[130px] rounded-xl overflow-hidden bg-amber-50 dark:bg-[#2d221c] flex-shrink-0 self-start">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={130}
                            height={130}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Quantity pill — fixed, no +/- controls */}
                          <div className="absolute bottom-2 right-2 bg-[#2f1e14]/85 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            ×{item.quantity}
                          </div>
                          {item.isSubscription && (
                            <div className="absolute top-2 left-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                                <RefreshCcw className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="flex-1 min-w-0 sm:pl-5 mt-4 sm:mt-0 flex flex-col">

                          {/* Name + remove */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/products/${item.slug}`}
                                className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-base sm:text-lg hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2 leading-snug"
                              >
                                {item.name}
                              </Link>

                              {/* Meta chips */}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="inline-flex items-center text-[11px] font-medium text-[#7A5C4F] dark:text-[#c8b6a6] bg-amber-50 dark:bg-[#2d221c] border border-amber-100 dark:border-[#3a2c23] px-2 py-0.5 rounded-md">
                                  {item.size}
                                </span>
                                {item.isSubscription && item.subscriptionInterval && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                                    <RefreshCcw className="w-2.5 h-2.5" />
                                    {item.subscriptionInterval}
                                  </span>
                                )}
                                {item.tierMinQty && item.tierMinQty > 1 && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                                    <Tag className="w-2.5 h-2.5" />
                                    {item.tierMinQty}-pack
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.productId, item.size, item.isSubscription)}
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[#7A5C4F]/50 dark:text-[#c8b6a6]/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* ── Price breakdown strip ── */}
                          <div className="mt-4 pt-3.5 border-t border-dashed border-amber-100 dark:border-[#3a2c23]">
                            {/* Row: unit × qty = subtotal */}
                            <div className="flex items-center gap-3 text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
                              {/* Unit price */}
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Unit</span>
                                <span className="font-bold text-sm text-[#2f1e14] dark:text-[#f5e9dc]">
                                  £{item.unitPrice.toFixed(2)}
                                </span>
                                {savedPerUnit > 0 && (
                                  <span className="text-[10px] line-through opacity-60">
                                    £{item.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <span className="text-[#7A5C4F]/40 dark:text-[#c8b6a6]/30 text-base font-light">×</span>

                              {/* Qty */}
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Qty</span>
                                <span className="font-bold text-sm text-[#2f1e14] dark:text-[#f5e9dc]">
                                  {item.quantity}
                                </span>
                              </div>

                              <span className="text-[#7A5C4F]/40 dark:text-[#c8b6a6]/30 text-base font-light">=</span>

                              {/* Line subtotal */}
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Subtotal</span>
                                <span className="font-bold text-sm text-[#2f1e14] dark:text-[#f5e9dc]">
                                  £{lineSubtotal.toFixed(2)}
                                </span>
                                {totalSaved > 0 && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                    −£{totalSaved.toFixed(2)} saved
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Line total label */}
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[11px] text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 italic">
                                {item.isSubscription ? 'Per delivery · excl. VAT &amp; delivery' : 'Line total · excl. VAT &amp; delivery'}
                              </span>
                              <div className="text-right">
                                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                                  £{lineSubtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Continue shopping */}
                <div style={makeDelay(items.length * 80)} className="flex items-center justify-between pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-sm text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                  <p className="text-[11px] text-[#7A5C4F]/50 dark:text-[#c8b6a6]/40 text-right max-w-[200px]">
                    To change quantity, remove &amp; re-add from product page
                  </p>
                </div>
              </div>

              {/* ── Right: Order summary ── */}
              {/* top-36 = 144px — matches navbar height so the sticky panel starts just below nav */}
              <div className="lg:sticky lg:top-36" style={makeDelay(60)}>
                <div className="bg-white dark:bg-[#241b16] rounded-2xl border border-amber-200/60 dark:border-[#3a2c23] shadow-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden">

                  {/* Summary header */}
                  <div className="bg-gradient-to-r from-[#2f1e14] to-[#4a2f1e] px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-5 h-5 text-amber-300" />
                      <h2 className="font-antique text-xl text-white tracking-wide">Order Summary</h2>
                    </div>
                    <p className="text-amber-200/70 text-xs mt-1">
                      All prices in GBP · VAT included
                    </p>
                  </div>

                  {/* Price rows */}
                  <div className="px-6 py-5 space-y-0">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center py-3 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
                      <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
                        Product subtotal
                        <span className="ml-1.5 text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold px-1.5 py-0.5 rounded-full">
                          {cartCount} {cartCount === 1 ? 'item' : 'items'}
                        </span>
                      </span>
                      <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                        £{subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <>
                        <div className="flex justify-between items-center py-3 border-b border-dashed border-amber-100 dark:border-[#3a2c23] text-emerald-600 dark:text-emerald-400">
                          <span className="text-sm flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            Promo discount
                          </span>
                          <span className="font-semibold">−£{discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
                          <span className="text-xs italic text-[#7A5C4F]/80 dark:text-[#c8b6a6]/70">
                            After discount
                          </span>
                          <span className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                            £{discountedSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    {/* VAT — computed on discountedSubtotal, matching backend */}
                    <div className="flex justify-between items-center py-3 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
                      <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
                        VAT
                        <span className="ml-1 text-[10px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">(20%)</span>
                      </span>
                      <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                        £{totalTax.toFixed(2)}
                      </span>
                    </div>

                    {/* Delivery — single flat rate for the whole order */}
                    <div className="flex justify-between items-center py-3 border-b border-dashed border-amber-100 dark:border-[#3a2c23]">
                      <span className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          Delivery
                          <span className="block text-[10px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 font-normal leading-tight">
                            UK Standard · entire order
                          </span>
                        </span>
                      </span>
                      <span className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
                        £{totalDelivery.toFixed(2)}
                      </span>
                    </div>

                    {/* Grand total */}
                    <div className="pt-4 pb-1">
                      <div className="flex justify-between items-end">
                        <span className="text-base font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
                          Total
                        </span>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 leading-none">
                            £{grandTotal.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 mt-0.5">
                            incl. VAT &amp; delivery
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription notice */}
                  {items.some((i) => i.isSubscription) && (
                    <div className="mx-6 mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                        <RefreshCcw className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                          Total shown is <strong>per delivery</strong>. Recurring charges apply on your chosen schedule. Cancel anytime.
                        </span>
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-amber-200 dark:hover:shadow-amber-900/50 hover:-translate-y-0.5 text-base group"
                    >
                      <Lock className="w-4 h-4" />
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>

                    <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>256-bit encrypted · Powered by Stripe</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Size Guide below the cart */}
      <SizeGuideSection />
    </>
  );
}
