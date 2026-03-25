'use client';

import React from 'react';
import { TourPackage } from '@/types';

interface PrivateRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tourPackage?: TourPackage;
}

export default function PrivateRequestPopup({ isOpen, onClose }: PrivateRequestPopupProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Private Request</h2>
        <p className="text-sm text-gray-600">
          Please contact us directly for private group bookings.
        </p>
      </div>
    </div>
  );
}
