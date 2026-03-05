'use client';

import React, { useRef, useEffect } from 'react';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';

// ─── Word-by-word stagger reveal ─────────────────────────────────────────────
//
// Each word fades in + slides up + unblurs with a small stagger.
// Using opacity+y+blur (NOT overflow-hidden + y:108%) so words are
// never fully invisible — headings always visible even before JS hydrates.
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
          initial={prefersReduced ? {} : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ─── Viewport-enter scale reveal — static image ──────────────────────────────
function ZoomImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className="rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
      initial={prefersReduced ? {} : { opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        style={{ display: 'block' }}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}

// ─── Viewport-enter scale reveal — autoplay video ────────────────────────────
function ZoomVideo({ src }: { src: string }) {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause off-screen → saves CPU / battery on mobile
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
      className="rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
      initial={prefersReduced ? {} : { opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        style={{ display: 'block' }}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HimalayanStorySection() {
  return (
    <div className="py-4 md:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* ── Section 1: Handmade By The Himalayan Farmers ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-20 md:mb-32">
          <div className="order-2 lg:order-1">
            <ZoomImage
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              alt="Himalayan mountains with yaks"
              priority
            />
          </div>

          <div className="order-1 lg:order-2">
            {/* Heading — word-by-word stagger */}
            <h2 className="font-antique text-3xl md:text-4xl lg:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-6 tracking-[-0.01em]">
              <SplitHeading text="Handmade By The Himalayan Farmers" delay={0.05} />
            </h2>

            {/* Body copy — fade up after heading */}
            <motion.p
              className="text-base md:text-lg lg:text-xl text-[#5b4636] dark:text-[#c8b6a6] leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              Yak milk chews, in tiny bits were first created and consumed as snacks by the Himalayan people decades ago
              as a good source of protein and still do now. We took the same idea and turned it into an all natural long
              lasting hard cheese dog chews – treats for your dog. Made from Yak milk, our yak chews for dogs contain the
              highest protein &amp; calcium content with minimal fat and no chemically binding agents.
            </motion.p>
          </div>
        </div>

        {/* ── Section 2: What To Do With End Pieces? ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            {/* Heading — word-by-word stagger */}
            <h2 className="font-antique text-3xl md:text-4xl lg:text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-6 tracking-[-0.01em]">
              <SplitHeading text="What To Do With End Pieces?" delay={0.05} />
            </h2>

            {/* Body copy */}
            <motion.p
              className="text-base md:text-lg lg:text-xl text-[#5b4636] dark:text-[#c8b6a6] leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              Simply microwave the nugget for about 45 seconds until it puffs up — Let it{' '}
              <span className="font-bold text-orange-600 dark:text-amber-500">COOL</span>{' '}
              — and then watch as your dog enjoys the crunchy texture and delicious smoky taste.
            </motion.p>

            {/* Numbered steps */}
            <div className="mt-8 space-y-4">
              {[
                { label: 'Microwave for 45 seconds', sub: 'Until it puffs up nicely' },
                { label: 'Let it cool completely',    sub: 'Safety first for your pup' },
                { label: 'Watch them enjoy!',         sub: 'Crunchy texture & smoky taste' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.55 + i * 0.11,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 bg-orange-500 dark:bg-amber-700 text-white rounded-full flex items-center justify-center font-bold text-lg"
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      delay: 0.6 + i * 0.11,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    {i + 1}
                  </motion.div>
                  <div className="pt-1">
                    <p className="text-[#2E1F14] dark:text-[#f5e9dc] font-semibold">{step.label}</p>
                    <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm">{step.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <ZoomVideo src="/videos/video4.mp4" />
          </div>
        </div>

      </div>
    </div>
  );
}
