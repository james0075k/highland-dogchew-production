'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Bell, Sparkles } from 'lucide-react';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';

interface Product {
  _id: string;
  name: string;
  slug: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  badge?: string;
  variety?: { _id: string; name: string; category: string };
}

interface ProductSectionProps {
  /** API endpoint suffix, e.g. "products?type=yak-milk" */
  apiPath: string;
  label: string;
  title: string;
  subtitle: string;
  /** "light" = warm cream | "subtle" = off-white light / dark-brown dark (respects theme) | "none" = transparent */
  variant?: 'light' | 'subtle' | 'none';
  viewAllHref?: string;
  initialProducts?: Product[];
}

/* ── Skeleton loader ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white/60 dark:bg-[#1e1510]/60 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-amber-100/60 dark:bg-amber-900/20" />
      <div className="p-4 space-y-3">
        <div className="h-2 w-14 bg-amber-200/60 dark:bg-amber-800/40 rounded-full" />
        <div className="h-3 bg-gray-200/80 dark:bg-[#3a2c23]/80 rounded" />
        <div className="h-3 w-3/4 bg-gray-200/80 dark:bg-[#3a2c23]/80 rounded" />
        <div className="flex gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-amber-200/60 dark:bg-amber-800/40 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-amber-50 dark:border-[#3a2c23]">
          <div className="h-5 w-16 bg-amber-200/60 dark:bg-amber-800/40 rounded" />
          <div className="w-7 h-7 rounded-full bg-amber-100/60 dark:bg-amber-900/20" />
        </div>
      </div>
    </div>
  );
}

export default function ProductSection({
  apiPath,
  label,
  title,
  subtitle,
  variant = 'none',
  viewAllHref,
  initialProducts,
}: ProductSectionProps) {
  const sortFn = (a: Product, b: Product) => {
    if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
    return (b.reviews || 0) - (a.reviews || 0);
  };
  const seed = initialProducts && initialProducts.length
    ? [...initialProducts].sort(sortFn)
    : [];
  const [products, setProducts] = useState<Product[]>(seed);
  const [loading, setLoading] = useState(seed.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  /* ── Fetch (skipped when seeded from server) ──────────────────────── */
  useEffect(() => {
    if (initialProducts && initialProducts.length) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/${apiPath}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          const arr: Product[] = data.success ? (data.data || []) : [];
          setProducts([...arr].sort(sortFn));
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // initialProducts intentionally omitted — it's a one-shot SSR seed; re-running
    // this effect when the parent re-renders with a new array reference would
    // cause unnecessary refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, API_BASE]);

  /* ── Scroll reveal ──────────────────────────────────────────────────── */
  useEffect(() => {
    const targets = [headerRef.current, gridRef.current].filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ps-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  const isEmpty = !loading && !error && products.length === 0;

  const LIMIT = 4;
  const displayed = expanded ? products : products.slice(0, LIMIT);
  const hasMore = products.length > LIMIT;

  /* ── Background variant ─────────────────────────────────────────────── */
  const bgCls =
    variant === 'subtle'
      ? 'bg-[#faf8f5] dark:bg-[#1f1812]'
      : variant === 'light'
      ? 'bg-[#f9f4ec] dark:bg-[#1a130d]'
      : 'bg-transparent';

  const isDark = false; // no forced-dark variant anymore

  return (
    <section ref={sectionRef} className={`relative overflow-hidden py-16 md:py-24 px-4 ${bgCls}`}>

      {/* Subtle decorative blobs (all variants) */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-orange-400/5 blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Section header ───────────────────────────────────────────── */}
        <div ref={headerRef} className="ps-header text-center mb-12 md:mb-16">
          <span className="inline-block text-xs font-black tracking-[0.25em] uppercase mb-3 text-amber-600 dark:text-amber-500">
            {label}
          </span>

          <h2 className="font-antique text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-[#2E1F14] dark:text-[#f5e9dc]">
            {title}
          </h2>

          {/* Underline accent */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="h-px w-12 bg-amber-300/60 dark:bg-amber-600/40" />
            <div className="h-1 w-16 rounded-full bg-amber-500 dark:bg-amber-400" />
            <div className="h-px w-12 bg-amber-300/60 dark:bg-amber-600/40" />
          </div>

          <p className="text-lg font-medium max-w-lg mx-auto text-[#7A5C4F] dark:text-[#c8b6a6]">
            {subtitle}
          </p>
        </div>

        {/* ── Product grid / Empty state ──────────────────────────────── */}
        <div ref={gridRef} className="ps-grid">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className={`mb-4 ${isDark ? 'text-amber-200/60' : 'text-gray-500'}`}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-amber-500 text-white rounded-full text-sm font-semibold hover:bg-amber-600 transition"
              >
                Retry
              </button>
            </div>
          ) : isEmpty ? (
            /* ── Coming Soon — premium empty state ──────────────────── */
            <div className="relative">
              {/* Placeholder cards (blurred/ghost) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 opacity-[0.08] dark:opacity-[0.06] pointer-events-none select-none" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-300 dark:bg-[#3a2c23] rounded-2xl overflow-hidden">
                    <div className="aspect-[9/14] bg-gray-200 dark:bg-[#2a2018]" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-300 dark:bg-[#3a2c23] rounded w-3/4" />
                      <div className="h-2 bg-gray-200 dark:bg-[#2a2018] rounded w-1/2" />
                      <div className="h-4 bg-gray-300 dark:bg-[#3a2c23] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative max-w-md w-full mx-4">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-orange-300/20 to-amber-400/20 dark:from-amber-600/10 dark:via-orange-500/10 dark:to-amber-600/10 rounded-3xl blur-xl" />

                  <div className="relative bg-white/95 dark:bg-[#1e1510]/95 backdrop-blur-xl rounded-2xl border border-amber-200/60 dark:border-amber-800/40 shadow-2xl shadow-amber-900/5 dark:shadow-black/30 px-8 py-10 text-center">
                    {/* Sparkle icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 mb-5">
                      <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2 tracking-tight">
                      Coming Soon
                    </h3>
                    <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] mb-6 leading-relaxed max-w-xs mx-auto">
                      We&apos;re handcrafting something special. Be the first to know when our new {title.toLowerCase()} are available.
                    </p>

                    {/* Notify CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        href="/contact"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-[#2E1F14] dark:bg-amber-600 text-white hover:bg-[#432d1f] dark:hover:bg-amber-500 shadow-lg shadow-amber-900/10 transition-all duration-300"
                      >
                        <Bell className="w-4 h-4" />
                        Notify Me
                      </Link>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                      >
                        Browse other products
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Trust line */}
                    <div className="mt-6 pt-5 border-t border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-center justify-center gap-4 text-[11px] text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          100% Natural
                        </span>
                        <span className="w-px h-3 bg-gray-300 dark:bg-[#3a2c23]" />
                        <span>Handcrafted in the Himalayas</span>
                        <span className="w-px h-3 bg-gray-300 dark:bg-[#3a2c23]" />
                        <span>Free UK Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {displayed.map((p, i) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  priority={i === 0}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Actions row ──────────────────────────────────────────────── */}
        {!loading && !error && !isEmpty && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 md:mt-12">

            {/* View More (if more than 4) */}
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold border-2 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white hover:border-amber-500 dark:hover:bg-amber-600 dark:hover:border-amber-600 transition-all duration-300"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                {expanded ? 'Show Less' : `View More (${products.length - LIMIT} more)`}
              </button>
            )}

            {/* View All page link */}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold bg-[#2f1e14] dark:bg-amber-600 text-white hover:bg-amber-700 dark:hover:bg-amber-500 transition-all duration-300"
              >
                Shop All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── CSS for scroll reveal animations ─────────────────────────── */}
      <style jsx global>{`
        /* Header reveal */
        .ps-header {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1),
                      transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .ps-header.ps-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Grid reveal wrapper */
        .ps-grid {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.15s,
                      transform 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.15s;
        }
        .ps-grid.ps-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Individual card stagger */
        .ps-grid.ps-visible .product-card {
          animation: cardReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
        }

        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: perspective(1200px) translateY(28px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: perspective(1200px) translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
