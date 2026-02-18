"use client"

import Image from "next/image";
import { FaInstagram, FaFacebookF, FaYoutube, FaCcVisa, FaCcMastercard, FaCcAmex, FaWhatsapp, FaTwitter, FaLinkedin } from "react-icons/fa";
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
  // Safely handle contactInfo with fallback
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
      
      label: "YouTube" 
    },
    { 
      Icon: FaLinkedin, 
      link: contactInfo?.socialLinks?.linkedin || "#", 
      label: "LinkedIn" 
    },
  ];

  return (
    <footer className="bg-gradient-to-t from-[#f2f7fa] to-[#c4b6b6]">
     
      <div className="bg-gradient-to-t from-[#e2f1fc] to-[#505b61]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 px-6 py-10">
          {/* Left Section */}
          <div className="w-full lg:w-4/12 flex flex-col space-y-6">
            {/* Logo */}
            <div className="w-[150px] md:w-[180px]">
              <Logo index={1} />
            </div>

            {/* Newsletter */}
            <div className="space-y-1">
              <div className="mb-6 mt-5">
                <h1 className="text-3xl font-bold">Newsletter</h1>
                <p className="text-base leading-relaxed pr-6">
                  To receive tour packages, news, updates, departures and offers via email.
                </p>
              </div>
              <div className="w-[300px] md:w-[356px] pt-1 pr-1 pb-1 mt-2 bg-white border border-black rounded-xl">
                <div className="flex bg-white rounded-xl">
                  <input
                    type="email"
                    placeholder="Enter Your Email Address"
                    className="w-full px-4 py-2 text-sm border-none focus:outline-none placeholder-gray-400"
                  />
                  <button className="bg-primary hover:bg-green-500 text-white text-base px-4 rounded-md">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <p className="font-bold text-xl mb-3">Find us on social</p>
              <div className="flex space-x-2">
                {socialLinks.map(({ Icon, link, label }, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="bg-primary text-white p-2 rounded-xl w-10 h-10 flex justify-center items-center hover:scale-110 transition-transform"
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full lg:w-7/12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Company Links */}
            <div className="flex flex-col space-y-4">
              <h1 className="text-2xl font-semibold">Company</h1>
              <ul className="space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="hover:text-[#06ab86] transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Overview Links */}
            <div className="flex flex-col space-y-4">
              <h1 className="text-2xl font-semibold">Overview</h1>
              <ul className="space-y-3">
                {overviewLinks.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="hover:text-[#06ab86] transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Details & Payment */}
            <div className="flex flex-col space-y-4">
              <h1 className="text-2xl font-semibold">Contact Detail</h1>
              
              {/* Display contact info if available */}
              {contactInfo && (
                <div className="space-y-2 text-sm">
                  {contactInfo.email && (
                    <p className="flex items-start gap-2">
                      <span className="font-semibold">Email:</span>
                      <a href={`mailto:highlandchew12@gmail.com`} className="hover:text-[#06ab86]">
                       highlandchew12@gmail.com
                      </a>
                    </p>
                  )}
                  {contactInfo.phone && (
                    <p className="flex items-start gap-2">
                      <span className="font-semibold">Phone:</span>
                      <a href={`tel:${contactInfo.phone}`} className="hover:text-[#06ab86]">
                      +44 1972537122
                      </a>
                    </p>
                  )}
                  {contactInfo.address && (
                    <p className="flex items-start gap-2">
                      <span className="font-semibold">Address:</span>
                      <span>HIghland UK</span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6">
                <p className="text-2xl font-bold">We Accept</p>
                <div className="flex gap-4 mt-2">
                  <FaCcVisa className="w-[80px] h-[80px] text-[#1A1F71]" aria-label="Visa" />
                  <FaCcMastercard className="w-[80px] h-[80px] text-[#EB001B]" aria-label="Mastercard" />
                  <FaCcAmex className="w-[80px] h-[80px] text-[#2E77BC]" aria-label="Amex" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="max-w-7xl mx-auto border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-6">
            <div className="flex gap-6 text-sm">
              <p>© 2026 Highland Chew</p>
              <a href="/about/terms" className="hover:text-[#06ab86]">Terms and Conditions</a>
              <a href="/site-map" className="hover:text-[#06ab86]">Site Map</a>
            </div>
            <a href="https://yogeshgc.com.np" target="_blank" rel="noopener noreferrer" className="text-sm mt-4 md:mt-0">
              Designed & Developed by: The YG
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}