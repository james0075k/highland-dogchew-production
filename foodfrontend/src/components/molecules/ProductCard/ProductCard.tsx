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
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden border border-amber-100 hover:border-amber-200"
    >
      <div className="relative">
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {product.badge}
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-antique font-bold text-sm md:text-base text-gray-800 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Variety */}
        {product.variety?.name && (
          <p className="text-xs text-purple-600 font-medium mb-2">
            {product.variety.name}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 md:w-4 md:h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg md:text-xl font-bold text-amber-700">
            £{product.price?.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              £{product.originalPrice?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
