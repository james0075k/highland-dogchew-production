"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface Testimonial {
  _id: string;
  name: string;
  position?: string;
  location: string;
  rating: number;
  message: string;
  profileImage?: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="bg-[#fbf8f2] rounded-2xl p-6 shadow-md border border-amber-100/60 hover:shadow-lg transition-shadow flex flex-col gap-4">
      {/* Quote mark */}
      <span
        className="text-6xl leading-none text-amber-300 font-serif select-none"
        aria-hidden
      >
        &ldquo;
      </span>

      {/* Rating */}
      <StarRow rating={t.rating} />

      {/* Message */}
      <p
        className="text-neutral-700 text-[15px] leading-relaxed flex-1"
        style={{
          fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
          fontStyle: "italic",
        }}
      >
        {t.message}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-amber-100">
        {t.profileImage ? (
          <img
            src={t.profileImage}
            alt={t.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-amber-200"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-200">
            <span className="text-amber-600 font-bold text-base">
              {t.name?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-neutral-800 text-sm">{t.name}</p>
          <p className="text-xs text-neutral-500">
            {t.position ? `${t.position} · ` : ""}
            {t.location}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoPosterCard({
  title,
  items,
  imageSrc,
}: {
  title: string;
  items: string[];
  imageSrc: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#fbf8f2] shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-black/5">
      <div className="relative aspect-[16/11] w-full bg-neutral-200">
        <img
          src={imageSrc}
          alt={`${title} poster image`}
          className="h-full w-full object-cover grayscale"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf8f2] to-transparent" />
      </div>
      <div className="px-6 pb-12 pt-10 md:px-10 md:pb-14 md:pt-10">
        <h3
          className="text-center text-[22px] md:text-[24px] tracking-[0.10em] text-neutral-900"
          style={{
            fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
            fontStyle: "italic",
          }}
        >
          {title}
        </h3>
        <div className="mx-auto mt-5 h-px w-20 bg-neutral-300/80" />
        <ul
          className="mx-auto mt-8 max-w-xl space-y-3 text-[18px] leading-relaxed text-neutral-800 md:text-[19px]"
          style={{
            fontFamily: 'ui-serif, Georgia, "Times New Roman", Times, serif',
            fontStyle: "italic",
          }}
        >
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

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/testimonials`
        );
        const data = await res.json();
        // Backend returns array directly
        setTestimonials(Array.isArray(data) ? data : (data.data || []));
      } catch {
        // silently fail — show static content only
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f2ea] pt-24">
      {/* ─── Customer Testimonials ─── */}
      {(loading || testimonials.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          {/* Section header */}
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-2">
              What Dog Owners Say
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2f1e14]">
              Customer Testimonials
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber-500" />
            <p className="mt-4 text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              Real reviews from real dog owners — discover why thousands of
              pups love Highland Dog Chew.
            </p>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#fbf8f2] rounded-2xl p-6 shadow-md animate-pulse">
                  <div className="h-8 w-8 bg-amber-100 rounded mb-4" />
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-4 h-4 bg-amber-100 rounded" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-amber-100">
                    <div className="w-11 h-11 rounded-full bg-amber-100" />
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                      <div className="h-2 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard key={t._id} t={t} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─── Average Rating Strip ─── */}
      {testimonials.length > 0 && !loading && (
        <section className="bg-[#2f1e14] py-10">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-amber-400/80 text-sm font-semibold uppercase tracking-widest mb-2">
              Overall Rating
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-bold text-white">
                {(
                  testimonials.reduce((s, t) => s + t.rating, 0) /
                  testimonials.length
                ).toFixed(1)}
              </span>
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-6 h-6 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-amber-100/60 text-xs mt-1">
                  Based on {testimonials.length} review
                  {testimonials.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Shipping & Products Info ─── */}
      <section className="mx-auto max-w-7xl px-6 pb-14 md:pb-20 pt-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <InfoPosterCard
            title="SHIPPING"
            items={shipping}
            imageSrc="/images/ship.jpg"
          />
          <InfoPosterCard
            title="PRODUCTS"
            items={products}
            imageSrc="/images/about.webp"
          />
        </div>
      </section>
    </main>
  );
};

export default Testimonials;
