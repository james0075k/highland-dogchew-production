'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════════════
   Utility: smooth spring config
   ═══════════════════════════════════════════════════════════════════════════ */
const SPRING = { stiffness: 60, damping: 20, mass: 0.8 };
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   Paw Accent — decorative brand element
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
   Parallax Image — cinematic scroll-driven zoom + parallax
   ═══════════════════════════════════════════════════════════════════════════ */
function ParallaxImage({
  src,
  alt,
  priority = false,
  direction = 'left',
}: {
  src: string;
  alt: string;
  priority?: boolean;
  direction?: 'left' | 'right';
}) {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useSpring(useTransform(scrollYProgress, [0, 1], [40, -40]), SPRING);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.05, 1]), SPRING);

  return (
    <motion.div
      ref={containerRef}
      className="relative cursor-pointer group"
      initial={prefersReduced ? {} : { opacity: 0, x: direction === 'left' ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 1.2, ease: EASE_EXPO }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Warm shadow frame — offset for depth */}
      <motion.div
        className="absolute -bottom-4 rounded-2xl"
        style={{
          left: direction === 'left' ? -16 : 16,
          right: direction === 'left' ? 16 : -16,
          top: 16,
          background: 'linear-gradient(135deg, rgba(184,151,106,0.25), rgba(184,151,106,0.08))',
          filter: 'blur(2px)',
        }}
        animate={{
          x: isHovered ? (direction === 'left' ? -4 : 4) : 0,
          y: isHovered ? 4 : 0,
        }}
        transition={{ duration: 0.5, ease: EASE_EXPO }}
      />

      {/* Image container */}
      <div className="relative overflow-hidden rounded-2xl" style={{ isolation: 'isolate' }}>
        {/* Parallax + zoom image */}
        <motion.div style={prefersReduced ? {} : { y, scale }}>
          <motion.img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full aspect-[4/3] object-cover"
            style={{ display: 'block', willChange: 'transform' }}
            animate={{
              scale: isHovered ? 1.08 : 1,
              filter: isHovered ? 'brightness(1.08)' : 'brightness(1)',
            }}
            transition={{ duration: 0.8, ease: EASE_EXPO }}
          />
        </motion.div>

        {/* Warm cinematic vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 50%, rgba(46,31,20,0.15) 100%),
              linear-gradient(180deg, transparent 60%, rgba(46,31,20,0.2) 100%)
            `,
          }}
        />

        {/* Gold corner accent — top-left */}
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE_EXPO }}
        >
          <div
            className="absolute top-0 left-0 w-full h-[2px]"
            style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent)' }}
          />
          <div
            className="absolute top-0 left-0 h-full w-[2px]"
            style={{ background: 'linear-gradient(180deg, var(--color-gold), transparent)' }}
          />
        </motion.div>

        {/* Gold corner accent — bottom-right */}
        <motion.div
          className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE_EXPO }}
        >
          <div
            className="absolute bottom-0 right-0 w-full h-[2px]"
            style={{ background: 'linear-gradient(270deg, var(--color-gold), transparent)' }}
          />
          <div
            className="absolute bottom-0 right-0 h-full w-[2px]"
            style={{ background: 'linear-gradient(0deg, var(--color-gold), transparent)' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Parallax Video — autoplay with scroll-driven effects
   ═══════════════════════════════════════════════════════════════════════════ */
function ParallaxVideo({ src }: { src: string }) {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useSpring(useTransform(scrollYProgress, [0, 1], [30, -30]), SPRING);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.03, 1]), SPRING);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      initial={prefersReduced ? {} : { opacity: 0, x: 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 1.2, ease: EASE_EXPO }}
    >
      {/* Shadow frame */}
      <div
        className="absolute -bottom-4 rounded-2xl"
        style={{
          right: -16,
          left: 16,
          top: 16,
          background: 'linear-gradient(135deg, rgba(184,151,106,0.2), rgba(184,151,106,0.05))',
          filter: 'blur(2px)',
        }}
      />

      <div className="relative overflow-hidden rounded-2xl">
        <motion.div style={prefersReduced ? {} : { y, scale }}>
          <video
            ref={videoRef}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full aspect-[4/3] object-cover"
            style={{ display: 'block' }}
          />
        </motion.div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(46,31,20,0.12) 100%)',
          }}
        />

        {/* Play indicator */}
        <motion.div
          className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-none"
          style={{ background: 'rgba(46,31,20,0.6)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1, ease: EASE_EXPO }}
        >
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-[11px] font-medium text-white/90 tracking-wider uppercase">Playing</span>
        </motion.div>

        {/* Gold corner accents */}
        <motion.div
          className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div
            className="absolute top-0 right-0 w-full h-[2px]"
            style={{ background: 'linear-gradient(270deg, var(--color-gold), transparent)' }}
          />
          <div
            className="absolute top-0 right-0 h-full w-[2px]"
            style={{ background: 'linear-gradient(180deg, var(--color-gold), transparent)' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Character-by-character stagger heading
   ═══════════════════════════════════════════════════════════════════════════ */
function StaggerHeading({
  text,
  delay = 0,
  className = '',
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');

  return (
    <span aria-label={text} className={className}>
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
   Horizontal rule with paw
   ═══════════════════════════════════════════════════════════════════════════ */
function GoldDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="flex items-center justify-center gap-4 py-2"
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
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HimalayanStorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Floating decorative paws driven by scroll
  const pawRotate1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 45]), SPRING);
  const pawRotate2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -30]), SPRING);
  const pawY1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -60]), SPRING);
  const pawY2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -40]), SPRING);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 overflow-hidden transition-colors duration-300 md:py-28"
      style={{ background: 'var(--surface-page)' }}
    >
      {/* ── Floating decorative paw prints (scroll-driven) ── */}
      <motion.div
        className="absolute top-24 left-[8%] opacity-[0.06] dark:opacity-[0.04] pointer-events-none hidden lg:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate1, y: pawY1 } : {}}
      >
        <PawAccent className="w-20 h-20 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-[6%] opacity-[0.05] dark:opacity-[0.03] pointer-events-none hidden lg:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate2, y: pawY2 } : {}}
      >
        <PawAccent className="w-14 h-14 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </motion.div>
      <motion.div
        className="absolute top-[55%] left-[3%] opacity-[0.04] dark:opacity-[0.03] pointer-events-none hidden xl:block"
        style={mounted && !prefersReduced ? { y: pawY2, rotate: pawRotate2 } : {}}
      >
        <PawAccent className="w-10 h-10 text-[#2E1F14] dark:text-[#D4BC8E] rotate-45" />
      </motion.div>

      {/* ── Subtle grain texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative px-5 mx-auto max-w-7xl md:px-8">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           SECTION 1 — Handmade By The Himalayan Farmers
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid items-center grid-cols-1 gap-10 mb-24 lg:grid-cols-12 lg:gap-16 md:mb-36">

          {/* Image — takes 7 columns for dramatic width */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            <ParallaxImage
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              alt="Majestic Himalayan mountain landscape where yak milk chews originate"
              priority
              direction="left"
            />
          </div>

          {/* Content — 5 columns */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-3 mb-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
            >
              <div className="h-[1px] w-8" style={{ background: 'var(--color-gold)' }} />
              <span
                className="text-[11px] font-semibold tracking-[0.25em] uppercase"
                style={{ color: 'var(--color-gold)' }}
              >
                Our Heritage
              </span>
            </motion.div>

            {/* Heading */}
            <h2
              className="text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold mb-6 leading-[1.15] tracking-[-0.01em]"
              style={{
                fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                color: 'var(--text-primary)',
              }}
            >
              <StaggerHeading text="Handmade By The Himalayan Farmers" delay={0.1} />
            </h2>

            <GoldDivider />

            {/* Body */}
            <motion.p
              className="text-[15px] md:text-base lg:text-lg leading-[1.8] mt-5"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE_EXPO }}
            >
              Yak milk chews, in tiny bits were first created and consumed as snacks by the Himalayan people decades ago
              as a good source of protein and still do now. We took the same idea and turned it into an all natural long
              lasting hard cheese dog chews — treats for your dog. Made from Yak milk, our yak chews for dogs contain the
              highest protein &amp; calcium content with minimal fat and no chemically binding agents.
            </motion.p>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-3 gap-4 pt-6 mt-8"
              style={{ borderTop: '1px solid var(--border-base)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.7, ease: EASE_EXPO }}
            >
              {[
                { value: '55%+', label: 'Protein' },
                { value: '<5%', label: 'Fat' },
                { value: '100%', label: 'Natural' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1, ease: EASE_EXPO }}
                >
                  <p
                    className="text-2xl font-bold md:text-3xl"
                    style={{
                      fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                      color: 'var(--color-gold)',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           SECTION 2 — What To Do With End Pieces?
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid items-center grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">

          {/* Content — 5 columns */}
          <div className="lg:col-span-5">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-3 mb-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
            >
              <div className="h-[1px] w-8" style={{ background: 'var(--color-gold)' }} />
              <span
                className="text-[11px] font-semibold tracking-[0.25em] uppercase"
                style={{ color: 'var(--color-gold)' }}
              >
                Zero Waste
              </span>
            </motion.div>

            {/* Heading */}
            <h2
              className="text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold mb-6 leading-[1.15] tracking-[-0.01em]"
              style={{
                fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                color: 'var(--text-primary)',
              }}
            >
              <StaggerHeading text="What To Do With End Pieces?" delay={0.08} />
            </h2>

            <GoldDivider />

            {/* Body */}
            <motion.p
              className="text-[15px] md:text-base lg:text-lg leading-[1.8] mt-5"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.9, delay: 0.45, ease: EASE_EXPO }}
            >
              Maximize every penny of your purchase by ensuring nothing goes to waste! Instead of discarding the end pieces,
              you can transform them into a fantastic treat for your dog. Simply wash the piece, soak it in hot water, and
              pat it dry before microwaving it for about 45 seconds until it puffs up. Once it has{' '}
              <span className="font-bold" style={{ color: 'var(--color-gold-hover)' }}>COOLED</span>{' '}
              completely for your pet&apos;s safety, your dog can enjoy a perfectly smoky and crunchy snack.
            </motion.p>

            {/* Numbered steps — refined with stagger */}
            <div className="mt-8 space-y-0">
              {[
                { label: 'Wash & soak in hot water',    sub: 'Prepare the end piece' },
                { label: 'Pat dry, then microwave 45s',  sub: 'Until it puffs up nicely' },
                { label: 'Let it cool completely',       sub: 'Safety first for your pup' },
                { label: 'Watch them enjoy!',            sub: 'Perfectly smoky & crunchy snack' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4 py-3 group"
                  style={{ borderBottom: i < 3 ? '1px solid var(--border-base)' : 'none' }}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.55 + i * 0.12,
                    ease: EASE_EXPO,
                  }}
                >
                  {/* Step number */}
                  <motion.div
                    className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white rounded-full w-9 h-9"
                    style={{ background: 'linear-gradient(135deg, #B8976A, #9A7B52)' }}
                    initial={{ scale: 0, rotate: -90 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + i * 0.12,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    {i + 1}
                  </motion.div>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold md:text-base" style={{ color: 'var(--text-primary)' }}>
                      {step.label}
                    </p>
                    <p className="text-xs md:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {step.sub}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Video — 7 columns */}
          <div className="lg:col-span-7">
            <ParallaxVideo src="/videos/video4new.mp4" />
          </div>
        </div>

      </div>
    </section>
  );
}
