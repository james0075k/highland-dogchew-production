"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mountain,
  Heart,
  Shield,
  Leaf,
  Award,
  Users,
  Star,
  ArrowRight,
  ChevronRight,
  Globe,
  Sparkles,
  PawPrint,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
}

interface TeamMember {
  _id: string;
  name: string;
  position?: string;
  image?: string;
  shortinfo?: string;
  contactNumber?: string;
  certifications?: { title: string; imageUrls?: string }[];
  socialLinks?: SocialLinks;
}

// ─── Intersection Observer hook ───────────────────────────────────────────────

function useReveal(threshold = 0.15) {
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

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { ref, visible } = useReveal(0.3);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-bold font-heading text-amber-400 leading-none">
        {count}{suffix}
      </p>
      <p className="mt-2 text-sm md:text-base text-amber-100/70 font-subheading italic tracking-wide">
        {label}
      </p>
    </div>
  );
}

// ─── Social Icon ──────────────────────────────────────────────────────────────

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  twitter: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  ),
  instagram: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  github: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
  ),
};

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({ member, idx }: { member: TeamMember; idx: number }) {
  const { ref, visible } = useReveal(0.1);
  const hasSocials = member.socialLinks && Object.values(member.socialLinks).some(Boolean);

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ transitionDelay: `${idx * 120}ms` }}
    >
      <div className="relative overflow-hidden bg-white dark:bg-[#1e1812] rounded-2xl border border-[#e8e3dc] dark:border-[#2e2420] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-gradient-to-br from-amber-50 to-[#f5ede0] dark:from-[#2a211b] dark:to-[#1e1812]">
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-900 flex items-center justify-center">
                <Users className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2f1e14]/90 via-[#2f1e14]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Hover content */}
          {member.shortinfo && (
            <div className="absolute inset-x-0 bottom-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <p className="text-sm text-white/90 font-subheading italic leading-relaxed line-clamp-4">
                {member.shortinfo}
              </p>
            </div>
          )}

          {/* Paw print accent */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-[#2f1e14]/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
            <PawPrint className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-[#2f1e14] dark:text-[#f5e9dc] font-heading leading-tight">
            {member.name}
          </h3>
          {member.position && (
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1 font-subheading italic">
              {member.position}
            </p>
          )}

          {/* Certifications */}
          {member.certifications && member.certifications.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {member.certifications.slice(0, 3).map((cert, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800 font-semibold uppercase tracking-wider"
                >
                  {cert.title}
                </span>
              ))}
              {member.certifications.length > 3 && (
                <span className="text-[10px] px-2.5 py-1 bg-gray-100 dark:bg-[#2a211b] text-[#aaa] rounded-full">
                  +{member.certifications.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Social links */}
          {hasSocials && (
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-[#f0ebe4] dark:border-[#2e2420]">
              {Object.entries(member.socialLinks!)
                .filter(([, url]) => url)
                .map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#faf5ee] dark:bg-[#2a211b] text-[#7A5C4F] dark:text-[#c8b6a6] hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 transition-all duration-300 hover:scale-110"
                    title={platform}
                  >
                    {SOCIAL_ICONS[platform]}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AboutPage = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const hero = useReveal(0.05);
  const story = useReveal(0.15);
  const mission = useReveal(0.15);
  const values = useReveal(0.1);
  const gallery = useReveal(0.1);
  const cta = useReveal(0.15);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
        const data = await res.json();
        if (data.success) setTeam(data.data || []);
      } catch {
        // silently fail
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(6px, -4px); }
          50% { transform: translate(-3px, -8px); }
          75% { transform: translate(-6px, -2px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .reveal { transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-hidden { opacity: 0; transform: translateY(40px); }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .reveal-left { opacity: 0; transform: translateX(-50px); }
        .reveal-left-visible { opacity: 1; transform: translateX(0); }
        .reveal-right { opacity: 0; transform: translateX(50px); }
        .reveal-right-visible { opacity: 1; transform: translateX(0); }
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
        }
      `}</style>

      <main className="min-h-screen bg-[var(--surface-page)] overflow-hidden">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO                                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section ref={hero.ref} className="relative min-h-[92vh] flex items-end overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/images/dog-5.jpeg"
              alt="Highland dog in the mountains"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1008] via-[#1a1008]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1008]/60 to-transparent" />
            <div className="absolute inset-0 noise-overlay opacity-30" />
          </div>

          {/* Floating accent elements */}
          <div className="absolute top-32 right-12 w-20 h-20 border border-amber-400/20 rounded-full animate-[drift_8s_ease-in-out_infinite] hidden lg:block" />
          <div className="absolute top-48 right-32 w-3 h-3 bg-amber-400/40 rounded-full animate-[drift_6s_ease-in-out_infinite_1s]" />

          {/* Content */}
          <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24 w-full reveal ${hero.visible ? "reveal-visible" : "reveal-hidden"}`}>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 backdrop-blur-sm mb-6">
                <Mountain className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-[0.2em]">
                  From the Himalayas
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.05] mb-6">
                Our Story,{" "}
                <span className="relative">
                  <span className="text-amber-400">Their Joy</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-400/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0 9C50 4 100 2 200 9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/70 font-subheading italic leading-relaxed max-w-lg mb-10">
                Born in the highlands, crafted with care. We bring the ancient Himalayan tradition
                of yak milk chews to dogs around the world.
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-[#2f1e14] font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.97]"
                >
                  Explore Our Chews
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#our-story"
                  className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 font-medium text-sm transition-colors"
                >
                  Read Our Story
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--surface-page)] to-transparent z-10" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OUR STORY — Founder's Note                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="our-story" className="py-20 md:py-32 px-4 md:px-8">
          <div ref={story.ref} className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
              {/* Image collage */}
              <div className={`relative reveal ${story.visible ? "reveal-left-visible" : "reveal-left"}`}>
                <div className="relative">
                  {/* Main image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 aspect-[4/5]">
                    <Image
                      src="/images/dog-2.jpeg"
                      alt="Happy dog with a yak chew"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  {/* Floating accent image */}
                  <div className="absolute -bottom-6 -right-6 w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-[var(--surface-page)] animate-[float_6s_ease-in-out_infinite]">
                    <Image
                      src="/images/dog-15.jpeg"
                      alt="Playful golden puppy"
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>
                  {/* Decorative dots */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 opacity-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <circle key={i} cx={(i % 5) * 22 + 11} cy={Math.floor(i / 5) * 22 + 11} r="2.5" fill="currentColor" />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className={`reveal ${story.visible ? "reveal-right-visible" : "reveal-right"}`}>
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-8 h-px bg-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">
                    Our Story
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[var(--text-primary)] leading-[1.1] mb-8">
                  A Note From{" "}
                  <span className="text-amber-600 dark:text-amber-400">Our Founder</span>
                </h2>

                <div className="space-y-5 text-base md:text-lg leading-[1.85] text-[var(--text-secondary)] font-subheading italic">
                  <p>
                    From the start, we knew our responsibility didn&apos;t end with making a great product.
                    When something comes from the mountains, it should also support the people who live there.
                  </p>
                  <p>
                    The Highland Yak Chew Future Foundation exists to give back to high-altitude communities,
                    with a focus on the women deeply involved in yak care, milk production, and
                    traditional cheese making.
                  </p>
                  <p>
                    A portion of every sale supports fair wages, healthcare access, skill training, and
                    sustainable income opportunities. We focus on long-term progress, helping communities
                    grow stronger and more independent over time.
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-[var(--border-base)]">
                  <p className="text-[var(--text-primary)] font-heading font-bold text-lg">
                    Highland Yak Chew
                  </p>
                  <p className="text-sm text-[var(--text-muted)] font-subheading italic mt-1">
                    Choosing Highland means supporting sustainable practices that honour both the land and the people who call it home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* WHY CHOOSE US                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section ref={values.ref} className="py-16 md:py-24 px-4 md:px-8 bg-[var(--surface-card)]">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-14 reveal ${values.visible ? "reveal-visible" : "reveal-hidden"}`}>
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">
                  Why Highland
                </span>
                <div className="w-8 h-px bg-amber-500" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--text-primary)]">
                What Sets Us Apart
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: <Mountain className="w-6 h-6" />,
                  title: "Sourced from the Himalayas",
                  desc: "Every chew originates from high-altitude yak milk — pure, natural, and free from artificial additives. Traditions passed down through generations.",
                  accent: "from-amber-500/20 to-orange-500/10",
                  border: "group-hover:border-amber-300 dark:group-hover:border-amber-700",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Vet Approved & Safe",
                  desc: "Our products are tested and trusted by veterinarians. Long-lasting, fully digestible, and perfect for dogs of all breeds and sizes.",
                  accent: "from-emerald-500/20 to-teal-500/10",
                  border: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700",
                },
                {
                  icon: <Leaf className="w-6 h-6" />,
                  title: "Sustainably Made",
                  desc: "We work directly with Himalayan communities, ensuring fair trade, empowering women, and environmentally responsible production practices.",
                  accent: "from-green-500/20 to-emerald-500/10",
                  border: "group-hover:border-green-300 dark:group-hover:border-green-700",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={`group relative reveal ${values.visible ? "reveal-visible" : "reveal-hidden"}`}
                  style={{ transitionDelay: `${i * 150 + 200}ms` }}
                >
                  <div className={`relative h-full bg-white dark:bg-[#1e1812] rounded-2xl border border-[#e8e3dc] dark:border-[#2e2420] p-7 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${item.border}`}>
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>

                    <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-[1.8] text-[var(--text-secondary)] font-subheading italic">
                      {item.desc}
                    </p>

                    {/* Arrow hover indicator */}
                    <div className="mt-5 flex items-center gap-2 text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300">
                      <span className="text-xs font-bold uppercase tracking-wider">Learn more</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MISSION + IMAGE                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section ref={mission.ref} className="py-20 md:py-32 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Text — left on desktop */}
              <div className={`order-2 lg:order-1 reveal ${mission.visible ? "reveal-left-visible" : "reveal-left"}`}>
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-8 h-px bg-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">
                    Our Mission
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[var(--text-primary)] leading-[1.1] mb-8">
                  Nourishing Dogs,{" "}
                  <span className="text-amber-600 dark:text-amber-400">Empowering Communities</span>
                </h2>

                <p className="text-base md:text-lg leading-[1.85] text-[var(--text-secondary)] font-subheading italic mb-10">
                  Every Highland Yak Chew starts its journey in the mountains, where traditional methods
                  meet modern quality standards. We believe in creating a product that&apos;s as good
                  for the world as it is for your dog.
                </p>

                {/* Mission pillars */}
                <div className="space-y-5">
                  {[
                    { icon: <Heart className="w-4.5 h-4.5" />, title: "Fair Trade Practices", desc: "Direct partnerships with Himalayan farming communities" },
                    { icon: <Globe className="w-4.5 h-4.5" />, title: "Environmental Stewardship", desc: "Sustainable grazing and eco-friendly production" },
                    { icon: <Sparkles className="w-4.5 h-4.5" />, title: "Premium Quality", desc: "No additives, no preservatives — just pure yak milk" },
                    { icon: <Users className="w-4.5 h-4.5" />, title: "Women Empowerment", desc: "Supporting women in traditional dairy practices" },
                  ].map((p) => (
                    <div key={p.title} className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                        {p.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{p.title}</h4>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image — right on desktop */}
              <div className={`order-1 lg:order-2 reveal ${mission.visible ? "reveal-right-visible" : "reveal-right"}`}>
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 aspect-[4/5]">
                    <Image
                      src="/images/dog-12.jpeg"
                      alt="Golden retriever in nature"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  {/* Accent image */}
                  <div className="absolute -top-6 -left-6 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-xl border-4 border-[var(--surface-page)] animate-[float_7s_ease-in-out_infinite_1s]">
                    <Image
                      src="/images/dog-25.jpeg"
                      alt="Adorable cavalier pup"
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                  {/* Decorative dots */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <circle key={i} cx={(i % 5) * 22 + 11} cy={Math.floor(i / 5) * 22 + 11} r="2.5" fill="currentColor" />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOG GALLERY — Masonry-style                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section ref={gallery.ref} className="py-16 md:py-24 px-4 md:px-8 bg-[var(--surface-card)]">
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-12 reveal ${gallery.visible ? "reveal-visible" : "reveal-hidden"}`}>
              <div className="inline-flex items-center gap-2 mb-4">
                <PawPrint className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">
                  Happy Customers
                </span>
                <PawPrint className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--text-primary)]">
                Dogs We&apos;ve Made Happy
              </h2>
            </div>

            {/* Masonry grid */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 reveal ${gallery.visible ? "reveal-visible" : "reveal-hidden"}`} style={{ transitionDelay: "200ms" }}>
              {[
                { src: "/images/dog-1.jpeg", alt: "Husky relaxing", span: "md:row-span-2", aspect: "aspect-[3/4]" },
                { src: "/images/dog-8.jpeg", alt: "Snowy husky", span: "", aspect: "aspect-square" },
                { src: "/images/dog-30.jpeg", alt: "Puppy in wooden box", span: "", aspect: "aspect-square" },
                { src: "/images/dog-7.jpeg", alt: "Husky close-up", span: "md:row-span-2", aspect: "aspect-[3/4]" },
                { src: "/images/dog-3.jpeg", alt: "Blue-eyed husky", span: "", aspect: "aspect-square" },
                { src: "/images/dog-20.jpeg", alt: "Rottweiler at golden hour", span: "", aspect: "aspect-square" },
              ].map((img, i) => (
                <div
                  key={img.src}
                  className={`${img.span} relative overflow-hidden rounded-xl md:rounded-2xl group cursor-pointer ${img.aspect}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="flex items-center gap-1.5 text-white">
                      <PawPrint className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{img.alt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATS STRIP                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative bg-[#2f1e14] py-16 md:py-20 overflow-hidden">
          {/* Subtle texture */}
          <div className="absolute inset-0 noise-overlay opacity-40" />
          {/* Gradient accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          <div className="relative max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
              <AnimatedStat value={100} suffix="%" label="Natural Ingredients" />
              <AnimatedStat value={5} suffix="★" label="Customer Rating" />
              <AnimatedStat value={10} suffix="k+" label="Happy Dogs" />
              <AnimatedStat value={3} suffix="" label="Himalayan Regions" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MEET OUR TEAM                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(loadingTeam || team.length > 0) && (
          <section className="py-20 md:py-28 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Section header */}
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">
                    The People Behind the Chew
                  </span>
                  <div className="w-8 h-px bg-amber-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--text-primary)] mb-4">
                  Meet Our Team
                </h2>
                <p className="max-w-xl mx-auto text-base leading-[1.85] text-[var(--text-secondary)] font-subheading italic">
                  Passionate dog lovers, quality experts, and sustainability advocates — our team is
                  dedicated to bringing your pup the very best from the Himalayas.
                </p>
              </div>

              {/* Loading skeleton */}
              {loadingTeam ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="overflow-hidden bg-white dark:bg-[#1e1812] shadow-sm rounded-2xl border border-[#e8e3dc] dark:border-[#2e2420] animate-pulse">
                      <div className="aspect-[3/4] bg-amber-100/50 dark:bg-[#2a211b]" />
                      <div className="p-5 space-y-3">
                        <div className="w-3/4 h-5 bg-gray-200 dark:bg-[#2e2420] rounded-lg" />
                        <div className="w-1/2 h-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg" />
                        <div className="h-3 bg-gray-100 dark:bg-[#2a211b] rounded-lg" />
                        <div className="w-5/6 h-3 bg-gray-100 dark:bg-[#2a211b] rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {team.map((member, i) => (
                    <TeamCard key={member._id} member={member} idx={i} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CTA                                                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section ref={cta.ref} className="py-20 md:py-28 px-4 md:px-8">
          <div className={`max-w-4xl mx-auto text-center reveal ${cta.visible ? "reveal-visible" : "reveal-hidden"}`}>
            <div className="relative bg-gradient-to-br from-[#2f1e14] to-[#1a1008] rounded-3xl overflow-hidden px-8 py-16 md:py-20 md:px-16 shadow-2xl">
              {/* Noise */}
              <div className="absolute inset-0 noise-overlay opacity-30" />
              {/* Gradient orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 mb-6">
                  <PawPrint className="w-5 h-5 text-amber-400" />
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight mb-5">
                  Ready to Treat Your<br />
                  <span className="text-amber-400">Best Friend?</span>
                </h2>

                <p className="text-base md:text-lg text-white/60 font-subheading italic max-w-lg mx-auto mb-10 leading-relaxed">
                  Explore our range of 100% natural Himalayan yak milk chews. Because your dog
                  deserves nothing but the very best.
                </p>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-[#2f1e14] font-bold text-sm px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.97]"
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contacts"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 border border-white/20 hover:border-amber-400/50 px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-300"
                  >
                    Get in Touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default AboutPage;
