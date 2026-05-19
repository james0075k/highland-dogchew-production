"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// Pure DOM-driven carousel controls. Cycles opacity on .hero-slide-N elements
// rendered by RhodeHero (server component) so the LCP image stays in the
// initial HTML and React doesn't need to remount images on each transition.
export default function HeroCarouselControls({ slideCount }: { slideCount: number }) {
  const [current, setCurrent]     = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Sync DOM visibility whenever `current` changes.
  useEffect(() => {
    for (let i = 0; i < slideCount; i++) {
      const img = document.querySelector<HTMLElement>(`.hero-slide-${i}`);
      if (img) img.style.opacity = i === current ? "1" : "0";

      const txt = document.querySelector<HTMLElement>(`.hero-text-slide[data-slide="${i}"]`);
      if (txt) {
        txt.style.opacity = i === current ? "1" : "0";
        txt.style.pointerEvents = i === current ? "auto" : "none";
      }
    }
  }, [current, slideCount]);

  const goTo = useCallback((i: number) => setCurrent(((i % slideCount) + slideCount) % slideCount), [slideCount]);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => goTo(current + 1), 6000);
    return () => clearTimeout(t);
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
