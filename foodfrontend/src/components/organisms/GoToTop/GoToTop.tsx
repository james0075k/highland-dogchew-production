'use client';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const GoToTop = () => {
  const [showGoToTop, setShowGoToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed left-1/2 -translate-x-1/2 bottom-[72px] sm:bottom-6 z-[55] flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-[#1e1510]/90 backdrop-blur-md border border-gray-200/80 dark:border-[#2a2018]/80 rounded-full shadow-lg shadow-black/5 dark:shadow-black/20 text-[#2E1F14] dark:text-[#c8b6a6] hover:bg-white dark:hover:bg-[#1e1510] hover:shadow-xl active:scale-95 sm:hover:scale-105 transition-all duration-300 ${
        showGoToTop
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.5} />
    </button>
  );
};

export default GoToTop;
