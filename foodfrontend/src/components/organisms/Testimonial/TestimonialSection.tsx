'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, BadgeCheck } from 'lucide-react';
import TextHeader from '@/components/atoms/headings';

interface Testimonial {
  _id: string;
  name: string;
  position?: string;
  location?: string;
  rating: number;
  message: string;
  profileImage?: string;
}

// Fallback data shown while API loads or if API returns empty
const FALLBACK: Testimonial[] = [
  {
    _id: 'f1',
    name: 'Sarah Johnson',
    position: 'Dog Owner',
    location: 'UK',
    rating: 5,
    message: "My golden retriever absolutely loves these Highland chews! They last so much longer than other treats and I love that they're all-natural. The quality is outstanding.",
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    _id: 'f2',
    name: 'Michael Chen',
    position: 'Veterinarian',
    location: 'UK',
    rating: 5,
    message: "As a veterinarian, I'm always careful about what I recommend. HimShree's Churpi chews are one of the few products I confidently suggest — safe, healthy, and dogs genuinely love them.",
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
  {
    _id: 'f3',
    name: 'Emma Williams',
    position: 'Pet Parent',
    location: 'Scotland',
    rating: 5,
    message: "Incredible product! My rescue dog used to be anxious but these long-lasting chews keep him calm and happy for hours. The natural ingredients give me total peace of mind.",
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
  },
];

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
    fetch(`${API}/testimonials`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : (data.data || []);
        if (arr.length > 0) setTestimonials(arr);
      })
      .catch(() => {});
  }, []);

  const goTo = useCallback((idx: number, dir: 'left' | 'right') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsAnimating(false);
    }, 350);
  }, [isAnimating]);

  const next = useCallback(() => {
    goTo((currentIndex + 1) % testimonials.length, 'right');
  }, [currentIndex, testimonials.length, goTo]);

  const prev = useCallback(() => {
    goTo((currentIndex - 1 + testimonials.length) % testimonials.length, 'left');
  }, [currentIndex, testimonials.length, goTo]);

  // Auto-play every 5 s
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const pauseAutoPlay = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resumeAutoPlay = () => { timerRef.current = setInterval(next, 5000); };

  const t = testimonials[currentIndex];

  return (
    <section
      className="w-full py-16 px-6 bg-gradient-to-b from-[#f9f5ef] to-[#f0ebe0] dark:from-[#1a130d] dark:to-[#150e09]"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-3">
            Trusted by Dog Owners
          </span>
          <TextHeader
            text="What Our Customers Say"
            align="center"
            size="custom"
            textcolor="gray-900"
            className="text-4xl md:text-5xl font-bold mb-4"
          />
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full" />
        </div>

        {/* Card */}
        <div className="relative">
          {/* Giant quote icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <Quote className="w-16 h-16 text-amber-400/70 fill-amber-200/50 drop-shadow-md" />
          </div>

          {/* Main card */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] mt-10"
            style={{ background: 'linear-gradient(135deg,#fffdf8 0%,#fff8ee 100%)' }}
          >
            {/* Decorative gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-white/60 to-orange-50/60 dark:from-[#2a1f18]/80 dark:to-[#1a130d]/60" />

            {/* Animated border top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 animate-shimmer" />

            {/* Content */}
            <div
              className={`relative z-10 px-8 md:px-16 lg:px-20 py-14 md:py-16 text-center transition-all duration-350 ${
                isAnimating
                  ? direction === 'right'
                    ? 'opacity-0 translate-x-8'
                    : 'opacity-0 -translate-x-8'
                  : 'opacity-100 translate-x-0'
              }`}
              style={{ transition: 'opacity 350ms ease, transform 350ms ease' }}
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 transition-transform hover:scale-110 ${
                      s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-lg md:text-xl lg:text-2xl text-[#4a3020] dark:text-[#d4c4b0] leading-relaxed mb-12 max-w-3xl mx-auto font-serif italic font-light">
                &ldquo;{t.message}&rdquo;
              </p>

              {/* Author */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 scale-110 opacity-20 animate-pulse" />
                  {t.profileImage ? (
                    <img
                      src={t.profileImage}
                      alt={t.name}
                      className="relative w-20 h-20 rounded-full object-cover border-4 border-white dark:border-[#3a2c23] shadow-xl"
                    />
                  ) : (
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-white font-bold text-3xl">{t.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] tracking-wide">{t.name}</p>
                  <p className="text-amber-600 dark:text-amber-500 text-sm font-medium italic mt-0.5">
                    {t.position}{t.location ? ` · ${t.location}` : ''}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified Customer
                </span>
              </div>
            </div>

            {/* Nav arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-[#2a1f18]/90 hover:bg-amber-500 dark:hover:bg-amber-700 text-[#2E1F14] dark:text-[#f5e9dc] hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-[#2a1f18]/90 hover:bg-amber-500 dark:hover:bg-amber-700 text-[#2E1F14] dark:text-[#f5e9dc] hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx, idx > currentIndex ? 'right' : 'left')}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? 'w-8 h-2.5 bg-amber-500 dark:bg-amber-600'
                      : 'w-2.5 h-2.5 bg-[#2E1F14]/20 dark:bg-[#f5e9dc]/20 hover:bg-amber-400/60'
                  }`}
                  aria-label={`Testimonial ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap justify-center gap-6 text-sm text-[#7A5C4F] dark:text-[#c8b6a6]">
          {[
            { emoji: '🐾', text: 'Natural Ingredients' },
            { emoji: '⭐', text: '5-Star Rated' },
            { emoji: '🇬🇧', text: 'UK Customers' },
            { emoji: '🦴', text: 'Vet Approved' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-2 bg-white/60 dark:bg-[#241b16]/60 border border-amber-100 dark:border-[#3a2c23] rounded-full px-4 py-2 shadow-sm backdrop-blur-sm">
              <span className="text-base">{emoji}</span>
              <span className="font-medium text-xs tracking-wide">{text}</span>
            </div>
          ))}
        </div>

        {/* Bottom decorative */}
        <div className="mt-14 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-14 h-px bg-gradient-to-r from-transparent to-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div className="w-14 h-px bg-gradient-to-l from-transparent to-amber-400" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default TestimonialSection;
