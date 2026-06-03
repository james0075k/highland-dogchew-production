"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Star,
  Quote,
  BadgeCheck,
  ShieldCheck,
  Heart,
  Timer,
  Leaf,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface Testimonial {
  _id: string;
  name: string;
  position?: string;
  location: string;
  rating: number;
  message: string;
  profileImage?: string;
}

/* ═══════════════════════════════════════════════
   SVG DECORATIONS — PAWS & BONES
   ═══════════════════════════════════════════════ */

/* paw print SVG */
function PawSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* main pad */}
      <ellipse cx="24" cy="32" rx="10" ry="9" />
      {/* toes */}
      <ellipse cx="13" cy="20" rx="5" ry="6" transform="rotate(-10 13 20)" />
      <ellipse cx="23" cy="14" rx="4.5" ry="6" />
      <ellipse cx="33" cy="17" rx="5" ry="6" transform="rotate(12 33 17)" />
      <ellipse cx="39" cy="26" rx="4" ry="5.5" transform="rotate(25 39 26)" />
    </svg>
  );
}

/* bone SVG divider */
function BoneDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`mx-auto ${className}`}
      width="120"
      height="24"
      viewBox="0 0 120 24"
      fill="none"
    >
      {/* left knob */}
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
      {/* shaft */}
      <rect x="16" y="9" width="88" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* right knob */}
      <circle cx="108" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="108" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* floating paw particles */
function FloatingPaws() {
  const paws = [
    { left: "5%", delay: "0s", dur: "14s", size: "w-6 h-6", opacity: "opacity-[0.04]", rot: "-15deg" },
    { left: "18%", delay: "3s", dur: "18s", size: "w-8 h-8", opacity: "opacity-[0.03]", rot: "20deg" },
    { left: "35%", delay: "7s", dur: "16s", size: "w-5 h-5", opacity: "opacity-[0.05]", rot: "-30deg" },
    { left: "52%", delay: "1s", dur: "20s", size: "w-7 h-7", opacity: "opacity-[0.03]", rot: "10deg" },
    { left: "70%", delay: "5s", dur: "15s", size: "w-6 h-6", opacity: "opacity-[0.04]", rot: "-25deg" },
    { left: "85%", delay: "9s", dur: "17s", size: "w-9 h-9", opacity: "opacity-[0.03]", rot: "35deg" },
    { left: "92%", delay: "12s", dur: "19s", size: "w-5 h-5", opacity: "opacity-[0.04]", rot: "-5deg" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {paws.map((p, i) => (
        <div
          key={i}
          className={`absolute animate-paw-float text-[var(--text-primary)] ${p.opacity} ${p.size}`}
          style={{
            left: p.left,
            bottom: "-40px",
            animationDelay: p.delay,
            animationDuration: p.dur,
            transform: `rotate(${p.rot})`,
          }}
        >
          <PawSvg className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

/* stitch corner */
function StitchCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const p: Record<string, string> = {
    tl: "top-2.5 left-2.5 rotate-0",
    tr: "top-2.5 right-2.5 rotate-90",
    bl: "bottom-2.5 left-2.5 -rotate-90",
    br: "bottom-2.5 right-2.5 rotate-180",
  };
  return (
    <svg
      className={`absolute ${p[pos]} text-[#B8976A]/40 dark:text-[#D4BC8E]/25`}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M2 16 L2 2 L16 2"
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
   ANIMATION HELPERS
   ═══════════════════════════════════════════════ */
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
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${
            s <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-[var(--border-base)] fill-[var(--border-base)]"
          }`}
        />
      ))}
    </div>
  );
}

function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-20 h-20" : size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const text = size === "lg" ? "text-3xl" : "text-base";
  return src ? (
    <img
      src={src}
      alt={name}
      className={`${dim} rounded-full object-cover border-2 border-[#B8976A]/30 dark:border-[#D4BC8E]/30 shadow-md flex-shrink-0`}
    />
  ) : (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-[#B8976A] to-[#9A7B52] flex items-center justify-center shadow-md flex-shrink-0`}
    >
      <span className={`text-white font-bold ${text}`}>
        {name?.[0]?.toUpperCase()}
      </span>
    </div>
  );
}

/* ── Featured hero card ─── */
function FeaturedCard({ t }: { t: Testimonial }) {
  return (
    <FadeUp>
      <div className="relative rounded-3xl p-px mb-10 overflow-hidden">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#B8976A] via-[#D4BC8E] to-[#B8976A] animate-borderSpin" />
        <div className="relative rounded-3xl bg-[var(--surface-card)] dark:bg-[#1f1812] p-8 md:p-14 text-center overflow-hidden transition-colors duration-300">
          {/* radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(184,151,106,0.08),transparent)]" />

          {/* paw watermark */}
          <div className="absolute top-6 right-6 opacity-[0.04] dark:opacity-[0.03]">
            <PawSvg className="w-24 h-24 text-[var(--text-primary)]" />
          </div>

          <StitchCorner pos="tl" />
          <StitchCorner pos="br" />

          <div className="flex justify-center mb-6">
            <Quote className="w-14 h-14 text-[#B8976A]/40 dark:text-[#D4BC8E]/30 fill-[#B8976A]/10 drop-shadow" />
          </div>

          <div className="flex justify-center mb-6">
            <Stars rating={t.rating} size="lg" />
          </div>

          <blockquote
            className="relative z-10 text-[16px] md:text-[18px] text-[var(--text-primary)] leading-[1.9] max-w-3xl mx-auto mb-10 transition-colors duration-300"
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            &ldquo;{t.message}&rdquo;
          </blockquote>

          {/* bone divider */}
          <div className="flex justify-center mb-8">
            <BoneDivider className="text-[#B8976A]/30 dark:text-[#D4BC8E]/20 w-28" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[#B8976A]/15 scale-125"
              />
              <Avatar src={t.profileImage} name={t.name} size="lg" />
            </div>
            <div>
              <p
                className="font-bold text-[var(--text-primary)] text-[16px] mt-1 transition-colors duration-300"
                style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
              >
                {t.name}
              </p>
              <p
                className="text-[#B8976A] dark:text-[#D4BC8E] text-[15px] mt-0.5"
                style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: "italic" }}
              >
                {t.position ? `${t.position} · ` : ""}
                {t.location}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified Purchase
            </span>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

/* ── Grid testimonial card ─── */
function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl p-6 shadow-sm border border-[var(--border-base)]/40 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col gap-4"
    >
      {/* hover paw watermark */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500">
        <PawSvg className="w-16 h-16 text-[var(--text-primary)]" />
      </div>

      <StitchCorner pos="tl" />
      <StitchCorner pos="br" />

      <div className="relative z-10 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between">
          <span
            className="text-5xl leading-none text-[#B8976A]/30 dark:text-[#D4BC8E]/20 group-hover:text-[#B8976A]/50 dark:group-hover:text-[#D4BC8E]/40 transition-colors"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            &ldquo;
          </span>
          <Stars rating={t.rating} />
        </div>

        <p
          className="text-[var(--text-secondary)] text-[15px] md:text-[16px] leading-[1.85] flex-1 transition-colors duration-300"
          style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: "italic" }}
        >
          {t.message}
        </p>

        <div className="h-px bg-gradient-to-r from-[#B8976A]/30 dark:from-[#D4BC8E]/20 via-[#B8976A]/15 to-transparent" />

        <div className="flex items-center gap-3">
          <Avatar src={t.profileImage} name={t.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-[var(--text-primary)] text-[14px] truncate transition-colors duration-300"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
            >
              {t.name}
            </p>
            <p
              className="text-[13px] text-[#B8976A]/80 dark:text-[#D4BC8E]/70 truncate"
              style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              {t.position ? `${t.position} · ` : ""}
              {t.location}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Skeleton ─── */
function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl p-6 border border-[var(--border-base)]/40 animate-pulse"
        >
          <div className="h-7 w-7 bg-[var(--border-base)]/40 rounded mb-4" />
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="w-4 h-4 bg-[var(--border-base)]/30 rounded" />
            ))}
          </div>
          <div className="space-y-2 mb-6">
            {[100, 90, 80].map((w, j) => (
              <div key={j} className="h-3 bg-[var(--border-base)]/20 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-base)]/20">
            <div className="w-10 h-10 rounded-full bg-[var(--border-base)]/30 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-24 bg-[var(--border-base)]/20 rounded" />
              <div className="h-2 w-16 bg-[var(--border-base)]/15 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Info poster card ─── */
function InfoPosterCard({
  title,
  items,
  imageSrc,
  index,
}: {
  title: string;
  items: string[];
  imageSrc: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-[28px] bg-[var(--surface-card)] dark:bg-[#1f1812] shadow-[0_18px_55px_rgba(0,0,0,0.08)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 group"
    >
      <StitchCorner pos="tl" />
      <StitchCorner pos="tr" />
      <StitchCorner pos="bl" />
      <StitchCorner pos="br" />

      <div className="relative aspect-[16/11] w-full bg-[var(--surface-image-bg)] overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--surface-card)] dark:from-[#1f1812] to-transparent transition-colors duration-300" />

        {/* paw watermark on image */}
        <div className="absolute top-4 right-4 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-500">
          <PawSvg className="w-12 h-12 text-white" />
        </div>
      </div>

      <div className="px-6 pb-10 pt-8 md:px-8">
        <h3
          className="text-center text-[20px] md:text-[22px] tracking-[0.10em] text-[var(--text-primary)] transition-colors duration-300"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontStyle: "italic" }}
        >
          {title}
        </h3>

        <div className="flex justify-center mt-4 mb-6">
          <BoneDivider className="text-[var(--border-base)] w-24" />
        </div>

        <ul
          className="mx-auto max-w-xl space-y-3 text-[15px] md:text-[16px] leading-[1.85] text-[var(--text-secondary)] transition-colors duration-300"
          style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: "italic" }}
        >
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-4">
              <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#B8976A] dark:bg-[#D4BC8E] transition-colors duration-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */
const shippingItems = [
  "Orders ship within 1–2 business days excluding bank holidays",
  "Delivery time varies by location across the UK",
  "Shipping fees shown clearly at checkout",
  "Free delivery available on qualifying orders",
  "Import taxes or duties apply for international orders",
];

const productItems = [
  "Suitable for most dog breeds and sizes",
  "Not recommended for puppies under 4 months",
  "Made from natural yak and cow milk — no additives",
  "Grain-free and gluten-free",
  "No artificial colours, flavours, or preservatives",
  "High protein and low fat for a healthy chew",
  "Supports dental health and reduces plaque",
  "Gentle on digestion — even for sensitive stomachs",
  "Supervision recommended during chewing",
  "Small leftover pieces can be microwaved 30–60 s for puff treats",
];

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayFade = useTransform(scrollYProgress, [0, 0.7], [0.3, 0.6]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials`)
      .then((r) => r.json())
      .then((data) => setTestimonials(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <main className="min-h-screen bg-[var(--surface-page)] transition-colors duration-300">
      {/* ═══════ HERO — dog photo with parallax ═══════ */}
      <div ref={heroRef} className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <img
            src="/images/dog-7.webp"
            alt="Happy dog with Highland Yak Chew"
            className="h-full w-full object-cover"
          />
        </motion.div>

        <motion.div className="absolute inset-0 bg-[#1a1410]" style={{ opacity: overlayFade }} />

        {/* floating paw silhouettes on hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: "8%", top: "20%", size: "w-10 h-10", rot: "-20deg", opacity: "0.06" },
            { left: "82%", top: "15%", size: "w-14 h-14", rot: "15deg", opacity: "0.05" },
            { left: "75%", top: "65%", size: "w-8 h-8", rot: "-35deg", opacity: "0.07" },
            { left: "15%", top: "70%", size: "w-12 h-12", rot: "25deg", opacity: "0.04" },
          ].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: Number(p.opacity), scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5 + i * 0.2 }}
              className={`absolute ${p.size} text-white`}
              style={{ left: p.left, top: p.top, transform: `rotate(${p.rot})` }}
            >
              <PawSvg className="w-full h-full" />
            </motion.div>
          ))}
        </div>

        {/* hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-4"
          >
            <PawSvg className="w-5 h-5 text-[#D4BC8E]" />
            <span
              className="text-[12px] font-semibold tracking-[0.25em] uppercase text-[#D4BC8E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Real Stories from Real Dogs
            </span>
            <PawSvg className="w-5 h-5 text-[#D4BC8E] scale-x-[-1]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-white text-[30px] md:text-[46px] lg:text-[54px] tracking-[0.06em] leading-tight"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            Testimonials
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 h-px w-28 md:w-40 bg-[#D4BC8E] origin-center"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-center text-white/75 text-[15px] md:text-[17px] max-w-lg"
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
          >
            Join thousands of happy dog owners across the UK who trust Highland Yak Chew
          </motion.p>
        </div>

        {/* bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--surface-page)] to-transparent" />
      </div>

      {/* ═══════ TRUST STATS ═══════ */}
      <section className="mx-auto max-w-5xl px-4 py-12 md:py-16 relative">
        <FloatingPaws />
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { Icon: Star, fill: true, stat: "4.9", label: "Average Rating" },
            { Icon: BadgeCheck, fill: false, stat: "500+", label: "Verified Reviews" },
            { Icon: ShieldCheck, fill: false, stat: "Vet", label: "Approved Formula" },
            { Icon: Heart, fill: true, stat: "100%", label: "Natural Ingredients" },
          ].map(({ Icon, fill, stat, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="relative bg-[var(--surface-card)] dark:bg-[#1f1812] border border-[var(--border-base)]/40 rounded-2xl p-5 text-center transition-all duration-300 group"
            >
              {/* paw on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-400">
                <PawSvg className="w-8 h-8 text-[var(--text-primary)]" />
              </div>

              <div className="flex justify-center mb-2">
                <Icon
                  className={`w-5 h-5 text-[#B8976A] dark:text-[#D4BC8E] transition-colors duration-200 ${fill ? "fill-[#B8976A]/30" : ""}`}
                />
              </div>
              <p
                className="text-2xl font-bold text-[var(--text-primary)] transition-colors duration-300"
                style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
              >
                {stat}
              </p>
              <p
                className="text-xs font-medium mt-0.5 tracking-wide text-[var(--text-muted)] transition-colors duration-300"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ DOG PHOTO STRIP ═══════ */}
      <FadeUp className="max-w-6xl mx-auto px-4 md:px-6 pb-10">
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {["/images/dog-10.webp", "/images/dog-19.webp", "/images/dog-24.webp", "/images/dog-28.webp"].map(
            (src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group"
              >
                <img
                  src={src}
                  alt="Dog enjoying Highland Yak Chew"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* paw on hover */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                  <PawSvg className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
              </motion.div>
            )
          )}
        </div>
      </FadeUp>

      {/* ═══════ BONE DIVIDER ═══════ */}
      <FadeUp className="flex justify-center py-6">
        <BoneDivider className="text-[var(--border-base)] w-32 md:w-40" />
      </FadeUp>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="mx-auto max-w-7xl px-4 pb-10 relative">
        <FloatingPaws />

        <FadeUp className="text-center mb-10 relative">
          <div className="flex items-center justify-center gap-3 mb-3">
            <PawSvg className="w-4 h-4 text-[#B8976A] dark:text-[#D4BC8E] -rotate-12" />
            <span
              className="text-[12px] font-semibold tracking-[0.22em] uppercase text-[#B8976A] dark:text-[#D4BC8E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Customer Reviews
            </span>
            <PawSvg className="w-4 h-4 text-[#B8976A] dark:text-[#D4BC8E] rotate-12 scale-x-[-1]" />
          </div>
          <h2
            className="text-[24px] md:text-[32px] tracking-[0.08em] text-[var(--text-primary)] transition-colors duration-300"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            Hear From Our Happy Pups
          </h2>
        </FadeUp>

        {loading ? (
          <SkeletonCards />
        ) : testimonials.length > 0 ? (
          <>
            {featured && <FeaturedCard t={featured} />}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((t, i) => (
                  <TestimonialCard key={t._id} t={t} index={i} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <PawSvg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
            <p
              className="text-[16px] font-semibold text-[var(--text-secondary)] mb-1"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
            >
              No reviews yet
            </p>
            <p
              className="text-[15px] text-[var(--text-muted)]"
              style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: "italic" }}
            >
              Be the first to share your experience!
            </p>
          </div>
        )}
      </section>

      {/* ═══════ SHIPPING & PRODUCT INFO ═══════ */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <FadeUp className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-[#B8976A] dark:bg-[#D4BC8E]" />
            <span
              className="text-[12px] font-semibold tracking-[0.22em] uppercase text-[#B8976A] dark:text-[#D4BC8E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Good to Know
            </span>
            <div className="h-px w-10 bg-[#B8976A] dark:bg-[#D4BC8E]" />
          </div>
        </FadeUp>

        <div className="grid gap-8 lg:grid-cols-2">
          <InfoPosterCard title="SHIPPING" items={shippingItems} imageSrc="/images/dog-14.webp" index={0} />
          <InfoPosterCard title="PRODUCTS" items={productItems} imageSrc="/images/dog-21.webp" index={1} />
        </div>
      </section>

      {/* ═══════ WHY DOGS CHOOSE US ═══════ */}
      <section className="mx-auto max-w-5xl px-4 py-12 md:py-16 relative">
        <FloatingPaws />

        <FadeUp className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#B8976A] dark:bg-[#D4BC8E]" />
            <span
              className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#B8976A] dark:text-[#D4BC8E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              The Highland Difference
            </span>
            <div className="h-px w-10 bg-[#B8976A] dark:bg-[#D4BC8E]" />
          </div>
          <h2
            className="text-[24px] md:text-[32px] tracking-[0.04em] text-[var(--text-primary)] transition-colors duration-300"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            Why Dogs &amp; Owners Choose Us
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            {
              Icon: Timer,
              title: "Long-Lasting Chews",
              desc: "Our yak milk chews last hours — not minutes. Keep your dog engaged and calm naturally.",
            },
            {
              Icon: Leaf,
              title: "100% Natural Recipe",
              desc: "No grain, no gluten, no artificial additives. Just wholesome yak and cow milk from Himalayan pastures.",
            },
            {
              Icon: Stethoscope,
              title: "Vet-Approved Formula",
              desc: "Recommended by veterinarians for dental health, protein content, and gentle digestion.",
            },
          ].map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative bg-[var(--surface-card)] dark:bg-[#1f1812] border border-[var(--border-base)]/40 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            >
              {/* gold top accent */}
              <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#B8976A] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

              {/* paw watermark */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500">
                <PawSvg className="w-14 h-14 text-[var(--text-primary)]" />
              </div>

              <div className="relative w-14 h-14 mx-auto mb-5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#B8976A]/15 dark:bg-[#D4BC8E]/10 blur-md group-hover:bg-[#B8976A]/25 transition-colors duration-300" />
                <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-[#B8976A]/10 dark:bg-[#D4BC8E]/10 border border-[#B8976A]/20 dark:border-[#D4BC8E]/15">
                  <Icon className="w-5 h-5 text-[#B8976A] dark:text-[#D4BC8E]" />
                </div>
              </div>

              <h3
                className="text-lg md:text-xl mb-2 text-[var(--text-primary)] transition-colors duration-300"
                style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed text-[var(--text-muted)] transition-colors duration-300"
                style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ CTA BANNER ═══════ */}
      <FadeUp className="mx-auto max-w-4xl px-4 pb-16">
        <div
          className="relative rounded-3xl overflow-hidden p-10 md:p-14 text-center shadow-xl"
          style={{ background: "linear-gradient(135deg, #2E1F14, #3D2B1C, #4a3528)" }}
        >
          {/* grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
              backgroundSize: "200px 200px",
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B8976A] to-transparent" />

          {/* decorative paws */}
          <div className="absolute top-6 left-6 opacity-[0.06]">
            <PawSvg className="w-16 h-16 text-white -rotate-12" />
          </div>
          <div className="absolute bottom-6 right-6 opacity-[0.06]">
            <PawSvg className="w-14 h-14 text-white rotate-20 scale-x-[-1]" />
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-[#B8976A]/40 flex items-center justify-center bg-[#B8976A]/10">
              <Heart className="w-6 h-6 text-[#D4BC8E] fill-[#D4BC8E]/20" />
            </div>

            <h2
              className="text-2xl md:text-[32px] text-[#F4EDE4] mb-3 tracking-[0.02em]"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
            >
              Your Dog Deserves the Best
            </h2>
            <p
              className="text-[#c8b6a6] mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed"
              style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
            >
              Join thousands of UK pup parents and try Highland Yak Chew. Natural, long-lasting, and
              tail-waggingly good.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/products"
                  className="group inline-flex items-center justify-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-300 tracking-wide shadow-lg hover:shadow-xl bg-gradient-to-r from-[#B8976A] to-[#9A7B52] text-white"
                >
                  Shop All Products
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/products/yak-chews"
                  className="inline-flex items-center justify-center text-sm font-semibold text-[#D4BC8E] border border-[#B8976A]/30 px-8 py-3.5 rounded-full hover:bg-[#B8976A]/10 hover:border-[#B8976A]/50 transition-all duration-300 tracking-wide"
                >
                  Try Yak Milk Chews
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* ═══════ GLOBAL STYLES ═══════ */}
      <style jsx global>{`
        @keyframes borderSpin {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-borderSpin {
          background-size: 300% 300%;
          animation: borderSpin 4s ease infinite;
        }

        @keyframes paw-float {
          0% {
            transform: translateY(0) rotate(var(--tw-rotate, 0deg));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-110vh) rotate(var(--tw-rotate, 0deg));
            opacity: 0;
          }
        }
        .animate-paw-float {
          animation: paw-float var(--dur, 16s) linear infinite;
        }

        @keyframes stitch-dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 22;
          }
        }
        .animate-stitch-slow {
          animation: stitch-dash 3s linear infinite;
        }
      `}</style>
    </main>
  );
};

export default Testimonials;
