"use client";

import React, { useEffect, useState } from "react";
import { Star, Quote, BadgeCheck } from "lucide-react";

interface Testimonial {
  _id: string;
  name: string;
  position?: string;
  location: string;
  rating: number;
  message: string;
  profileImage?: string;
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  );
}

function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-20 h-20" : size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const text = size === "lg" ? "text-3xl" : "text-base";
  return src ? (
    <img src={src} alt={name} className={`${dim} rounded-full object-cover border-2 border-amber-200 shadow-md flex-shrink-0`} />
  ) : (
    <div className={`${dim} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0`}>
      <span className={`text-white font-bold ${text}`}>{name?.[0]?.toUpperCase()}</span>
    </div>
  );
}

/* ── Featured hero card (first testimonial) ──────────────────────────── */
function FeaturedCard({ t }: { t: Testimonial }) {
  return (
    <div className="featured-card relative rounded-3xl p-px mb-10 overflow-hidden">
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 animate-borderSpin" />
      <div className="relative rounded-3xl bg-[#fffdf8] p-8 md:p-14 text-center overflow-hidden">
        {/* Soft glow bg */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(251,191,36,0.12),transparent)]" />

        {/* Large quote */}
        <div className="flex justify-center mb-6">
          <Quote className="w-14 h-14 text-amber-300 fill-amber-100 drop-shadow" />
        </div>

        {/* Stars */}
        <div className="flex justify-center mb-6">
          <Stars rating={t.rating} size="lg" />
        </div>

        {/* Message */}
        <blockquote className="relative z-10 text-xl md:text-2xl lg:text-[1.65rem] text-[#3d2512] leading-relaxed max-w-4xl mx-auto mb-10 font-serif italic">
          &ldquo;{t.message}&rdquo;
        </blockquote>

        {/* Divider */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-300" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-300" />
        </div>

        {/* Author */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 scale-125 opacity-15 animate-pulse" />
            <Avatar src={t.profileImage} name={t.name} size="lg" />
          </div>
          <div>
            <p className="font-bold text-[#2f1e14] text-xl mt-1">{t.name}</p>
            <p className="text-amber-600 text-sm mt-0.5">
              {t.position ? `${t.position} · ` : ""}{t.location}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified Purchase
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Regular grid card ───────────────────────────────────────────────── */
function TestimonialCard({ t, delay = 0 }: { t: Testimonial; delay?: number }) {
  return (
    <div
      className="group relative bg-white rounded-2xl p-6 shadow-sm border border-amber-100/70 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-4 card-animate"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col gap-4 h-full">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <span className="text-5xl leading-none text-amber-300 font-serif group-hover:text-amber-400 transition-colors">&ldquo;</span>
          <Stars rating={t.rating} />
        </div>

        {/* Message */}
        <p className="text-neutral-700 text-[15px] leading-relaxed flex-1 font-serif italic">
          {t.message}
        </p>

        {/* Gradient bottom line */}
        <div className="h-px bg-gradient-to-r from-amber-200 via-amber-400/60 to-transparent" />

        {/* Author row */}
        <div className="flex items-center gap-3">
          <Avatar src={t.profileImage} name={t.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#2f1e14] text-sm truncate">{t.name}</p>
            <p className="text-xs text-amber-600/80 truncate">
              {t.position ? `${t.position} · ` : ""}{t.location}
            </p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
            ✓ Verified
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100/60 animate-pulse">
          <div className="h-7 w-7 bg-amber-100 rounded mb-4" />
          <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <div key={j} className="w-4 h-4 bg-amber-100 rounded" />)}</div>
          <div className="space-y-2 mb-6">
            {[100, 90, 80].map((w, j) => <div key={j} className={`h-3 bg-gray-100 rounded`} style={{ width: `${w}%` }} />)}
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-amber-50">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex-shrink-0" />
            <div className="space-y-1 flex-1"><div className="h-3 w-24 bg-gray-200 rounded" /><div className="h-2 w-16 bg-gray-100 rounded" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Info poster card ────────────────────────────────────────────────── */
function InfoPosterCard({ title, items, imageSrc }: { title: string; items: string[]; imageSrc: string }) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#fbf8f2] shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-black/5">
      <div className="relative aspect-[16/11] w-full bg-neutral-200">
        <img src={imageSrc} alt={`${title} poster image`} className="h-full w-full object-cover grayscale" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf8f2] to-transparent" />
      </div>
      <div className="px-6 pb-12 pt-10 md:px-10 md:pb-14 md:pt-10">
        <h3 className="text-center text-[22px] md:text-[24px] tracking-[0.10em] text-neutral-900 font-serif italic">{title}</h3>
        <div className="mx-auto mt-5 h-px w-20 bg-neutral-300/80" />
        <ul className="mx-auto mt-8 max-w-xl space-y-3 text-[18px] leading-relaxed text-neutral-800 md:text-[19px] font-serif italic">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-4">
              <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-neutral-900" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const shipping = [
  "Orders ship within 1–2 business days excluding bank holiday",
  "Delivery time varies by location",
  "Shipping fees shown at checkout",
  "Domestic and limited international shipping available",
  "Import taxes or duties apply internationally",
];

const products = [
  "Suitable for most dog breeds and sizes",
  "Not recommended for puppies under 4 months",
  "Made from natural yak and cow milk",
  "Grain-free and gluten-free",
  "No artificial colors, flavors, or preservatives",
  "High protein and low fat",
  "Supports dental health",
  "Gentle on digestion",
  "Supervision recommended during chewing",
  "Small pieces can be microwaved for 30–60 seconds and cooled before feeding",
];

/* ── Page ────────────────────────────────────────────────────────────── */
const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials`)
      .then((r) => r.json())
      .then((data) => setTestimonials(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = testimonials[0];
  const rest = testimonials.slice(1);
  const avg = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : null;

  return (
    <main className="min-h-screen bg-[#f6f2ea] pt-24">

      {/* ── Section header ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6 text-center">
        <span className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-3">
          What Dog Owners Say
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#2f1e14] mb-4 leading-tight">
          Customer Testimonials
        </h1>
        <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 mb-5" />
        <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          Real reviews from real dog owners — discover why thousands of pups love Highland Dog Chew.
        </p>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      {(loading || testimonials.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 pb-10">
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {/* Featured hero card */}
              {featured && <FeaturedCard t={featured} />}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((t, i) => (
                    <TestimonialCard key={t._id} t={t} delay={i * 80} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Rating strip ───────────────────────────────────────────────── */}
      {avg && !loading && (
        <section className="bg-[#2f1e14] py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-amber-400/80 text-xs font-bold uppercase tracking-widest mb-3">
              Overall Rating
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl font-black text-white">{avg}</span>
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-7 h-7 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-amber-100/50 text-xs mt-1">
                  Based on {testimonials.length} review{testimonials.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Shipping & Products info ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-14 md:pb-20 pt-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <InfoPosterCard title="SHIPPING" items={shipping} imageSrc="/images/ship.jpg" />
          <InfoPosterCard title="PRODUCTS" items={products} imageSrc="/images/about.webp" />
        </div>
      </section>

      <style jsx>{`
        /* Featured card animated border */
        @keyframes borderSpin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-borderSpin {
          background-size: 300% 300%;
          animation: borderSpin 4s ease infinite;
        }

        /* Card entrance */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .featured-card { animation: fadeUp 0.7s ease both; }
        .card-animate  { animation: fadeUp 0.6s ease both; opacity: 0; animation-fill-mode: forwards; }
      `}</style>
    </main>
  );
};

export default Testimonials;
