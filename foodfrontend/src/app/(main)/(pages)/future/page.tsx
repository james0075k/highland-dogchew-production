"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Sparkles, Users, Leaf } from "lucide-react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";

/* ─── types ─── */
type Pillar = {
  id: number;
  title: string;
  icon: React.ReactNode;
  paragraphs?: string[];
  bullets?: string[];
};

const AUTO_SLIDE_MS = 4500;

/* ─── stitch SVG component (animated dash-offset thread line) ─── */
function StitchLine({ className = "", vertical = false }: { className?: string; vertical?: boolean }) {
  const w = vertical ? 4 : 320;
  const h = vertical ? 320 : 4;
  const d = vertical ? "M2 0 L2 320" : "M0 2 L320 2";
  return (
    <svg
      className={className}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      style={{ overflow: "visible" }}
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="8 6"
        strokeLinecap="round"
        className="animate-stitch"
      />
    </svg>
  );
}

/* ─── stitch corner decoration ─── */
function StitchCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const corners: Record<string, string> = {
    tl: "top-3 left-3 rotate-0",
    tr: "top-3 right-3 rotate-90",
    bl: "bottom-3 left-3 -rotate-90",
    br: "bottom-3 right-3 rotate-180",
  };
  return (
    <svg
      className={`absolute ${corners[position]} text-[#B8976A] dark:text-[#D4BC8E]/60 opacity-60`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M2 22 L2 2 L22 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        className="animate-stitch-slow"
      />
    </svg>
  );
}

/* ─── fade-up wrapper ─── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── main component ─── */
const PillarsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<number | null>(null);

  /* parallax */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.25, 0.55]);

  const pillarIcons = [
    <Users key="u" className="w-6 h-6" />,
    <Heart key="h" className="w-6 h-6" />,
    <Sparkles key="s" className="w-6 h-6" />,
    <Leaf key="l" className="w-6 h-6" />,
  ];

  const pillars: Pillar[] = useMemo(
    () => [
      {
        id: 1,
        title: "COMMUNITY FIRST",
        icon: pillarIcons[0],
        paragraphs: [
          "From the start, we knew our responsibility didn't end with making a great product. When something comes from the mountains, it should also support the people who live there.",
        ],
      },
      {
        id: 2,
        title: "WOMEN-LED TRADITIONS",
        icon: pillarIcons[1],
        paragraphs: [
          "The Highland Yak Chew Future Foundation supports women involved in yak care, milk production, and traditional cheese making—keeping Himalayan traditions alive.",
        ],
      },
      {
        id: 3,
        title: "REAL IMPACT PER PURCHASE",
        icon: pillarIcons[2],
        bullets: [
          "Fair wages support",
          "Healthcare access",
          "Skill training",
          "Sustainable income opportunities",
        ],
        paragraphs: [
          "Every purchase contributes to long-term progress for high-altitude communities.",
        ],
      },
      {
        id: 4,
        title: "SUSTAINABLE FUTURE",
        icon: pillarIcons[3],
        paragraphs: [
          "Choosing Highland Yak Chew means supporting the land and people behind every chew—ensuring long-term progress for generations.",
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const goTo = (index: number) => {
    setCurrentIndex(index);
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-pillar]");
    const card = cards[index];
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const next = () => goTo((currentIndex + 1) % pillars.length);
  const prev = () => goTo((currentIndex - 1 + pillars.length) % pillars.length);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      goTo((currentIndex + 1) % pillars.length);
    }, AUTO_SLIDE_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, pillars.length]);

  const pauseAuto = () => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 1500);
  };

  return (
    <section className="w-full bg-[var(--surface-page)] transition-colors duration-300 pt-0 md:pt-0 lg:pt-0">
      {/* ═══════════ HERO — dog photo with parallax ═══════════ */}
      <div ref={heroRef} className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden mt-16">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <img
            src="/images/dog-5.jpeg"
            alt="Happy dog enjoying Highland Yak Chew"
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* dark overlay */}
        <motion.div
          className="absolute inset-0 bg-[#1a1410]"
          style={{ opacity: overlayOpacity }}
        />

        {/* stitch decorations on hero */}
        <div className="absolute top-6 left-6 md:top-10 md:left-10">
          <StitchLine className="text-white/30" />
        </div>
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10">
          <StitchLine className="text-white/30" />
        </div>

        {/* hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-white text-[32px] md:text-[48px] lg:text-[56px] tracking-[0.08em] leading-tight"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            Yak Chew Future
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 h-px w-32 md:w-48 bg-[#D4BC8E] origin-center"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-center text-white/80 text-[15px] md:text-[17px] max-w-lg tracking-wide"
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
          >
            Building a sustainable future — one chew at a time
          </motion.p>
        </div>

        {/* bottom gradient fade into page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--surface-page)] to-transparent" />
      </div>

      {/* ═══════════ MISSION STRIP ═══════════ */}
      <FadeUp className="max-w-3xl mx-auto px-6 py-10 md:py-14 text-center relative">
        <StitchCorner position="tl" />
        <StitchCorner position="tr" />
        <StitchCorner position="bl" />
        <StitchCorner position="br" />

        <h2
          className="text-[var(--text-primary)] text-[13px] md:text-[14px] tracking-[0.22em] uppercase mb-4"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Our Mission
        </h2>
        <p
          className="text-[var(--text-secondary)] text-[18px] md:text-[22px] leading-relaxed"
          style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
        >
          The Highland Yak Chew Future Foundation is rooted in the belief that every chew
          should carry purpose — supporting the communities, women, and landscapes of the
          Himalayas that make it all possible.
        </p>
      </FadeUp>

      {/* ═══════════ STITCH DIVIDER ═══════════ */}
      <div className="flex justify-center py-2">
        <StitchLine className="text-[var(--border-base)] w-40 md:w-64" />
      </div>

      {/* ═══════════ DOG PHOTO STRIP (secondary) ═══════════ */}
      <FadeUp delay={0.1}>
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {["/images/dog-12.jpeg", "/images/dog-18.jpeg", "/images/dog-25.jpeg"].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden group"
              >
                <img
                  src={src}
                  alt="Dog with Highland Yak Chew"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* stitch corner on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <StitchCorner position="tl" />
                  <StitchCorner position="br" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* ═══════════ PILLARS CAROUSEL ═══════════ */}
      <FadeUp delay={0.15} className="md:max-w-7xl md:mx-auto md:px-6 pb-10">
        <div
          className={[
            "w-full rounded-none md:rounded-[28px]",
            "bg-[var(--surface-secondary)] dark:bg-[#241b16]",
            "shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]",
            "ring-1 ring-black/5 dark:ring-white/5",
            "px-4 py-10 md:px-10 md:py-12",
            "transition-colors duration-300",
            "relative overflow-hidden",
          ].join(" ")}
        >
          {/* background stitch pattern */}
          <div className="absolute top-4 left-4 opacity-20 dark:opacity-10">
            <StitchLine className="text-[var(--text-muted)]" />
          </div>
          <div className="absolute bottom-4 right-4 opacity-20 dark:opacity-10">
            <StitchLine className="text-[var(--text-muted)]" />
          </div>

          <h2
            className="text-center text-[24px] md:text-[30px] tracking-[0.14em] text-[var(--text-primary)] transition-colors duration-300"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontStyle: "italic" }}
          >
            OUR PILLARS
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-[var(--border-base)] transition-colors duration-300" />

          <div className="relative mt-8">
            <div
              ref={scrollRef}
              onTouchStart={pauseAuto}
              onMouseEnter={pauseAuto}
              onWheel={pauseAuto}
              onScroll={pauseAuto}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar px-2 md:px-0 pb-2"
            >
              {pillars.map((p, idx) => {
                const active = idx === currentIndex;
                return (
                  <div
                    key={p.id}
                    data-pillar
                    className="snap-center shrink-0 w-[calc(100vw-24px)] md:w-[58%] lg:w-[46%]"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`card-${p.id}-${active}`}
                        initial={{ opacity: 0.85, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-[26px] bg-[#ece9e4] dark:bg-[#2d221c] p-5 md:p-8 transition-colors duration-300 relative"
                      >
                        {/* stitch corners on card */}
                        <StitchCorner position="tl" />
                        <StitchCorner position="tr" />
                        <StitchCorner position="bl" />
                        <StitchCorner position="br" />

                        <div
                          className={[
                            "rounded-[22px]",
                            "bg-[#6b6863] dark:bg-[#3a2c23]",
                            "shadow-[0_18px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.4)]",
                            "h-[420px] md:h-[460px] lg:h-[480px]",
                            "flex flex-col items-center justify-center",
                            "px-5 py-7 md:px-8 md:py-10",
                            "transition-all duration-500",
                            active ? "opacity-100" : "opacity-90",
                          ].join(" ")}
                        >
                          {/* icon */}
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mb-5 flex items-center justify-center w-12 h-12 rounded-full bg-[#B8976A]/20 dark:bg-[#D4BC8E]/15 text-[#B8976A] dark:text-[#D4BC8E]"
                          >
                            {p.icon}
                          </motion.div>

                          <h3
                            className="text-center uppercase tracking-[0.12em] text-[18px] md:text-[20px] text-[#f5e9dc] dark:text-[#f5e9dc]"
                            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontStyle: "italic" }}
                          >
                            {p.title}
                          </h3>

                          <div
                            className="mt-5 max-h-[280px] md:max-h-[300px] overflow-y-auto pr-1 no-scrollbar"
                            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
                          >
                            <div className="text-[18px] md:text-[20px] leading-relaxed text-[#e8dfd1] dark:text-[#c8b6a6] text-center">
                              {p.paragraphs?.map((t, i) => (
                                <p key={i} className="mb-4">{t}</p>
                              ))}
                              {p.bullets?.length ? (
                                <ul className="mt-3 space-y-2 text-left mx-auto max-w-[420px]">
                                  {p.bullets.map((b, i) => (
                                    <li key={i} className="flex gap-3">
                                      <span className="mt-[12px] h-[6px] w-[6px] rounded-full bg-[#D4BC8E] shrink-0" />
                                      <span className="text-[#e8dfd1] dark:text-[#c8b6a6]">{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {pillars.length > 1 && (
              <>
                <button
                  onClick={() => { pauseAuto(); prev(); }}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-[#2d221c]/80 hover:bg-white dark:hover:bg-[#3a2c23] shadow-md ring-1 ring-black/10 dark:ring-white/10 transition-all duration-200"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-[#2b2a28] dark:text-[#c8b6a6]" />
                </button>
                <button
                  onClick={() => { pauseAuto(); next(); }}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-[#2d221c]/80 hover:bg-white dark:hover:bg-[#3a2c23] shadow-md ring-1 ring-black/10 dark:ring-white/10 transition-all duration-200"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5 text-[#2b2a28] dark:text-[#c8b6a6]" />
                </button>
              </>
            )}

            <div className="mt-8 flex justify-center gap-2">
              {pillars.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { pauseAuto(); goTo(i); }}
                  aria-label={`Go to pillar ${i + 1}`}
                  className={[
                    "h-2 rounded-full transition-all duration-300",
                    i === currentIndex
                      ? "w-10 bg-[#B8976A] dark:bg-[#D4BC8E]"
                      : "w-2 bg-[#cfcac3] dark:bg-[#4a3828] hover:bg-[#bdb7af] dark:hover:bg-[#5a4838]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <FadeUp delay={0.2} className="py-10 md:py-16 text-center px-6">
        <h3
          className="text-[var(--text-primary)] text-[22px] md:text-[28px] tracking-[0.06em] mb-4 transition-colors duration-300"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          Every Chew Makes a Difference
        </h3>
        <p
          className="text-[var(--text-muted)] text-[15px] md:text-[17px] max-w-md mx-auto mb-8 transition-colors duration-300"
          style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
        >
          Join us in building a brighter future for Himalayan communities and their four-legged friends.
        </p>
        <motion.a
          href="/products"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block bg-gradient-to-r from-[#B8976A] to-[#9A7B52] hover:from-[#9A7B52] hover:to-[#7A5C4F] text-white text-[13px] tracking-[0.18em] uppercase px-8 py-3.5 rounded-full shadow-md transition-all duration-300"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Shop Now
        </motion.a>
      </FadeUp>

      {/* ═══════════ GLOBAL STYLES ═══════════ */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }

        /* stitch dash animation — sewing thread effect */
        @keyframes stitch-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 28; }
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

export default PillarsSection;
