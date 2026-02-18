"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/atoms/Logo";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: delay / 1000 },
});

export default function RhodeHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-b from-[#F9F5EF] via-[#F4EDE4] to-[#E8DFD1] overflow-hidden">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <Logo index={1} />
        </motion.div>

        {/* HIGHLAND */}
        <motion.h1
          {...fadeUp(200)}
          className="font-antique text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#2E1F14] leading-[0.9] tracking-[0.04em]"
        >
          HIGHLAND
        </motion.h1>

        {/* MIXED CHEW */}
        <motion.h1
          {...fadeUp(400)}
          className="font-antique text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#2E1F14] leading-[0.9] tracking-[0.04em] mt-2"
        >
          MIXED CHEW
        </motion.h1>

        {/* Subheading */}
        <motion.p
          {...fadeUp(400)}
          className="mt-6 md:mt-8 text-sm sm:text-base md:text-lg text-[#7A5C4F] tracking-[0.15em] uppercase max-w-md mx-auto font-sans"
        >
          Premium Himalayan dog treats, crafted with care
        </motion.p>

        {/* CTA Button */}
        <motion.div {...fadeUp(600)} className="mt-10 md:mt-12">
          <Link
            href="/products"
            className="inline-block px-10 py-3.5 sm:px-14 sm:py-4 border border-[#2E1F14] rounded-full text-[#2E1F14] text-xs sm:text-sm tracking-[0.25em] uppercase transition-all duration-300 hover:bg-[#2E1F14] hover:text-white font-sans"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
