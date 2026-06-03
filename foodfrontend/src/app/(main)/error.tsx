'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[#FDFAF6] dark:bg-[#1a1209]">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logos.jpeg"
            alt="Highland Yak Chew"
            width={80}
            height={80}
            className="rounded-full opacity-90"
          />
        </div>

        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C4A882] dark:text-amber-500 mb-3">
          Something went wrong
        </p>
        <h1 className="text-3xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4">
          Unexpected Error
        </h1>
        <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm leading-relaxed mb-8">
          We hit a bump in the road. Our team has been notified.
          Try again or head back to the shop.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#2E1F14] dark:bg-amber-700 hover:bg-[#3D2B1C] dark:hover:bg-amber-600 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-[#2E1F14]/30 dark:border-[#3a2c23] hover:border-[#2E1F14] dark:hover:border-amber-600 text-[#2E1F14] dark:text-[#f5e9dc] text-sm font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
