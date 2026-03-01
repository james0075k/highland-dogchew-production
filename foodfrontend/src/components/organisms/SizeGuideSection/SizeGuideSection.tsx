'use client';

import React, { useRef } from 'react';
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
      color: 'bg-orange-500 dark:bg-amber-700',
      path:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: '100% NATURAL',
      body:  'Made from pure yak milk with no artificial additives',
      color: 'bg-green-500 dark:bg-green-700',
      path:  'M5 13l4 4L19 7',
    },
    {
      title: 'GMO & GLUTEN FREE',
      body:  'Safe for dogs with sensitive stomachs and allergies',
      color: 'bg-blue-500 dark:bg-blue-700',
      path:  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="text-center"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.div
                  className={`w-16 h-16 mx-auto mb-4 ${feat.color} rounded-full flex items-center justify-center`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + i * 0.12,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feat.path} />
                  </svg>
                </motion.div>
                <h4 className="text-xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-2">{feat.title}</h4>
                <p className="text-[#7A5C4F] dark:text-[#c8b6a6]">{feat.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
