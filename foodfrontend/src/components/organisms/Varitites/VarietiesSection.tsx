'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type Variety = {
  _id: string;
  name: string;
  image: string;
  isActive: boolean;
  category: string;
  description?: string;
  displayOrder?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

/* ═══════════════════════════════════════════════
   SVG DECORATIONS
   ═══════════════════════════════════════════════ */
function PawSvg({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor">
      <ellipse cx="24" cy="32" rx="10" ry="9" />
      <ellipse cx="13" cy="20" rx="5" ry="6" transform="rotate(-10 13 20)" />
      <ellipse cx="23" cy="14" rx="4.5" ry="6" />
      <ellipse cx="33" cy="17" rx="5" ry="6" transform="rotate(12 33 17)" />
      <ellipse cx="39" cy="26" rx="4" ry="5.5" transform="rotate(25 39 26)" />
    </svg>
  );
}

function BoneDivider({ className = '' }: { className?: string }) {
  return (
    <svg className={`mx-auto ${className}`} width="100" height="20" viewBox="0 0 100 20" fill="none">
      <circle cx="10" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="7.5" width="72" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="90" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="90" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function StitchCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const p: Record<string, string> = {
    tl: 'top-2.5 left-2.5 rotate-0',
    tr: 'top-2.5 right-2.5 rotate-90',
    bl: 'bottom-2.5 left-2.5 -rotate-90',
    br: 'bottom-2.5 right-2.5 rotate-180',
  };
  return (
    <svg className={`absolute ${p[pos]} text-[#B8976A]/40 dark:text-[#D4BC8E]/25`} width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 16 L2 2 L16 2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" className="animate-stitch-slow" />
    </svg>
  );
}

function StitchLine({ className = '' }: { className?: string }) {
  return (
    <svg className={`mx-auto ${className}`} width="120" height="4" viewBox="0 0 120 4" fill="none">
      <path d="M0 2 L120 2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 5" strokeLinecap="round" className="animate-stitch" />
    </svg>
  );
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Flavor accent colors ── */
const accentMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Blueberry:  { bg: 'bg-indigo-500/10 dark:bg-indigo-400/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20 dark:border-indigo-400/15', gradient: 'from-indigo-950/50 via-indigo-900/20 to-black/50' },
  Strawberry: { bg: 'bg-rose-500/10 dark:bg-rose-400/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20 dark:border-rose-400/15', gradient: 'from-rose-950/50 via-rose-900/20 to-black/50' },
  Pumpkin:    { bg: 'bg-orange-500/10 dark:bg-orange-400/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20 dark:border-orange-400/15', gradient: 'from-orange-950/50 via-orange-900/20 to-black/50' },
  Honey:      { bg: 'bg-amber-500/10 dark:bg-amber-400/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20 dark:border-amber-400/15', gradient: 'from-amber-950/50 via-amber-900/20 to-black/50' },
};
const getAccent = (name: string) => accentMap[name] || { bg: 'bg-[#B8976A]/10', text: 'text-[#B8976A] dark:text-[#D4BC8E]', border: 'border-[#B8976A]/20 dark:border-[#D4BC8E]/15', gradient: 'from-gray-950/50 via-gray-900/20 to-black/50' };

/* ═══════════════════════════════════════════════
   DESKTOP VARIETY CARD
   ═══════════════════════════════════════════════ */
function VarietyCard({ variety, index, onClick, prefersReduced }: { variety: Variety; index: number; onClick: () => void; prefersReduced: boolean | null }) {
  const [hovered, setHovered] = useState(false);
  const accent = getAccent(variety.name);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-2xl dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-400"
      style={{ aspectRatio: '3 / 4' }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px', amount: 0.1 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <Image
        src={variety.image || '/placeholder.jpg'}
        alt={variety.name}
        fill
        className="object-cover"
        style={{
          transform: hovered && !prefersReduced ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.6s ease-out',
        }}
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${accent.gradient} transition-opacity duration-500`}
        style={{ opacity: hovered ? 0.85 : 0.6 }}
      />

      {/* stitch corners */}
      <div className="absolute inset-0">
        <StitchCorner pos="tl" />
        <StitchCorner pos="br" />
      </div>

      {/* paw watermark */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500">
        <PawSvg className="w-10 h-10 text-white" />
      </div>

      {/* top label */}
      <div className="absolute top-5 left-5 right-5 z-10">
        <p className="text-white/60 text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          {variety.category || 'Special Variety'}
        </p>
        <h3 className="text-white text-[24px] leading-tight drop-shadow-md" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          {variety.name}
        </h3>
      </div>

      {/* description overlay */}
      {variety.description && (
        <div className="absolute left-5 right-5 bottom-16 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <p className="text-white/70 text-[13px] leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
            {variety.description}
          </p>
        </div>
      )}

      {/* CTA button */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 flex transition-all duration-400 ease-out z-10"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(14px)',
        }}
      >
        <button className="flex-1 h-11 bg-gradient-to-r from-[#B8976A] to-[#9A7B52] hover:from-[#9A7B52] hover:to-[#7A5C4F] text-white text-[11px] font-semibold tracking-[0.16em] uppercase flex items-center justify-center rounded-xl shadow-lg transition-all duration-300" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          Buy Product
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MOBILE VARIETY CARD
   ═══════════════════════════════════════════════ */
function MobileVarietyCard({ variety, onClick }: { variety: Variety; onClick: () => void }) {
  const accent = getAccent(variety.name);

  return (
    <div onClick={onClick} className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer" style={{ aspectRatio: '3 / 4' }}>
      <Image src={variety.image || '/placeholder.jpg'} alt={variety.name} fill className="object-cover" />
      <div className={`absolute inset-0 bg-gradient-to-b ${accent.gradient} opacity-65`} />

      <StitchCorner pos="tl" />
      <StitchCorner pos="br" />

      <div className="absolute top-5 left-5 right-5 z-10">
        <p className="text-white/60 text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          {variety.category || 'Special Variety'}
        </p>
        <h3 className="text-white text-[24px] leading-tight drop-shadow-md" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          {variety.name}
        </h3>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button className="w-full h-11 bg-gradient-to-r from-[#B8976A] to-[#9A7B52] text-white text-[11px] font-semibold tracking-[0.16em] uppercase rounded-xl shadow-lg transition-colors" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          Buy Product
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════ */
function VarietySkeleton() {
  return (
    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl bg-[var(--surface-card)] dark:bg-[#1f1812] border border-[var(--border-base)]/30 animate-pulse" style={{ aspectRatio: '3 / 4' }}>
          <div className="h-full w-full bg-[var(--border-base)]/20 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════ */
const VarietiesSection = () => {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayFade = useTransform(scrollYProgress, [0, 0.7], [0.3, 0.6]);

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        const res = await fetch(`${API_BASE}/variety`);
        const result = await res.json();
        if (result?.success) {
          setVarieties(
            (result.data || [])
              .filter((v: Variety) => v.isActive)
              .sort((a: Variety, b: Variety) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          );
        }
      } catch (err) {
        // Soft-fail: the section just renders empty / skeleton if the API is
        // unreachable. Warn (not error) so Next's dev overlay doesn't pop up
        // for an expected offline-backend state.
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[VarietiesSection] varieties fetch failed:', (err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVarieties();
  }, []);

  const handleViewVariety = (id: string) => router.push(`/variety/${id}`);
  const maxIndex = Math.max(0, varieties.length - 1);
  const nextSlide = () => setCurrentIndex(p => Math.min(p + 1, maxIndex));
  const prevSlide = () => setCurrentIndex(p => Math.max(p - 1, 0));

  /* ── Touch swipe state ── */
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = true;
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    touchEndX.current = e.touches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    // Limit swipe offset and add resistance at edges
    const atStart = currentIndex === 0 && diff > 0;
    const atEnd = currentIndex === maxIndex && diff < 0;
    const resistance = (atStart || atEnd) ? 0.25 : 1;
    setSwipeOffset(diff * resistance);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    const diff = touchEndX.current - touchStartX.current;
    const threshold = 50;
    if (diff < -threshold) {
      nextSlide();
    } else if (diff > threshold) {
      prevSlide();
    }
    setSwipeOffset(0);
  };

  return (
    <section className="w-full bg-[var(--surface-page)] transition-colors duration-300 pt-0 md:pt-0 lg:pt-0">

      {/* ═══════ HERO ═══════ */}
      <div ref={heroRef} className="relative w-full h-[50vh] md:h-[62vh] overflow-hidden mt-16">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <Image src="/images/dog-11.jpeg" alt="Dogs enjoying Highland Yak Chew varieties" fill className="object-cover" />
        </motion.div>
        <motion.div className="absolute inset-0 bg-[#1a1410]" style={{ opacity: overlayFade }} />

        {/* paw silhouettes */}
        {[
          { left: '8%', top: '22%', size: 'w-9 h-9', rot: '-18deg', op: '0.06' },
          { left: '88%', top: '30%', size: 'w-11 h-11', rot: '20deg', op: '0.05' },
          { left: '72%', top: '65%', size: 'w-7 h-7', rot: '-30deg', op: '0.07' },
        ].map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: Number(p.op), scale: 1 }} transition={{ duration: 1.2, delay: 0.5 + i * 0.25 }} className={`absolute ${p.size} text-white pointer-events-none`} style={{ left: p.left, top: p.top, transform: `rotate(${p.rot})` }}>
            <PawSvg className="w-full h-full" />
          </motion.div>
        ))}

        {/* stitch accent */}
        <div className="absolute top-8 left-6 md:top-12 md:left-12 opacity-30">
          <StitchLine className="text-white/50" />
        </div>

        {/* text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="flex items-center gap-3 mb-4">
            <PawSvg className="w-4 h-4 text-[#D4BC8E]" />
            <span className="text-[12px] font-semibold tracking-[0.25em] uppercase text-[#D4BC8E]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Flavour Collection</span>
            <PawSvg className="w-4 h-4 text-[#D4BC8E] scale-x-[-1]" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="text-center text-white text-[30px] md:text-[46px] lg:text-[54px] tracking-[0.06em] leading-tight" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            Our Special Varieties
          </motion.h1>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.6 }} className="mt-4 h-px w-28 md:w-40 bg-[#D4BC8E] origin-center" />

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }} className="mt-5 text-center text-white/75 text-[15px] md:text-[17px] max-w-lg" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
            Discover our range of naturally flavoured yak chews — crafted with care, loved by dogs
          </motion.p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--surface-page)] to-transparent" />
      </div>

      {/* ═══════ INTRO ═══════ */}
      <FadeUp className="max-w-3xl mx-auto px-6 py-10 md:py-14 text-center relative">
        <StitchCorner pos="tl" />
        <StitchCorner pos="tr" />
        <StitchCorner pos="bl" />
        <StitchCorner pos="br" />

        <p className="text-[var(--text-secondary)] text-[18px] md:text-[22px] leading-relaxed transition-colors duration-300" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
          Each variety is infused with natural flavours that dogs love — from sweet blueberry to rich honey. Same long-lasting chew, same natural ingredients, with an irresistible twist.
        </p>
      </FadeUp>

      {/* ═══════ BONE DIVIDER ═══════ */}
      <FadeUp className="flex justify-center pb-8">
        <BoneDivider className="text-[var(--border-base)] w-28 md:w-36" />
      </FadeUp>

      {/* ═══════ VARIETY GRID ═══════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">

        {loading ? (
          <VarietySkeleton />
        ) : varieties.length === 0 ? (
          <FadeUp className="text-center py-20">
            <PawSvg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
            <p className="text-[var(--text-secondary)] text-[18px]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
              New varieties coming soon
            </p>
          </FadeUp>
        ) : (
          <>
            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {varieties.map((variety, index) => (
                <VarietyCard key={variety._id} variety={variety} index={index} onClick={() => handleViewVariety(variety._id)} prefersReduced={prefersReduced} />
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden">
              <div
                className="relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex ease-out"
                  style={{
                    transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))`,
                    transition: isSwiping.current ? 'none' : 'transform 500ms ease-out',
                  }}
                >
                  {varieties.map(variety => (
                    <div key={variety._id} className="min-w-full px-1">
                      <MobileVarietyCard variety={variety} onClick={() => handleViewVariety(variety._id)} />
                    </div>
                  ))}
                </div>

                {currentIndex > 0 && (
                  <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-[#1f1812]/80 hover:bg-white dark:hover:bg-[#1f1812] text-[var(--text-primary)] rounded-full shadow-md flex items-center justify-center z-10 transition-all duration-200 ring-1 ring-black/5 dark:ring-white/10" aria-label="Previous variety">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {currentIndex < maxIndex && (
                  <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-[#1f1812]/80 hover:bg-white dark:hover:bg-[#1f1812] text-[var(--text-primary)] rounded-full shadow-md flex items-center justify-center z-10 transition-all duration-200 ring-1 ring-black/5 dark:ring-white/10" aria-label="Next variety">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {varieties.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentIndex
                        ? 'w-8 h-2.5 bg-[#B8976A] dark:bg-[#D4BC8E]'
                        : 'w-2.5 h-2.5 bg-[var(--border-base)] hover:bg-[#B8976A]/50'
                    }`}
                    aria-label={`Go to variety ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══════ DOG PHOTO STRIP ═══════ */}
      <FadeUp className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {['/images/dog-9.jpeg', '/images/dog-20.jpeg', '/images/dog-31.jpeg'].map((src, i) => (
            <motion.div key={src} initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }} className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
              <Image src={src} alt="Dog enjoying flavoured yak chew" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-25 transition-opacity duration-500">
                <PawSvg className="w-7 h-7 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </FadeUp>

      {/* ═══════ CTA ═══════ */}
      <FadeUp delay={0.1} className="py-10 md:py-14 text-center px-6">
        <h3 className="text-[var(--text-primary)] text-[22px] md:text-[28px] tracking-[0.04em] mb-4 transition-colors duration-300" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          Find Your Dog&apos;s Favourite
        </h3>
        <p className="text-[var(--text-muted)] text-[15px] md:text-[17px] max-w-md mx-auto mb-8 transition-colors duration-300" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
          Not sure which flavour to try? Browse our full range and let your pup decide.
        </p>
        <motion.a href="/products" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block bg-gradient-to-r from-[#B8976A] to-[#9A7B52] hover:from-[#9A7B52] hover:to-[#7A5C4F] text-white text-[13px] tracking-[0.18em] uppercase px-8 py-3.5 rounded-full shadow-md transition-all duration-300" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          Shop All Products
        </motion.a>
      </FadeUp>

      {/* ═══════ STYLES ═══════ */}
      <style jsx global>{`
        @keyframes stitch-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 22; }
        }
        .animate-stitch {
          animation: stitch-dash 1.8s linear infinite;
        }
        .animate-stitch-slow {
          animation: stitch-dash 3s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default VarietiesSection;
