'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    title: 'Yak Milk Chews',
    description: '100% natural, long-lasting chews packed with protein and calcium. Perfect for all dog sizes.',
    href: '/products/yak-chews',
    image: '/images/yak-milk-category.jpg',
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Puff Treats',
    description: 'Light, crunchy puffed treats made from yak milk. A delicious reward your dog will love.',
    href: '/products/puff-treats',
    image: '/images/puff-treats-category.jpg',
    color: 'from-rose-500 to-pink-600',
  },
  {
    title: 'Highland Mix Chews',
    description: 'A premium blend of Himalayan ingredients for a unique chewing experience.',
    href: '/products/highland-mix',
    image: '/images/highland-mix-category.jpg',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function ProductsLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] to-[#f3e5d0] dark:from-[#1a1410] dark:to-[#241b16] transition-colors duration-300">
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-amber-600 dark:text-amber-500 text-sm font-semibold tracking-[0.2em] uppercase mb-3">Shop Our Range</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4">
              Our Products
            </h1>
            <p className="text-lg text-[#7A5C4F] dark:text-[#c8b6a6] max-w-2xl mx-auto">
              Explore our range of natural, healthy dog chews and treats made from authentic Himalayan ingredients.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative bg-white dark:bg-[#241b16] rounded-2xl shadow-md dark:shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:shadow-2xl transition-all duration-300 overflow-hidden border border-amber-100 dark:border-[#3a2c23] hover:border-amber-300 dark:hover:border-amber-500 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2a1f18] dark:to-[#32241a]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <Image
                    src={category.image || '/fallback.svg'}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                  />
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {category.title}
                  </h2>
                  <p className="text-[#7A5C4F] dark:text-[#c8b6a6] mb-4 text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 font-semibold group-hover:gap-3 transition-all text-sm">
                    Browse Collection
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
