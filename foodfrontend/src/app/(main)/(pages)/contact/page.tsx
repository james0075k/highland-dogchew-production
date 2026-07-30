'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle,
  AlertCircle, ChevronRight,
} from 'lucide-react';
import {
  FaInstagram, FaFacebookF, FaLinkedinIn, FaTiktok,
} from 'react-icons/fa6';
import { FaXTwitter } from 'react-icons/fa6';
import { apiRequest } from '@/utils/apiService';
import { toWhatsAppNumber } from '@/utils/phone';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */
interface ContactInfo {
  email?: string;
  phone?: string;
  phones?: string[];
  address?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
    twitter?: string;
  };
}

/* ═══════════════════════════════════════════════
   SVG DECORATIONS
   ═══════════════════════════════════════════════ */
function PawSvg({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="currentColor">
      <ellipse cx="24" cy="32" rx="10" ry="9" />
      <ellipse cx="13" cy="20" rx="5" ry="6" transform="rotate(-10 13 20)" />
      <ellipse cx="23" cy="14" rx="4.5" ry="6" />
      <ellipse cx="33" cy="17" rx="5" ry="6" transform="rotate(12 33 17)" />
      <ellipse cx="39" cy="26" rx="4" ry="5.5" transform="rotate(25 39 26)" />
    </svg>
  );
}

function BoneDivider({ className = '' }: { className?: string }) {
  return (
    <svg className={`mx-auto ${className}`} width="100" height="20" viewBox="0 0 100 20" fill="none">
      <circle cx="10" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="7.5" width="72" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="90" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="90" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function StitchCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const p: Record<string, string> = {
    tl: 'top-2.5 left-2.5 rotate-0',
    tr: 'top-2.5 right-2.5 rotate-90',
    bl: 'bottom-2.5 left-2.5 -rotate-90',
    br: 'bottom-2.5 right-2.5 rotate-180',
  };
  return (
    <svg className={`absolute ${p[pos]} text-[#B8976A]/40 dark:text-[#D4BC8E]/25`} width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 16 L2 2 L16 2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" className="animate-stitch-slow" />
    </svg>
  );
}

function StitchLine({ className = '' }: { className?: string }) {
  return (
    <svg className={`mx-auto ${className}`} width="120" height="4" viewBox="0 0 120 4" fill="none">
      <path d="M0 2 L120 2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 5" strokeLinecap="round" className="animate-stitch" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════ */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */
function toWhatsApp(phone: string) {
  return `https://wa.me/${toWhatsAppNumber(phone)}`;
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

function InfoCard({ Icon, label, value, href, iconBg, index }: {
  Icon: React.ElementType; label: string; value: string; href?: string; iconBg: string; index: number;
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4 }}
      className="relative flex items-start gap-4 p-5 bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
    >
      {/* hover paw */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500">
        <PawSvg className="w-10 h-10 text-[var(--text-primary)]" />
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#B8976A] dark:text-[#D4BC8E] mb-1" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          {label}
        </p>
        <p className="text-[var(--text-primary)] font-medium text-[15px] leading-relaxed group-hover:text-[#B8976A] dark:group-hover:text-[#D4BC8E] transition-colors duration-200" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
          {value}
        </p>
      </div>
    </motion.div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  ) : (
    <div>{inner}</div>
  );
}

function SocialLink({ href, Icon, label, gradient, index }: {
  href: string; Icon: React.ElementType; label: string; gradient: string; index: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4 }}
      className="group flex items-center gap-3 p-4 rounded-2xl border border-[var(--border-base)]/40 bg-[var(--surface-card)] dark:bg-[#1f1812] hover:border-transparent hover:shadow-lg transition-all duration-300 overflow-hidden relative"
    >
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className={`relative z-10 w-9 h-9 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="relative z-10 text-sm font-semibold text-[var(--text-primary)] group-hover:text-white transition-colors duration-300">
        {label}
      </span>
      <ChevronRight className="relative z-10 w-4 h-4 text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200 ml-auto" />
    </motion.a>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2" style={{ fontFamily: 'var(--font-dm-sans)' }}>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-3 bg-[var(--surface-input)] border border-[var(--border-base)]/60 rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8976A]/30 focus:border-[#B8976A]/50 transition-all duration-200';

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contactInfoUpdateKey = 'contactInfoUpdatedAt';

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayFade = useTransform(scrollYProgress, [0, 0.7], [0.35, 0.65]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const loadContactInfo = () => {
      fetch(`${apiUrl}/info?t=${Date.now()}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => { if (d.success && d.data) setInfo(d.data); })
        .catch(() => {});
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadContactInfo();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === contactInfoUpdateKey) loadContactInfo();
    };

    loadContactInfo();
    window.addEventListener('focus', loadContactInfo);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('focus', loadContactInfo);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [contactInfoUpdateKey]);

  const phone = info?.phone || info?.phones?.[0] || '';
  const contactAddress = info?.address?.trim() || '2nd Floor, College House, 17 King Edwards Rd, Ruislip, HA4 7AE, UK';
  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(contactAddress)}&output=embed&z=18`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setMsg('');
    try {
      const res = await apiRequest('/contact', { method: 'POST', body: JSON.stringify(form) });
      setStatus('success');
      setMsg(res?.message || "Thanks! We'll get back to you soon.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.message || 'Something went wrong. Please try again.');
    }
  };

  const socialLinks = [
    { key: 'instagram', href: info?.socialLinks?.instagram, Icon: FaInstagram, label: 'Instagram', gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400' },
    { key: 'facebook', href: info?.socialLinks?.facebook, Icon: FaFacebookF, label: 'Facebook', gradient: 'bg-[#1877F2]' },
    { key: 'tiktok', href: info?.socialLinks?.tiktok, Icon: FaTiktok, label: 'TikTok', gradient: 'bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-neutral-800' },
    { key: 'linkedin', href: info?.socialLinks?.linkedin, Icon: FaLinkedinIn, label: 'LinkedIn', gradient: 'bg-[#0A66C2]' },
    { key: 'twitter', href: info?.socialLinks?.twitter, Icon: FaXTwitter, label: 'X (Twitter)', gradient: 'bg-neutral-900 dark:bg-neutral-700' },
  ].filter((s) => !!s.href);

  return (
    <main className="min-h-screen bg-[var(--surface-page)] transition-colors duration-300">

      {/* ═══════ HERO — dog photo with parallax ═══════ */}
      <div ref={heroRef} className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <img
            src="/images/dog-6.webp"
            alt="Friendly dog waiting to hear from you"
            className="h-full w-full object-cover"
          />
        </motion.div>

        <motion.div className="absolute inset-0 bg-[#1a1410]" style={{ opacity: overlayFade }} />

        {/* paw silhouettes */}
        {[
          { left: '10%', top: '25%', size: 'w-8 h-8', rot: '-15deg', op: '0.06' },
          { left: '85%', top: '20%', size: 'w-12 h-12', rot: '18deg', op: '0.05' },
          { left: '78%', top: '68%', size: 'w-7 h-7', rot: '-30deg', op: '0.07' },
        ].map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: Number(p.op), scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 + i * 0.25 }}
            className={`absolute ${p.size} text-white pointer-events-none`}
            style={{ left: p.left, top: p.top, transform: `rotate(${p.rot})` }}
          >
            <PawSvg className="w-full h-full" />
          </motion.div>
        ))}

        {/* stitch accents */}
        <div className="absolute top-8 left-6 md:top-12 md:left-12 opacity-30">
          <StitchLine className="text-white/50" />
        </div>

        {/* hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-4"
          >
            <PawSvg className="w-4 h-4 text-[#D4BC8E]" />
            <span className="text-[12px] font-semibold tracking-[0.25em] uppercase text-[#D4BC8E]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Get in Touch
            </span>
            <PawSvg className="w-4 h-4 text-[#D4BC8E] scale-x-[-1]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-white text-[30px] md:text-[46px] lg:text-[52px] tracking-[0.08em] leading-tight"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            Contact Us
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 h-px w-24 md:w-36 bg-[#D4BC8E] origin-center"
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-center text-white/75 text-[15px] md:text-[17px] max-w-md"
            style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
          >
            Have a question about our products? We&apos;re here to help and would love to hear from you.
          </motion.p>
        </div>

        {/* bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--surface-page)] to-transparent" />
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 xl:gap-14 items-start">

          {/* ═══════ CONTACT FORM ═══════ */}
          <FadeUp>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-3xl shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-8 md:p-10 border border-[var(--border-base)]/40 transition-colors duration-300 overflow-hidden"
            >
              <StitchCorner pos="tl" />
              <StitchCorner pos="tr" />
              <StitchCorner pos="bl" />
              <StitchCorner pos="br" />

              {/* paw watermark */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03]">
                <PawSvg className="w-32 h-32 text-[var(--text-primary)]" />
              </div>

              <div className="mb-8 relative">
                <div className="flex items-center gap-2 mb-2">
                  <PawSvg className="w-3.5 h-3.5 text-[#B8976A] dark:text-[#D4BC8E]" />
                  <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#B8976A] dark:text-[#D4BC8E]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    Send a Message
                  </span>
                </div>
                <h2 className="text-[26px] md:text-[30px] text-[var(--text-primary)] mb-2 transition-colors duration-300" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                  We&apos;d Love to Hear From You
                </h2>
                <p className="text-[var(--text-muted)] text-[15px] leading-relaxed transition-colors duration-300" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                  Fill in the form and our team will respond within 24 hours.
                </p>
              </div>

              {/* status message */}
              <AnimatePresence>
                {status !== 'idle' && msg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`mb-6 flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${
                      status === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                    }`}>
                      {status === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                      {msg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" required>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Jane Smith" className={inputCls} style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }} />
                  </Field>
                  <Field label="Email Address" required>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className={inputCls} style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }} />
                  </Field>
                </div>
                <Field label="Subject" required>
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} required placeholder="e.g. Question about Yak Milk Chews" className={inputCls} style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }} />
                </Field>
                <Field label="Message" required>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={6} placeholder="Tell us about your dog, your question, or anything else..." className={`${inputCls} resize-none`} style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }} />
                </Field>

                <motion.button
                  type="submit"
                  disabled={status === 'sending' || status === 'success'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-8 bg-gradient-to-r from-[#B8976A] to-[#9A7B52] hover:from-[#9A7B52] hover:to-[#7A5C4F] disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg shadow-[#B8976A]/20 hover:shadow-[#B8976A]/30 transition-all duration-300 disabled:cursor-not-allowed text-sm tracking-[0.1em] uppercase"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {status === 'sending' ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</>
                  ) : status === 'success' ? (
                    <><CheckCircle className="w-4 h-4" />Message Sent!</>
                  ) : (
                    <><Send className="w-4 h-4" />Send Message</>
                  )}
                </motion.button>

                <p className="text-center text-xs text-[var(--text-muted)]/60" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  By submitting you agree to our{' '}
                  <Link href="/about/terms" className="underline hover:text-[#B8976A] dark:hover:text-[#D4BC8E] transition-colors">
                    Terms & Conditions
                  </Link>
                </p>
              </form>
            </motion.div>
          </FadeUp>

          {/* ═══════ RIGHT SIDEBAR ═══════ */}
          <div className="space-y-4">
            {/* Contact info cards */}
            {info?.email && (
              <InfoCard Icon={Mail} label="Email Us" value={info.email}
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(info.email)}`}
                iconBg="bg-gradient-to-br from-[#B8976A] to-[#9A7B52]" index={0} />
            )}
            {phone && (
              <InfoCard Icon={Phone} label="WhatsApp Us" value={phone}
                href={toWhatsApp(phone)}
                iconBg="bg-gradient-to-br from-emerald-500 to-teal-500" index={1} />
            )}
            {info?.address && (
              <InfoCard Icon={MapPin} label="Our Location" value={info.address}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`}
                iconBg="bg-gradient-to-br from-blue-500 to-indigo-500" index={2} />
            )}
            <InfoCard Icon={Clock} label="Working Hours" value="Mon-Fri: 9am - 6pm (GMT)"
              iconBg="bg-gradient-to-br from-purple-500 to-violet-500" index={3} />

            {/* Social links */}
            {socialLinks.length > 0 && (
              <FadeUp delay={0.1}>
                <div className="relative bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 shadow-sm p-5 transition-colors duration-300 overflow-hidden">
                  <StitchCorner pos="tl" />
                  <StitchCorner pos="br" />

                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#B8976A] dark:text-[#D4BC8E] mb-4" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    Follow Us
                  </p>
                  <div className="space-y-2.5">
                    {socialLinks.map(({ key, href, Icon, label, gradient }, i) => (
                      <SocialLink key={key} href={href!} Icon={Icon} label={label} gradient={gradient} index={i} />
                    ))}
                  </div>
                </div>
              </FadeUp>
            )}

            {/* Response promise */}
            <FadeUp delay={0.15}>
              <div className="relative bg-[#B8976A]/5 dark:bg-[#D4BC8E]/5 border border-[#B8976A]/20 dark:border-[#D4BC8E]/15 rounded-2xl p-5 transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#B8976A] dark:bg-[#D4BC8E] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white dark:text-[#1a1410]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-[15px] mb-1 transition-colors duration-300" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                      We respond within 24 hours
                    </p>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed transition-colors duration-300" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                      Our team is dedicated to answering every enquiry about our natural Himalayan dog chews.
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* FAQ & Testimonials nudge */}
            <FadeUp delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <Link
                  href="/faq"
                  className="group flex items-center justify-between p-5 bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 shadow-sm hover:shadow-md hover:border-[#B8976A]/40 dark:hover:border-[#D4BC8E]/30 transition-all duration-300"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-[15px] mb-0.5 transition-colors duration-300" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                      Browse FAQs
                    </p>
                    <p className="text-sm text-[var(--text-muted)] transition-colors duration-300" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                      Find quick answers to common questions
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B8976A] dark:text-[#D4BC8E] group-hover:translate-x-1 transition-transform duration-200" />
                </Link>

                <Link
                  href="/testimonials"
                  className="group flex items-center justify-between p-5 bg-[var(--surface-card)] dark:bg-[#1f1812] rounded-2xl border border-[var(--border-base)]/40 shadow-sm hover:shadow-md hover:border-[#B8976A]/40 dark:hover:border-[#D4BC8E]/30 transition-all duration-300"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-[15px] mb-0.5 transition-colors duration-300" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                      Read Reviews
                    </p>
                    <p className="text-sm text-[var(--text-muted)] transition-colors duration-300" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                      See what other dog owners say
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B8976A] dark:text-[#D4BC8E] group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* ═══════ DOG PHOTO STRIP ═══════ */}
      <FadeUp className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {['/images/dog-2.webp', '/images/dog-16.webp', '/images/dog-27.webp'].map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
            >
              <img src={src} alt="Happy dog with Highland Yak Chew" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-25 transition-opacity duration-500">
                <PawSvg className="w-7 h-7 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </FadeUp>

      {/* ═══════ BONE DIVIDER ═══════ */}
      <FadeUp className="flex justify-center py-4">
        <BoneDivider className="text-[var(--border-base)] w-28 md:w-36" />
      </FadeUp>

      {/* ═══════ GOOGLE MAP ═══════ */}
      <FadeUp>
        <div className="relative">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--surface-page)] to-transparent z-10" />
          <div className="w-full h-[380px] md:h-[460px] overflow-hidden">
            <iframe
              src={mapEmbedSrc}
              className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Highland Yak Chew Location - ${contactAddress}`}
            />
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--surface-page)] to-transparent z-10" />
        </div>
      </FadeUp>

      {/* ═══════ GLOBAL STYLES ═══════ */}
      <style jsx global>{`
        @keyframes stitch-dash {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 22; }
        }
        .animate-stitch {
          animation: stitch-dash 1.8s linear infinite;
        }
        .animate-stitch-slow {
          animation: stitch-dash 3s linear infinite;
        }
      `}</style>
    </main>
  );
}
