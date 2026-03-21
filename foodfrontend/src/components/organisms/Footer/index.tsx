"use client"

import { FaInstagram, FaFacebookF, FaYoutube, FaCcVisa, FaCcMastercard, FaCcAmex, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiCheck, FiLoader } from "react-icons/fi";
import Logo from "@/components/atoms/Logo";
import PawBackground from "@/components/atoms/PawBackground";
import { ContactInfo } from "@/types";
import { useState, useEffect } from "react";

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Terms and Conditions", href: "/about/terms" },
];

const overviewLinks = [
  { label: "FAQs", href: "/faq" },
  { label: "Variety", href: "/variety" },
  { label: "Process", href: "/process" },
  { label: "Refund Policy", href: "/refunds" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Testimonials", href: "/testimonials" },
];

interface FooterProps {
  destinations?: any[];
  activities?: any[];
  contactInfo?: ContactInfo;
}

function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

function toGmailComposeUrl(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

function toGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function Footer({ destinations = [], activities = [], contactInfo: contactInfoProp }: FooterProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | undefined>(contactInfoProp);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API}/info`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setContactInfo(data.data); })
      .catch(() => {});
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterState('loading');
    setNewsletterMsg('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
      const res = await fetch(`${API}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsletterState('success');
        setNewsletterMsg(data.message || 'Subscribed! Check your inbox.');
        setNewsletterEmail('');
      } else {
        setNewsletterState('error');
        setNewsletterMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setNewsletterState('error');
      setNewsletterMsg('Network error. Please try again.');
    } finally {
      if (newsletterState !== 'success') {
        setTimeout(() => { setNewsletterState('idle'); setNewsletterMsg(''); }, 4000);
      }
    }
  };

  const socialLinks = [
    {
      Icon: FaInstagram,
      link: contactInfo?.socialLinks?.instagram || "",
      label: "Instagram"
    },
    {
      Icon: FaFacebookF,
      link: contactInfo?.socialLinks?.facebook || "",
      label: "Facebook"
    },
    {
      Icon: FaYoutube,
      link: "",
      label: "YouTube"
    },
    {
      Icon: FaLinkedin,
      link: contactInfo?.socialLinks?.linkedin || "",
      label: "LinkedIn"
    },
  ].filter(s => s.link !== "");

  return (
    <footer className="bg-gradient-to-b from-[#F4EDE4] to-[#E8DFD1] dark:from-[#1f1812] dark:to-[#18120e] transition-colors duration-300">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C4A882] dark:via-[#3a2c23] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* Top row: Logo + Newsletter */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
            <PawBackground size="lg">
              <Logo
                index={1}
                width={190}
                height={190}
                imgClassName="h-[120px] w-[120px] sm:h-[140px] sm:w-[140px] md:h-[160px] md:w-[160px] lg:h-[180px] lg:w-[180px]"
              />
            </PawBackground>
            <div className="hidden sm:block h-14 w-px bg-[#2E1F14]/10 dark:bg-[#f5e9dc]/10" />
            <p className="text-center sm:text-left text-sm text-[#7A5C4F] dark:text-[#c8b6a6] max-w-[200px] leading-relaxed">
              Premium Himalayan dog treats, crafted with care
            </p>
          </div>

          {/* Newsletter */}
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold text-[#2E1F14] dark:text-[#f5e9dc] mb-2 tracking-wide">Join Our Newsletter</p>
            <form onSubmit={handleNewsletterSubmit}>
              <div className="flex bg-white dark:bg-[#241b16] rounded-full border border-[#2E1F14]/10 dark:border-[#3a2c23] overflow-hidden shadow-sm">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={newsletterState === 'loading' || newsletterState === 'success'}
                  className="w-full px-5 py-3 text-sm bg-transparent text-[#2E1F14] dark:text-[#f5e9dc] border-none focus:outline-none placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/40 disabled:opacity-60"
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  disabled={newsletterState === 'loading' || newsletterState === 'success'}
                  className="bg-[#2E1F14] dark:bg-amber-700 hover:bg-[#3D2B1C] dark:hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-medium px-6 rounded-full m-1 transition-colors duration-300 whitespace-nowrap flex items-center gap-1.5"
                >
                  {newsletterState === 'loading' ? (
                    <><FiLoader className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                  ) : newsletterState === 'success' ? (
                    <><FiCheck className="w-3.5 h-3.5" /> Done!</>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            </form>
            {newsletterMsg && (
              <p className={`mt-2 text-xs px-2 ${newsletterState === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {newsletterMsg}
              </p>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 mb-14">
          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-[#2E1F14] dark:text-[#f5e9dc] uppercase tracking-[0.15em] mb-5">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors text-sm">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Overview Links */}
          <div>
            <h4 className="text-sm font-bold text-[#2E1F14] dark:text-[#f5e9dc] uppercase tracking-[0.15em] mb-5">Overview</h4>
            <ul className="space-y-3">
              {overviewLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors text-sm">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-bold text-[#2E1F14] dark:text-[#f5e9dc] uppercase tracking-[0.15em] mb-5">Get In Touch</h4>
            <ul className="space-y-3.5 text-sm">
              {contactInfo?.email && (
                <li>
                  <a
                    href={toGmailComposeUrl(contactInfo.email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors group"
                  >
                    <FiMail className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A882] dark:text-amber-600 group-hover:text-[#2E1F14] dark:group-hover:text-amber-400 transition-colors" />
                    <span>{contactInfo.email}</span>
                  </a>
                </li>
              )}
              {(contactInfo?.phone || contactInfo?.phones?.[0]) && (
                <li>
                  <a
                    href={toWhatsAppUrl(contactInfo.phone || contactInfo.phones?.[0] || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-green-600 dark:hover:text-green-400 transition-colors group"
                  >
                    <FaWhatsapp className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A882] dark:text-amber-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                    <span>{contactInfo.phone || contactInfo.phones?.[0]}</span>
                  </a>
                </li>
              )}
              {contactInfo?.address && (
                <li>
                  <a
                    href={toGoogleMapsUrl(contactInfo.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors group"
                  >
                    <FiMapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A882] dark:text-amber-600 group-hover:text-[#2E1F14] dark:group-hover:text-amber-400 transition-colors" />
                    <span>{contactInfo.address}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Social + Payment */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-bold text-[#2E1F14] dark:text-[#f5e9dc] uppercase tracking-[0.15em] mb-5">Follow Us</h4>
            <div className="flex gap-2 mb-6">
              {socialLinks.map(({ Icon, link, label }, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-[#2E1F14]/15 dark:border-[#3a2c23] flex items-center justify-center text-[#7A5C4F] dark:text-[#c8b6a6] hover:bg-[#2E1F14] dark:hover:bg-amber-700 hover:text-white hover:border-[#2E1F14] dark:hover:border-amber-700 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <p className="text-sm font-bold text-[#2E1F14] dark:text-[#f5e9dc] uppercase tracking-[0.15em] mb-3">We Accept</p>
            <div className="flex gap-2">
              <div className="w-12 h-8 rounded bg-white dark:bg-[#241b16] border border-[#2E1F14]/10 dark:border-[#3a2c23] flex items-center justify-center">
                <FaCcVisa className="w-8 h-5 text-[#1A1F71]" aria-label="Visa" />
              </div>
              <div className="w-12 h-8 rounded bg-white dark:bg-[#241b16] border border-[#2E1F14]/10 dark:border-[#3a2c23] flex items-center justify-center">
                <FaCcMastercard className="w-8 h-5 text-[#EB001B]" aria-label="Mastercard" />
              </div>
              <div className="w-12 h-8 rounded bg-white dark:bg-[#241b16] border border-[#2E1F14]/10 dark:border-[#3a2c23] flex items-center justify-center">
                <FaCcAmex className="w-8 h-5 text-[#2E77BC]" aria-label="Amex" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-[#2E1F14]/10 dark:border-[#3a2c23]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-5 gap-3">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
            <p>&copy; 2026 Highland Yak Chew. All rights reserved.</p>
            <a href="/about/terms" className="hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors">Terms & Conditions</a>
            <a href="/site-map" className="hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors">Site Map</a>
          </div>
          <span className="text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/60 hover:text-[#7A5C4F] dark:hover:text-[#c8b6a6] transition-colors cursor-default">
            Designed by JAMES.00.7
          </span>
        </div>
      </div>
    </footer>
  );
}
