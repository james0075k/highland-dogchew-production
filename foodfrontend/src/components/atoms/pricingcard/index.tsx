"use client";
import React from "react";
import Button from "@/components/atoms/button";
import PrivateRequestPopup from "@/components/molecules/PrivateRequestPopup";
import { usePopup } from "@/hooks/usePopup";
import { TourPackage } from "@/types";

interface PricingCardProps {
  basePrice: number;
  isCompact?: boolean;
  tourPackage?: TourPackage;
  showMobilePricing?: boolean;
  onToggleMobile?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  basePrice,
  isCompact = false,
  tourPackage,
  showMobilePricing,
  onToggleMobile,
}) => {
  const { isOpen, openPopup, closePopup } = usePopup();

  const handleBookNowClick = () => {
    // Close mobile pricing when booking
    if (isCompact && onToggleMobile && showMobilePricing) {
      onToggleMobile();
    }
    
    const el = document.getElementById("Book-Now");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrivateRequestClick = () => {
    // Close mobile pricing when opening popup
    if (isCompact && onToggleMobile && showMobilePricing) {
      onToggleMobile();
    }
    openPopup();
  };

  return (
    <>
      <div
        className={`${
          isCompact ? "w-[200px] max-w-full h-[280px] px-3 py-2" : "max-w-xs p-1"
        } flex flex-col items-center rounded-xl border border-black bg-white shadow text-center space-y-3`}
      >
        <div
          className={`bg-[#002D62] text-white ${
            isCompact ? "text-sm h-[35px]" : "text-xl h-[45px]"
          } w-full font-medium rounded-xl p-2`}
        >
          Best Price
        </div>

        <div className="flex items-center justify-center gap-2 mt-3">
          <p className="text-sm font-semibold text-gray-700">USD</p>
          <p className={`font-bold text-gray-800 ${isCompact ? "text-2xl" : "text-4xl"}`}>
            {basePrice}
          </p>
          <p className="text-xs leading-tight text-gray-600 text-left">
            <span>Per</span>
            <br />
            <span>Person</span>
          </p>
        </div>

        <hr className="border-t border-dashed border-gray-300 w-full" />

        <p className={`text-gray-500 ${isCompact ? "text-sm" : "text-base"}`}>
          Price May Vary According
          <br />
          To The Group Size.
        </p>

        <div className="py-2 space-y-2 items-center flex flex-col">
          <Button
            text="Book this Trip"
            variant="primary"
            className={`w-full font-semibold ${
              isCompact ? "text-xs h-9" : "text-sm w-[175px] h-[42px]"
            }`}
            onClick={handleBookNowClick}
          />
          <Button
            text="Private Request"
            variant="secondary"
            className={`w-full border border-black text-[#0E334F] font-medium ${
              isCompact ? "text-xs h-9" : "text-sm w-[175px] h-[42px]"
            }`}
            onClick={handlePrivateRequestClick}
          />
        </div>
      </div>

      <PrivateRequestPopup
        isOpen={isOpen}
        onClose={closePopup}
        tourPackage={tourPackage}
      />
    </>
  );
};

export default PricingCard;