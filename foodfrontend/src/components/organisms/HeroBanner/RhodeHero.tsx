"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "@/components/atoms/Logo";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: delay / 1000 },
});

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="bg-white dark:bg-[#241b16] text-amber-600 dark:text-amber-400 rounded-full p-3 shadow-lg border border-amber-100 dark:border-[#3a2c23] hover:scale-110 hover:shadow-amber-200 dark:hover:shadow-amber-900/50 transition-all duration-300"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export default function RhodeHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-b from-[#F9F5EF] via-[#F4EDE4] to-[#E8DFD1] dark:from-[#1a1410] dark:via-[#1f1812] dark:to-[#241b16] overflow-hidden transition-colors duration-300">

      {/* Theme toggle — top right */}
      <div className="absolute top-24 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <Logo index={1} />
        </motion.div>

        {/* HIGHLAND */}
        <motion.h1
          {...fadeUp(200)}
          className="font-antique text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#2E1F14] dark:text-[#f5e9dc] leading-[0.9] tracking-[0.04em]"
        >
          HIGHLAND
        </motion.h1>

        {/* MIXED CHEW */}
        <motion.h1
          {...fadeUp(400)}
          className="font-antique text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#2E1F14] dark:text-[#f5e9dc] leading-[0.9] tracking-[0.04em] mt-2"
        >
          MIXED CHEW
        </motion.h1>

        {/* Subheading */}
        <motion.p
          {...fadeUp(400)}
          className="mt-6 md:mt-8 text-sm sm:text-base md:text-lg text-[#7A5C4F] dark:text-[#c8b6a6] tracking-[0.15em] uppercase max-w-md mx-auto font-sans"
        >
          Premium Himalayan dog treats, crafted with care
        </motion.p>

        {/* CTA Button */}
        <motion.div {...fadeUp(600)} className="mt-10 md:mt-12">
          <Link
            href="/products"
            className="inline-block px-10 py-3.5 sm:px-14 sm:py-4 border border-[#2E1F14] dark:border-[#f5e9dc]/60 rounded-full text-[#2E1F14] dark:text-[#f5e9dc] text-xs sm:text-sm tracking-[0.25em] uppercase transition-all duration-300 hover:bg-[#2E1F14] hover:text-white dark:hover:bg-[#f5e9dc] dark:hover:text-[#1a1410] font-sans"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
