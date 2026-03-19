'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

// ─── Word-by-word stagger reveal ─────────────────────────────────────────────
//
// Each word fades in + slides up + unblurs with a small stagger.
// Does NOT use overflow-hidden + y:108%, so words are never fully invisible.
// Heading remains readable even before JS hydrates.
//
function SplitHeading({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');

  return (
    <span aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ marginRight: i < words.length - 1 ? '0.28em' : 0 }}
          initial={prefersReduced ? {} : { opacity: 0, y: 22, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.65,
            delay: delay + i * 0.09,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ─── Scroll-parallax zoom image ───────────────────────────────────────────────
//
// Tracks how far the element has crossed the viewport (0 → 1) via useScroll.
// Scale mapping:  1.10 → 1.00 (entering) → 1.05 (exiting)
// Creates a living parallax effect — the photo breathes as you scroll past it.
//
function ParallaxZoomImage({ src, alt }: { src: string; alt: string }) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    prefersReduced ? [1, 1, 1] : [1.10, 1.0, 1.05]
  );

  return (
    <div
      ref={ref}
      className="rounded-2xl overflow-hidden shadow-xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-stone-100 dark:bg-[#241b16] p-6 md:p-8"
    >
      <motion.img
        src={src}
        alt={alt}
        style={{ scale, willChange: 'transform', display: 'block' }}
        className="w-full rounded-lg object-contain"
      />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SizeGuideSection() {
  const sizes = [
    { label: 'King',        sub: 'Great Dane' },
    { label: 'Extra Large', sub: 'Newfoundland' },
    { label: 'Large',       sub: 'German Shepherd' },
    { label: 'Medium',      sub: 'Shiba Inu' },
    { label: 'Small',       sub: 'Dachshund / Yorkie' },
  ];

  const features = [
    {
      title: 'FULL OF CALCIUM & PROTEIN',
      body:  'Packed with essential nutrients for strong bones and muscles',
      icon:  '/images/icon/calcium.png',
      glow:  'rgba(251,146,60,0.35)',
    },
    {
      title: '100% NATURAL',
      body:  'Made from pure yak milk with no artificial additives',
      icon:  '/images/icon/recycle.png',
      glow:  'rgba(34,197,94,0.35)',
    },
    {
      title: 'GMO & GLUTEN FREE',
      body:  'Safe for dogs with sensitive stomachs and allergies',
      icon:  '/images/icon/gultonfree.png',
      glow:  'rgba(59,130,246,0.35)',
    },
  ];

  return (
    <div className="py-4 md:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* ── Main Heading ───────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <h2 className="font-antique text-3xl md:text-4xl lg:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 tracking-[-0.01em]">
            <SplitHeading text="WHAT SIZE TO CHOOSE?" delay={0.05} />
          </h2>

          <motion.p
            className="text-lg md:text-xl text-[#7A5C4F] dark:text-[#c8b6a6]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Find the perfect size for your furry friend
          </motion.p>
        </div>

        {/* ── Dog Size Chart — scroll parallax zoom ──────────────────────────── */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <ParallaxZoomImage
            src="/images/dogsize.jpg"
            alt="Dog size comparison chart showing breeds from King to Small"
          />

          {/* Size labels — stagger after image */}
          <div className="mt-6 grid grid-cols-5 gap-2 text-center">
            {sizes.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.55,
                  delay: 0.1 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p className="font-bold text-sm md:text-base text-[#2E1F14] dark:text-[#f5e9dc]">
                  {s.label}
                </p>
                <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Description Text ───────────────────────────────────────────────── */}
        <motion.div
          className="text-center max-w-7xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-base md:text-lg text-[#5b4636] dark:text-[#c8b6a6] leading-relaxed">
            Yak milk chews, in tiny bits were first created and consumed as snacks by the Himalayan people decades ago
            as a good source of protein and still do now. We took the same idea and turned it into an all natural long
            hard cheese dog chews - toys for your pet - Himalayan Yak Dog Chew. Made from Yak milk, our Himalayan yak
            chews for dogs contain the highest protein &amp; calcium content with minimal fat and no chemically binding agents.
          </p>
        </motion.div>

        {/* ── Why it's so good? ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-[#241b16] dark:to-[#2a1f18] rounded-3xl p-8 md:p-12 shadow-lg dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-transparent dark:border-[#3a2c23]">

          <h3 className="font-antique text-2xl md:text-3xl lg:text-4xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] text-center mb-8 tracking-[-0.01em]">
            <SplitHeading text="Why it's so good?" delay={0.05} />
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="text-center flex flex-col items-center"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.14,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Icon with float + glow animation */}
                <motion.div
                  className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.55,
                    delay: 0.15 + i * 0.14,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  animate={{
                    y: [0, -6, 0],
                  }}
                  // @ts-ignore — framer-motion animate + whileInView coexist fine
                  style={{ animationIterationCount: 'infinite' }}
                  whileHover={{ scale: 1.12 }}
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: feat.glow, filter: 'blur(14px)' }}
                    animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                  />
                  {/* Float loop */}
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
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

                <h4 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2 tracking-wide">{feat.title}</h4>
                <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm leading-relaxed max-w-[220px]">{feat.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
