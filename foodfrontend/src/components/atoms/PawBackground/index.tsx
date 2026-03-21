'use client';

import React, { useState, useCallback, createContext, useContext } from 'react';

/* Context to pass the onLoaded callback down to Logo without cloneElement */
const PawLoadContext = createContext<(() => void) | undefined>(undefined);
export const usePawLoaded = () => useContext(PawLoadContext);

interface PawBackgroundProps {
  children: React.ReactNode;
  size?: 'sm' | 'lg';
  className?: string;
}

export default function PawBackground({
  children,
  size = 'sm',
  className = '',
}: PawBackgroundProps) {
  const isLg = size === 'lg';
  const [logoLoaded, setLogoLoaded] = useState(false);

  const handleLoaded = useCallback(() => {
    setTimeout(() => setLogoLoaded(true), 600);
  }, []);

  const outer = isLg
    ? 'w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] md:w-[170px] md:h-[170px] lg:w-[190px] lg:h-[190px]'
    : 'w-[60px] h-[60px] md:w-[70px] md:h-[70px]';

  return (
    <div className={`relative flex-shrink-0 ${outer} ${className}`}>
      {/* ── Paw skeleton ── */}
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
          logoLoaded ? 'opacity-0 scale-90' : 'opacity-100 scale-100 animate-pulse'
        }`}
        aria-hidden="true"
      >
        <g className="fill-[#D4C4B0]/50 dark:fill-[#3a2c23]/60">
          <ellipse cx="7.5" cy="7" rx="2.5" ry="3" />
          <ellipse cx="16.5" cy="7" rx="2.5" ry="3" />
          <ellipse cx="4" cy="13" rx="2" ry="2.5" />
          <ellipse cx="20" cy="13" rx="2" ry="2.5" />
          <path d="M12 22c-4 0-7-3.5-7-6 0-2.5 3-5 7-5s7 2.5 7 5c0 2.5-3 6-7 6z" />
        </g>
      </svg>

      {/* ── Logo ── */}
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-700 ease-out ${
          logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <PawLoadContext.Provider value={handleLoaded}>
          {children}
        </PawLoadContext.Provider>
      </div>
    </div>
  );
}
