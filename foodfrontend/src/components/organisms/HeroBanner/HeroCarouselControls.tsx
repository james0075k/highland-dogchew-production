"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// Pure DOM-driven carousel controls. Cycles opacity on .hero-slide-N elements
// rendered by RhodeHero (server component) so the LCP image stays in the
// initial HTML and React doesn't need to remount images on each transition.
export default function HeroCarouselControls({ slideCount }: { slideCount: number }) {
  const [current, setCurrent]     = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const goTo = useCallback((i: number) => setCurrent(((i % slideCount) + slideCount) % slideCount), [slideCount]);

  // Sync DOM visibility whenever `current` changes.
  useEffect(() => {
    for (let i = 0; i < slideCount; i++) {
      const el = document.querySelector<HTMLElement>(`.hero-slide-${i}`);
      if (el) el.style.opacity = i === current ? "1" : "0";

      // Inactive video slides are stopped and rewound so they restart cleanly.
      if (el instanceof HTMLVideoElement && i !== current) {
        el.pause();
        el.currentTime = 0;
      }

      const txt = document.querySelector<HTMLElement>(`.hero-text-slide[data-slide="${i}"]`);
      if (txt) {
        txt.style.opacity = i === current ? "1" : "0";
        txt.style.pointerEvents = i === current ? "auto" : "none";
      }
    }

    const active = document.querySelector(`.hero-slide-${current}`);
    const overlay = document.querySelector<HTMLElement>(".hero-overlay");
    if (overlay) overlay.style.opacity = active instanceof HTMLVideoElement ? "0" : "1";

    // While one film part plays, warm up the next part so the film continues
    // across slides without a loading gap. Only from a video slide — the first
    // part's poster is its opening frame, so it can load on demand and the
    // initial page load downloads no video at all.
    const next = document.querySelector(`.hero-slide-${(current + 1) % slideCount}`);
    if (
      active instanceof HTMLVideoElement &&
      next instanceof HTMLVideoElement &&
      next.readyState === HTMLMediaElement.HAVE_NOTHING
    ) {
      next.preload = "auto";
      next.load();
    }
  }, [current, slideCount]);

  // Auto-advance. Image slides hold for 1s; video slides play to the end and
  // advance on `ended`, so the transition lands on the film's own scene change.
  useEffect(() => {
    const el = document.querySelector(`.hero-slide-${current}`);

    if (!(el instanceof HTMLVideoElement)) {
      if (!isPlaying) return;
      const t = setTimeout(() => goTo(current + 1), 1000);
      return () => clearTimeout(t);
    }

    if (!isPlaying) {
      el.pause();
      return;
    }

    let cancelled = false;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const onEnded = () => goTo(current + 1);
    el.addEventListener("ended", onEnded);
    // Playing is also what triggers the (preload="none") download if it wasn't
    // warmed up. Autoplay can be blocked (e.g. low-power mode) or the file can
    // fail — then the poster stays visible and we fall back to the image timing
    // so the carousel never gets stuck. `cancelled` ignores the AbortError a
    // pending play() throws when we pause it ourselves (slide change / pause).
    el.play().catch(() => {
      if (!cancelled) fallback = setTimeout(() => goTo(current + 1), 6000);
    });
    return () => {
      cancelled = true;
      el.removeEventListener("ended", onEnded);
      clearTimeout(fallback);
    };
  }, [current, isPlaying, goTo]);

  return (
    <>
      {/* Prev / Next arrows — desktop only */}
      <button
        onClick={() => goTo(current - 1)}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      >
        <ChevronLeft size={40} strokeWidth={1.5} />
      </button>
      <button
        onClick={() => goTo(current + 1)}
        aria-label="Next slide"
        className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      >
        <ChevronRight size={40} strokeWidth={1.5} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-2">
        {Array.from({ length: slideCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-3 md:w-4" : "bg-white/40 w-1 md:w-1.5"
            }`}
          />
        ))}
      </div>

      {/* Play / Pause */}
      <button
        onClick={() => setIsPlaying((p) => !p)}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="absolute bottom-3 right-4 md:bottom-6 md:right-6 z-20 rounded-full border border-white/50 bg-white/10 backdrop-blur-sm p-2 md:p-3 text-white hover:bg-white hover:text-black transition-all duration-300"
      >
        {isPlaying
          ? <Pause className="w-3 h-3 md:w-4 md:h-4" />
          : <Play  className="w-3 h-3 md:w-4 md:h-4" />
        }
      </button>
    </>
  );
}
