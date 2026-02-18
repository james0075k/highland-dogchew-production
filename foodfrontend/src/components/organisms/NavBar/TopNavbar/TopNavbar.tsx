import React from 'react';
import { Instagram, Phone, Mail } from 'lucide-react';

const TopNavbar = () => {
  return (
    <div className="bg-gray-900 text-white py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section - Social */}
        <div className="flex items-center gap-2">
          <a
            href="https://instagram.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-orange-400 transition-colors group"
          >
            <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Follow us!</span>
          </a>
        </div>

        {/* Center Section - Tagline */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="hidden md:inline">Rich in</span>
          <span className="font-bold">Protein & Calcium</span>
          <span className="text-orange-400 text-lg">🦴</span>
        </div>

        {/* Right Section - Contact */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden lg:inline">Get in touch with us</span>
          
          <div className="flex items-center gap-3">
            {/* Phone */}
            <a
              href="tel:+9779851254578"
              className="hover:text-orange-400 transition-colors"
              aria-label="Call us"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Email */}
            <a
              href="mailto:sales@highland1.com"
              className="hover:text-orange-400 transition-colors"
              aria-label="Email us"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;