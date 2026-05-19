'use client';

import TextHeader from '@/components/atoms/headings';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

const HimalayanDelightHero = () => {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/*
        Background image — scroll-zoom via whileInView.
        • initial scale 1.1  →  animates to 1.0 as section enters viewport
        • viewport margin triggers the animation ~120px before visible  →  no "snap" on entry
        • once: true prevents re-triggering when scrolling back up (no jitter)
        • expo-out easing [0.16,1,0.3,1] gives a luxury deceleration feel
        • Skipped entirely if user prefers reduced motion
      */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ scale: prefersReduced ? 1 : 1.1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -120px 0px', amount: 0.05 }}
        transition={{
          duration: 1.6,
          ease: [0.16, 1, 0.3, 1],   // expo-out — very smooth deceleration
        }}
        style={{ willChange: 'transform' }}
      >
        <Image
          src="/images/dog-9.webp"
          alt="Husky standing on Himalayan mountain rocks"
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Decorative floating cheese pieces */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 w-32 h-32 md:w-40 md:h-40 opacity-90 animate-float relative">
        <Image src="/images/dog-2.webp" alt="Malamute with stick"
          fill className="object-cover rounded-lg transform -rotate-12" />
      </div>
      <div className="absolute top-8 right-8 md:top-12 md:right-12 w-32 h-32 md:w-48 md:h-32 opacity-90 animate-float-delayed relative">
        <Image src="/images/dog-7.webp" alt="Husky side profile"
          fill className="object-cover rounded-lg transform rotate-6" />
      </div>
      <div className="absolute bottom-8 left-4 md:bottom-12 md:left-8 w-28 h-28 md:w-36 md:h-36 opacity-90 animate-float relative">
        <Image src="/images/dog-19.webp" alt="Bernese Mountain Dog"
          fill className="object-cover rounded-lg transform rotate-12" />
      </div>
      <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 w-36 h-24 md:w-48 md:h-32 opacity-90 animate-float-delayed relative">
        <Image src="/images/dog-20.webp" alt="Rottweiler at sunset"
          fill className="object-cover rounded-lg transform -rotate-6" />
      </div>

      {/* Center Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center z-10">
        <TextHeader text="Highland Delight: The Dog Chew" align="left" size="custom" textcolor="white"
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight" />
        <TextHeader text="One Chew, Endless Flavors! Discover the Taste of the Himalayas!" align="left" size="custom" textcolor="white"
          className="text-lg md:text-xl lg:text-2xl italic font-light max-w-3xl" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
          50%       { transform: translateY(-20px) rotate(var(--rotation, 0deg)); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
          50%       { transform: translateY(-15px) rotate(var(--rotation, 0deg)); }
        }
        .animate-float         { animation: float 4s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite 1s; }
        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-float-delayed { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default HimalayanDelightHero;
