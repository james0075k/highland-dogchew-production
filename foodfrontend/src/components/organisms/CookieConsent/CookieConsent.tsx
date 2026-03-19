'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'hdc_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // small delay so it doesn't pop instantly
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-slide-up-cookie"
    >
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#1f1812] rounded-2xl shadow-2xl border border-[#2E1F14]/10 dark:border-[#3a2c23] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F4EDE4] dark:bg-[#241b16] flex items-center justify-center">
          <Cookie className="w-5 h-5 text-[#C4A882] dark:text-amber-500" />
        </div>

        {/* Text */}
        <p className="flex-1 text-xs text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed">
          We use cookies to improve your browsing experience and analyse site traffic.
          By clicking <strong className="text-[#2E1F14] dark:text-[#f5e9dc]">Accept</strong>, you agree to our use of cookies.{' '}
          <Link href="/privacy-policy#cookies" className="underline underline-offset-2 text-[#8B5E3C] dark:text-amber-400 hover:opacity-80">
            Privacy Policy
          </Link>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] px-4 py-2 rounded-full border border-[#2E1F14]/15 dark:border-[#3a2c23] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs font-semibold text-white bg-[#2E1F14] dark:bg-amber-700 hover:bg-[#3D2B1C] dark:hover:bg-amber-600 px-5 py-2 rounded-full transition-colors"
          >
            Accept
          </button>
          <button
            onClick={decline}
            aria-label="Close"
            className="text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up-cookie {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-cookie {
          animation: slide-up-cookie 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
