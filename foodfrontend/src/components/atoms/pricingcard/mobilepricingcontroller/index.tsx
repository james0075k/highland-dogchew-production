'use client';

import { useState, useEffect } from 'react';
import MobilePricingToggle from '@/components/atoms/pricingcard/mobilepricingtoggle';

interface MobilePricingControllerProps {
  packages: any;
  targetSectionId: string;
}

export default function MobilePricingController({ 
  packages, 
  targetSectionId 
}: MobilePricingControllerProps) {
  const [showToggle, setShowToggle] = useState(true);

  useEffect(() => {
    const targetSection = document.getElementById(targetSectionId);
    
    if (!targetSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Hide toggle when pricing section is visible
          // Show toggle when pricing section is not visible
          setShowToggle(!entry.isIntersecting);
        });
      },
      {
        // Trigger when 50% of the pricing section is visible
        threshold: 0.5,
        // Add some margin to trigger slightly before/after
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    observer.observe(targetSection);

    return () => {
      observer.disconnect();
    };
  }, [targetSectionId]);

  return (
    <>
      {showToggle && <MobilePricingToggle packages={packages}  />}
    </>
  );
}