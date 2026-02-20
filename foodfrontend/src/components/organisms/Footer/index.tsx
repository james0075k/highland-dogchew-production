"use client"

import { FaInstagram, FaFacebookF, FaYoutube, FaCcVisa, FaCcMastercard, FaCcAmex, FaLinkedin } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Logo from "@/components/atoms/Logo";
import { ContactInfo } from "@/types";

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonial", href: "/testimonial" },
  { label: "Terms and Conditions", href: "/about/terms" },
];

const overviewLinks = [
  { label: "Variety", href: "/variety" },
  { label: "Process", href: "/process" },
  { label: "Refund Policy", href: "/refunds" },
  { label: "Testimonial", href: "/testimonals" },
];

interface FooterProps {
  destinations?: any[];
  activities?: any[];
  contactInfo?: ContactInfo;
}

export default function Footer({ destinations = [], activities = [], contactInfo }: FooterProps) {
  const socialLinks = [
    {
      Icon: FaInstagram,
      link: contactInfo?.socialLinks?.instagram || "#",
      label: "Instagram"
    },
    {
      Icon: FaFacebookF,
      link: contactInfo?.socialLinks?.facebook || "#",
      label: "Facebook"
    },
    {
      Icon: FaYoutube,
      link: "#",
      label: "YouTube"
    },
    {
      Icon: FaLinkedin,
      link: contactInfo?.socialLinks?.linkedin || "#",
      label: "LinkedIn"
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-[#F4EDE4] to-[#E8DFD1] dark:from-[#1f1812] dark:to-[#18120e] transition-colors duration-300">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C4A882] dark:via-[#3a2c23] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* Top row: Logo + Newsletter */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-14">
          <div className="flex items-center gap-4">
            <div className="w-[140px] md:w-[160px]">
              <Logo index={1} />
            </div>
            <div className="hidden sm:block h-10 w-px bg-[#2E1F14]/10 dark:bg-[#f5e9dc]/10" />
            <p className="hidden sm:block text-sm text-[#7A5C4F] dark:text-[#c8b6a6] max-w-[200px] leading-relaxed">
              Premium Himalayan dog treats, crafted with care
            </p>
          </div>

          {/* Newsletter */}
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold text-[#2E1F14] dark:text-[#f5e9dc] mb-2 tracking-wide">Join Our Newsletter</p>
            <div className="flex bg-white dark:bg-[#241b16] rounded-full border border-[#2E1F14]/10 dark:border-[#3a2c23] overflow-hidden shadow-sm">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-5 py-3 text-sm bg-transparent text-[#2E1F14] dark:text-[#f5e9dc] border-none focus:outline-none placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/40"
              />
              <button className="bg-[#2E1F14] dark:bg-amber-700 hover:bg-[#3D2B1C] dark:hover:bg-amber-600 text-white text-sm font-medium px-6 rounded-full m-1 transition-colors duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </div>
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
          <div>
            <h4 className="text-sm font-bold text-[#2E1F14] dark:text-[#f5e9dc] uppercase tracking-[0.15em] mb-5">Get In Touch</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a href="mailto:highlandchew12@gmail.com" className="flex items-start gap-2.5 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors group">
                  <FiMail className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A882] dark:text-amber-600 group-hover:text-[#2E1F14] dark:group-hover:text-amber-400 transition-colors" />
                  <span>highlandchew12@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+441972537122" className="flex items-start gap-2.5 text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-[#f5e9dc] transition-colors group">
                  <FiPhone className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A882] dark:text-amber-600 group-hover:text-[#2E1F14] dark:group-hover:text-amber-400 transition-colors" />
                  <span>+44 1972 537122</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-[#7A5C4F] dark:text-[#c8b6a6]">
                  <FiMapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#C4A882] dark:text-amber-600" />
                  <span>Highland, UK</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Social + Payment */}
          <div>
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
            <p>&copy; 2026 Highland Dog Chew. All rights reserved.</p>
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
