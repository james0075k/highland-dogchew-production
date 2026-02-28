"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const videos = [
  "/videos/video1.mp4",
  "/videos/video2.mp4",
  "/videos/video3.mp4",
];

const heroContent = [
  {
    heading: "Highland Dog Chew",
    subtext: "Premium Himalayan treats, crafted with care",
  },
  {
    heading: "Pure & Natural",
    subtext: "100% yak milk — no preservatives, no additives",
  },
  {
    heading: "Born in the Himalayas",
    subtext: "Ancient recipe, modern love for your dog",
  },
];

export default function RhodeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fade → swap src → fade in
  const switchVideo = useCallback((nextIndex: number) => {
    setOpacity(0);
    setTimeout(() => {
      setCurrent(nextIndex);
      setOpacity(1);
    }, 350);
  }, []);

  // Keep video element in sync with current index.
  // isMounted is in the deps so the effect re-runs once the <video> element
  // actually exists (on first render videoRef.current is null).
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isMounted) return;
    vid.src = videos[current];
    vid.load();
    if (isPlaying) {
      vid.play().catch(() => {});
    }
  }, [current, isMounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback timer: auto-advance after 12 s in case the video fails to fire
  // onEnded (e.g. file missing, codec issue). Resets on every slide change.
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      switchVideo((current + 1) % videos.length);
    }, 12000);
    return () => clearTimeout(timer);
  }, [current, isPlaying, switchVideo]);

  const handlePrev = () => {
    switchVideo((current - 1 + videos.length) % videos.length);
  };

  const handleNext = () => {
    switchVideo((current + 1) % videos.length);
  };

  const handlePlayPause = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isPlaying) {
      vid.pause();
    } else {
      vid.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  // Auto-advance when video ends
  const handleVideoEnded = () => {
    switchVideo((current + 1) % videos.length);
  };

  if (!isMounted) {
    // SSR placeholder — no video element rendered server-side
    return (
      <section className="relative h-screen w-full overflow-hidden bg-black" />
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* ── Video Layer ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        style={{
          opacity,
          transition: "opacity 0.7s ease-in-out",
        }}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* ── Dark Overlay ── */}
      <div className="absolute inset-0 z-[1] bg-black/20 dark:bg-black/40" />

      {/* ── Left Arrow ── */}
      <button
        onClick={handlePrev}
        aria-label="Previous video"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      >
        <ChevronLeft size={40} strokeWidth={1.5} />
      </button>

      {/* ── Right Arrow ── */}
      <button
        onClick={handleNext}
        aria-label="Next video"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      >
        <ChevronRight size={40} strokeWidth={1.5} />
      </button>

      {/* ── Center Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 gap-6">
        <p
          className="text-sm md:text-base tracking-[0.2em] uppercase text-white/80 font-sans"
          style={{
            opacity,
            transition: "opacity 0.7s ease-in-out",
          }}
        >
          {heroContent[current].subtext}
        </p>

        <h1
          className="text-5xl sm:text-6xl md:text-8xl font-serif tracking-wide text-white leading-tight"
          style={{
            opacity,
            transition: "opacity 0.7s ease-in-out",
          }}
        >
          {heroContent[current].heading}
        </h1>

        <Link
          href="/products"
          className="mt-2 inline-block border border-white rounded-full px-8 py-3 text-white text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500 font-sans"
        >
          Shop Now
        </Link>
      </div>

      {/* ── Dot Indicators ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => switchVideo(i)}
            aria-label={`Go to video ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-4" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* ── Play / Pause ── */}
      <button
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="absolute bottom-6 right-6 z-20 rounded-full border border-white/60 bg-white/10 backdrop-blur-sm p-3 text-white hover:bg-white hover:text-black transition-all duration-300"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </section>
  );
}
