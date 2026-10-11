// Hero is now a server component for the first frame so the LCP image lands in
// the initial HTML and the browser can start downloading it immediately.
// The carousel controls + parallax are isolated in a small client island below.

import Image from "next/image";
import Link from "next/link";
import HeroCarouselControls from "./HeroCarouselControls";

// Slides 2 + 3 are the brand film split in half at a scene change (18s, the
// steam wipe into the globe). Each plays to its end before the carousel moves on,
// so together they read as one continuous film. Posters are each part's first frame.
const slides = [
  "/videos/video1.webp",
  "/videos/hero-film-1.webp",
  "/videos/hero-film-2.webp",
];

const filmParts = [
  { slide: 1, name: "hero-film-1" },
  { slide: 2, name: "hero-film-2" },
];

// The film carries its own headlines, so the video slides get no overlay text.
const heroContent = [
  { heading: "Highland Yak Chew", subtext: "Premium Himalayan treats, crafted with care" },
];

export default function RhodeHero() {
  return (
    // Inset, rounded card (Rhode-style), locked to the film's 16:9 shape at every
    // width so it fills edge to edge — no letterboxing, and none of the film's
    // edge text (logo, headlines, end card) is ever cropped.
    <div className="px-3 pt-3 md:px-5 md:pt-4">
    <section className="relative aspect-video w-full overflow-hidden rounded-2xl md:rounded-3xl bg-black">

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

      {/* Film slides. preload="none" + no autoplay attribute means the browser
          fetches nothing until HeroCarouselControls plays/preloads them — zero
          impact on initial page load / LCP. No loop: the controls advance on
          `ended`. The section matches the film's 16:9, so object-cover crops nothing. */}
      {filmParts.map(({ slide, name }) => (
        <video
          key={name}
          className={`absolute inset-0 w-full h-full object-cover hero-slide hero-slide-${slide} opacity-0`}
          poster={slides[slide]}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src={`/videos/${name}.webm`} type="video/webm" />
          <source src={`/videos/${name}.mp4`} type="video/mp4" />
        </video>
      ))}

      {/* Overlay — lighter on mobile so text is readable. Faded out on film
          slides by HeroCarouselControls so the film's colours/text aren't dimmed. */}
      <div className="hero-overlay absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-black/10 md:from-black/50 md:via-black/15 md:to-transparent" />

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
    </div>
  );
}
