'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle,
  AlertCircle, ChevronRight, Instagram, Facebook, MessageCircle,
} from 'lucide-react';
import { apiRequest } from '@/utils/apiService';

/* ── Types ─────────────────────────────────────────────────────────── */
interface ContactInfo {
  email?: string;
  phone?: string;
  phones?: string[];
  address?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

/* ── Helpers ───────────────────────────────────────────────────────── */
function toWhatsApp(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

/* ── Info card ─────────────────────────────────────────────────────── */
function InfoCard({
  Icon, label, value, href, iconBg,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
  iconBg: string;
}) {
  const inner = (
    <div className="flex items-start gap-4 p-5 bg-white dark:bg-[#1e1510] rounded-2xl border border-amber-100/60 dark:border-[#3a2c23] shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-500 mb-1">
          {label}
        </p>
        <p className="text-[#2f1e14] dark:text-[#f5e9dc] font-medium text-sm leading-relaxed group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          {value}
        </p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  );
}

/* ── Input ─────────────────────────────────────────────────────────── */
function Field({
  label, required, children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-[#5C4033] dark:text-[#c8b6a6] mb-2">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-3 bg-[#fdf8f2] dark:bg-[#241b16] border border-amber-200/80 dark:border-[#3a2c23] rounded-xl text-[#2f1e14] dark:text-[#f5e9dc] placeholder-[#7A5C4F]/40 dark:placeholder-[#c8b6a6]/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-600 transition-all duration-200';

/* ════════════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [info, setInfo] = useState<ContactInfo | null>(null);

  /* Fetch contact info from CMS */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/info`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setInfo(d.data); })
      .catch(() => {});
  }, []);

  const phone = info?.phone || info?.phones?.[0] || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setMsg('');
    try {
      const res = await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setStatus('success');
      setMsg(res?.message || "Thanks! We'll get back to you soon.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f5ef] dark:bg-[#150e09]">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f1e14] via-[#3d2512] to-[#1e1108] pt-32 pb-16 md:pb-20">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-orange-400/8 blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-amber-200/40 mb-6 uppercase tracking-widest">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-200/80">Contact</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-5">
            <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-xs font-bold tracking-widest uppercase">Get In Touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
            Contact Us
          </h1>
          <p className="text-amber-100/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Have a question about our products? We&apos;re here to help and would
            love to hear from you.
          </p>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-16 items-start">

          {/* ── Contact Form ─────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#1e1510] rounded-3xl shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-8 md:p-10 border border-amber-100/50 dark:border-[#3a2c23]">
            <div className="mb-8">
              <span className="inline-block text-xs font-black tracking-widest uppercase text-amber-600 dark:text-amber-500 mb-2">
                Send a Message
              </span>
              <h2 className="text-3xl font-bold text-[#2f1e14] dark:text-[#f5e9dc] mb-2">
                We&apos;d Love to Hear From You
              </h2>
              <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-sm leading-relaxed">
                Fill in the form and our team will respond within 24 hours.
              </p>
            </div>

            {/* Status banner */}
            {status !== 'idle' && msg && (
              <div className={`mb-6 flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${
                status === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}>
                {status === 'success'
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Jane Smith"
                    className={inputCls}
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Subject */}
              <Field label="Subject" required>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Question about Yak Milk Chews"
                  className={inputCls}
                />
              </Field>

              {/* Message */}
              <Field label="Message" required>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us about your dog, your question, or anything else…"
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 disabled:cursor-not-allowed text-sm tracking-wide"
              >
                {status === 'sending' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Message Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-center text-xs text-[#7A5C4F]/60 dark:text-[#c8b6a6]/40">
                By submitting you agree to our{' '}
                <Link href="/about/terms" className="underline hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </Link>
              </p>
            </form>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Info cards */}
            <div className="space-y-3">
              {info?.email && (
                <InfoCard
                  Icon={Mail}
                  label="Email Us"
                  value={info.email}
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(info.email)}`}
                  iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
                />
              )}
              {phone && (
                <InfoCard
                  Icon={Phone}
                  label="WhatsApp Us"
                  value={phone}
                  href={toWhatsApp(phone)}
                  iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
                />
              )}
              {info?.address && (
                <InfoCard
                  Icon={MapPin}
                  label="Our Location"
                  value={info.address}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`}
                  iconBg="bg-gradient-to-br from-blue-500 to-indigo-500"
                />
              )}
              <InfoCard
                Icon={Clock}
                label="Working Hours"
                value="Mon–Fri: 9am – 6pm (GMT)"
                iconBg="bg-gradient-to-br from-purple-500 to-violet-500"
              />
            </div>

            {/* Social links */}
            {(info?.socialLinks?.instagram || info?.socialLinks?.facebook) && (
              <div className="bg-white dark:bg-[#1e1510] rounded-2xl border border-amber-100/60 dark:border-[#3a2c23] shadow-sm p-5">
                <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-500 mb-4">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  {info.socialLinks?.instagram && (
                    <a
                      href={info.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                    </a>
                  )}
                  {info.socialLinks?.facebook && (
                    <a
                      href={info.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Response promise */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-sm mb-1">
                    We respond within 24 hours
                  </p>
                  <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] leading-relaxed">
                    Our team is dedicated to answering every enquiry about our
                    natural Himalayan dog chews.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ nudge */}
            <Link
              href="/testimonials"
              className="group flex items-center justify-between p-5 bg-white dark:bg-[#1e1510] rounded-2xl border border-amber-100/60 dark:border-[#3a2c23] shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300"
            >
              <div>
                <p className="font-bold text-[#2f1e14] dark:text-[#f5e9dc] text-sm mb-0.5">
                  Looking for FAQs?
                </p>
                <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6]">
                  Browse common questions & reviews
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Google Map ───────────────────────────────────────────────── */}
      <div className="relative">
        {/* Top fade overlay */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#f9f5ef] dark:from-[#150e09] to-transparent z-10" />
        <div className="w-full h-[420px] md:h-[500px] overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.682160402595!2d-0.4483869!3d51.5190469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48766d8b57bb686f%3A0x9dbdcf7df5a726a9!2sDickens%20Ave%2C%20Uxbridge%2C%20UK!5e0!3m2!1sen!2snp!4v1766241428979!5m2!1sen!2snp"
            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Highland Dog Chew Location"
          />
        </div>
        {/* Bottom fade overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f9f5ef] dark:from-[#150e09] to-transparent z-10" />
      </div>

    </main>
  );
}
