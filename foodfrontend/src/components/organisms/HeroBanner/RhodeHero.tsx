"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const videos = [
  "/videos/video1.mp4",
  "/videos/video2.mp4",
  "/videos/video3.mp4",
];

const heroContent = [
  { heading: "Highland Yak Chew",    subtext: "Premium Himalayan treats, crafted with care" },
  { heading: "Pure & Natural",        subtext: "100% yak milk — no preservatives, no additives" },
  { heading: "Born in the Himalayas", subtext: "Ancient recipe, modern love for your dog" },
];

export default function RhodeHero() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [current,    setCurrent]    = useState(0);
  const [isPlaying,  setIsPlaying]  = useState(true);
  const [opacity,    setOpacity]    = useState(1);
  const [isMounted,  setIsMounted]  = useState(false);

  const prefersReduced = useReducedMotion();

  const { scrollY } = useScroll();
  const rawScale = useTransform(
    scrollY,
    [0, 700],
    prefersReduced ? [1, 1] : [1.0, 1.12]
  );
  const videoScale = useSpring(rawScale, {
    stiffness: 55,
    damping:   22,
    mass:      0.4,
    restDelta: 0.0001,
  });

  useEffect(() => { setIsMounted(true); }, []);

  const switchVideo = useCallback((nextIndex: number) => {
    setOpacity(0);
    setTimeout(() => { setCurrent(nextIndex); setOpacity(1); }, 350);
  }, []);

  useEffect(() => {
    if (isPlaying) return;
    videoRef.current?.pause();
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => switchVideo((current + 1) % videos.length), 12000);
    return () => clearTimeout(timer);
  }, [current, isPlaying, switchVideo]);

  const handlePrev       = () => switchVideo((current - 1 + videos.length) % videos.length);
  const handleNext       = () => switchVideo((current + 1) % videos.length);
  const handleVideoEnded = () => switchVideo((current + 1) % videos.length);
  const handlePlayPause  = () => {
    const vid = videoRef.current;
    if (!vid) return;
    isPlaying ? vid.pause() : vid.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  // SSR placeholder — matches responsive height
  if (!isMounted) {
    return <section className="relative h-[52vw] min-h-[280px] max-h-[520px] md:h-screen md:max-h-none w-full overflow-hidden bg-black" />;
  }

  return (
    /*
      Mobile  : ~52vw height (landscape feel), min 280px, max 520px
      Tablet+ : h-screen (full viewport)
    */
    <section className="relative h-[52vw] min-h-[280px] max-h-[520px] md:h-screen md:max-h-none w-full overflow-hidden bg-black">

      {/* Video with parallax (desktop only, reduced on mobile for perf) */}
      <motion.video
        key={videos[current]}
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        style={{
          opacity,
          scale: videoScale,
          willChange: "transform",
          transition: "opacity 0.7s ease-in-out",
        }}
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videos[current]} type="video/mp4" />
      </motion.video>

      {/* Overlay — lighter on mobile so text is readable */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-black/10 md:from-black/50 md:via-black/15 md:to-transparent" />

      {/* Prev / Next arrows — desktop only */}
      <button
        onClick={handlePrev}
        aria-label="Previous video"
        className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      >
        <ChevronLeft size={40} strokeWidth={1.5} />
      </button>
      <button
        onClick={handleNext}
        aria-label="Next video"
        className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      >
        <ChevronRight size={40} strokeWidth={1.5} />
      </button>

      {/* Hero text — bottom-left aligned (Rhode style) */}
      <div
        className="relative z-10 flex flex-col items-start justify-end h-full px-5 pb-8 gap-2 md:px-12 md:pb-16 md:gap-4 max-w-3xl"
        style={{ opacity, transition: "opacity 0.7s ease-in-out" }}
      >
        <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase text-white/75 font-sans">
          {heroContent[current].subtext}
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-8xl font-serif tracking-wide text-white leading-tight">
          {heroContent[current].heading}
        </h1>
        <Link
          href="/products"
          className="mt-1 inline-block border border-white/80 rounded-full px-5 py-2 md:px-8 md:py-3 text-white text-[10px] sm:text-xs md:text-sm tracking-[0.18em] uppercase hover:bg-white hover:text-black transition-all duration-400 font-sans"
        >
          Shop Now
        </Link>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-2">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => switchVideo(i)}
            aria-label={`Go to video ${i + 1}`}
            className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-3 md:w-4" : "bg-white/40 w-1 md:w-1.5"}`}
          />
        ))}
      </div>

      {/* Play / Pause */}
      <button
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="absolute bottom-3 right-4 md:bottom-6 md:right-6 z-20 rounded-full border border-white/50 bg-white/10 backdrop-blur-sm p-2 md:p-3 text-white hover:bg-white hover:text-black transition-all duration-300"
      >
        {isPlaying
          ? <Pause className="w-3 h-3 md:w-4 md:h-4" />
          : <Play  className="w-3 h-3 md:w-4 md:h-4" />
        }
      </button>
    </section>
  );
}
