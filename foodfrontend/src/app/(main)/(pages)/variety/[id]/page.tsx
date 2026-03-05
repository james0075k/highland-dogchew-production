'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Package } from 'lucide-react';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

interface Variety {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  products: any[];
  productCount: number;
}

export default function VarietyDetailPage({ params }: { params: { id: string } }) {
  const [variety, setVariety] = useState<Variety | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariety = async () => {
      try {
        const res = await fetch(`${API_BASE}/variety/${params.id}/products`);
        if (!res.ok) throw new Error('Variety not found');
        const data = await res.json();
        setVariety(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load variety');
      } finally {
        setLoading(false);
      }
    };
    fetchVariety();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] to-[#f3e5d0] dark:from-[#1a1410] dark:to-[#241b16] pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">Loading variety...</p>
        </div>
      </div>
    );
  }

  if (error || !variety) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] to-[#f3e5d0] dark:from-[#1a1410] dark:to-[#241b16] pt-40 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Variety not found'}</p>
          <Link href="/" className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] to-[#f3e5d0] dark:from-[#1a1410] dark:to-[#241b16] transition-colors duration-300">

      {/* Hero */}
      <section className="relative h-[380px] md:h-[460px] overflow-hidden">
        {variety.image ? (
          <img
            src={variety.image}
            alt={variety.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-800 to-amber-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-4 text-center">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Special Variety
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {variety.name}
          </h1>
          {variety.description && (
            <p className="text-white/80 max-w-xl text-base md:text-lg leading-relaxed">
              {variety.description}
            </p>
          )}
        </div>
      </section>

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-700 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-1">
            Products in {variety.name}
          </h2>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">
            {variety.productCount} product{variety.productCount !== 1 ? 's' : ''} available
          </p>
        </div>

        {variety.products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Package className="w-16 h-16 text-amber-300 mb-4" />
            <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-lg font-medium mb-2">
              No products yet
            </p>
            <p className="text-[#7A5C4F]/70 dark:text-[#c8b6a6]/70 text-sm mb-6">
              Products for this variety will appear here once added.
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition font-medium text-sm"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {variety.products.map((product, index) => (
              <ProductCard key={product._id} product={product} priority={index === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
