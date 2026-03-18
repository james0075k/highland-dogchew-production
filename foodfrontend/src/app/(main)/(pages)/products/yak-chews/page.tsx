'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';
import SizeGuideSection from '@/components/organisms/SizeGuideSection/SizeGuideSection';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export default function YakChewsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/products?type=yak-milk`);

      if (!response.ok) throw new Error('Failed to fetch products');

      const result = await response.json();
      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching yak milk products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...products].sort((a, b) => {
    if ((b.rating || 0) === (a.rating || 0)) return (b.reviews || 0) - (a.reviews || 0);
    return (b.rating || 0) - (a.rating || 0);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] to-[#f3e5d0] dark:from-[#1a1410] dark:to-[#241b16] transition-colors duration-300">
      <section className="pt-[100px] md:pt-[180px] pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mb-8 text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            All Products
          </Link>

          <div className="text-center mb-12">
            <span className="inline-block text-amber-600 dark:text-amber-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3">Best Sellers</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4">
              Yak Milk Chews
            </h1>
            <p className="text-lg text-[#7A5C4F] dark:text-[#c8b6a6] max-w-2xl mx-auto">
              100% Natural, Full Of Protein & Calcium — Long-lasting chews perfect for all dog sizes.
            </p>
          </div>

          {loading && (
            <div className="py-16 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">Loading yak milk chews...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="py-16 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error: {error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-lg">No yak milk chews found</p>
            </div>
          )}

          {!loading && !error && sorted.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map((product, index) => (
                <ProductCard key={product._id} product={product} priority={index === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SizeGuideSection />
    </div>
  );
}
