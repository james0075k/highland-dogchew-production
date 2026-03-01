'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Variety = {
  _id: string;
  name: string;
  image: string;
  isActive: boolean;
  category: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const colorMap: Record<string, string> = {
  Blueberry:  'from-blue-900/60 to-blue-600/60',
  Strawberry: 'from-red-900/60 to-red-600/60',
  Pumpkin:    'from-orange-900/60 to-orange-600/60',
  Honey:      'from-yellow-900/60 to-yellow-600/60',
};
const getColor = (name: string) => colorMap[name] || 'from-gray-900/60 to-gray-600/60';

/*
  VarietyCard — desktop tile
  ─────────────────────────────
  • Card fades + slides up on entry (staggered by index)
  • Image zooms from 1.08 → 1.0 on entry, then 1.08 again on hover
  • All transitions use expo-out easing for a premium feel
  • whileHover on the image is separate from whileInView so they compose cleanly
  • once: true → no jitter when scrolling back
  • Skips zoom if user prefers reduced motion
*/
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
  return (
    <motion.div
      onClick={onClick}
      className="group relative h-[400px] rounded-lg overflow-hidden cursor-pointer shadow-lg"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px', amount: 0.1 }}
      transition={{
        duration: 0.65,
        delay: index * 0.09,   // stagger: each card appears slightly after the previous
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Image layer — zoom-in on entry, zoom-in on hover */}
      <motion.img
        src={variety.image || '/placeholder.jpg'}
        alt={variety.name}
        initial={{ scale: prefersReduced ? 1 : 1.08 }}
        whileInView={{ scale: 1 }}
        whileHover={{ scale: prefersReduced ? 1 : 1.08 }}
        viewport={{ once: true, margin: '0px 0px -80px 0px', amount: 0.1 }}
        transition={{
          // whileInView transition (zoom-out on entry)
          duration: 1.3,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          willChange: 'transform',
        }}
      />

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${getColor(variety.name)} opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
      />

      {/* Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
        <h3 className="font-antique text-4xl font-bold text-white tracking-wide text-center drop-shadow-lg">
          {variety.name}
        </h3>
        <button className="mt-6 px-6 py-2 border-2 border-white text-white font-semibold rounded-md opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:text-gray-800">
          View Products
        </button>
      </div>
    </motion.div>
  );
}

const VarietiesSection = () => {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [varieties,     setVarieties]     = useState<Variety[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        const res    = await fetch(`${API_BASE}/variety`);
        const result = await res.json();
        if (result?.success) {
          setVarieties(
            (result.data || [])
              .filter((v: Variety) => v.isActive)
              .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          );
        }
      } catch (err) {
        console.error('❌ Failed to fetch varieties:', err);
      }
    };
    fetchVarieties();
  }, []);

  const handleViewVariety = (id: string) => router.push(`/variety/${id}`);
  const maxIndex  = Math.max(0, varieties.length - 1);
  const nextSlide = () => setCurrentIndex((p) => Math.min(p + 1, maxIndex));
  const prevSlide = () => setCurrentIndex((p) => Math.max(p - 1, 0));

  if (varieties.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-4">
      {/* Heading */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -60px 0px', amount: 0.4 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-antique text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 tracking-[-0.01em]">
          Our Special Varieties
        </h2>
      </motion.div>

      <div className="relative">
        {/* ── Desktop Grid ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-6">
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

        {/* ── Mobile Slider ── */}
        <div className="md:hidden relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {varieties.map((variety) => (
              <div key={variety._id} className="min-w-full px-2">
                <div
                  onClick={() => handleViewVariety(variety._id)}
                  className="group relative h-[400px] rounded-lg overflow-hidden shadow-lg cursor-pointer"
                >
                  <img
                    src={variety.image || '/placeholder.jpg'}
                    alt={variety.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b ${getColor(variety.name)} opacity-50`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <h3 className="text-4xl font-bold text-white tracking-wide text-center drop-shadow-lg">
                      {variety.name}
                    </h3>
                    <button className="mt-6 px-6 py-2 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-gray-800 transition-colors duration-300">
                      View Products
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentIndex > 0 && (
            <button onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-[#241b16]/80 hover:bg-white dark:hover:bg-[#241b16] text-[#2E1F14] dark:text-[#f5e9dc] p-3 rounded-full shadow-lg z-10">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < maxIndex && (
            <button onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-[#241b16]/80 hover:bg-white dark:hover:bg-[#241b16] text-[#2E1F14] dark:text-[#f5e9dc] p-3 rounded-full shadow-lg z-10">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Mobile Dots */}
        <div className="md:hidden flex justify-center gap-2 mt-6">
          {varieties.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? 'w-8 h-3 bg-amber-500 dark:bg-amber-600'
                  : 'w-3 h-3 bg-[#2E1F14]/20 dark:bg-[#f5e9dc]/20 hover:bg-[#2E1F14]/40 dark:hover:bg-[#f5e9dc]/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VarietiesSection;
