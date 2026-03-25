'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { XCircle, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';

// ─── Retrieve PI failure reason via Stripe.js ─────────────────────────────────
//
// Stripe appends payment_intent_client_secret to the return_url on redirect.
// We use it to call retrievePaymentIntent and surface the exact failure reason.
//
async function getFailureReason(clientSecret: string): Promise<string | null> {
  try {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    if (!stripe) return null;
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    return paymentIntent?.last_payment_error?.message ?? null;
  } catch {
    return null;
  }
}

export default function CheckoutFailedPage() {
  const searchParams   = useSearchParams();
  const paymentIntent  = searchParams.get('payment_intent');
  const clientSecret   = searchParams.get('payment_intent_client_secret');

  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [loaded, setLoaded]               = useState(false);

  useEffect(() => {
    if (!clientSecret) { setLoaded(true); return; }
    getFailureReason(clientSecret).then((reason) => {
      setFailureReason(reason);
      setLoaded(true);
    });
  }, [clientSecret]);

  const defaultMessage =
    'Your payment could not be completed. No charge was made to your account.';

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#1a1410] transition-colors duration-300">
      <div className="max-w-lg mx-auto px-4 py-16 md:py-24">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <span
              className="text-[2rem] font-extralight tracking-[0.18em] text-[#2f1e14] dark:text-[#f5e9dc] lowercase leading-none select-none"
              style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif', fontWeight: 200 }}
            >
              Highland Yak Chew
            </span>
          </Link>
        </div>

        {/* Failure card */}
        <div className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-xl overflow-hidden shadow-sm">

          {/* Header */}
          <div className="px-8 py-8 text-center border-b border-[#f0ebe4] dark:border-[#2e2420]">
            <div
              className="mx-auto mb-5 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center"
              style={{ width: 64, height: 64 }}
            >
              <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-light text-[#2f1e14] dark:text-[#f5e9dc] tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}
            >
              Payment failed
            </h1>
            <p className="text-sm text-[#888] dark:text-[#aaa] leading-relaxed">
              {defaultMessage}
            </p>
          </div>

          {/* Failure reason (from Stripe) */}
          {loaded && failureReason && (
            <div className="px-6 py-4 border-b border-[#f0ebe4] dark:border-[#2e2420]">
              <div className="flex gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-lg p-4">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-red-500 dark:text-red-400 font-medium mb-1">
                    Reason
                  </p>
                  <p className="text-sm text-[#2f1e14] dark:text-[#f5e9dc]">
                    {failureReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What to do next */}
          <div className="px-6 py-5 border-b border-[#f0ebe4] dark:border-[#2e2420]">
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#aaa] dark:text-[#666] font-medium mb-3">
              What to do next
            </p>
            <ul className="space-y-2 text-sm text-[#555] dark:text-[#aaa]">
              <li className="flex items-start gap-2">
                <span className="text-[#aaa] dark:text-[#666] mt-0.5">·</span>
                Check that your card details or payment information are correct.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#aaa] dark:text-[#666] mt-0.5">·</span>
                Ensure your card has sufficient funds or try a different payment method.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#aaa] dark:text-[#666] mt-0.5">·</span>
                Contact your bank if the problem persists — they may be blocking the transaction.
              </li>
            </ul>
          </div>

          {/* Reference */}
          {paymentIntent && (
            <div className="px-6 py-4 border-b border-[#f0ebe4] dark:border-[#2e2420]">
              <div className="flex justify-between text-xs text-[#aaa] dark:text-[#666]">
                <span>Reference</span>
                <span className="font-mono">…{paymentIntent.slice(-16)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/cart"
              className="flex-1 flex items-center justify-center gap-2 bg-[#2f1e14] dark:bg-amber-600 text-white text-sm font-medium py-3 px-6 rounded hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </Link>
            <Link
              href="/products"
              className="flex-1 flex items-center justify-center gap-2 border border-[#d8d0c8] dark:border-[#2e2420] text-[#2f1e14] dark:text-[#f5e9dc] text-sm font-medium py-3 px-6 rounded hover:bg-[#f0ebe4] dark:hover:bg-[#2a211b] transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Continue shopping
            </Link>
          </div>
        </div>

        {/* Help */}
        <p className="text-center text-xs text-[#aaa] dark:text-[#666] mt-6">
          Need help?{' '}
          <Link href="/contact" className="underline hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors">
            Contact us
          </Link>{' '}
          and we&apos;ll sort it out.
        </p>

        {/* Footer links */}
        <div className="mt-8 pt-6 border-t border-[#e8e3dc] dark:border-[#2e2420] flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {['Refund policy', 'Privacy policy', 'Contact'].map((label) => (
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
  );
}
