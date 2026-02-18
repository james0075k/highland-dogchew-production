'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/molecules/ProductCard/ProductCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export default function PuffTreatsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPuffTreats();
  }, []);

  const fetchPuffTreats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/products?type=puff-treat`);

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
      console.error('Error fetching puff treats:', err);
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
          <p className="text-gray-600">Loading puff treats...</p>
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
            onClick={fetchPuffTreats}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="min-h-screen py-4 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="font-antique text-4xl md:text-5xl font-bold text-[#2E1F14] mb-4 tracking-[-0.01em]">
          Puff Treats
        </h1>
        <p className="text-lg md:text-xl text-[#7A5C4F] font-medium tracking-[0.3px]">
          100% Natural, Full Of Protein & Calcium
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
