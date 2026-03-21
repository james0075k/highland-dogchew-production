'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useInView,
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
   Scroll-parallax zoom image with gold frame accents
   ═══════════════════════════════════════════════════════════════════════════ */
function ParallaxZoomImage({ src, alt }: { src: string; alt: string }) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.45, 1], prefersReduced ? [1, 1, 1] : [1.1, 1.0, 1.04]),
    SPRING
  );

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: EASE_EXPO }}
    >
      {/* Offset shadow */}
      <div
        className="absolute -bottom-3 -left-3 -right-3 top-3 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(184,151,106,0.15), rgba(184,151,106,0.05))',
          filter: 'blur(2px)',
        }}
      />

      <div className="relative rounded-2xl overflow-hidden border border-[#2E1F14]/6 dark:border-[#3a2c23] bg-stone-50 dark:bg-[#241b16] p-6 md:p-8" style={{ isolation: 'isolate' }}>
        <motion.img
          src={src}
          alt={alt}
          style={{ scale, willChange: 'transform', display: 'block' }}
          className="w-full rounded-lg object-contain"
        />

        {/* Gold corner accents */}
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent)' }} />
          <div className="absolute top-0 left-0 h-full w-[2px]" style={{ background: 'linear-gradient(180deg, var(--color-gold), transparent)' }} />
        </motion.div>
        <motion.div
          className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="absolute bottom-0 right-0 w-full h-[2px]" style={{ background: 'linear-gradient(270deg, var(--color-gold), transparent)' }} />
          <div className="absolute bottom-0 right-0 h-full w-[2px]" style={{ background: 'linear-gradient(0deg, var(--color-gold), transparent)' }} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function SizeGuideSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  /* ── Scroll-driven floating paws ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const pawRotate1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 40]), SPRING);
  const pawRotate2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -30]), SPRING);
  const pawY1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -55]), SPRING);
  const pawY2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -40]), SPRING);
  const pawRotate3 = useSpring(useTransform(scrollYProgress, [0, 1], [10, -25]), SPRING);
  const pawY3 = useSpring(useTransform(scrollYProgress, [0, 1], [5, -50]), SPRING);

  const sizes = [
    { label: 'King',        sub: 'Great Dane' },
    { label: 'Extra Large', sub: 'Newfoundland' },
    { label: 'Large',       sub: 'German Shepherd' },
    { label: 'Medium',      sub: 'Shiba Inu' },
    { label: 'Small',       sub: 'Dachshund / Yorkie' },
  ];

  const features = [
    {
      title: 'Full of Calcium & Protein',
      body:  'Packed with essential nutrients for strong bones and muscles',
      icon:  '/images/icon/calcium.png',
      glow:  'rgba(184,151,106,0.35)',
    },
    {
      title: '100% Natural',
      body:  'Made from pure yak milk with no artificial additives',
      icon:  '/images/icon/recycle.png',
      glow:  'rgba(154,123,82,0.35)',
    },
    {
      title: 'GMO & Gluten Free',
      body:  'Safe for dogs with sensitive stomachs and allergies',
      icon:  '/images/icon/gultonfree.png',
      glow:  'rgba(212,188,142,0.35)',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-28 overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--surface-page)' }}
    >
      {/* ── Floating decorative paw prints (scroll-driven) ── */}
      <motion.div
        className="absolute top-20 right-[7%] opacity-[0.05] dark:opacity-[0.03] pointer-events-none hidden lg:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate1, y: pawY1 } : {}}
      >
        <PawAccent className="w-18 h-18 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </motion.div>
      <motion.div
        className="absolute bottom-28 left-[5%] opacity-[0.04] dark:opacity-[0.025] pointer-events-none hidden lg:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate2, y: pawY2 } : {}}
      >
        <PawAccent className="w-14 h-14 text-[#2E1F14] dark:text-[#D4BC8E]" />
      </motion.div>
      <motion.div
        className="absolute top-[40%] left-[3%] opacity-[0.04] dark:opacity-[0.025] pointer-events-none hidden xl:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate3, y: pawY3 } : {}}
      >
        <PawAccent className="w-10 h-10 text-[#2E1F14] dark:text-[#D4BC8E] rotate-30" />
      </motion.div>
      <motion.div
        className="absolute top-[65%] right-[4%] opacity-[0.035] dark:opacity-[0.02] pointer-events-none hidden xl:block"
        style={mounted && !prefersReduced ? { rotate: pawRotate1, y: pawY2 } : {}}
      >
        <PawAccent className="w-8 h-8 text-[#2E1F14] dark:text-[#D4BC8E] -rotate-20" />
      </motion.div>

      {/* ── Grain texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">

        {/* ── Header ── */}
        <div className="text-center mb-14">
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
              Size Guide
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
            <StaggerHeading text="What Size To Choose?" delay={0.06} />
          </h2>

          <GoldDivider />

          <motion.p
            className="text-base md:text-lg mt-3 max-w-lg mx-auto"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE_EXPO }}
          >
            Find the perfect size for your furry friend
          </motion.p>
        </div>

        {/* ── Dog Size Chart — parallax zoom ── */}
        <div className="mb-14">
          <ParallaxZoomImage
            src="/images/dogsize.jpg"
            alt="Dog size comparison chart showing breeds from King to Small"
          />

          {/* Size labels — stagger */}
          <div className="mt-8 grid grid-cols-5 gap-2 text-center">
            {sizes.map((s, i) => (
              <motion.div
                key={s.label}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.15 + i * 0.1,
                  ease: EASE_EXPO,
                }}
              >
                {/* Decorative dot */}
                <motion.div
                  className="w-2 h-2 rounded-full mx-auto mb-2"
                  style={{ background: 'var(--color-gold)' }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.25 + i * 0.1,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                />
                <p
                  className="font-bold text-sm md:text-base"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {s.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Why it's so good? ── */}
        <motion.div
          className="relative rounded-3xl overflow-hidden border"
          style={{
            borderColor: 'var(--border-base)',
            background: 'linear-gradient(145deg, rgba(255,253,248,0.8), rgba(244,237,228,0.5))',
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1, ease: EASE_EXPO }}
        >
          {/* Dark mode bg */}
          <div className="absolute inset-0 bg-[#241b16] opacity-0 dark:opacity-100 rounded-3xl" />

          {/* Top gold line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: 'linear-gradient(90deg, transparent 10%, var(--color-gold) 50%, transparent 90%)' }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: EASE_EXPO }}
          />

          {/* Gold corner accents */}
          <motion.div
            className="absolute top-0 left-0 w-16 h-16 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: 'linear-gradient(90deg, var(--color-gold), transparent)' }} />
            <div className="absolute top-0 left-0 h-full w-[2px]" style={{ background: 'linear-gradient(180deg, var(--color-gold), transparent)' }} />
          </motion.div>
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="absolute bottom-0 right-0 w-full h-[2px]" style={{ background: 'linear-gradient(270deg, var(--color-gold), transparent)' }} />
            <div className="absolute bottom-0 right-0 h-full w-[2px]" style={{ background: 'linear-gradient(0deg, var(--color-gold), transparent)' }} />
          </motion.div>

          <div className="relative z-10 p-8 md:p-12">
            {/* Sub-heading */}
            <div className="text-center mb-10">
              <motion.div
                className="flex items-center justify-center gap-3 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="h-[1px] w-6" style={{ background: 'var(--color-gold)' }} />
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: 'var(--color-gold)' }}>
                  Quality Promise
                </span>
                <div className="h-[1px] w-6" style={{ background: 'var(--color-gold)' }} />
              </motion.div>

              <h3
                className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-[-0.01em]"
                style={{
                  fontFamily: 'var(--font-antique-serif), DM Serif Display, serif',
                  color: 'var(--text-primary)',
                }}
              >
                <StaggerHeading text="Why It's So Good?" delay={0.05} />
              </h3>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  className="text-center flex flex-col items-center group"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2 + i * 0.15,
                    ease: EASE_EXPO,
                  }}
                >
                  {/* Icon with glow + float */}
                  <motion.div
                    className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center"
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + i * 0.15,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    whileHover={{ scale: 1.12 }}
                  >
                    {/* Gold glow ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: feat.glow, filter: 'blur(14px)' }}
                      animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    />
                    {/* Float loop */}
                    <motion.div
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                      className="relative z-10 w-20 h-20"
                    >
                      <Image
                        src={feat.icon}
                        alt={feat.title}
                        fill
                        className="object-contain drop-shadow-xl"
                      />
                    </motion.div>
                  </motion.div>

                  <h4
                    className="text-base md:text-lg font-bold mb-2 tracking-wide"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {feat.title}
                  </h4>
                  <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: 'var(--text-muted)' }}>
                    {feat.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Bottom decorative ── */}
        <motion.div
          className="mt-14 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="h-[1px] w-14" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-light))' }} />
          <PawAccent className="w-4 h-4 text-[#B8976A] dark:text-[#D4BC8E]" />
          <div className="h-[1px] w-14" style={{ background: 'linear-gradient(270deg, transparent, var(--color-gold-light))' }} />
        </motion.div>
      </div>
    </section>
  );
}
