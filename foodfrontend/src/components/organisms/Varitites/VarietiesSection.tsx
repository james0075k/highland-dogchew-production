'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type Variety = {
  _id: string;
  name: string;
  image: string;
  isActive: boolean;
  category: string;
  description?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

// Flavor-specific gradient overlays (kept subtle so image shows through)
const colorMap: Record<string, string> = {
  Blueberry:  'from-blue-950/60 via-blue-900/20 to-black/40',
  Strawberry: 'from-rose-950/60 via-rose-900/20 to-black/40',
  Pumpkin:    'from-orange-950/60 via-orange-900/20 to-black/40',
  Honey:      'from-yellow-950/60 via-yellow-900/20 to-black/40',
};
const getGradient = (name: string) => colorMap[name] || 'from-gray-950/60 via-gray-900/20 to-black/40';

/* ── Desktop/tablet variety card — mirrors the "featured" ProductCard ─────── */
function VarietyCard({
  variety,
  index,
  onClick,
  prefersReduced,
}: {
  variety: Variety;
  index: number;
  onClick: () => void;
  prefersReduced: boolean | null;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300"
      style={{ aspectRatio: '3 / 4' }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px', amount: 0.1 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Image with scale-105 zoom on hover — matches featured ProductCard */}
      <Image
        src={variety.image || '/placeholder.jpg'}
        alt={variety.name}
        fill
        className="object-cover"
        style={{
          transform: hovered && !prefersReduced ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.35s ease-out',
        }}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Gradient overlay — flavour-tinted, same technique as featured card */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${getGradient(variety.name)} transition-opacity duration-400`}
        style={{ opacity: hovered ? 0.85 : 0.65 }}
      />

      {/* Name — top-left, same position as featured ProductCard */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <p className="text-white/70 text-[10px] font-black tracking-[0.22em] uppercase mb-0.5 drop-shadow">
          {variety.category || 'Special Variety'}
        </p>
        <h3 className="text-white font-bold text-[22px] leading-tight drop-shadow-md">
          {variety.name}
        </h3>
      </div>

      {/* CTA — same green "Select Options" button, slides up on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 p-3 flex transition-all duration-300 ease-out"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(14px)',
        }}
      >
        <button
          className="flex-1 h-10 bg-[#4caf50] hover:bg-[#43a047] active:bg-[#388e3c] text-white text-[10px] font-black tracking-[0.14em] uppercase flex items-center justify-center rounded shadow-md transition-colors"
        >
          View Products
        </button>
      </div>
    </motion.div>
  );
}

/* ── Mobile-only single carousel card (always shows CTA) ─────────────────── */
function MobileVarietyCard({
  variety,
  onClick,
}: {
  variety: Variety;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-xl shadow-md cursor-pointer"
      style={{ aspectRatio: '3 / 4' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={variety.image || '/placeholder.jpg'}
        alt={variety.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${getGradient(variety.name)} opacity-70`} />

      {/* Name top-left */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <p className="text-white/70 text-[10px] font-black tracking-[0.22em] uppercase mb-0.5">
          {variety.category || 'Special Variety'}
        </p>
        <h3 className="text-white font-bold text-[22px] leading-tight drop-shadow-md">
          {variety.name}
        </h3>
      </div>

      {/* Always-visible CTA on mobile */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <button className="w-full h-10 bg-[#4caf50] hover:bg-[#43a047] text-white text-[10px] font-black tracking-[0.14em] uppercase rounded shadow-md transition-colors">
          View Products
        </button>
      </div>
    </div>
  );
}

/* ── Main section ──────────────────────────────────────────────────────────── */
const VarietiesSection = () => {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        const res = await fetch(`${API_BASE}/variety`);
        const result = await res.json();
        if (result?.success) {
          setVarieties(
            (result.data || [])
              .filter((v: Variety) => v.isActive)
              .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          );
        }
      } catch (err) {
        console.error('Failed to fetch varieties:', err);
      }
    };
    fetchVarieties();
  }, []);

  const handleViewVariety = (id: string) => router.push(`/variety/${id}`);
  const maxIndex = Math.max(0, varieties.length - 1);
  const nextSlide = () => setCurrentIndex(p => Math.min(p + 1, maxIndex));
  const prevSlide = () => setCurrentIndex(p => Math.max(p - 1, 0));

  if (varieties.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Heading */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-antique text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] tracking-[-0.01em]">
          Our Special Varieties
        </h2>
      </motion.div>

      {/* ── Desktop / tablet grid (md+) — matches product grid 4 columns ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {varieties.map((variety, index) => (
          <VarietyCard
            key={variety._id}
            variety={variety}
            index={index}
            onClick={() => handleViewVariety(variety._id)}
            prefersReduced={prefersReduced}
          />
        ))}
      </div>

      {/* ── Mobile carousel (< md) ── */}
      <div className="md:hidden">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {varieties.map(variety => (
              <div key={variety._id} className="min-w-full px-1">
                <MobileVarietyCard
                  variety={variety}
                  onClick={() => handleViewVariety(variety._id)}
                />
              </div>
            ))}
          </div>

          {/* Prev arrow */}
          {currentIndex > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 dark:bg-[#241b16]/85 hover:bg-white dark:hover:bg-[#241b16] text-[#2E1F14] dark:text-[#f5e9dc] rounded-full shadow-md flex items-center justify-center z-10 transition-colors"
              aria-label="Previous variety"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next arrow */}
          {currentIndex < maxIndex && (
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 dark:bg-[#241b16]/85 hover:bg-white dark:hover:bg-[#241b16] text-[#2E1F14] dark:text-[#f5e9dc] rounded-full shadow-md flex items-center justify-center z-10 transition-colors"
              aria-label="Next variety"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dots — same amber pill style as before */}
        <div className="flex justify-center gap-2 mt-5">
          {varieties.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? 'w-7 h-2.5 bg-[#4caf50]'
                  : 'w-2.5 h-2.5 bg-[#2E1F14]/20 dark:bg-[#f5e9dc]/20 hover:bg-[#2E1F14]/40'
              }`}
              aria-label={`Go to variety ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VarietiesSection;
