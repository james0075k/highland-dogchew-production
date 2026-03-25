'use client';

import { useState, useEffect, useCallback } from 'react';

interface ScrollSpyItem {
  id: string;
}

function useScrollSpy(items: ScrollSpyItem[]): {
  activeSection: string;
  scrollToSection: (id: string) => void;
} {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const handleScroll = () => {
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  }, []);

  return { activeSection, scrollToSection };
}

export default useScrollSpy;
