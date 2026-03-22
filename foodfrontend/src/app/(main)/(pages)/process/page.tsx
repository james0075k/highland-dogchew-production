"use client";

import React, { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";

/* ─── types ─── */
type PromiseCard = {
  title: string;
  image: string;
  intro?: string;
  bullets?: string[];
  outro?: string;
  paragraphs?: string[];
};

/* ─── animation helpers ─── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── stitch decorative line ─── */
function StitchDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`mx-auto ${className}`}
      width="160"
      height="4"
      viewBox="0 0 160 4"
      fill="none"
    >
      <path
        d="M0 2 L160 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
        className="animate-stitch"
      />
    </svg>
  );
}

/* ─── stitch corner ─── */
function StitchCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const placement: Record<string, string> = {
    tl: "top-2.5 left-2.5 rotate-0",
    tr: "top-2.5 right-2.5 rotate-90",
    bl: "bottom-2.5 left-2.5 -rotate-90",
    br: "bottom-2.5 right-2.5 rotate-180",
  };
  return (
    <svg
      className={`absolute ${placement[pos]} text-[#B8976A]/50 dark:text-[#D4BC8E]/30`}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M2 18 L2 2 L18 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        className="animate-stitch-slow"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
const OurPromiseCards = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const overlayFade = useTransform(scrollYProgress, [0, 0.7], [0.3, 0.6]);

  const promiseText = [
    "Everything we do starts with one priority. Is it truly good for dogs?",
    "We believe dogs do best with simple, natural nutrition and well-made products. That's why we avoid unnecessary ingredients and focus on quality, safety, and sourcing you can trust.",
    "Nothing extra. Nothing artificial. Just a chew dogs enjoy and owners rely on.",
  ];

  const cards: PromiseCard[] = [
    {
      title: "RESPONSIBLE PACKAGING",
      image: "/images/dog-8.jpeg",
      intro: "Our care doesn't stop with the product.",
      bullets: [
        "Minimal, recyclable packaging",
        "Reduced plastic use",
        "Paper inserts made from recycled or certified materials",
        "Compact shipping to lower environmental impact",
      ],
      outro:
        "Looking after pets also means looking after the planet they live on.",
    },
    {
      title: "NATURAL, SIMPLE, AND DOG-APPROVED",
      image: "/images/dog-15.jpeg",
      bullets: [
        "Made using yak and cow milk",
        "High protein, low fat",
        "Long-lasting and satisfying",
        "Supports dental hygiene through chewing",
        "Easy to digest",
        "No artificial additives",
        "Grain-free and gluten-free",
        "Responsibly sourced and cruelty-free",
      ],
      outro: "",
    },
    {
      title: "MADE FOR SMARTER CHEWING",
      image: "/images/dog-22.jpeg",
      paragraphs: [
        "Chewing plays an important role in a dog's health. It helps keep teeth cleaner, strengthens jaws, and provides mental stimulation.",
        "Highland Yak Chews are firm and durable without splintering like bones. When the chew becomes small, it can be microwaved into a light, crunchy snack, reducing waste and extending enjoyment.",
      ],
    },
  ];

  return (
    <section className="w-full bg-[var(--surface-page)] transition-colors duration-300 pt-0 md:pt-0 lg:pt-0">
      {/* ═══════ HERO — full-bleed dog photo with parallax ═══════ */}
      <div
        ref={heroRef}
        className="relative w-full h-[55vh] md:h-[68vh] overflow-hidden mt-16"
      >
        <motion.div
          className="absolute inset-0"
          style={{ y: heroY, scale: heroScale }}
        >
          <img
            src="/images/dog-3.jpeg"
            alt="Dog enjoying Highland Yak Chew"
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* overlay */}
        <motion.div
          className="absolute inset-0 bg-[#1a1410]"
          style={{ opacity: overlayFade }}
        />

        {/* stitch accents on hero */}
        <div className="absolute top-8 left-6 md:top-12 md:left-12 opacity-40">
          <StitchDivider className="text-white/60" />
        </div>
        <div className="absolute bottom-14 right-6 md:bottom-20 md:right-12 opacity-40">
          <StitchDivider className="text-white/60" />
        </div>

        {/* hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-center text-white text-[28px] md:text-[44px] lg:text-[52px] tracking-[0.1em] leading-tight"
            style={{
              fontFamily:
                "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            Our Promise to Dogs
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-4 h-px w-28 md:w-40 bg-[#D4BC8E] origin-center"
          />
        </div>

        {/* bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--surface-page)] to-transparent" />
      </div>

      {/* ═══════ PROMISE TEXT ═══════ */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 pt-6 md:pt-10">
          {promiseText.map((t, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <p
                className={`text-[18px] md:text-[20px] leading-relaxed text-[var(--text-primary)] transition-colors duration-300 ${
                  i < promiseText.length - 1 ? "mb-6" : ""
                }`}
                style={{
                  fontFamily:
                    "var(--font-cormorant), 'Cormorant Garamond', serif",
                  fontStyle: "italic",
                }}
              >
                {t}
              </p>
            </FadeUp>
          ))}
        </div>

        {/* stitch divider */}
        <FadeUp delay={0.1} className="flex justify-center mb-12 md:mb-16">
          <StitchDivider className="text-[var(--border-base)]" />
        </FadeUp>

        {/* ═══════ 3 POSTER CARDS ═══════ */}
        <div className="grid gap-8 lg:grid-cols-3 pb-8">
          {cards.map((card, idx) => (
            <ScaleIn key={card.title} delay={idx * 0.12}>
              <PosterCard card={card} index={idx} />
            </ScaleIn>
          ))}
        </div>
      </div>

      {/* ═══════ BOTTOM ACCENT STRIP ═══════ */}
      <FadeUp delay={0.1}>
        <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
            <img
              src="/images/dog-30.jpeg"
              alt="Happy dogs with Highland Yak Chews"
              className="w-full h-[220px] md:h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1410]/70 via-[#1a1410]/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-14">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-white/90 text-[20px] md:text-[28px] max-w-md leading-snug"
                  style={{
                    fontFamily:
                      "var(--font-playfair), 'Playfair Display', serif",
                  }}
                >
                  Every chew tells a story of care
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-3 h-px w-20 bg-[#D4BC8E] origin-left"
                />
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ═══════ GLOBAL STYLES ═══════ */}
      <style jsx global>{`
        @keyframes stitch-dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 22;
          }
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

export default OurPromiseCards;

/* ═══════════════════════════════════════════════
   POSTER CARD COMPONENT
   ═══════════════════════════════════════════════ */
function PosterCard({
  card,
  index,
}: {
  card: PromiseCard;
  index: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "relative overflow-hidden rounded-[28px]",
        "bg-[var(--surface-card)] dark:bg-[#1f1812]",
        "shadow-[0_18px_55px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.35)]",
        "ring-1 ring-black/5 dark:ring-white/5",
        "transition-colors duration-300",
        "group",
      ].join(" ")}
    >
      {/* stitch corners */}
      <StitchCorner pos="tl" />
      <StitchCorner pos="tr" />
      <StitchCorner pos="bl" />
      <StitchCorner pos="br" />

      {/* image */}
      <div className="relative aspect-[16/11] w-full bg-[var(--surface-image-bg)] overflow-hidden">
        <motion.img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--surface-card)] dark:from-[#1f1812] to-transparent transition-colors duration-300" />

        {/* gold number badge */}
        <div className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full bg-[#B8976A]/80 dark:bg-[#D4BC8E]/70 backdrop-blur-sm">
          <span
            className="text-white text-[14px] font-semibold"
            style={{
              fontFamily:
                "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* text content */}
      <div className="px-6 pb-10 pt-8 md:px-8">
        <h3
          className="text-center text-[18px] md:text-[20px] tracking-[0.12em] text-[var(--text-primary)] transition-colors duration-300"
          style={{
            fontFamily:
              "var(--font-playfair), 'Playfair Display', serif",
            fontStyle: "italic",
          }}
        >
          {card.title}
        </h3>

        <div className="mx-auto mt-5 h-px w-20 bg-[var(--border-base)] transition-colors duration-300" />

        {/* intro */}
        {card.intro ? (
          <p
            className="mt-7 text-[18px] md:text-[19px] text-[var(--text-secondary)] text-center transition-colors duration-300"
            style={{
              fontFamily:
                "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontStyle: "italic",
            }}
          >
            {card.intro}
          </p>
        ) : null}

        {/* bullets */}
        {card.bullets?.length ? (
          <ul
            className="mx-auto mt-6 max-w-xl space-y-3 text-[18px] leading-relaxed text-[var(--text-secondary)] md:text-[19px] transition-colors duration-300"
            style={{
              fontFamily:
                "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontStyle: "italic",
            }}
          >
            {card.bullets.map((item, idx) => (
              <li key={idx} className="flex gap-4 group/item">
                <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#B8976A] dark:bg-[#D4BC8E] transition-colors duration-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* paragraphs */}
        {card.paragraphs?.length ? (
          <div
            className="mt-7 space-y-6 text-[18px] md:text-[19px] leading-relaxed text-[var(--text-secondary)] text-left transition-colors duration-300"
            style={{
              fontFamily:
                "var(--font-cormorant), 'Cormorant Garamond', serif",
            }}
          >
            {card.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}

        {/* outro */}
        {card.outro ? (
          <p
            className="mt-8 text-[18px] md:text-[19px] text-[var(--text-muted)] text-center italic transition-colors duration-300"
            style={{
              fontFamily:
                "var(--font-cormorant), 'Cormorant Garamond', serif",
            }}
          >
            {card.outro}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
