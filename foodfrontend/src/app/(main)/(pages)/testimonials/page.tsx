"use client";

import React, { useEffect, useState } from "react";
import {
  Star, Quote, BadgeCheck, ShieldCheck, Bone, Heart,
  Timer, Leaf, Stethoscope, ArrowRight,
} from "lucide-react";
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

/* ── Stars ──────────────────────────────────────────────────────────── */
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

/* ── Avatar ──────────────────────────────────────────────────────────── */
function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-20 h-20" : size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const text = size === "lg" ? "text-3xl" : "text-base";
  return src ? (
    <img src={src} alt={name} className={`${dim} rounded-full object-cover border-2 border-amber-200 dark:border-amber-700 shadow-md flex-shrink-0`} />
  ) : (
    <div className={`${dim} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0`}>
      <span className={`text-white font-bold ${text}`}>{name?.[0]?.toUpperCase()}</span>
    </div>
  );
}

/* ── Featured hero card ───────────────────────────────────────────── */
function FeaturedCard({ t }: { t: Testimonial }) {
  return (
    <div className="featured-card relative rounded-3xl p-px mb-10 overflow-hidden">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 animate-borderSpin" />
      <div className="relative rounded-3xl bg-[#fffdf8] dark:bg-[#1e160f] p-8 md:p-14 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(251,191,36,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(251,191,36,0.06),transparent)]" />
        <div className="flex justify-center mb-6">
          <Quote className="w-14 h-14 text-amber-300 dark:text-amber-500 fill-amber-100 dark:fill-amber-900/30 drop-shadow" />
        </div>
        <div className="flex justify-center mb-6"><Stars rating={t.rating} size="lg" /></div>
        <blockquote
          className="relative z-10 text-[15px] md:text-[16px] text-[#3d2512] dark:text-[#d4c4b0] leading-[1.95] max-w-4xl mx-auto mb-10"
          style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
        >
          &ldquo;{t.message}&rdquo;
        </blockquote>
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-600" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-600" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 scale-125 opacity-15 animate-pulse" />
            <Avatar src={t.profileImage} name={t.name} size="lg" />
          </div>
          <div>
            <p
              className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-[15px] md:text-[16px] mt-1"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif' }}
            >{t.name}</p>
            <p
              className="text-amber-600 dark:text-amber-400 text-[15px] md:text-[16px] mt-0.5"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
            >
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
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between">
          <span className="text-5xl leading-none text-amber-300 dark:text-amber-600 font-serif group-hover:text-amber-400 dark:group-hover:text-amber-500 transition-colors">&ldquo;</span>
          <Stars rating={t.rating} />
        </div>
        <p
          className="text-neutral-700 dark:text-neutral-300 text-[15px] md:text-[16px] leading-[1.95] flex-1"
          style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
        >{t.message}</p>
        <div className="h-px bg-gradient-to-r from-amber-200 dark:from-amber-700 via-amber-400/60 to-transparent" />
        <div className="flex items-center gap-3">
          <Avatar src={t.profileImage} name={t.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-[#2f1e14] dark:text-[#f5e9dc] text-[15px] md:text-[16px] truncate"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif' }}
            >{t.name}</p>
            <p
              className="text-[15px] md:text-[16px] text-amber-600/80 dark:text-amber-400/80 truncate"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
            >
              {t.position ? `${t.position} · ` : ""}{t.location}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
            <BadgeCheck className="w-3 h-3" /> Verified
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
        <div key={i} className="bg-white dark:bg-[#1e160f] rounded-2xl p-6 shadow-sm border border-amber-100/60 dark:border-amber-900/30 animate-pulse">
          <div className="h-7 w-7 bg-amber-100 dark:bg-amber-900/40 rounded mb-4" />
          <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <div key={j} className="w-4 h-4 bg-amber-100 dark:bg-amber-900/40 rounded" />)}</div>
          <div className="space-y-2 mb-6">{[100, 90, 80].map((w, j) => <div key={j} className="h-3 bg-gray-100 dark:bg-gray-700 rounded" style={{ width: `${w}%` }} />)}</div>
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

/* ── Info poster card (original design with image) ──────────────────── */
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
        <ul
          className="mx-auto mt-8 max-w-xl space-y-3 text-[15px] md:text-[16px] leading-[1.95] text-neutral-800 dark:text-neutral-200"
          style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
        >
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

/* ── Data ───────────────────────────────────────────────────────────── */
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

  return (
    <main className="min-h-screen bg-[#fbf8f2] dark:bg-[#1a120d] transition-colors duration-300">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-[#fbf8f2] dark:bg-[#1a120d] pt-32 pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1
            className="text-[26px] md:text-[32px] tracking-[0.14em] text-neutral-900 dark:text-neutral-100"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
          >
            TESTIMONIALS
          </h1>
          <div className="mx-auto mt-5 h-px w-24 bg-neutral-300/80 dark:bg-neutral-600/60" />
          <p
            className="mt-8 text-[15px] md:text-[16px] leading-[1.95] text-neutral-800 dark:text-neutral-300"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
          >
            Join thousands of happy dog owners across the UK who trust Highland Yakchew for natural,
            long-lasting yak milk chews their pups absolutely love.
          </p>
        </div>
      </div>

      {/* ── Shipping & Product Info ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <InfoPosterCard title="SHIPPING" items={shippingItems} imageSrc="/images/ship.jpg" />
          <InfoPosterCard title="PRODUCTS" items={productItems}  imageSrc="/images/about.webp" />
        </div>
      </section>

      {/* ── Trust stats cards ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { Icon: Star, fill: true, stat: "4.9", label: "Average Rating" },
            { Icon: BadgeCheck, fill: false, stat: "500+", label: "Verified Reviews" },
            { Icon: ShieldCheck, fill: false, stat: "Vet", label: "Approved Formula" },
            { Icon: Heart, fill: true, stat: "100%", label: "Natural Ingredients" },
          ].map(({ Icon, fill, stat, label }) => (
            <div key={label} className="group bg-white dark:bg-[#1e160f] border border-[#2E1F14]/6 dark:border-[#3a2c23] rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex justify-center mb-2">
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${fill ? 'fill-[#B8976A]/30' : ''}`}
                  style={{ color: 'var(--color-gold)' }}
                />
              </div>
              <p className="font-antique text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {stat}
              </p>
              <p className="text-xs font-medium mt-0.5 tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="text-center mb-10">
          <span
            className="inline-block text-[15px] md:text-[16px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-2"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
          >
            Customer Reviews
          </span>
          <h2
            className="text-[24px] md:text-[30px] tracking-[0.14em] text-neutral-900 dark:text-neutral-100"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
          >
            HEAR FROM OUR HAPPY PUPS
          </h2>
        </div>

        {loading ? (
          <Skeleton />
        ) : testimonials.length > 0 ? (
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
        ) : (
          <div className="text-center py-16 text-[#7A5C4F] dark:text-[#c8b6a6]">
            <Quote className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p
              className="text-[15px] md:text-[16px] font-semibold mb-1"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif' }}
            >No reviews yet</p>
            <p
              className="text-[15px] md:text-[16px]"
              style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif', fontStyle: "italic" }}
            >Be the first to share your experience!</p>
          </div>
        )}
      </section>


      {/* ── Why dog owners love us ───────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: 'var(--color-gold)' }} />
            <span
              className="text-[11px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              The Highland Difference
            </span>
            <div className="h-px w-10" style={{ background: 'var(--color-gold)' }} />
          </div>
          <h2
            className="font-antique text-2xl md:text-[32px] tracking-[-0.01em] leading-[1.2]"
            style={{ color: 'var(--text-primary)' }}
          >
            Why Dogs (And Owners) Choose Us
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { Icon: Timer, title: "Long-Lasting Chews", desc: "Our yak milk chews last hours — not minutes. Keep your dog engaged and calm naturally.", accent: 'rgba(184,151,106,0.35)' },
            { Icon: Leaf, title: "100% Natural Recipe", desc: "No grain, no gluten, no artificial additives. Just wholesome yak and cow milk from Himalayan pastures.", accent: 'rgba(154,123,82,0.35)' },
            { Icon: Stethoscope, title: "Vet-Approved Formula", desc: "Recommended by veterinarians for dental health, protein content, and gentle digestion.", accent: 'rgba(212,188,142,0.35)' },
          ].map(({ Icon, title, desc, accent }, i) => (
            <div
              key={title}
              className="group relative bg-white dark:bg-[#1e160f] border border-[#2E1F14]/6 dark:border-[#3a2c23] rounded-2xl p-8 text-center hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] hover:-translate-y-1.5 transition-all duration-300 card-animate"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Gold top accent line */}
              <div
                className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)' }}
              />

              {/* Icon with glow */}
              <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-300"
                  style={{ background: accent, filter: 'blur(12px)' }}
                />
                <div
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center border"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,253,248,0.9), rgba(244,237,228,0.7))',
                    borderColor: 'var(--color-gold-light)',
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-[#1e160f] opacity-0 dark:opacity-100" />
                  <Icon className="relative z-10 w-5 h-5" style={{ color: 'var(--color-gold)' }} />
                </div>
              </div>

              <h3
                className="font-antique text-lg md:text-xl mb-2"
                style={{ color: 'var(--text-primary)' }}
              >{title}</h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-14 text-center shadow-xl" style={{ background: 'linear-gradient(135deg, #2E1F14, #3D2B1C, #4a3528)' }}>
          {/* Subtle grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />
          {/* Gold border accent at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 10%, #B8976A 50%, transparent 90%)' }} />

          <div className="relative z-10">
            {/* Icon */}
            <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-[#B8976A]/40 flex items-center justify-center" style={{ background: 'rgba(184,151,106,0.1)' }}>
              <Heart className="w-6 h-6 text-[#D4BC8E] fill-[#D4BC8E]/20" />
            </div>

            <h2 className="font-antique text-2xl md:text-[32px] text-[#F4EDE4] mb-3 tracking-[-0.01em]">
              Your Dog Deserves the Best
            </h2>
            <p className="text-[#c8b6a6] mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed">
              Join thousands of UK pup parents and try Highland Yakchew. Natural, long-lasting, and tail-waggingly good.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-300 tracking-wide shadow-lg hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #B8976A, #9A7B52)', color: '#fff' }}
              >
                Shop All Products
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/products/yak-chews"
                className="inline-flex items-center justify-center text-sm font-semibold text-[#D4BC8E] border border-[#B8976A]/30 px-8 py-3.5 rounded-full hover:bg-[#B8976A]/10 hover:border-[#B8976A]/50 transition-all duration-300 tracking-wide"
              >
                Try Yak Milk Chews
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes borderSpin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-borderSpin { background-size: 300% 300%; animation: borderSpin 4s ease infinite; }
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
