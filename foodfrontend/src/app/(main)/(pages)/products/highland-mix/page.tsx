'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export default function HighlandMixPage() {
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
      const response = await fetch(`${API_BASE}/products?type=highland-mix`);

      if (!response.ok) throw new Error('Failed to fetch products');

      const result = await response.json();
      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching highland mix chews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mb-8 text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          All Products
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            Highland Mix Chews
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A premium blend of Himalayan ingredients for a unique chewing experience.
          </p>
        </div>

        {loading && (
          <div className="py-16 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading highland mix chews...</p>
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
            <p className="text-gray-500 text-lg">No highland mix chews found</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
