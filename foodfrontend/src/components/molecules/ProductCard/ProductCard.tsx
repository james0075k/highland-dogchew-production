'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight } from 'lucide-react';

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
}

export default function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 10, y: x * -10 });
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <Link href={`/products/${product.slug}`} className="block outline-none">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={resetTilt}
        className="product-card group relative flex flex-col bg-white dark:bg-[#1e1510] rounded-2xl overflow-hidden will-change-transform"
        style={{
          animationDelay: `${index * 90}ms`,
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -8 : 0}px) scale(${hovered ? 1.02 : 1})`,
          transition: hovered
            ? 'transform 0.12s ease'
            : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
          boxShadow: hovered
            ? '0 24px 64px rgba(46,31,20,0.18), 0 0 0 1.5px rgba(245,158,11,0.4)'
            : '0 2px 16px rgba(46,31,20,0.07), 0 0 0 1px rgba(245,158,11,0.12)',
        }}
      >
        {/* ── Image area ─────────────────────────────────────── */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#fdf8f0] to-[#f5ede0] dark:from-[#2a1f18] dark:to-[#1e1510]">

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
            {product.badge && (
              <span className="inline-flex bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-widest">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                −{discount}%
              </span>
            )}
          </div>

          {/* Product image with parallax on hover */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full h-full relative"
              style={{
                transform: hovered ? 'scale(1.12) translateY(-4%)' : 'scale(1) translateY(0)',
                transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            >
              <Image
                src={product.image || '/fallback.svg'}
                alt={product.name}
                fill
                className="object-contain drop-shadow-lg"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
              />
            </div>
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#2f1e14]/70 via-transparent to-transparent flex items-end justify-center pb-4"
            style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }}
          >
            <span
              className="inline-flex items-center gap-1.5 bg-white text-[#2f1e14] text-[11px] font-bold px-4 py-2 rounded-full shadow-xl"
              style={{
                transform: hovered ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.92)',
                opacity: hovered ? 1 : 0,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
              }}
            >
              View Product <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="p-3 md:p-4 flex flex-col gap-1.5">

          {product.variety?.name && (
            <span className="text-[9px] md:text-[10px] font-black tracking-widest text-amber-500 uppercase">
              {product.variety.name}
            </span>
          )}

          <h3 className="font-semibold text-[12px] md:text-[13px] text-[#2E1F14] dark:text-[#f5e9dc] leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-amber-700 dark:group-hover:text-amber-400">
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex gap-px">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product.rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200 dark:fill-[#3a2c23] dark:text-[#3a2c23]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-[#c8b6a6]/50">
              ({product.reviews || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-amber-50 dark:border-[#3a2c23]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base md:text-lg font-black text-amber-700 dark:text-amber-400">
                £{product.price?.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  £{product.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ background: hovered ? '#f59e0b' : 'rgba(245,158,11,0.1)' }}
            >
              <ArrowRight
                className="w-3.5 h-3.5 transition-colors duration-300"
                style={{ color: hovered ? '#fff' : '#d97706' }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
