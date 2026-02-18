'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

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
  variety?: {
    _id: string;
    name: string;
    category: string;
  };
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden border border-amber-100 hover:border-amber-300 hover:-translate-y-1"
    >
      <div className="relative">
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg">
            {product.badge}
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          <Image
            src={product.image || '/fallback.svg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            priority={priority}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        <h3 className="font-antique font-bold text-xs md:text-sm lg:text-base text-gray-800 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Variety */}
        {product.variety?.name && (
          <p className="text-[10px] md:text-xs text-amber-600 font-medium mb-1.5">
            {product.variety.name}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-1.5 mt-auto">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-gray-500 ml-0.5">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base md:text-lg font-bold text-amber-700">
            £{product.price?.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              £{product.originalPrice?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
