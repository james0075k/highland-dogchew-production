'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    <div>
      {showGoToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className={`fixed bottom-24 right-6 text-white p-3 rounded-full shadow-xl transition-opacity duration-300 ${showGoToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-50`}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-full shadow-md border border-orange-600">
            <Image
              src="/images/GoToTop.svg"
              className="w-6 h-6"
              width={24}
              height={24}
              alt="Scroll to Top"
            />
          </div>
        </button>
      )}
    </div>
  );
};

export default GoToTop;