'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';
import SizeGuideSection from '@/components/organisms/SizeGuideSection/SizeGuideSection';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

import FancySelect from '@/components/molecules/FancySelect/FancySelect';

type SortKey = 'rating' | 'price-asc' | 'price-desc' | 'name';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1e1510] rounded-xl overflow-hidden border border-gray-100 dark:border-[#2a2018] animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-[#2a1f18]" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-full" />
        <div className="h-3 bg-gray-100 dark:bg-[#3a2c23] rounded" />
        <div className="h-3 w-4/5 bg-gray-100 dark:bg-[#3a2c23] rounded" />
        <div className="flex gap-0.5 pt-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 bg-amber-100 dark:bg-amber-900/30 rounded-sm" />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-14 bg-gray-200 dark:bg-[#3a2c23] rounded" />
          <div className="h-3 w-10 bg-gray-100 dark:bg-[#2a2018] rounded" />
        </div>
      </div>
    </div>
  );
}

export default function YakChewsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/products?type=yak-milk`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const result = await res.json();
      if (result.success) setProducts(result.data || []);
      else throw new Error(result.message || 'Failed to load products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case 'price-asc':  return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc': return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name':       return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default:           return arr.sort((a, b) => {
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
        return (b.reviews || 0) - (a.reviews || 0);
      });
    }
  }, [products, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#161210] transition-colors duration-300">
      <section className="pt-[90px] md:pt-[120px] pb-20 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-gray-500 mb-8 font-medium">
            <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link href="/products" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Products</Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[#2E1F14] dark:text-[#c8b6a6]">Yak Milk Chews</span>
          </nav>

          {/* Page header */}
          <div className="mb-8 md:mb-10">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-600 dark:text-amber-500 block mb-2">Best Sellers</span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2 leading-tight">
              Yak Milk Chews
            </h1>
            <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm md:text-base max-w-2xl leading-relaxed">
              100% natural, long-lasting chews packed with protein and calcium. Made from authentic Himalayan yak milk — perfect for all dog sizes.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-[#2a2018] mb-6" />

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
              {loading ? (
                <span className="inline-block w-20 h-4 bg-gray-100 dark:bg-[#2a2018] rounded animate-pulse" />
              ) : (
                <>
                  <span className="font-semibold text-[#2E1F14] dark:text-[#f5e9dc]">{sorted.length}</span>
                  {' '}product{sorted.length !== 1 ? 's' : ''}
                </>
              )}
            </p>

            <div className="w-full sm:w-auto sm:min-w-[220px]">
              <FancySelect<SortKey>
                variant="pill"
                triggerPrefix="Sort:"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'rating',     label: 'Best Rated' },
                  { value: 'price-asc',  label: 'Price · Low to High' },
                  { value: 'price-desc', label: 'Price · High to Low' },
                  { value: 'name',       label: 'Name · A–Z' },
                ]}
              />
            </div>
          </div>

          {/* Loading skeleton grid */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="py-20 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Something went wrong loading products.</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-2.5 bg-[#2E1F14] dark:bg-amber-700 text-white text-sm font-semibold rounded-lg hover:bg-[#432d1f] dark:hover:bg-amber-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sorted.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No yak milk chews found.</p>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && sorted.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {sorted.map((product: any, index: number) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  priority={index < 4}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <SizeGuideSection />
    </div>
  );
}
