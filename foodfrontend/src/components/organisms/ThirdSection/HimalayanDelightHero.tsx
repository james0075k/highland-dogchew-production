'use client'
import TextHeader from '@/components/atoms/headings';
import React from 'react';

const HimalayanDelightHero = () => {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1452195100486-9cc805987862?w=1920&q=80"
          alt="Himalayan Dog Chew Background"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Decorative Cheese Pieces - Top Left */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 w-32 h-32 md:w-40 md:h-40 opacity-90 animate-float">
        <img
          src="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80"
          alt="Cheese"
          className="w-full h-full object-cover rounded-lg transform -rotate-12"
        />
      </div>

      {/* Decorative Cheese Pieces - Top Right */}
      <div className="absolute top-8 right-8 md:top-12 md:right-12 w-32 h-32 md:w-48 md:h-32 opacity-90 animate-float-delayed">
        <img
          src="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80"
          alt="Cheese"
          className="w-full h-full object-cover rounded-lg transform rotate-6"
        />
      </div>

      {/* Decorative Cheese Pieces - Bottom Left */}
      <div className="absolute bottom-8 left-4 md:bottom-12 md:left-8 w-28 h-28 md:w-36 md:h-36 opacity-90 animate-float">
        <img
          src="https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80"
          alt="Cheese"
          className="w-full h-full object-cover rounded-lg transform rotate-12"
        />
      </div>

      {/* Decorative Cheese Pieces - Bottom Right */}
      <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 w-36 h-24 md:w-48 md:h-32 opacity-90 animate-float-delayed">
        <img
          src="https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80"
          alt="Cheese"
          className="w-full h-full object-cover rounded-lg transform -rotate-6"
        />
      </div>

      {/* Center Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center z-10">
        <TextHeader
  text="Highland Delight: The Dog Chew"
  align="left"
  size="custom"
  textcolor="white"
  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
/>

       <TextHeader
  text="One Chew, Endless Flavors! Discover the Taste of the Himalayas!"

  align="left"
  size="custom"
  textcolor="white"
  className="text-lg md:text-xl lg:text-2xl italic font-light max-w-3xl"
/>

      </div>

      {/* Floating Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-20px) rotate(var(--rotation, 0deg));
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-15px) rotate(var(--rotation, 0deg));
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite 1s;
        }

        .animate-float:nth-child(1) {
          --rotation: -12deg;
        }

        .animate-float:nth-child(2) {
          --rotation: 6deg;
        }

        .animate-float:nth-child(3) {
          --rotation: 12deg;
        }

        .animate-float-delayed:nth-child(4) {
          --rotation: -6deg;
        }
      `}</style>
    </section>
  );
};

export default HimalayanDelightHero;