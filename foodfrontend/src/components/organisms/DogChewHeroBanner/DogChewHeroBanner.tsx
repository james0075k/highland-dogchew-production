'use client'
import TextHeader from '@/components/atoms/headings';
import React from 'react';

const DogChewHeroBanner = () => {
  return (
    <section className="relative w-full min-h-[400px] md:min-h-[500px] overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50">
      {/* Decorative Dog Items - Top Left */}
      <div className="absolute top-8 left-8 md:top-12 md:left-16 animate-float">
        <img
          src="/images/dog-12.jpeg"
          alt="Golden Retriever Puppy"
          className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-full shadow-lg transform -rotate-12"
        />
      </div>

      {/* Dog Bone - Left Side */}
      <div className="absolute bottom-16 left-8 md:bottom-24 md:left-12 animate-float-delayed">
        <img
          src="/images/dog-22.jpeg"
          alt="Happy Husky on Beach"
          className="w-24 h-16 md:w-32 md:h-20 object-cover rounded-lg shadow-lg transform rotate-12"
        />
      </div>

      {/* Dog Food Bowl - Top Right */}
      <div className="absolute top-8 right-8 md:top-12 md:right-16 animate-float">
        <div className="relative">
          <img
            src="/images/dog-32.jpeg"
            alt="Golden Retriever Portrait"
            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-2xl"
          />
          {/* Scattered food pieces */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-600 rounded-full animate-bounce" />
          <div className="absolute -top-4 right-8 w-3 h-3 bg-orange-700 rounded-full animate-bounce delay-100" />
          <div className="absolute top-2 -right-6 w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-200" />
        </div>
      </div>

      {/* Dog Toy - Bottom Right */}
      <div className="absolute bottom-16 right-8 md:bottom-24 md:right-16 animate-float-delayed">
        <img
          src="/images/dog-24.jpeg"
          alt="Jack Russell Running"
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full shadow-lg"
        />
      </div>

      {/* Green Food Bowl - Bottom Left */}
      <div className="absolute bottom-8 left-4 md:bottom-16 md:left-8 animate-float">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-green-400 rounded-full shadow-xl flex items-center justify-center border-4 border-green-500">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-300 rounded-full flex items-center justify-center">
              {/* Food pieces inside */}
              <div className="space-y-1">
                <div className="flex gap-1 justify-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  <div className="w-2 h-2 bg-orange-700 rounded-full" />
                </div>
                <div className="flex gap-1 justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <div className="w-2 h-2 bg-orange-600 rounded-full" />
                  <div className="w-2 h-2 bg-orange-700 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Red/White Toy - Bottom Right Corner */}
      <div className="absolute bottom-8 right-20 md:bottom-12 md:right-32 animate-bounce-slow">
        <div className="w-16 h-20 md:w-20 md:h-24 bg-gradient-to-b from-red-500 to-white rounded-lg shadow-lg transform rotate-12 flex items-center justify-center">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-white rounded-full" />
        </div>
      </div>

      {/* Scattered Dog Food Pieces - Around the page */}
      <div className="absolute top-32 left-24 w-3 h-3 bg-orange-600 rounded-sm transform rotate-45 animate-bounce" />
      <div className="absolute top-40 left-32 w-2 h-3 bg-orange-700 rounded-sm transform -rotate-12 animate-bounce delay-150" />
      <div className="absolute top-24 right-32 w-3 h-3 bg-orange-500 rounded-sm transform rotate-12 animate-bounce delay-300" />
      <div className="absolute bottom-32 right-48 w-2 h-3 bg-orange-600 rounded-sm transform rotate-45 animate-bounce delay-100" />

      {/* Center Content */}
      <div className="relative h-full min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center px-6 text-center z-10 py-16">
       <TextHeader
  text="Himalayan Delight: The Dog Chew"
 
  align="left"
  size="medium"
  textcolor="gray-900"
  className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight max-w-5xl"
/>

     <TextHeader
  text="Let Your Dog Chew Like a Yeti! Try Our Churpi!"
 
  align="center"
  size="custom"
  textcolor="gray-800"
  className="text-xl md:text-2xl lg:text-3xl font-semibold max-w-4xl"
/>


        {/* Optional CTA Button */}
        <button className="mt-8 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
          Shop Now
        </button>
      </div>

      {/* Floating Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-15px) rotate(var(--rotation, 0deg));
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            transform: translateY(-20px) rotate(var(--rotation, 0deg));
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) rotate(12deg);
          }
          50% {
            transform: translateY(-10px) rotate(12deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite 1s;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-150 {
          animation-delay: 0.15s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </section>
  );
};

export default DogChewHeroBanner;