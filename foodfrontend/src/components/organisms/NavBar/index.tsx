"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { IoMdClose } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { FaShoppingCart, FaInstagram, FaFacebook, FaTiktok, FaEnvelope } from "react-icons/fa";
import { PackageSearch } from "lucide-react";
import Logo from "@/components/atoms/Logo";
import { useCart } from "@/context/CartContext";
import { ContactInfo } from "@/types";

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-7 h-7" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200 text-[#2E1F14] dark:text-[#c8b6a6] hover:text-[#7A5C4F] dark:hover:text-amber-400 ${className}`}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const leftLinks = [
  { name: "About Us", href: "/about" },
  { name: "Yak Chew Future", href: "/future" },
  { name: "Promise to Dogs", href: "/process" },
];

const rightLinks = [
  { name: "FAQs", href: "/testimonials" },
  { name: "Contacts", href: "/contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  const pathname = usePathname();
  const { cartCount } = useCart();

  const isHomepage = pathname === "/";
  const isTransparentState = isHomepage && scrollY === 0;

  const navbarClasses = useMemo(() => {
    const base = "fixed top-0 left-0 w-full z-60 transition-all duration-400 ease-out";
    const visibility = showNavbar ? "translate-y-0" : "-translate-y-full";

    const theme = isTransparentState
      ? "bg-transparent text-[#2E1F14] dark:text-[#f5e9dc]"
      : "backdrop-blur-md bg-white/70 dark:bg-[#1a1410]/80 text-[#2E1F14] dark:text-[#f5e9dc]";

    return `${base} ${visibility} ${theme}`;
  }, [showNavbar, isTransparentState]);

  const handleScroll = useMemo(
    () =>
      throttle(() => {
        const currentScrollY = window.scrollY;
        setScrollY(currentScrollY);

        if (currentScrollY === 0) {
          setShowNavbar(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }

        setLastScrollY(currentScrollY);
      }, 100),
    [lastScrollY]
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuItemClick = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API}/info`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setContactInfo(data.data); })
      .catch(() => {});
  }, []);

  const allLinks = [...leftLinks, ...rightLinks];

  const linkClass = (href: string) =>
    `relative text-[13px] tracking-[0.10em] uppercase transition-colors duration-200 whitespace-nowrap font-medium ${
      pathname.startsWith(href)
        ? "text-[#2E1F14] dark:text-[#f5e9dc] after:absolute after:bottom-[-3px] after:left-0 after:w-full after:h-[2px] after:bg-amber-500 after:rounded-full"
        : "text-[#5C4033]/70 dark:text-[#c8b6a6]/70 hover:text-[#2E1F14] dark:hover:text-[#f5e9dc]"
    }`;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 lg:py-5">
        {/* Desktop Layout: Left Links | Center Logo | Right Links + Cart */}
        <div className="hidden md:grid grid-cols-3 items-center">
          {/* Left Links */}
          <div className="flex items-center gap-5 lg:gap-7">
            {leftLinks.map((link) => (
              <Link key={link.name} href={link.href} className={linkClass(link.href)}>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Center Logo */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1 cursor-pointer">
            <Logo index={isTransparentState ? 1 : 0} />
            <span className="font-antique text-2xl lg:text-[28px] text-[#2E1F14] dark:text-[#f5e9dc] tracking-[0.04em] leading-tight font-bold">
              Highland Yakchew
            </span>
          </Link>

          {/* Right Links + Social Icons + Cart */}
          <div className="flex items-center justify-end gap-5 lg:gap-7">
            {rightLinks.map((link) => (
              <Link key={link.name} href={link.href} className={linkClass(link.href)}>
                {link.name}
              </Link>
            ))}
            {/* Divider */}
            <div className="h-4 w-px bg-[#2E1F14]/15 dark:bg-[#f5e9dc]/15 mx-0.5" />
            <div className="flex items-center gap-3">
              {contactInfo?.socialLinks?.instagram && (
                <a href={contactInfo.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram className="text-[#2E1F14] dark:text-[#c8b6a6] text-lg hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors duration-200" />
                </a>
              )}
              {contactInfo?.socialLinks?.tiktok && (
                <a href={contactInfo.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FaTiktok className="text-[#2E1F14] dark:text-[#c8b6a6] text-lg hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors duration-200" />
                </a>
              )}
              {contactInfo?.email && (
                <a href={`mailto:${contactInfo.email}`} aria-label="Email">
                  <FaEnvelope className="text-[#2E1F14] dark:text-[#c8b6a6] text-lg hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors duration-200" />
                </a>
              )}
              {contactInfo?.socialLinks?.facebook && (
                <a href={contactInfo.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebook className="text-[#2E1F14] dark:text-[#c8b6a6] text-lg hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors duration-200" />
                </a>
              )}
              <Link
                href="/my-orders"
                aria-label="My Orders"
                title="My Orders"
                className="relative flex items-center justify-center w-7 h-7"
              >
                <PackageSearch className="text-[#2E1F14] dark:text-[#c8b6a6] text-[19px] hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors duration-200" />
              </Link>
              <Link href="/cart" className="relative ml-1" aria-label="Shopping cart">
                <FaShoppingCart className="text-[#2E1F14] dark:text-[#c8b6a6] text-lg hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors duration-200" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold w-[17px] h-[17px] flex items-center justify-center rounded-full">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile Layout: Hamburger | Center Logo | Cart */}
        <div className="flex md:hidden items-center justify-between">
          <button
            onClick={toggleMenu}
            className="text-2xl text-[#2E1F14] dark:text-[#f5e9dc] p-1"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <IoMdClose /> : <FiMenu />}
          </button>

          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Logo index={isTransparentState ? 1 : 0} />
            <span className="font-antique text-xl text-[#2E1F14] dark:text-[#f5e9dc] tracking-[0.03em] font-bold">
              Highland Yakchew
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/my-orders"
              aria-label="My Orders"
              title="My Orders"
              className="flex items-center justify-center"
            >
              <PackageSearch className="text-[#2E1F14] dark:text-[#c8b6a6] text-[22px] hover:text-[#7A5C4F] transition-colors duration-200" />
            </Link>
            <Link href="/cart" className="relative" aria-label="Shopping cart">
              <FaShoppingCart className="text-[#2E1F14] dark:text-[#c8b6a6] text-xl hover:text-[#7A5C4F] transition-colors duration-200" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold w-[17px] h-[17px] flex items-center justify-center rounded-full">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 dark:bg-[#241b16]/95 backdrop-blur-md text-[#2E1F14] dark:text-[#f5e9dc] px-4 py-6 absolute top-full left-0 w-full z-50 border-t border-amber-100 dark:border-[#3a2c23]">
          <ul className="space-y-1">
            {allLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={handleMenuItemClick}
                  className={`block px-4 py-3 text-[13px] tracking-[0.10em] uppercase font-medium transition-colors duration-200 ${
                    pathname.startsWith(link.href)
                      ? "text-[#2E1F14] dark:text-[#f5e9dc] font-medium"
                      : "text-[#5C4033]/80 dark:text-[#c8b6a6]/80 hover:text-[#2E1F14] dark:hover:text-[#f5e9dc]"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            <li className="px-4 py-2">
              <div className="border-t border-[#2E1F14]/10 dark:border-[#3a2c23]" />
            </li>

            <li>
              <Link
                href="/my-orders"
                onClick={handleMenuItemClick}
                className={`flex items-center gap-2.5 px-4 py-3 text-[13px] tracking-[0.10em] uppercase font-medium transition-colors duration-200 ${
                  pathname === '/my-orders'
                    ? 'text-[#2E1F14] dark:text-[#f5e9dc] font-medium'
                    : 'text-[#5C4033]/80 dark:text-[#c8b6a6]/80 hover:text-[#2E1F14] dark:hover:text-[#f5e9dc]'
                }`}
              >
                <PackageSearch className="text-amber-600 dark:text-amber-400 text-base" />
                My Orders
              </Link>
            </li>

            <li className="px-4">
              <Link
                href="/products"
                onClick={handleMenuItemClick}
                className="block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs text-center px-4 py-3 rounded-full tracking-[0.2em] uppercase transition-all duration-300 hover:from-amber-600 hover:to-orange-600 shadow-sm"
              >
                Shop Now
              </Link>
            </li>

            {/* Mobile social icons */}
            <li className="flex items-center justify-center gap-5 pt-3 pb-1">
              {contactInfo?.socialLinks?.instagram && (
                <a href={contactInfo.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram className="text-[#2E1F14] dark:text-[#c8b6a6] text-xl hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors" />
                </a>
              )}
              {contactInfo?.socialLinks?.tiktok && (
                <a href={contactInfo.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FaTiktok className="text-[#2E1F14] dark:text-[#c8b6a6] text-xl hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors" />
                </a>
              )}
              {contactInfo?.email && (
                <a href={`mailto:${contactInfo.email}`} aria-label="Email">
                  <FaEnvelope className="text-[#2E1F14] dark:text-[#c8b6a6] text-xl hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors" />
                </a>
              )}
              {contactInfo?.socialLinks?.facebook && (
                <a href={contactInfo.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebook className="text-[#2E1F14] dark:text-[#c8b6a6] text-xl hover:text-[#7A5C4F] dark:hover:text-amber-400 transition-colors" />
                </a>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
