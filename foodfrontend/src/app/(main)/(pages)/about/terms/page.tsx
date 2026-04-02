"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield, ShoppingBag, Truck, RotateCcw, CreditCard, Lock,
  AlertTriangle, BookOpen, Mail, ChevronRight, Dog, FileText,
} from "lucide-react";

const LAST_UPDATED = "24 February 2026";
const COMPANY_NAME = "Highland Yak Chew";
const COMPANY_EMAIL = "info@highlanddogchew.co.uk";
const COMPANY_WEBSITE = "highlanddogchew.co.uk";

interface Section {
  id: string;
  number: string;
  title: string;
  Icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: "general",       number: "01", title: "General Information",       Icon: BookOpen },
  { id: "products",      number: "02", title: "Product Information",        Icon: Dog },
  { id: "safety",        number: "03", title: "Dog Safety & Disclaimer",    Icon: AlertTriangle },
  { id: "orders",        number: "04", title: "Orders & Payments",          Icon: CreditCard },
  { id: "shipping",      number: "05", title: "Shipping & Delivery",        Icon: Truck },
  { id: "returns",       number: "06", title: "Returns & Refunds",          Icon: RotateCcw },
  { id: "products-sale", number: "07", title: "Products for Sale",          Icon: ShoppingBag },
  { id: "ip",            number: "08", title: "Intellectual Property",      Icon: Shield },
  { id: "liability",     number: "09", title: "Limitation of Liability",    Icon: Lock },
  { id: "privacy",       number: "10", title: "Privacy & Data",             Icon: Shield },
  { id: "changes",       number: "11", title: "Changes to These Terms",     Icon: FileText },
  { id: "contact",       number: "12", title: "Contact Us",                 Icon: Mail },
];

/* ─── Hooks ─────────────────────────────────────────────────────────────── */

function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Decorative SVGs ───────────────────────────────────────────────────── */

function PawPrint({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="50" cy="70" rx="22" ry="18" />
      <ellipse cx="22" cy="50" rx="10" ry="13" />
      <ellipse cx="78" cy="50" rx="10" ry="13" />
      <ellipse cx="33" cy="28" rx="9" ry="11" />
      <ellipse cx="67" cy="28" rx="9" ry="11" />
    </svg>
  );
}

function MountainLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 160" className={className} fill="none" preserveAspectRatio="none" aria-hidden>
      <polyline
        points="0,160 160,60 280,110 420,20 560,80 680,35 820,90 940,45 1080,75 1200,50 1200,160"
        stroke="currentColor" strokeWidth="1.5" fill="none"
      />
      <polyline
        points="0,160 120,100 240,130 380,55 500,105 640,65 760,105 900,70 1040,95 1200,75 1200,160"
        stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35"
      />
    </svg>
  );
}

/* ─── Reading progress bar ──────────────────────────────────────────────── */

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] pointer-events-none">
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "linear-gradient(90deg, var(--color-gold), #d4a84f, var(--color-gold))",
          boxShadow: "0 0 10px rgba(184,151,106,0.7)",
          transition: "width 0.08s linear",
        }}
      />
    </div>
  );
}

/* ─── Section card ──────────────────────────────────────────────────────── */

function SectionBlock({
  id, number, title, Icon, children,
}: {
  id: string; number: string; title: string; Icon: React.ElementType; children: React.ReactNode;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      id={id}
      className="scroll-mt-28 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border p-6 md:p-8 transition-shadow duration-300 group-hover:shadow-lg"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--border-base)",
        }}
      >
        {/* Watermark number */}
        <span
          className="absolute -top-3 -right-1 font-black leading-none select-none pointer-events-none"
          style={{
            fontSize: "clamp(80px, 12vw, 130px)",
            color: "var(--color-gold)",
            opacity: 0.045,
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            lineHeight: 1,
          }}
        >
          {number}
        </span>

        {/* Top accent line */}
        <div
          className="absolute top-0 left-8 right-8 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
        />

        {/* Header row */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
            style={{
              background: "linear-gradient(135deg, rgba(184,151,106,0.14), rgba(184,151,106,0.04))",
              borderColor: "rgba(184,151,106,0.28)",
            }}
          >
            <Icon className="w-5 h-5" style={{ color: "var(--color-gold)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="block text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5"
              style={{ color: "var(--color-gold)" }}
            >
              Section {number}
            </span>
            <h2
              className="text-xl md:text-2xl font-bold leading-tight"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                color: "var(--text-primary)",
              }}
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div
          className="text-[15px] md:text-base leading-[1.75] space-y-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-5 py-4 border-l-[3px]"
      style={{
        background: "rgba(184,151,106,0.07)",
        borderLeftColor: "var(--color-gold)",
        color: "var(--text-primary)",
      }}
    >
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="mt-[9px] flex-shrink-0 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--color-gold)" }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Intro notice ──────────────────────────────────────────────────────── */

function IntroNotice() {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="rounded-2xl border p-6 md:p-7"
      style={{
        background: "linear-gradient(135deg, rgba(184,151,106,0.09), rgba(184,151,106,0.03))",
        borderColor: "rgba(184,151,106,0.25)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
        <p className="text-[15px] md:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          These Terms &amp; Conditions govern your use of{" "}
          <strong style={{ color: "var(--text-primary)" }}>{COMPANY_WEBSITE}</strong>{" "}
          and any purchase of products from{" "}
          <strong style={{ color: "var(--text-primary)" }}>{COMPANY_NAME}</strong>.
          By accessing our website or placing an order you confirm that you have read, understood,
          and agree to be bound by these terms. If you do not agree, please do not use our website.
        </p>
      </div>
    </div>
  );
}

/* ─── Closing banner ────────────────────────────────────────────────────── */

function ClosingBanner() {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="relative overflow-hidden rounded-2xl p-8 md:p-10 text-center"
      style={{
        background: "linear-gradient(135deg, #2f1e14 0%, #1e1108 100%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(184,151,106,0.12), transparent 70%)" }}
      />
      <div
        className="absolute top-0 inset-x-0 h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(184,151,106,0.4), transparent)" }}
      />
      <PawPrint className="w-10 h-10 text-amber-400 mx-auto mb-4 opacity-75" />
      <h3
        className="text-xl md:text-2xl font-bold text-white mb-3"
        style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
      >
        Thank you for choosing{" "}
        <span style={{ color: "var(--color-gold-light)" }}>{COMPANY_NAME}</span>
      </h3>
      <p
        className="max-w-xl mx-auto leading-relaxed text-sm md:text-base mb-7"
        style={{ color: "rgba(244,237,228,0.5)" }}
      >
        We&apos;re committed to providing safe, natural, and premium dog chews that your pets will love.
        If anything in these terms is unclear, please don&apos;t hesitate to reach out.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { href: "/contact", label: "Contact Us" },
          { href: "/refunds", label: "Refund Policy" },
          { href: "/about", label: "About Us" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-xs px-5 py-2 rounded-full border transition-all duration-200"
            style={{ color: "var(--color-gold-light)", borderColor: "rgba(184,151,106,0.3)" }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function TermsAndConditions() {
  const [activeId, setActiveId] = useState("general");
  const [tocOpen, setTocOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTocOpen(false);
  };

  const activeIdx = SECTIONS.findIndex((s) => s.id === activeId);

  return (
    <main
      className="min-h-screen pt-32"
      style={{ background: "var(--surface-page)" }}
    >
      <ReadingProgress />

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden py-20 md:py-28"
        style={{
          background:
            "linear-gradient(135deg, #2E1F14 0%, #3d2a18 45%, #1a0f08 100%)",
        }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Radial glows */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(184,151,106,0.14) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(184,151,106,0.08) 0%, transparent 65%)",
          }}
        />

        {/* Mountain silhouette */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-[0.055]">
          <MountainLine className="w-full h-24 md:h-36 text-[#B8976A]" />
        </div>

        {/* Floating paw prints */}
        <div
          className="absolute top-8 right-[8%] pointer-events-none"
          style={{ opacity: 0.055 }}
        >
          <PawPrint className="w-28 h-28 text-[#D4BC8E]" />
        </div>
        <div
          className="absolute bottom-10 left-[6%] pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <PawPrint className="w-16 h-16 text-[#D4BC8E]" />
        </div>

        {/* Top gold rule */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(184,151,106,0.45), transparent)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 mb-8">
            <Link
              href="/"
              className="text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 hover:opacity-100"
              style={{ color: "rgba(212,188,142,0.5)" }}
            >
              Home
            </Link>
            <ChevronRight
              className="w-3 h-3"
              style={{ color: "rgba(212,188,142,0.3)" }}
            />
            <span
              className="text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "rgba(212,188,142,0.75)" }}
            >
              Terms &amp; Conditions
            </span>
          </nav>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 border"
            style={{
              background: "rgba(184,151,106,0.1)",
              borderColor: "rgba(184,151,106,0.28)",
            }}
          >
            <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-gold)" }} />
            <span
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--color-gold-light)" }}
            >
              Legal Agreement
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-black text-white leading-[1.05] mb-5"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 7vw, 5rem)",
            }}
          >
            Terms &amp;{" "}
            <em
              className="not-italic"
              style={{
                background: "linear-gradient(135deg, #e8d4a8 0%, #B8976A 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Conditions
            </em>
          </h1>

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(184,151,106,0.5))",
              }}
            />
            <PawPrint className="w-4 h-4 text-[#B8976A] opacity-60" />
            <div
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(270deg, transparent, rgba(184,151,106,0.5))",
              }}
            />
          </div>

          {/* Subtitle */}
          <p
            className="max-w-2xl mx-auto leading-relaxed mb-8"
            style={{
              fontFamily:
                "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
              color: "rgba(244,237,228,0.6)",
            }}
          >
            Please read these terms carefully before using our website or
            purchasing any products from{" "}
            <strong style={{ color: "var(--color-gold-light)" }}>
              {COMPANY_NAME}
            </strong>
            .
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { Icon: FileText, label: `Last updated: ${LAST_UPDATED}` },
              { Icon: Shield, label: "Governed by UK Law" },
              { Icon: BookOpen, label: "12 Sections" },
            ].map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-[11px] rounded-full px-4 py-2 border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(184,151,106,0.2)",
                  color: "rgba(212,188,142,0.55)",
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: "var(--color-gold)" }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ BODY ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
        <div className="lg:grid lg:grid-cols-[288px_1fr] lg:gap-12 xl:gap-16">

          {/* ─── Desktop Sidebar ─────────────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div
              className="sticky top-28 rounded-2xl border overflow-hidden"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--border-base)",
                boxShadow: "0 4px 32px rgba(46,31,20,0.07)",
              }}
            >
              {/* Sidebar header */}
              <div
                className="px-5 py-4 border-b flex items-center gap-2"
                style={{ borderColor: "var(--border-base)" }}
              >
                <BookOpen className="w-3.5 h-3.5" style={{ color: "var(--color-gold)" }} />
                <p
                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: "var(--color-gold)" }}
                >
                  Contents
                </p>
                <span
                  className="ml-auto text-[10px] px-2 py-0.5 rounded-full border font-semibold"
                  style={{
                    color: "var(--color-gold)",
                    borderColor: "rgba(184,151,106,0.3)",
                    background: "rgba(184,151,106,0.08)",
                  }}
                >
                  {SECTIONS.length}
                </span>
              </div>

              {/* Timeline nav */}
              <nav className="relative px-4 py-4">
                {/* Vertical track */}
                <div
                  className="absolute left-[28px] top-4 bottom-4 w-px"
                  style={{ background: "var(--border-base)" }}
                />
                {/* Active fill */}
                {mounted && (
                  <div
                    className="absolute left-[28px] top-4 w-px transition-all duration-500"
                    style={{
                      background: "var(--color-gold)",
                      height: `${((activeIdx + 0.5) / SECTIONS.length) * 100}%`,
                    }}
                  />
                )}

                <div className="space-y-0.5 relative z-10">
                  {SECTIONS.map(({ id, number, title, Icon }, idx) => {
                    const isActive = activeId === id;
                    const isPast = idx < activeIdx;
                    return (
                      <button
                        key={id}
                        onClick={() => scrollTo(id)}
                        className="w-full flex items-center gap-3 pl-2 pr-3 py-2 rounded-xl text-left text-[13px] transition-all duration-200"
                        style={{
                          background: isActive
                            ? "rgba(184,151,106,0.11)"
                            : "transparent",
                        }}
                      >
                        {/* Dot */}
                        <span
                          className="flex-shrink-0 w-[14px] h-[14px] rounded-full border-2 transition-all duration-300"
                          style={{
                            borderColor:
                              isActive || isPast
                                ? "var(--color-gold)"
                                : "var(--border-base)",
                            background: isActive
                              ? "var(--color-gold)"
                              : isPast
                              ? "rgba(184,151,106,0.35)"
                              : "var(--surface-card)",
                          }}
                        />
                        <span
                          className="truncate transition-colors duration-200"
                          style={{
                            color: isActive
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {number}. {title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Email footer */}
              <div
                className="px-5 py-4 border-t"
                style={{ borderColor: "var(--border-base)" }}
              >
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="flex items-center gap-2 text-xs font-medium transition-colors duration-200"
                  style={{ color: "var(--color-gold)" }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Questions? Email us
                </a>
              </div>
            </div>
          </aside>

          {/* ─── Mobile TOC ──────────────────────────────────────────────── */}
          <div className="lg:hidden mb-8">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full flex items-center justify-between gap-3 rounded-xl px-5 py-4 border transition-all duration-200"
              style={{
                background: "var(--surface-card)",
                borderColor: tocOpen
                  ? "rgba(184,151,106,0.4)"
                  : "var(--border-base)",
              }}
            >
              <span
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <BookOpen
                  className="w-4 h-4"
                  style={{ color: "var(--color-gold)" }}
                />
                Table of Contents
                <span
                  className="ml-1 text-[11px] px-2 py-0.5 rounded-full border font-semibold"
                  style={{
                    background: "rgba(184,151,106,0.1)",
                    borderColor: "rgba(184,151,106,0.3)",
                    color: "var(--color-gold)",
                  }}
                >
                  {SECTIONS.length}
                </span>
              </span>
              <ChevronRight
                className="w-4 h-4 transition-transform duration-300"
                style={{
                  color: "var(--color-gold)",
                  transform: tocOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: tocOpen ? "800px" : "0" }}
            >
              <div
                className="mt-2 rounded-xl border p-3"
                style={{
                  background: "var(--surface-card)",
                  borderColor: "var(--border-base)",
                }}
              >
                {SECTIONS.map(({ id, number, title, Icon }) => {
                  const isActive = activeId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150"
                      style={{
                        background: isActive
                          ? "rgba(184,151,106,0.1)"
                          : "transparent",
                      }}
                    >
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{
                          color: isActive
                            ? "var(--color-gold)"
                            : "var(--text-muted)",
                        }}
                      />
                      <span
                        style={{
                          color: isActive
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {number}. {title}
                      </span>
                      {isActive && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--color-gold)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Main Content ─────────────────────────────────────────────── */}
          <article className="space-y-5 md:space-y-6">

            {/* Intro notice */}
            <IntroNotice />

            {/* ── 01 ── */}
            <SectionBlock id="general" number="01" title="General Information" Icon={BookOpen}>
              <p>
                {COMPANY_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website{" "}
                <span style={{ fontWeight: 600, color: "var(--color-gold-hover)" }}>{COMPANY_WEBSITE}</span>.
                We are a UK-based company specialising in premium, natural Himalayan yak and cow milk dog chews.
              </p>
              <p>
                These terms apply to all visitors, customers, and users of our website. Your continued
                use of the website constitutes your agreement to these terms and any future revisions.
              </p>
            </SectionBlock>

            {/* ── 02 ── */}
            <SectionBlock id="products" number="02" title="Product Information" Icon={Dog}>
              <p>
                Our dog chews are crafted from natural yak and cow milk using traditional Himalayan
                methods. Because they are a natural product, variations in size, shape, colour, and
                texture are entirely normal and do not indicate a defect.
              </p>
              <BulletList items={[
                "All products are grain-free, gluten-free, and free from artificial additives.",
                "Weights and dimensions listed are approximate.",
                "Product images are for illustration purposes; actual items may differ slightly.",
                "We strive to keep product descriptions accurate, but we do not guarantee that descriptions are error-free.",
              ]} />
            </SectionBlock>

            {/* ── 03 ── */}
            <SectionBlock id="safety" number="03" title="Dog Safety & Disclaimer" Icon={AlertTriangle}>
              <Highlight>
                <strong>Always supervise your dog while chewing.</strong> Remove small pieces
                to prevent choking. Consult your vet if your dog has dietary restrictions.
              </Highlight>
              <BulletList items={[
                "Products are intended for dogs only and are not for human consumption.",
                "Not recommended for puppies under 4 months of age.",
                "Do not give to dogs with known dairy or milk allergies.",
                "Remove and discard pieces small enough to swallow whole.",
                "Ensure your dog has access to fresh water at all times.",
                "Highland Yak Chew is not liable for any injury or adverse reaction resulting from unsupervised use.",
                "If your dog shows signs of distress after chewing, discontinue use and consult a veterinarian immediately.",
              ]} />
            </SectionBlock>

            {/* ── 04 ── */}
            <SectionBlock id="orders" number="04" title="Orders & Payments" Icon={CreditCard}>
              <p>
                All prices are displayed in <strong>Great British Pounds (GBP)</strong> and include VAT
                where applicable. Prices are subject to change without prior notice.
              </p>
              <BulletList items={[
                "An order is not confirmed until payment has been successfully processed.",
                "We accept major credit/debit cards and other payment methods displayed at checkout.",
                "We reserve the right to cancel any order due to pricing errors, stock unavailability, or suspected fraudulent activity.",
                "You will receive an order confirmation email once payment is accepted.",
                "We do not store full payment card details on our servers.",
              ]} />
            </SectionBlock>

            {/* ── 05 ── */}
            <SectionBlock id="shipping" number="05" title="Shipping & Delivery" Icon={Truck}>
              <p>
                We aim to dispatch all orders within <strong>1–2 business days</strong>, excluding UK
                bank holidays and weekends.
              </p>
              <BulletList items={[
                "Shipping costs and estimated delivery times are shown at checkout.",
                "We ship to UK addresses and select international destinations.",
                "International customers are solely responsible for any customs duties, import taxes, or additional fees.",
                "We are not liable for delays caused by carriers, customs, or circumstances beyond our control.",
                "Risk of loss passes to you upon delivery to the carrier.",
              ]} />
            </SectionBlock>

            {/* ── 06 ── */}
            <SectionBlock id="returns" number="06" title="Returns & Refunds" Icon={RotateCcw}>
              <p>
                Your satisfaction matters to us. Due to hygiene and safety reasons, we are unable to
                accept returns of opened or used chew products.
              </p>
              <BulletList items={[
                "Unopened, undamaged products may be returned within 14 days of receipt.",
                "If your order arrives damaged or incorrect, contact us within 48 hours with photographic evidence.",
                "Refunds are processed to the original payment method within 5–10 business days of approval.",
                "Return postage costs are the customer's responsibility unless the item is faulty.",
                "We reserve the right to refuse a refund if the product has been used or tampered with.",
              ]} />
              <Highlight>
                To initiate a return, email us at{" "}
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  style={{ textDecoration: "underline", color: "var(--color-gold-hover)", fontWeight: 500 }}
                >
                  {COMPANY_EMAIL}
                </a>{" "}
                with your order number and reason.
              </Highlight>
            </SectionBlock>

            {/* ── 07 ── */}
            <SectionBlock id="products-sale" number="07" title="Products for Sale" Icon={ShoppingBag}>
              <p>
                All products listed on our website are subject to availability. We reserve the right to
                discontinue any product at any time.
              </p>
              <BulletList items={[
                "Promotional discounts and offers are valid only for the specified period and cannot be applied retrospectively.",
                "Bundle offers are subject to stock availability.",
                "We reserve the right to limit the quantity of items purchased per customer.",
                "Subscription or repeat-order offers are governed by their own specific terms, available at the point of purchase.",
              ]} />
            </SectionBlock>

            {/* ── 08 ── */}
            <SectionBlock id="ip" number="08" title="Intellectual Property" Icon={Shield}>
              <p>
                All content on this website — including but not limited to text, photography, logos,
                branding, product descriptions, and design — is the exclusive property of{" "}
                <strong>{COMPANY_NAME}</strong> or its licensors.
              </p>
              <BulletList items={[
                "You may not copy, reproduce, republish, upload, post, transmit, or distribute any content without prior written permission.",
                "Unauthorised use of our trademarks or branding is strictly prohibited.",
                "User-generated content submitted to us (e.g. reviews, photos) may be used by us for marketing purposes.",
              ]} />
            </SectionBlock>

            {/* ── 09 ── */}
            <SectionBlock id="liability" number="09" title="Limitation of Liability" Icon={Lock}>
              <p>
                To the fullest extent permitted by applicable UK law, {COMPANY_NAME} shall not be liable for:
              </p>
              <BulletList items={[
                "Any indirect, incidental, special, or consequential damages arising from the use of our products or website.",
                "Loss of profits, revenue, data, or goodwill.",
                "Injury to animals resulting from unsupervised or improper use of our products.",
                "Errors, inaccuracies, or interruptions on the website.",
              ]} />
              <p>
                Our total liability for any claim shall not exceed the amount paid by you for the relevant
                product(s). Nothing in these terms limits our liability for death, personal injury, or fraud
                caused by our negligence.
              </p>
            </SectionBlock>

            {/* ── 10 ── */}
            <SectionBlock id="privacy" number="10" title="Privacy & Data" Icon={Shield}>
              <p>
                We take your privacy seriously. Personal data you provide when making a purchase or
                contacting us is handled in accordance with our Privacy Policy and the UK GDPR.
              </p>
              <BulletList items={[
                "We do not sell your personal data to third parties.",
                "Data is used only to process orders, improve our services, and communicate with you.",
                "You can request access to, correction of, or deletion of your data at any time.",
                "By subscribing to our newsletter you consent to receiving marketing emails. You may unsubscribe at any time.",
              ]} />
            </SectionBlock>

            {/* ── 11 ── */}
            <SectionBlock id="changes" number="11" title="Changes to These Terms" Icon={FileText}>
              <p>
                We reserve the right to update or amend these Terms &amp; Conditions at any time. The date
                at the top of this page reflects the most recent revision.
              </p>
              <p>
                Continued use of our website or purchase of products after changes are posted constitutes
                your acceptance of the revised terms. We encourage you to review this page periodically.
              </p>
            </SectionBlock>

            {/* ── 12 ── */}
            <SectionBlock id="contact" number="12" title="Contact Us" Icon={Mail}>
              <p>
                If you have any questions, concerns, or feedback regarding these Terms &amp; Conditions,
                please get in touch:
              </p>
              <div
                className="rounded-xl border p-5 space-y-3 text-sm"
                style={{
                  background: "rgba(184,151,106,0.05)",
                  borderColor: "rgba(184,151,106,0.2)",
                }}
              >
                {[
                  { icon: Mail, content: <a href={`mailto:${COMPANY_EMAIL}`} style={{ color: "var(--color-gold-hover)", textDecoration: "underline", fontWeight: 500 }}>{COMPANY_EMAIL}</a> },
                  { icon: Dog, content: <span style={{ color: "var(--text-secondary)" }}>{COMPANY_NAME} — Premium Himalayan Dog Chews</span> },
                  { icon: Shield, content: <span style={{ color: "var(--text-secondary)" }}>Governed by the laws of England &amp; Wales</span> },
                ].map(({ icon: Icon, content }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                    {content}
                  </div>
                ))}
              </div>
            </SectionBlock>

            {/* ── Closing banner ── */}
            <ClosingBanner />

          </article>
        </div>
      </div>
    </main>
  );
}
