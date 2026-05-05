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
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center pt-40">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] flex items-center justify-center pt-40">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => router.push('/mixchew')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Back to Highland Mix Chews
          </button>
        </div>
      </div>
    );
  }

  return (
    /* pt-40 = 160px clears the fixed navbar (~144px) on all screen sizes */
    <div className="min-h-screen bg-[#f8f3ea] dark:bg-[#1a1410] pt-40 pb-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-amber-600 dark:hover:text-amber-400 mb-8 transition font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-amber-50 dark:bg-[#2d221c] border border-amber-100 dark:border-[#3a2c23]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            {product.badge && (
              <span className="inline-block mb-4 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 self-start">
                {product.badge}
              </span>
            )}

            <h1 className="font-antique text-3xl sm:text-4xl text-[#2f1e14] dark:text-[#f5e9dc] mb-3 leading-snug">
              {product.name}
            </h1>

            <p className="text-[#7A5C4F] dark:text-[#c8b6a6] mb-6 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>

            {/* Rating */}
            {(product.rating > 0 || product.reviews > 0) && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-amber-100 dark:fill-amber-900/30 text-amber-200 dark:text-amber-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm font-medium">
                  {product.rating} · {product.reviews} reviews
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                £{product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 line-through">
                  £{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* CTA — redirects to full product page which has full size/subscription/add-to-cart flow */}
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              View Full Details &amp; Add to Cart
            </Link>

            <p className="text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/50 text-center mt-3">
              Choose your size, subscription &amp; more on the next page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
