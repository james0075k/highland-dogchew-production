'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
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
}: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  /* ── Fetch ─────────────────────────────────────────────────────────── */
  useEffect(() => {
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
          const sorted = [...arr].sort((a, b) => {
            if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
            return (b.reviews || 0) - (a.reviews || 0);
          });
          setProducts(sorted);
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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

  if (!loading && !error && products.length === 0) return null;

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

        {/* ── Product grid ─────────────────────────────────────────────── */}
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
        {!loading && !error && (
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
