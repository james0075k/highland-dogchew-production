'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
  featured?: boolean;
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-px">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const partial = !filled && rating > star - 1;
          const pct = partial ? Math.round((rating - (star - 1)) * 100) : 0;
          return (
            <span key={star} className="relative inline-block w-3.5 h-3.5 flex-shrink-0">
              <Star className="absolute inset-0 w-3.5 h-3.5 text-gray-200 dark:text-gray-700" fill="currentColor" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : partial ? `${pct}%` : '0%' }}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
              </span>
            </span>
          );
        })}
      </div>
      {reviews > 0 && (
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-none">
          ({reviews.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default function ProductCard({
  product,
  priority = false,
  index = 0,
  featured = false,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  /* ── FEATURED / LIFESTYLE CARD ─────────────────────────────── */
  if (featured) {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="relative h-full min-h-[320px] overflow-hidden rounded-xl group cursor-pointer block"
      >
        <Image
          src={imgError ? '/fallback.svg' : product.image || '/fallback.svg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          priority={priority}
          sizes="(max-width: 1024px) 50vw, 25vw"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            -{discount}% OFF
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {product.variety?.name && (
            <span className="text-amber-300 text-[9px] font-bold tracking-widest uppercase block mb-1">
              {product.variety.name}
            </span>
          )}
          <h3 className="text-white font-bold text-[15px] leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-bold text-lg">£{product.price?.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="text-white/60 text-sm line-through ml-2">
                  £{product.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-white text-[11px] font-semibold px-3 py-1.5 bg-white/15 rounded-full backdrop-blur-sm border border-white/25 group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-200">
              Shop Now →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  /* ── NORMAL CARD ────────────────────────────────────────────── */
  return (
    <div
      className="group flex flex-col bg-white dark:bg-[#1e1510] rounded-xl overflow-hidden border border-gray-100 dark:border-[#2a2018] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-gray-200 dark:hover:border-[#3a2c23] transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image area ──────────────────────────────────────────── */}
      <div className="relative aspect-[9/14] overflow-hidden bg-[#F7F4F0] dark:bg-[#231a14]">

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm select-none">
            -{discount}%
          </div>
        )}

        {/* Variety / badge label */}
        {product.badge && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-[#2E1F14] text-[#f5e9dc] text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase shadow-sm">
              {product.badge}
            </span>
          </div>
        )}

        {/* Clickable image */}
        <Link href={`/products/${product.slug}`} className="absolute inset-0">
          <div
            className="w-full h-full relative transition-transform duration-300 ease-out"
            style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          >
            <Image
              src={imgError ? '/fallback.svg' : product.image || '/fallback.svg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              onError={() => setImgError(true)}
            />
          </div>
        </Link>

        {/* Add to Cart hover CTA */}
        <div
          className="absolute bottom-0 left-0 right-0 p-2.5 transition-all duration-200 ease-out"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(10px)' }}
        >
          <Link
            href={`/products/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full h-9 bg-[#2E1F14] dark:bg-[#6b4226] hover:bg-[#432d1f] dark:hover:bg-[#7a4f30] text-white text-[11px] font-bold tracking-wide uppercase rounded-lg shadow-md transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </Link>
        </div>
      </div>

      {/* ── Product info ─────────────────────────────────────────── */}
      <Link href={`/products/${product.slug}`} className="p-3.5 flex flex-col gap-1.5 flex-1">
        {/* Variety label */}
        {product.variety?.name && (
          <span className="text-[9px] font-bold tracking-[0.2em] text-amber-600 dark:text-amber-500 uppercase">
            {product.variety.name}
          </span>
        )}

        {/* Name */}
        <h3 className="text-[13px] font-semibold text-[#1a1a1a] dark:text-[#f5e9dc] line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Star rating — always visible */}
        <StarRating rating={product.rating || 0} reviews={product.reviews || 0} />

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1.5">
          <span className="text-[15px] font-bold text-[#1a1a1a] dark:text-[#f5e9dc]">
            £{product.price?.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[12px] text-gray-400 dark:text-gray-500 line-through font-normal">
              £{product.originalPrice?.toFixed(2)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] text-red-500 font-bold ml-auto">
              Save {discount}%
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
