'use client'
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import TextHeader from '@/components/atoms/headings';

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Shreejan Koirala',
      role: 'Ceo & Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      quote: "At HimShree, we're dedicated to crafting top-quality, natural dog chews that dogs adore. As a pet parent myself, I ensure each treat meets our high standards. Try HimShree, and see why we're the go-to choice for health-conscious pet owners.",
      rating: 5
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Dog Owner & Customer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      quote: "My golden retriever absolutely loves these Highland chews! They last so much longer than other treats, and I love that they're all-natural. The quality is outstanding, and I can see the difference in my dog's happiness.",
      rating: 5
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Veterinarian',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      quote: "As a veterinarian, I'm always careful about what I recommend to pet owners. HimShree's Churpi chews are one of the few products I confidently suggest. They're safe, healthy, and dogs genuinely enjoy them.",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="w-full py-4 px-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
         <TextHeader
  text="What Our Client Says"
  
  align="center"
  size="custom"
  textcolor="gray-900"
  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
/>

          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full" />
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          {/* Large Quote Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
            <Quote className="w-20 h-20 md:w-24 md:h-24 text-cyan-500 fill-cyan-500 opacity-80" />
          </div>

          {/* Main Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 mt-12 border border-gray-100">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 rounded-3xl" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Quote Text */}
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600 text-center leading-relaxed mb-12 max-w-4xl mx-auto font-light">
                "{currentTestimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="flex flex-col items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse opacity-20 scale-110" />
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                </div>

                {/* Name and Role */}
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-wide">
                    {currentTestimonial.name}
                  </h3>
                  <p className="text-cyan-500 text-lg md:text-xl font-medium italic mt-1">
                    {currentTestimonial.role}
                  </p>
                </div>

                {/* Star Rating */}
                <div className="flex gap-1 mt-2">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400 fill-yellow-400"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prevTestimonial}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-cyan-500 text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextTestimonial}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-cyan-500 text-gray-800 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Dot Indicators */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-10 h-3 bg-cyan-500'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Decorative Line */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500" />
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200" />
            </div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce {
          animation: bounce 1.5s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </section>
  );
};

export default TestimonialSection;