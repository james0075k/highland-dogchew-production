'use client';
import React, { useEffect, useState } from 'react';
import { Instagram, Phone, Mail } from 'lucide-react';

// Fallbacks used only until the admin Contact Info loads (Dashboard → Settings).
const FALLBACK = {
  phone: '+9779851254578',
  email: 'sales@highland1.com',
  instagram: 'https://instagram.com/highlanddogchew',
};

const TopNavbar = () => {
  const [phone, setPhone] = useState(FALLBACK.phone);
  const [email, setEmail] = useState(FALLBACK.email);
  const [instagram, setInstagram] = useState(FALLBACK.instagram);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    fetch(`${apiUrl}/info`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.success || !d?.data) return;
        const info = d.data;
        const p = info.phones?.[0] || info.whatsappNumber || '';
        if (p) setPhone(p);
        if (info.email) setEmail(info.email);
        if (info.socialLinks?.instagram) setInstagram(info.socialLinks.instagram);
      })
      .catch(() => {});
  }, []);

  // tel: links should contain only digits and an optional leading +
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`;

  return (
    <div className="bg-gray-900 text-white py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section - Social */}
        <div className="flex items-center gap-2">
          <a
            href={instagram}
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
              href={telHref}
              className="hover:text-orange-400 transition-colors"
              aria-label="Call us"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}`}
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
