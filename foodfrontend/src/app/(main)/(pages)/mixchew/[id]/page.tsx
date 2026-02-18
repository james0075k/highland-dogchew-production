'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';

type Product = {
  _id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  description: string;
  badge?: string;
  slug: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export default function MixChewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products/${productId}`);
      const result = await response.json();

      if (result.success) {
        setProduct(result.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('An error occurred while loading');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => router.push('/mixchew')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Back to Highland Mix Chews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div>
            {product.badge && (
              <span className="inline-block mb-4 bg-orange-50 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full border border-orange-200">
                {product.badge}
              </span>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-900 font-bold">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-bold text-orange-500">
                £{product.price.toFixed(2)}
              </span>
              <span className="text-xl text-gray-400 line-through">
                £{product.originalPrice.toFixed(2)}
              </span>
            </div>

            {/* View Full Product Page */}
            <Link
              href={`/products/${product.slug}`}
              className="inline-block w-full text-center bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Full Details & Add to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
