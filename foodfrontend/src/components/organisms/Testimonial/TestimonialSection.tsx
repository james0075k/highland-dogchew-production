'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, BadgeCheck } from 'lucide-react';

interface Testimonial {
  _id: string;
  name: string;
  position?: string;
  location?: string;
  rating: number;
  message: string;
  profileImage?: string;
}

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
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
        setTestimonials(arr);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const pauseAutoPlay = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resumeAutoPlay = () => { timerRef.current = setInterval(next, 5000); };

  if (loading) {
    return (
      <section className="w-full py-16 px-6 bg-gradient-to-b from-[#f9f5ef] to-[#f0ebe0] dark:from-[#1a130d] dark:to-[#150e09]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="h-3 w-48 bg-amber-200/60 dark:bg-amber-800/40 rounded-full mx-auto mb-3 animate-pulse" />
            <div className="h-10 w-72 bg-amber-100 dark:bg-amber-900/30 rounded-xl mx-auto mb-4 animate-pulse" />
            <div className="w-20 h-1 bg-amber-200 dark:bg-amber-800 mx-auto rounded-full" />
          </div>
          <div className="rounded-3xl bg-[#fffdf8] dark:bg-[#1e1610] border border-amber-100/60 dark:border-amber-900/30 p-14 mt-10 animate-pulse">
            <div className="flex justify-center gap-1 mb-6">
              {[1,2,3,4,5].map((s) => <div key={s} className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/40" />)}
            </div>
            <div className="space-y-3 max-w-2xl mx-auto mb-10">
              {[100, 90, 80].map((w, i) => (
                <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700 rounded mx-auto" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/40" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

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
          <span className="inline-block text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-3">
            Trusted by Dog Owners Across the UK
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4">
            What Our Customers Say
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full" />
        </div>

        {/* Card */}
        <div className="relative">
          {/* Giant quote icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <Quote className="w-16 h-16 text-amber-400/70 fill-amber-200/50 dark:fill-amber-900/30 drop-shadow-md" />
          </div>

          {/* Main card — Tailwind bg classes only, NO inline style */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] mt-10 bg-[#fffdf8] dark:bg-[#1e1610] border border-amber-100/60 dark:border-amber-900/30">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300" />

            {/* Subtle inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent dark:from-amber-900/10 dark:to-transparent pointer-events-none" />

            {/* Content */}
            <div
              className={`relative z-10 px-8 md:px-16 lg:px-20 py-14 md:py-16 text-center ${
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
                      s <= t.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200 dark:text-gray-600 dark:fill-gray-600'
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
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-4 border-white dark:border-[#3a2c23] shadow-xl">
                      <span className="text-white font-bold text-3xl">{t.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] tracking-wide">{t.name}</p>
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-medium italic mt-0.5">
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
                      ? 'w-8 h-2.5 bg-amber-500'
                      : 'w-2.5 h-2.5 bg-[#2E1F14]/20 dark:bg-[#f5e9dc]/20 hover:bg-amber-400/60'
                  }`}
                  aria-label={`Testimonial ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap justify-center gap-4 text-sm">
          {[
            { emoji: '🐾', text: 'Natural Ingredients' },
            { emoji: '⭐', text: '5-Star Rated' },
            { emoji: '🇬🇧', text: 'UK Dog Owners' },
            { emoji: '🦴', text: 'Vet Approved' },
            { emoji: '🐕', text: 'Long-Lasting Chews' },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 bg-white/70 dark:bg-[#241b16]/70 border border-amber-100 dark:border-[#3a2c23] rounded-full px-4 py-2 shadow-sm backdrop-blur-sm text-[#7A5C4F] dark:text-[#c8b6a6]"
            >
              <span className="text-base">{emoji}</span>
              <span className="font-medium text-xs tracking-wide">{text}</span>
            </div>
          ))}
        </div>

        {/* Bottom decorative */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-14 h-px bg-gradient-to-r from-transparent to-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div className="w-14 h-px bg-gradient-to-l from-transparent to-amber-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
