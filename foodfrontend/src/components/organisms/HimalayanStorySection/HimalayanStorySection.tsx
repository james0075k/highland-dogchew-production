'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

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

/* Parallax Image — single useTransform, no spring, CSS-driven hover */
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <motion.div
      ref={containerRef}
      className="relative group"
      initial={prefersReduced ? false : { opacity: 0, x: direction === 'left' ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.9, ease: EASE_EXPO }}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Static shadow frame (CSS-only) */}
      <div
        className="absolute -bottom-4 rounded-2xl transition-transform duration-500 ease-out group-hover:translate-y-1"
        style={{
          left: direction === 'left' ? -16 : 16,
          right: direction === 'left' ? 16 : -16,
          top: 16,
          background: 'linear-gradient(135deg, rgba(184,151,106,0.25), rgba(184,151,106,0.08))',
          filter: 'blur(2px)',
        }}
      />

      <div className="relative overflow-hidden rounded-2xl">
        <motion.img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full aspect-[4/3] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={prefersReduced ? { display: 'block' } : { display: 'block', y, willChange: 'transform' }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(46,31,20,0.15) 100%), linear-gradient(180deg, transparent 60%, rgba(46,31,20,0.2) 100%)',
          }}
        />

        {/* Static gold corner accents (no per-element animation) */}
        <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent)' }} />
          <div className="absolute top-0 left-0 h-full w-[2px]" style={{ background: 'linear-gradient(180deg, var(--color-gold), transparent)' }} />
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-[2px]" style={{ background: 'linear-gradient(270deg, var(--color-gold), transparent)' }} />
          <div className="absolute bottom-0 right-0 h-full w-[2px]" style={{ background: 'linear-gradient(0deg, var(--color-gold), transparent)' }} />
        </div>
      </div>
    </motion.div>
  );
}

/* Click-to-play video — poster shown by default. The 66MB MP4 is NOT fetched
   until the user actually clicks play, cutting homepage page weight massively. */
function ParallaxVideo({ src, poster }: { src: string; poster: string }) {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const [activated, setActivated] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [25, -25]);

  const handlePlay = () => {
    setActivated(true);
    // Defer play until the <video> is mounted in the next paint
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      initial={prefersReduced ? false : { opacity: 0, x: 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.9, ease: EASE_EXPO }}
      style={{ willChange: 'transform, opacity' }}
    >
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
        {activated ? (
          <motion.video
            ref={videoRef}
            src={src}
            poster={poster}
            loop
            muted
            playsInline
            controls
            preload="none"
            className="w-full aspect-[4/3] object-cover"
            style={prefersReduced ? { display: 'block' } : { display: 'block', y, willChange: 'transform' }}
          />
        ) : (
          <motion.button
            type="button"
            onClick={handlePlay}
            aria-label="Play video"
            className="block w-full aspect-[4/3] relative group/play cursor-pointer"
            style={prefersReduced ? {} : { y, willChange: 'transform' }}
          >
            <img
              src={poster}
              alt="Yak chew end-piece transformation video preview"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/play:scale-[1.03]"
            />
            {/* Centered play button */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full backdrop-blur-md transition-transform duration-300 group-hover/play:scale-110"
                style={{ background: 'rgba(255,255,255,0.85)' }}
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-9 md:h-9 ml-1" fill="#2E1F14">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
            <span
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(46,31,20,0.25) 100%)' }}
            />
          </motion.button>
        )}

        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-[2px]" style={{ background: 'linear-gradient(270deg, var(--color-gold), transparent)' }} />
          <div className="absolute top-0 right-0 h-full w-[2px]" style={{ background: 'linear-gradient(180deg, var(--color-gold), transparent)' }} />
        </div>
      </div>
    </motion.div>
  );
}

/* Heading reveal — single block fade-up (replaces per-char stagger) */
function HeadingReveal({ text, className = '' }: { text: string; className?: string }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE_EXPO }}
    >
      {text}
    </motion.span>
  );
}

function GoldDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="flex items-center justify-center gap-4 py-2"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : undefined}
      transition={{ duration: 0.6 }}
    >
      <div className="h-[1px] w-12 md:w-20" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold))' }} />
      <PawAccent className="text-[#B8976A] dark:text-[#D4BC8E]" />
      <div className="h-[1px] w-12 md:w-20" style={{ background: 'linear-gradient(270deg, transparent, var(--color-gold))' }} />
    </motion.div>
  );
}

export default function HimalayanStorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 overflow-hidden transition-colors duration-300 md:py-28"
      style={{ background: 'var(--surface-page)' }}
    >
      {/* Static decorative paws (no scroll-driven RAF) */}
      <div className="absolute top-24 left-[8%] opacity-[0.06] dark:opacity-[0.04] pointer-events-none hidden lg:block">
        <PawAccent className="w-20 h-20 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </div>
      <div className="absolute bottom-32 right-[6%] opacity-[0.05] dark:opacity-[0.03] pointer-events-none hidden lg:block">
        <PawAccent className="w-14 h-14 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </div>

      <div className="relative px-5 mx-auto max-w-7xl md:px-8">

        {/* SECTION 1 — Handmade By The Himalayan Farmers */}
        <div className="grid items-center grid-cols-1 gap-10 mb-24 lg:grid-cols-12 lg:gap-16 md:mb-36">

          <div className="order-2 lg:order-1 lg:col-span-7">
            <ParallaxImage
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              alt="Majestic Himalayan mountain landscape where yak milk chews originate"
              priority
              direction="left"
            />
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5">
            <motion.div
              className="flex items-center gap-3 mb-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE_EXPO }}
            >
              <div className="h-[1px] w-8" style={{ background: 'var(--color-gold)' }} />
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: 'var(--color-gold)' }}>
                Our Heritage
              </span>
            </motion.div>

            <h2
              className="text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold mb-6 leading-[1.15] tracking-[-0.01em]"
              style={{ fontFamily: 'var(--font-antique-serif), DM Serif Display, serif', color: 'var(--text-primary)' }}
            >
              <HeadingReveal text="Handmade By The Himalayan Farmers" />
            </h2>

            <GoldDivider />

            <motion.p
              className="text-[15px] md:text-base lg:text-lg leading-[1.8] mt-5"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE_EXPO }}
            >
              Yak milk chews, in tiny bits were first created and consumed as snacks by the Himalayan people decades ago
              as a good source of protein and still do now. We took the same idea and turned it into an all natural long
              lasting hard cheese dog chews — treats for your dog. Made from Yak milk, our yak chews for dogs contain the
              highest protein &amp; calcium content with minimal fat and no chemically binding agents.
            </motion.p>

            <motion.div
              className="grid grid-cols-2 gap-3 pt-6 mt-8 sm:grid-cols-4"
              style={{ borderTop: '1px solid var(--border-base)' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE_EXPO }}
            >
              {[
                {
                  value: '55%+', label: 'Protein', featured: false,
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.698-1.338 2.698H4.136c-1.368 0-2.337-1.698-1.338-2.698L4 15.3" />
                    </svg>
                  ),
                },
                {
                  value: '<5%', label: 'Fat', featured: false,
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                    </svg>
                  ),
                },
                {
                  value: '100%', label: 'Natural', featured: false,
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  ),
                },
                {
                  value: 'High', label: 'Calcium', featured: true,
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={
                    'group/stat relative flex flex-col items-center justify-center gap-2 ' +
                    'aspect-square p-3 sm:p-4 rounded-2xl text-center overflow-hidden cursor-default ' +
                    'border transition-[border-color,box-shadow,transform,background] duration-300 ease-out ' +
                    'hover:-translate-y-0.5 ' +
                    (stat.featured
                      ? 'border-[rgba(184,151,106,0.45)] bg-[linear-gradient(135deg,rgba(184,151,106,0.18)_0%,rgba(184,151,106,0.06)_100%)] shadow-[0_4px_18px_-8px_rgba(184,151,106,0.45)] hover:shadow-[0_10px_28px_-10px_rgba(184,151,106,0.65)] hover:border-[rgba(184,151,106,0.7)]'
                      : 'border-[rgba(184,151,106,0.18)] bg-[linear-gradient(135deg,rgba(184,151,106,0.06)_0%,rgba(184,151,106,0.01)_100%)] hover:border-[rgba(184,151,106,0.45)] hover:bg-[linear-gradient(135deg,rgba(184,151,106,0.14)_0%,rgba(184,151,106,0.04)_100%)] hover:shadow-[0_8px_24px_-10px_rgba(184,151,106,0.4)]')
                  }
                >
                  {stat.featured && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(184,151,106,0.22) 0%, transparent 70%)' }}
                    />
                  )}

                  <span
                    className="relative transition-transform duration-300 group-hover/stat:scale-110"
                    style={{ color: 'var(--color-gold)', opacity: stat.featured ? 1 : 0.85 }}
                  >
                    {stat.icon}
                  </span>

                  <p
                    className="relative text-xl font-bold md:text-2xl lg:text-3xl leading-none"
                    style={{ fontFamily: 'var(--font-antique-serif), DM Serif Display, serif', color: 'var(--color-gold)' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="relative text-[10px] tracking-widest uppercase leading-tight"
                    style={{
                      color: stat.featured ? 'var(--color-gold)' : 'var(--text-muted)',
                      opacity: stat.featured ? 0.9 : 1,
                    }}
                  >
                    {stat.label}
                  </p>

                  {stat.featured && (
                    <span
                      className="relative text-[9px] tracking-wider uppercase mt-0.5 px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(184,151,106,0.2)',
                        color: 'var(--color-gold)',
                        border: '1px solid rgba(184,151,106,0.3)',
                      }}
                    >
                      Content
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* SECTION 2 — What To Do With End Pieces? */}
        <div className="grid items-center grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">

          <div className="lg:col-span-5">
            <motion.div
              className="flex items-center gap-3 mb-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE_EXPO }}
            >
              <div className="h-[1px] w-8" style={{ background: 'var(--color-gold)' }} />
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: 'var(--color-gold)' }}>
                Zero Waste
              </span>
            </motion.div>

            <h2
              className="text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold mb-6 leading-[1.15] tracking-[-0.01em]"
              style={{ fontFamily: 'var(--font-antique-serif), DM Serif Display, serif', color: 'var(--text-primary)' }}
            >
              <HeadingReveal text="What To Do With End Pieces?" />
            </h2>

            <GoldDivider />

            <motion.p
              className="text-[15px] md:text-base lg:text-lg leading-[1.8] mt-5"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE_EXPO }}
            >
              Maximize every penny of your purchase by ensuring nothing goes to waste! Instead of discarding the end pieces,
              you can transform them into a fantastic treat for your dog. Simply wash the piece, soak it in hot water, and
              pat it dry before microwaving it for about 45 seconds until it puffs up. Once it has{' '}
              <span className="font-bold" style={{ color: 'var(--color-gold-hover)' }}>COOLED</span>{' '}
              completely for your pet&apos;s safety, your dog can enjoy a perfectly smoky and crunchy snack.
            </motion.p>

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
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.08, ease: EASE_EXPO }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white rounded-full w-9 h-9"
                    style={{ background: 'linear-gradient(135deg, #B8976A, #9A7B52)' }}
                  >
                    {i + 1}
                  </div>
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

          <div className="lg:col-span-7">
            <ParallaxVideo src="/videos/video4new.mp4" poster="/videos/video1.jpeg" />
          </div>
        </div>

      </div>
    </section>
  );
}
