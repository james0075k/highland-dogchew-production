"use client";

import React, { useEffect, useState } from "react";
import { Star, Quote, BadgeCheck, ShieldCheck, Bone, Heart } from "lucide-react";
import Link from "next/link";

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
        <Star
          key={s}
          className={`${cls} ${
            s <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200 dark:text-gray-600 dark:fill-gray-600"
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
      className={`${dim} rounded-full object-cover border-2 border-amber-200 dark:border-amber-700 shadow-md flex-shrink-0`}
    />
  ) : (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0`}
    >
      <span className={`text-white font-bold ${text}`}>{name?.[0]?.toUpperCase()}</span>
    </div>
  );
}

/* ── Featured hero card ───────────────────────────────────────────── */
function FeaturedCard({ t }: { t: Testimonial }) {
  return (
    <div className="featured-card relative rounded-3xl p-px mb-10 overflow-hidden">
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 animate-borderSpin" />
      <div className="relative rounded-3xl bg-[#fffdf8] dark:bg-[#1e160f] p-8 md:p-14 text-center overflow-hidden">
        {/* Soft glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(251,191,36,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(251,191,36,0.06),transparent)]" />

        {/* Large quote */}
        <div className="flex justify-center mb-6">
          <Quote className="w-14 h-14 text-amber-300 dark:text-amber-500 fill-amber-100 dark:fill-amber-900/30 drop-shadow" />
        </div>

        {/* Stars */}
        <div className="flex justify-center mb-6">
          <Stars rating={t.rating} size="lg" />
        </div>

        {/* Message */}
        <blockquote className="relative z-10 text-xl md:text-2xl lg:text-[1.65rem] text-[#3d2512] dark:text-[#d4c4b0] leading-relaxed max-w-4xl mx-auto mb-10 font-serif italic">
          &ldquo;{t.message}&rdquo;
        </blockquote>

        {/* Divider */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-600" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-600" />
        </div>

        {/* Author */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 scale-125 opacity-15 animate-pulse" />
            <Avatar src={t.profileImage} name={t.name} size="lg" />
          </div>
          <div>
            <p className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-xl mt-1">{t.name}</p>
            <p className="text-amber-600 dark:text-amber-400 text-sm mt-0.5">
              {t.position ? `${t.position} · ` : ""}{t.location}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified Purchase
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Regular grid card ──────────────────────────────────────────────── */
function TestimonialCard({ t, delay = 0 }: { t: Testimonial; delay?: number }) {
  return (
    <div
      className="group relative bg-white dark:bg-[#1e160f] rounded-2xl p-6 shadow-sm border border-amber-100/70 dark:border-amber-900/30 hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-4 card-animate"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col gap-4 h-full">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <span className="text-5xl leading-none text-amber-300 dark:text-amber-600 font-serif group-hover:text-amber-400 dark:group-hover:text-amber-500 transition-colors">
            &ldquo;
          </span>
          <Stars rating={t.rating} />
        </div>

        {/* Message */}
        <p className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-relaxed flex-1 font-serif italic">
          {t.message}
        </p>

        {/* Gradient bottom line */}
        <div className="h-px bg-gradient-to-r from-amber-200 dark:from-amber-700 via-amber-400/60 to-transparent" />

        {/* Author row */}
        <div className="flex items-center gap-3">
          <Avatar src={t.profileImage} name={t.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-sm truncate">{t.name}</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 truncate">
              {t.position ? `${t.position} · ` : ""}{t.location}
            </p>
          </div>
          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
            ✓ Verified
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1e160f] rounded-2xl p-6 shadow-sm border border-amber-100/60 dark:border-amber-900/30 animate-pulse"
        >
          <div className="h-7 w-7 bg-amber-100 dark:bg-amber-900/40 rounded mb-4" />
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="w-4 h-4 bg-amber-100 dark:bg-amber-900/40 rounded" />
            ))}
          </div>
          <div className="space-y-2 mb-6">
            {[100, 90, 80].map((w, j) => (
              <div
                key={j}
                className="h-3 bg-gray-100 dark:bg-gray-700 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-amber-50 dark:border-amber-900/30">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Info poster card ───────────────────────────────────────────────── */
function InfoPosterCard({ title, items, imageSrc }: { title: string; items: string[]; imageSrc: string }) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#fbf8f2] dark:bg-[#1e160f] shadow-[0_18px_55px_rgba(0,0,0,0.10)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.4)] ring-1 ring-black/5 dark:ring-white/5">
      <div className="relative aspect-[16/11] w-full bg-neutral-200 dark:bg-neutral-800">
        <img src={imageSrc} alt={`${title} poster image`} className="h-full w-full object-cover grayscale" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf8f2] dark:from-[#1e160f] to-transparent" />
      </div>
      <div className="px-6 pb-12 pt-10 md:px-10 md:pb-14 md:pt-10">
        <h3 className="text-center text-[22px] md:text-[24px] tracking-[0.10em] text-neutral-900 dark:text-neutral-100 font-serif italic">
          {title}
        </h3>
        <div className="mx-auto mt-5 h-px w-20 bg-neutral-300/80 dark:bg-neutral-600/80" />
        <ul className="mx-auto mt-8 max-w-xl space-y-3 text-[18px] leading-relaxed text-neutral-800 dark:text-neutral-200 md:text-[19px] font-serif italic">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-4">
              <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const shipping = [
  "Orders ship within 1–2 business days excluding bank holidays",
  "Delivery time varies by location across the UK",
  "Shipping fees shown clearly at checkout",
  "Free delivery available on qualifying orders",
  "Import taxes or duties apply for international orders",
];

const products = [
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

/* ── Page ───────────────────────────────────────────────────────────── */
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
    <main className="min-h-screen bg-[#f6f2ea] dark:bg-[#0f0a07] pt-32 transition-colors duration-300">

      {/* ── Hero header ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pt-10 pb-8 text-center">
        <span className="inline-block text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-3">
          What Dog Owners Say
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-4 leading-tight">
          Real Dogs. Real Results.
        </h1>
        <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 mb-6" />
        <p className="text-[#7A5C4F] dark:text-[#c8b6a6] max-w-xl mx-auto text-base leading-relaxed">
          Join thousands of happy dog owners across the UK who trust Highland Dogchew for natural,
          long-lasting yak milk chews their pups absolutely love.
        </p>
      </section>

      {/* ── Trust stats bar ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />, stat: "4.9★", label: "Average Rating" },
            { icon: <BadgeCheck className="w-5 h-5 text-emerald-500" />, stat: "500+", label: "Verified Reviews" },
            { icon: <ShieldCheck className="w-5 h-5 text-blue-500" />, stat: "Vet", label: "Approved Formula" },
            { icon: <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />, stat: "100%", label: "Natural Ingredients" },
          ].map(({ icon, stat, label }) => (
            <div
              key={label}
              className="bg-white dark:bg-[#1e160f] border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-2">{icon}</div>
              <p className="text-2xl font-black text-[#2f1e14] dark:text-[#f5e9dc]">{stat}</p>
              <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      {(loading || testimonials.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 pb-10">
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {featured && <FeaturedCard t={featured} />}
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

      {/* ── Overall rating strip ──────────────────────────────────────── */}
      {avg && !loading && (
        <section className="bg-[#2f1e14] dark:bg-[#1a100a] py-14 mt-6">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-amber-400/80 text-xs font-bold uppercase tracking-widest mb-4">
              Overall Customer Rating
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <span className="text-7xl font-black text-white leading-none">{avg}</span>
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-7 h-7 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-amber-100/60 text-xs">
                  Based on {testimonials.length} verified review{testimonials.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <p className="text-amber-200/60 text-sm max-w-sm mx-auto leading-relaxed">
              Every review comes from a real dog owner who has tried our products.
            </p>
          </div>
        </section>
      )}

      {/* ── Why dog owners love us ───────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-2">
            The Highland Difference
          </span>
          <h2 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
            Why Dogs (and Owners) Choose Us
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: "🦴",
              title: "Long-Lasting Chews",
              desc: "Our yak milk chews last hours — not minutes. Keep your dog engaged and calm naturally.",
            },
            {
              emoji: "🌿",
              title: "100% Natural Recipe",
              desc: "No grain, no gluten, no artificial additives. Just wholesome yak and cow milk from Himalayan pastures.",
            },
            {
              emoji: "🐾",
              title: "Vet-Approved Formula",
              desc: "Recommended by veterinarians for dental health, protein content, and gentle digestion.",
            },
          ].map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#1e160f] border border-amber-100 dark:border-amber-900/30 rounded-2xl p-7 text-center shadow-sm hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">{title}</h3>
              <p className="text-sm text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pb-14">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-10 text-center shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[url('/images/paws-pattern.svg')] bg-repeat bg-[length:80px]" />
          <div className="relative z-10">
            <Bone className="w-10 h-10 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
              Your Dog Deserves the Best
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto text-base leading-relaxed">
              Join thousands of UK pup parents and try Highland Dogchew. Natural, long-lasting, and
              tail-waggingly good.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="inline-block bg-white text-amber-700 font-bold px-8 py-3.5 rounded-full hover:bg-amber-50 transition-colors shadow-lg text-sm tracking-wide"
              >
                Shop All Products
              </Link>
              <Link
                href="/products/yak-chews"
                className="inline-block bg-white/10 text-white border border-white/30 font-semibold px-8 py-3.5 rounded-full hover:bg-white/20 transition-colors text-sm tracking-wide"
              >
                Try Yak Milk Chews
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shipping & Products info ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-14 md:pb-20">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-2">
            Good to Know
          </span>
          <h2 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc]">
            Shipping & Product Info
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <InfoPosterCard title="SHIPPING" items={shipping} imageSrc="/images/ship.jpg" />
          <InfoPosterCard title="PRODUCTS" items={products} imageSrc="/images/about.webp" />
        </div>
      </section>

      <style jsx>{`
        @keyframes borderSpin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-borderSpin {
          background-size: 300% 300%;
          animation: borderSpin 4s ease infinite;
        }
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
