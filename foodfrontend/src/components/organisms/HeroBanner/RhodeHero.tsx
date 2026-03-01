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
  { heading: "Highland Dog Chew",    subtext: "Premium Himalayan treats, crafted with care" },
  { heading: "Pure & Natural",        subtext: "100% yak milk — no preservatives, no additives" },
  { heading: "Born in the Himalayas", subtext: "Ancient recipe, modern love for your dog" },
];

export default function RhodeHero() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [current,    setCurrent]    = useState(0);
  const [isPlaying,  setIsPlaying]  = useState(true);
  const [opacity,    setOpacity]    = useState(1);
  const [isMounted,  setIsMounted]  = useState(false);
  // key changes with `current` → React unmounts+remounts the <video> element
  // on every switch → guarantees a fresh network fetch (no stale cache)

  // Respect user's "prefer reduced motion" OS setting
  const prefersReduced = useReducedMotion();

  // Raw scale from global scroll — no ref needed (avoids SSR hydration error)
  const { scrollY } = useScroll();
  const rawScale = useTransform(
    scrollY,
    [0, 700],
    prefersReduced ? [1, 1] : [1.0, 1.14]
  );
  // Spring wraps rawScale for buttery smooth parallax on every device
  const videoScale = useSpring(rawScale, {
    stiffness: 55,   // lower = softer / slower to catch up
    damping:   22,   // higher = less oscillation
    mass:      0.4,  // lighter = snappier response
    restDelta: 0.0001,
  });

  useEffect(() => { setIsMounted(true); }, []);

  const switchVideo = useCallback((nextIndex: number) => {
    setOpacity(0);
    setTimeout(() => { setCurrent(nextIndex); setOpacity(1); }, 350);
  }, []);

  // If the user had paused before a video switch, pause the freshly-mounted video
  useEffect(() => {
    if (isPlaying) return;
    const vid = videoRef.current;
    vid?.pause();
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => switchVideo((current + 1) % videos.length), 12000);
    return () => clearTimeout(timer);
  }, [current, isPlaying, switchVideo]);

  const handlePrev      = () => switchVideo((current - 1 + videos.length) % videos.length);
  const handleNext      = () => switchVideo((current + 1) % videos.length);
  const handleVideoEnded = () => switchVideo((current + 1) % videos.length);
  const handlePlayPause = () => {
    const vid = videoRef.current;
    if (!vid) return;
    isPlaying ? vid.pause() : vid.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  if (!isMounted) {
    return <section className="relative h-screen w-full overflow-hidden bg-black" />;
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* ── Video with spring-smoothed parallax zoom ── */}
      {/*
        key={videos[current]} forces React to unmount + remount a brand-new
        <video> element each time the active index changes.  This means the
        browser always does a fresh network request for the file — so swapping
        video1/2/3.mp4 on disk (or via a CDN) is instantly picked up with
        no stale-cache issues.  autoPlay on the fresh element starts it
        automatically without needing a manual vid.play() call.
      */}
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

      <div className="absolute inset-0 z-[1] bg-black/20 dark:bg-black/40" />

      {/* Prev / Next arrows */}
      <button onClick={handlePrev} aria-label="Previous video"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
        <ChevronLeft size={40} strokeWidth={1.5} />
      </button>
      <button onClick={handleNext} aria-label="Next video"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-white opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
        <ChevronRight size={40} strokeWidth={1.5} />
      </button>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 gap-6">
        <p className="text-sm md:text-base tracking-[0.2em] uppercase text-white/80 font-sans"
          style={{ opacity, transition: "opacity 0.7s ease-in-out" }}>
          {heroContent[current].subtext}
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif tracking-wide text-white leading-tight"
          style={{ opacity, transition: "opacity 0.7s ease-in-out" }}>
          {heroContent[current].heading}
        </h1>
        <Link href="/products"
          className="mt-2 inline-block border border-white rounded-full px-8 py-3 text-white text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500 font-sans">
          Shop Now
        </Link>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {videos.map((_, i) => (
          <button key={i} onClick={() => switchVideo(i)} aria-label={`Go to video ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-4" : "bg-white/40 w-1.5"}`} />
        ))}
      </div>

      {/* Play / Pause */}
      <button onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}
        className="absolute bottom-6 right-6 z-20 rounded-full border border-white/60 bg-white/10 backdrop-blur-sm p-3 text-white hover:bg-white hover:text-black transition-all duration-300">
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </section>
  );
}
