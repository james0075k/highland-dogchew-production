// Hero is now a server component for the first frame so the LCP image lands in
// the initial HTML and the browser can start downloading it immediately.
// The carousel controls + parallax are isolated in a small client island below.

import Image from "next/image";
import Link from "next/link";
import HeroCarouselControls from "./HeroCarouselControls";

const slides = [
  "/videos/video1.webp",
  "/videos/video2.webp",
  "/videos/video3.webp",
];

const heroContent = [
  { heading: "Highland Yak Chew",    subtext: "Premium Himalayan treats, crafted with care" },
  { heading: "Pure & Natural",        subtext: "100% yak milk — no preservatives, no additives" },
  { heading: "Born in the Himalayas", subtext: "Ancient recipe, modern love for your dog" },
];

export default function RhodeHero() {
  return (
    <section className="relative h-[52vw] min-h-[280px] max-h-[520px] md:h-screen md:max-h-none w-full overflow-hidden bg-black">

      {/* First frame rendered server-side — this becomes the LCP element.
          fetchPriority="high" + priority tells Next/image to skip lazy loading
          and emit a preload <link> in the head. */}
      <Image
        src={slides[0]}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover hero-slide hero-slide-0"
      />

      {/* Preload slides 1 + 2 as plain Image so the carousel transition is instant.
          Lazy by default — no impact on LCP. */}
      <Image src={slides[1]} alt="" fill sizes="100vw" className="object-cover hero-slide hero-slide-1 opacity-0" />
      <Image src={slides[2]} alt="" fill sizes="100vw" className="object-cover hero-slide hero-slide-2 opacity-0" />

      {/* Overlay — lighter on mobile so text is readable */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-black/10 md:from-black/50 md:via-black/15 md:to-transparent" />

      {/* Hero text — bottom-left aligned (Rhode style). Rendered SSR for SEO. */}
      <div className="hero-text-stack relative z-10 flex flex-col items-start justify-end h-full px-5 pb-8 gap-2 md:px-12 md:pb-16 md:gap-4 max-w-3xl">
        {heroContent.map((c, i) => (
          <div
            key={i}
            data-slide={i}
            className={`hero-text-slide ${i === 0 ? "" : "absolute inset-x-5 bottom-8 md:inset-x-12 md:bottom-16 opacity-0 pointer-events-none"}`}
          >
            <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase text-white/75 font-sans">
              {c.subtext}
            </p>
            {i === 0 ? (
              <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-8xl font-serif tracking-wide text-white leading-tight mt-2 md:mt-4">
                {c.heading}
              </h1>
            ) : (
              <p className="text-2xl sm:text-3xl md:text-6xl lg:text-8xl font-serif tracking-wide text-white leading-tight mt-2 md:mt-4">
                {c.heading}
              </p>
            )}
            <Link
              href="/products"
              className="mt-3 md:mt-4 inline-block border border-white/80 rounded-full px-5 py-2 md:px-8 md:py-3 text-white text-[10px] sm:text-xs md:text-sm tracking-[0.18em] uppercase hover:bg-white hover:text-black transition-all duration-400 font-sans"
            >
              Shop Now
            </Link>
          </div>
        ))}
      </div>

      {/* Client island — carousel controls only. Doesn't block LCP. */}
      <HeroCarouselControls slideCount={slides.length} />
    </section>
  );
}
