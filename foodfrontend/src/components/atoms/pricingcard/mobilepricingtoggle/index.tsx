'use client';

import React, { useState } from 'react';
import PricingCard from '@/components/atoms/pricingcard';
import DownloadPdfButton from '@/components/atoms/pdfbutton';
import { TourPackage } from '@/types';

interface MobilePricingToggleProps {
  packages: TourPackage;
}

const MobilePricingToggle: React.FC<MobilePricingToggleProps> = ({ packages }) => {
  const [showMobilePricing, setShowMobilePricing] = useState(false);
  const toggleMobilePricing = () => setShowMobilePricing(!showMobilePricing);

  return (
    <>
      {/* Mobile Price Toggle Button */}
      <div className="block md:hidden fixed bottom-2 right-2 z-40">
        <button
          onClick={toggleMobilePricing}
          className="bg-[#002D62] text-white px-4 py-2 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2"
        >
          <span>USD {packages.basePrice}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showMobilePricing ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile Compact Pricing Card */}
      <div className={`block md:hidden fixed bottom-14 right-2 z-50 transition-all duration-300 ${
        showMobilePricing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="max-w-md mx-auto p-2">
          <PricingCard 
            basePrice={packages.basePrice} 
            isCompact 
            tourPackage={packages}
            showMobilePricing={showMobilePricing}
            onToggleMobile={toggleMobilePricing}
          />
          <div className="mt-4">
            <DownloadPdfButton packageId={packages._id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilePricingToggle;