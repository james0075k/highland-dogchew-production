'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, BadgeCheck, Leaf, Award, MapPin, Stethoscope, Timer } from 'lucide-react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════════════
   Shared constants — matching HimalayanStorySection
   ═══════════════════════════════════════════════════════════════════════════ */
const SPRING = { stiffness: 60, damping: 20, mass: 0.8 };
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   Paw Accent — brand decorative element
   ═══════════════════════════════════════════════════════════════════════════ */
function PawAccent({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="7.5" cy="7" rx="2.5" ry="3" />
      <ellipse cx="16.5" cy="7" rx="2.5" ry="3" />
      <ellipse cx="4" cy="13" rx="2" ry="2.5" />
      <ellipse cx="20" cy="13" rx="2" ry="2.5" />
      <path d="M12 22c-4 0-7-3.5-7-6 0-2.5 3-5 7-5s7 2.5 7 5c0 2.5-3 6-7 6z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Gold Divider with animated paw
   ═══════════════════════════════════════════════════════════════════════════ */
function GoldDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="flex items-center justify-center gap-4 py-3"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="h-[1px] w-12 md:w-20"
        style={{ transformOrigin: 'right', background: 'linear-gradient(90deg, transparent, var(--color-gold))' }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE_EXPO }}
      />
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <PawAccent className="text-[#B8976A] dark:text-[#D4BC8E]" />
      </motion.div>
      <motion.div
        className="h-[1px] w-12 md:w-20"
        style={{ transformOrigin: 'left', background: 'linear-gradient(270deg, transparent, var(--color-gold))' }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE_EXPO }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Character stagger heading
   ═══════════════════════════════════════════════════════════════════════════ */
function StaggerHeading({ text, delay = 0 }: { text: string; delay?: number }) {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');

  return (
    <span aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block" style={{ marginRight: wi < words.length - 1 ? '0.3em' : 0 }}>
          {word.split('').map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={prefersReduced ? {} : { opacity: 0, y: 30, rotateX: -40 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.5,
                delay: delay + (wi * word.length + ci) * 0.025,
                ease: EASE_EXPO,
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Quote SVG — elegant open-quote mark
   ═══════════════════════════════════════════════════════════════════════════ */
function QuoteMark({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 48" fill="currentColor">
      <path d="M14 28c-1.1 0-2-.9-2-2 0-6 4-12 10-14l1 2c-4 2-6 5-6 8h5c1.7 0 3 1.3 3 3v5c0 1.7-1.3 3-3 3h-8zm18 0c-1.1 0-2-.9-2-2 0-6 4-12 10-14l1 2c-4 2-6 5-6 8h5c1.7 0 3 1.3 3 3v5c0 1.7-1.3 3-3 3h-8z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */
interface Testimonial {
  _id: string;
  name: string;
  position?: string;
  location?: string;
  rating: number;
  message: string;
  profileImage?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */
const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  /* ── Scroll-driven floating paws ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const pawRotate1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 35]), SPRING);
  const pawRotate2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -25]), SPRING);
  const pawY1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50]), SPRING);
  const pawY2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -35]), SPRING);
  const pawRotate3 = useSpring(useTransform(scrollYProgress, [0, 1], [15, -20]), SPRING);
  const pawY3 = useSpring(useTransform(scrollYProgress, [0, 1], [10, -45]), SPRING);

  useEffect(() => { setMounted(true); }, []);

  /* ── Fetch ── */
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

  /* ── Navigation ── */
  const goTo = useCallback((idx: number, dir: 'left' | 'right') => {
    setDirection(dir);
    setCurrentIndex(idx);
  }, []);

  const next = useCallback(() => {
    if (testimonials.length === 0) return;
    goTo((currentIndex + 1) % testimonials.length, 'right');
  }, [currentIndex, testimonials.length, goTo]);

  const prev = useCallback(() => {
    if (testimonials.length === 0) return;
    goTo((currentIndex - 1 + testimonials.length) % testimonials.length, 'left');
  }, [currentIndex, testimonials.length, goTo]);

  /* ── Auto-play ── */
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const pauseAutoPlay = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resumeAutoPlay = () => { timerRef.current = setInterval(next, 5000); };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <section ref={sectionRef} className="w-full py-20 px-6" style={{ background: 'var(--surface-page)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="h-3 w-48 bg-amber-200/40 dark:bg-amber-800/30 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-80 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl mx-auto mb-4 animate-pulse" />
          </div>
          <div className="rounded-3xl bg-white/60 dark:bg-[#1e1610]/60 border border-[#2E1F14]/5 dark:border-[#3a2c23] p-16 animate-pulse">
            <div className="flex justify-center gap-1 mb-8">
              {[1,2,3,4,5].map((s) => <div key={s} className="w-6 h-6 rounded bg-amber-100/60 dark:bg-amber-900/30" />)}
            </div>
            <div className="space-y-3 max-w-2xl mx-auto mb-12">
              {[100, 92, 78].map((w, i) => (
                <div key={i} className="h-4 rounded mx-auto" style={{ width: `${w}%`, background: 'var(--border-base)' }} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-amber-100/50 dark:bg-amber-900/30" />
              <div className="h-4 w-32 rounded" style={{ background: 'var(--border-base)' }} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return <section ref={sectionRef} />;

  const t = testimonials[currentIndex];

  /* ── Slide animation variants ── */
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -80 : 80,
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-28 px-6 overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--surface-page)' }}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* ── Floating decorative paw prints (scroll-driven) ── */}
      <motion.div
        className="absolute top-20 left-[6%] opacity-[0.05] dark:opacity-[0.03] pointer-events-none hidden lg:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate1, y: pawY1 } : {}}
      >
        <PawAccent className="w-16 h-16 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </motion.div>
      <motion.div
        className="absolute bottom-24 right-[5%] opacity-[0.04] dark:opacity-[0.025] pointer-events-none hidden lg:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate2, y: pawY2 } : {}}
      >
        <PawAccent className="w-12 h-12 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </motion.div>
      <motion.div
        className="absolute top-[45%] right-[8%] opacity-[0.04] dark:opacity-[0.025] pointer-events-none hidden xl:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate3, y: pawY3 } : {}}
      >
        <PawAccent className="w-10 h-10 text-[#2E1F14] dark:text-[#D4BC8E] -rotate-12" />
      </motion.div>
      <motion.div
        className="absolute bottom-[35%] left-[4%] opacity-[0.035] dark:opacity-[0.02] pointer-events-none hidden xl:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate1, y: pawY2 } : {}}
      >
        <PawAccent className="w-8 h-8 text-[#2E1F14] dark:text-[#D4BC8E] rotate-45" />
      </motion.div>

      {/* ── Grain texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-5"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE_EXPO }}
          >
            <div className="h-[1px] w-8" style={{ background: 'var(--color-gold)' }} />
            <span
              className="text-[11px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Trusted by Dog Owners Across the UK
            </span>
            <div className="h-[1px] w-8" style={{ background: 'var(--color-gold)' }} />
          </motion.div>

          {/* Heading */}
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-[1.15] tracking-[-0.01em]"
            style={{
              fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
              color: 'var(--text-primary)',
            }}
          >
            <StaggerHeading text="What Our Customers Say" delay={0.08} />
          </h2>

          <GoldDivider />
        </div>

        {/* ── Testimonial Card ── */}
        <div className="relative">
          {/* Decorative quote mark */}
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <QuoteMark className="w-14 h-14 drop-shadow-md" style={{ color: 'var(--color-gold-light)' }} />
          </motion.div>

          {/* Card with gold corner accents */}
          <motion.div
            className="relative rounded-3xl overflow-hidden mt-8"
            style={{
              background: 'linear-gradient(145deg, rgba(255,253,248,0.95), rgba(255,253,248,0.85))',
              boxShadow: '0 8px 40px rgba(46,31,20,0.08), 0 1px 3px rgba(46,31,20,0.04)',
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1, ease: EASE_EXPO }}
          >
            {/* Dark mode override */}
            <div className="absolute inset-0 bg-[#1e1610] opacity-0 dark:opacity-100 rounded-3xl" />

            {/* Top gold accent line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] z-10"
              style={{ background: 'linear-gradient(90deg, transparent 5%, var(--color-gold) 50%, transparent 95%)' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: EASE_EXPO }}
            />

            {/* Gold corner accents */}
            <motion.div
              className="absolute top-0 left-0 w-20 h-20 pointer-events-none z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent)' }} />
              <div className="absolute top-0 left-0 h-full w-[2px]" style={{ background: 'linear-gradient(180deg, var(--color-gold), transparent)' }} />
            </motion.div>
            <motion.div
              className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="absolute bottom-0 right-0 w-full h-[2px]" style={{ background: 'linear-gradient(270deg, var(--color-gold), transparent)' }} />
              <div className="absolute bottom-0 right-0 h-full w-[2px]" style={{ background: 'linear-gradient(0deg, var(--color-gold), transparent)' }} />
            </motion.div>

            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-transparent dark:from-amber-900/5 dark:to-transparent pointer-events-none rounded-3xl" />

            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-[#2E1F14]/6 dark:border-[#3a2c23]" />

            {/* Animated content */}
            <div className="relative z-10 px-8 md:px-16 lg:px-20 py-14 md:py-18 min-h-[340px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: EASE_EXPO }}
                  className="w-full text-center"
                >
                  {/* Stars */}
                  <div className="flex justify-center gap-1.5 mb-7">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, scale: 0, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: s * 0.06,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= t.rating
                              ? 'text-[#B8976A] fill-[#B8976A]'
                              : 'text-gray-200 fill-gray-200 dark:text-gray-700 dark:fill-gray-700'
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote text */}
                  <p
                    className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-12 max-w-3xl mx-auto italic font-light"
                    style={{
                      fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    &ldquo;{t.message}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {/* Gold ring glow */}
                      <motion.div
                        className="absolute -inset-1.5 rounded-full"
                        style={{ background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-light))' }}
                        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      {t.profileImage ? (
                        <Image
                          src={t.profileImage}
                          alt={t.name}
                          width={72}
                          height={72}
                          className="relative rounded-full object-cover border-3 border-white dark:border-[#2a1f18] shadow-lg"
                        />
                      ) : (
                        <div
                          className="relative w-18 h-18 rounded-full flex items-center justify-center border-3 border-white dark:border-[#2a1f18] shadow-lg"
                          style={{
                            width: 72,
                            height: 72,
                            background: 'linear-gradient(135deg, #B8976A, #9A7B52)',
                          }}
                        >
                          <span className="text-white font-bold text-2xl">{t.name?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center mt-1">
                      <p
                        className="text-lg font-bold tracking-wide"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {t.name}
                      </p>
                      <p className="text-sm font-medium italic mt-0.5" style={{ color: 'var(--color-gold)' }}>
                        {t.position}{t.location ? ` · ${t.location}` : ''}
                      </p>
                    </div>

                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full border"
                      style={{
                        color: 'var(--color-gold-hover)',
                        borderColor: 'var(--color-gold-light)',
                        background: 'rgba(184,151,106,0.06)',
                      }}
                    >
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified Customer
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-md transition-all duration-300 hover:scale-110 backdrop-blur-sm border"
                  style={{
                    background: 'rgba(255,253,248,0.9)',
                    borderColor: 'var(--color-gold-light)',
                    color: 'var(--color-gold-hover)',
                  }}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-md transition-all duration-300 hover:scale-110 backdrop-blur-sm border"
                  style={{
                    background: 'rgba(255,253,248,0.9)',
                    borderColor: 'var(--color-gold-light)',
                    color: 'var(--color-gold-hover)',
                  }}
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>

          {/* Dot indicators */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2.5 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx, idx > currentIndex ? 'right' : 'left')}
                  className="transition-all duration-500 rounded-full"
                  style={{
                    width: idx === currentIndex ? 32 : 10,
                    height: 10,
                    background: idx === currentIndex
                      ? 'linear-gradient(90deg, #B8976A, #9A7B52)'
                      : 'rgba(46,31,20,0.12)',
                  }}
                  aria-label={`Testimonial ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Trust badges ── */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_EXPO }}
        >
          {[
            { Icon: Leaf, text: 'Natural Ingredients' },
            { Icon: Award, text: '5-Star Rated' },
            { Icon: MapPin, text: 'UK Dog Owners' },
            { Icon: Stethoscope, text: 'Vet Approved' },
            { Icon: Timer, text: 'Long-Lasting' },
          ].map(({ Icon, text }, i) => (
            <motion.div
              key={text}
              className="flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm border"
              style={{
                background: 'rgba(255,253,248,0.6)',
                borderColor: 'var(--color-gold-light)',
              }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: EASE_EXPO }}
              whileHover={{ y: -2, scale: 1.03 }}
            >
              <Icon className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
              <span className="font-medium text-xs tracking-wide" style={{ color: 'var(--text-secondary)' }}>{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Bottom decorative ── */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="h-[1px] w-14" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-light))' }} />
          <PawAccent className="w-4 h-4 text-[#B8976A] dark:text-[#D4BC8E]" />
          <div className="h-[1px] w-14" style={{ background: 'linear-gradient(270deg, transparent, var(--color-gold-light))' }} />
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;
