'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export default function HighlandMixChewSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHighlandMixProducts();
  }, []);

  const fetchHighlandMixProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/products?type=highland-mix`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();
      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching highland mix products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading highland mix chews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchHighlandMixProducts}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const sorted = [...products].sort((a, b) => {
    if ((b.rating || 0) === (a.rating || 0)) return (b.reviews || 0) - (a.reviews || 0);
    return (b.rating || 0) - (a.rating || 0);
  });

  return (
    <section className="py-16 md:py-20 px-4 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto text-center mb-10">
        <span className="inline-block text-amber-600 text-sm font-semibold tracking-[0.2em] uppercase mb-3">Premium Blend</span>
        <h2 className="font-antique text-4xl md:text-5xl font-bold text-[#2E1F14] mb-4 tracking-[-0.01em]">
          Highland Mix Chews
        </h2>
        <p className="text-lg md:text-xl text-[#7A5C4F] font-medium tracking-[0.3px]">
          100% Natural, Full Of Protein & Calcium
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((product, index) => (
          <ProductCard key={product._id} product={product} priority={index === 0} />
        ))}
      </div>
    </section>
  );
}
