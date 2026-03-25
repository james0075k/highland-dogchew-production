'use client'
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const HeroBannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const slides = [
    {
      id: 1,
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: 'HIGHLAND CHURPI',
      subtitle: 'THE DOG CHEW',
      description: 'Natural & Healthy Dog Treats from the Himalayas',
      buttonText: 'WATCH NOW',
      buttonIcon: <Play className="w-5 h-5" />
    },
    {
      id: 2,
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      title: 'HIGHLAND AWAITS',
      subtitle: 'EXPLORE NATURE',
      description: 'Experience the breathtaking beauty of mountain landscapes',
      buttonText: 'DISCOVER MORE',
      buttonIcon: <ChevronLeft className="w-5 h-5" />
    },
    {
      id: 3,
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'HIGHLAND EXPERIENCE',
      subtitle: 'REACH NEW HEIGHTS',
      description: 'Push your limits and conquer majestic peaks',
      buttonText: 'START JOURNEY',
      buttonIcon: <ChevronLeft className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  useEffect(() => {
    // Play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide && !isVideoPaused) {
          video.play().catch(err => console.log('Video play error:', err));
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide, isVideoPaused]);

  const toggleVideoPlayPause = () => {
    const currentVideo = videoRefs.current[currentSlide];
    if (currentVideo) {
      if (isVideoPaused) {
        currentVideo.play();
        setIsVideoPaused(false);
      } else {
        currentVideo.pause();
        setIsVideoPaused(true);
      }
    }
  };



  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsVideoPaused(false);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsVideoPaused(false);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Video with Overlay */}
          <div className="absolute inset-0">
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            >
              <source src={slide.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Content - Desktop: Left aligned, Mobile: Right bottom */}
        <div className="relative h-full flex items-end justify-end md:items-center md:justify-start pb-8 md:pb-0">
  <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
    <div className="max-w-2xl flex flex-col md:space-y-6 animate-fade-in text-right md:text-left">

      {/* Title */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-wider text-white">
          {slide.title}
        </h1>
        <h2 className="hidden md:block font-[family-name:var(--font-cormorant)] text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight text-white">
          {slide.subtitle}
        </h2>
      </div>

      {/* Divider - Hidden on mobile */}
      <div className="hidden md:block w-24 h-1 bg-cyan-400" />

      {/* Description - Hidden on mobile */}
      <p className="hidden md:block text-lg md:text-xl max-w-xl text-white">
        {slide.description}
      </p>

      {/* Button */}
      <div className="flex justify-end md:justify-start mt-4 md:mt-0">
        <button className="group flex items-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-sm font-semibold text-base md:text-lg transition-all duration-300 hover:gap-4 hover:shadow-lg hover:shadow-cyan-500/50">
          {slide.buttonText}
          {slide.buttonIcon}
        </button>
      </div>
    </div>
  </div>
</div>
        </div>
      ))}

      {/* Video Play/Pause Button */}
      <button
        onClick={toggleVideoPlayPause}
        className="absolute left-4 md:left-8 bottom-20 md:bottom-24 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 z-10"
        aria-label={isVideoPaused ? 'Play video' : 'Pause video'}
      >
        {isVideoPaused ? (
          <Play className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <Pause className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}


      {/* Slide Counter */}
     

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HeroBannerSlider;