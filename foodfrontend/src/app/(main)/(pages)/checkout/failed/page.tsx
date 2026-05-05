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
    <>
      <style>{`
        @keyframes failedFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .failed-fade { animation: failedFadeUp 0.45s ease both; }
      `}</style>

      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] transition-colors duration-300">
        <div className="max-w-lg mx-auto px-4 pt-40 pb-16">

          {/* Logo */}
          <div className="text-center mb-10 failed-fade" style={{ animationDelay: '0ms' }}>
            <Link href="/">
              <span className="font-antique text-3xl text-[#2f1e14] dark:text-[#f5e9dc] select-none hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
                Highland Yak Chew
              </span>
            </Link>
          </div>

          {/* Failure card */}
          <div
            className="bg-white dark:bg-[#1e1812] border border-[#e8e3dc] dark:border-[#2e2420] rounded-2xl overflow-hidden shadow-sm failed-fade"
            style={{ animationDelay: '80ms' }}
          >
            {/* Amber accent stripe */}
            <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

            {/* Header */}
            <div className="px-8 py-8 text-center border-b border-[#f0ebe4] dark:border-[#2e2420]">
              <div
                className="mx-auto mb-5 rounded-full flex items-center justify-center ring-8 ring-red-100/60 dark:ring-red-900/30 bg-red-50 dark:bg-red-900/20"
                style={{ width: 80, height: 80 }}
              >
                <XCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
              <h1 className="font-antique text-3xl text-[#2f1e14] dark:text-[#f5e9dc] mb-2">
                Payment failed
              </h1>
              <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed">
                {defaultMessage}
              </p>
            </div>

            {/* Failure reason (from Stripe) */}
            {loaded && failureReason && (
              <div className="px-6 py-4 border-b border-[#f0ebe4] dark:border-[#2e2420]">
                <div className="flex gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-red-500 dark:text-red-400 font-semibold mb-1">
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
              <p className="text-[11px] uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400 font-semibold mb-3">
                What to do next
              </p>
              <ul className="space-y-2.5 text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 flex-shrink-0" />
                  Check that your card details or payment information are correct.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 flex-shrink-0" />
                  Ensure your card has sufficient funds or try a different payment method.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 flex-shrink-0" />
                  Contact your bank if the problem persists — they may be blocking the transaction.
                </li>
              </ul>
            </div>

            {/* Reference */}
            {paymentIntent && (
              <div className="px-6 py-4 border-b border-[#f0ebe4] dark:border-[#2e2420] bg-amber-50/40 dark:bg-amber-900/10">
                <div className="flex justify-between text-xs text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">
                  <span>Reference</span>
                  <span className="font-mono">…{paymentIntent.slice(-16)}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 py-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/cart"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 text-white text-sm font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </Link>
              <Link
                href="/products"
                className="flex-1 flex items-center justify-center gap-2 border border-[#d8ccba] dark:border-[#3a2c23] text-[#2f1e14] dark:text-[#f5e9dc] text-sm font-medium py-3 px-6 rounded-xl hover:bg-amber-50 dark:hover:bg-[#2a211b] transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Continue shopping
              </Link>
            </div>
          </div>

          {/* Help */}
          <p
            className="text-center text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 mt-6 failed-fade"
            style={{ animationDelay: '200ms' }}
          >
            Need help?{' '}
            <Link href="/contact" className="underline hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors">
              Contact us
            </Link>{' '}
            and we&apos;ll sort it out.
          </p>

          {/* Footer links */}
          <div
            className="mt-8 pt-6 border-t border-[#e8e3dc] dark:border-[#2e2420] flex flex-wrap gap-x-4 gap-y-2 justify-center failed-fade"
            style={{ animationDelay: '260ms' }}
          >
            {['Refund policy', 'Privacy policy', 'Contact'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase().replace(/ /g, '-')}`}
                className="text-[11px] text-[#7A5C4F]/50 dark:text-[#c8b6a6]/40 hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
