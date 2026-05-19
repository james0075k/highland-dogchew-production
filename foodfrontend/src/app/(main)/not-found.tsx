'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, ShoppingBag, ArrowRight, Search, Compass, MapPin, Sparkles } from 'lucide-react';

const quickLinks = [
  { label: 'Yak Milk Chews', href: '/products/yak-chews',   tag: 'Bestseller' },
  { label: 'Puff Treats',    href: '/products/puff-treats', tag: 'Crunchy'    },
  { label: 'Highland Mix',   href: '/products/highland-mix',tag: 'Variety'    },
  { label: 'Contact Us',     href: '/contact',              tag: 'Help'       },
];

export default function MainNotFound() {
  return (
    <main className="relative min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] overflow-hidden transition-colors duration-300">
      {/* ── ambient amber glow background ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-amber-200/40 dark:bg-amber-900/20 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-[420px] h-[420px] rounded-full bg-orange-200/30 dark:bg-orange-900/15 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[460px] h-[460px] rounded-full bg-amber-100/50 dark:bg-amber-950/30 blur-3xl" />
      </div>

      {/* pt-40 = 160px clears the fixed navbar (~144px). pb-24 leaves breathing room before Footer */}
      <section className="relative pt-40 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">

            {/* ── Left: copy ── */}
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-6">
                <Compass className="w-3 h-3" />
                Error 404 · Page not found
              </div>

              {/* Giant numerals */}
              <div className="relative inline-block leading-none mb-4 select-none">
                <span className="font-antique text-[140px] sm:text-[180px] md:text-[220px] bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 dark:from-amber-300 dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent tracking-tighter">
                  404
                </span>
                <span aria-hidden className="absolute -top-2 -right-6 sm:-right-10 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#2f1e14] dark:bg-amber-500 text-amber-300 dark:text-[#1a1410] shadow-xl rotate-12">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
              </div>

              <h1 className="font-antique text-3xl sm:text-4xl md:text-5xl text-[#2f1e14] dark:text-[#f5e9dc] leading-[1.05] mb-4">
                Oops, this page<br />
                <span className="text-amber-600 dark:text-amber-400">went for a walk.</span>
              </h1>

              <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-base sm:text-lg leading-relaxed max-w-xl mb-8">
                The link you followed may be broken, or the page may have been moved.
                Let&apos;s get your dog back on the trail — try one of these instead.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 text-white font-bold py-3.5 px-7 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-amber-300/60 dark:hover:shadow-amber-900/50 hover:-translate-y-0.5"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#241b16] hover:bg-amber-50 dark:hover:bg-[#2d221c] text-[#2f1e14] dark:text-[#f5e9dc] font-bold py-3.5 px-7 rounded-2xl border-2 border-[#2f1e14]/15 dark:border-[#3a2c23] hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop Products
                </Link>
              </div>

              {/* Search hint */}
              <div className="flex items-center gap-3 text-xs text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60">
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#241b16] border border-amber-100 dark:border-[#3a2c23] rounded-full px-3 py-1.5 shadow-sm">
                  <Search className="w-3 h-3 text-amber-500" />
                  <span>Tip — use the navbar search to find a product</span>
                </div>
              </div>
            </div>

            {/* ── Right: brand mark card ── */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                {/* decorative pin */}
                <div aria-hidden className="absolute -top-4 -left-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white shadow-xl rotate-[-12deg]">
                  <MapPin className="w-5 h-5" />
                </div>

                <div className="relative bg-white dark:bg-[#241b16] rounded-3xl border border-amber-200/60 dark:border-[#3a2c23] shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                  {/* top stripe */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

                  <div className="p-8 sm:p-10 text-center">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/30 scale-150 blur-xl" />
                      <div className="relative w-28 h-28 rounded-full bg-amber-50 dark:bg-[#2d221c] border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/logos.jpeg"
                          alt="Highland Yak Chew"
                          width={112}
                          height={112}
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-600 dark:text-amber-400 mb-1.5">
                      Highland Yak Chew
                    </p>
                    <p className="font-antique text-xl text-[#2f1e14] dark:text-[#f5e9dc] leading-tight mb-4">
                      Lost on the highlands?
                    </p>
                    <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed">
                      Don&apos;t worry — every great chew adventure starts with a wrong turn.
                      Pick a trail below to keep exploring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick links grid ── */}
          <div className="mt-16 sm:mt-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#7A5C4F] dark:text-[#c8b6a6]">
                Popular trails
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 via-amber-200/40 to-transparent dark:from-amber-800/60 dark:via-amber-900/30" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group relative bg-white dark:bg-[#241b16] border border-amber-100/80 dark:border-[#3a2c23] rounded-2xl p-4 sm:p-5 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                    {l.tag}
                  </span>
                  <div className="mt-6 sm:mt-8">
                    <p className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-sm sm:text-base mb-1">
                      {l.label}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      Explore
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
