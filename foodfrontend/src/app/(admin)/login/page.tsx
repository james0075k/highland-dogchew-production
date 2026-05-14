'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

/* ─── Decorative SVGs ─────────────────────────────────────────────────────── */

const BoneSvg = ({ size = 36, opacity = 0.18 }: { size?: number; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ opacity }}>
    <path d="M13 22L22 13" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="8"  cy="27" r="4" stroke="#F59E0B" strokeWidth="2" />
    <circle cx="27" cy="8"  r="4" stroke="#F59E0B" strokeWidth="2" />
    <circle cx="27" cy="27" r="4" stroke="#F59E0B" strokeWidth="2" />
    <circle cx="8"  cy="8"  r="4" stroke="#F59E0B" strokeWidth="2" />
  </svg>
);

const PawSvg = ({ size = 28, opacity = 0.15 }: { size?: number; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="#F59E0B" style={{ opacity }}>
    <ellipse cx="14" cy="18" rx="5" ry="6" />
    <ellipse cx="7"  cy="15" rx="2.5" ry="3" />
    <ellipse cx="21" cy="15" rx="2.5" ry="3" />
    <ellipse cx="10" cy="9"  rx="2.2" ry="2.8" />
    <ellipse cx="18" cy="9"  rx="2.2" ry="2.8" />
  </svg>
);

/* Highland mountains SVG illustration */
const MountainScene = () => (
  <svg viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
    {/* Moon glow */}
    <circle cx="480" cy="60" r="28" fill="url(#moonGrad)" />
    <circle cx="480" cy="60" r="38" fill="rgba(251,191,36,0.08)" />
    <circle cx="480" cy="60" r="52" fill="rgba(251,191,36,0.04)" />
    {/* Far mountains */}
    <path d="M0 220 L80 120 L140 170 L200 90 L270 160 L330 100 L400 180 L460 110 L520 155 L600 80 L600 300 L0 300Z"
      fill="url(#farMtnGrad)" opacity="0.45" />
    {/* Mid mountains */}
    <path d="M0 260 L60 190 L110 230 L180 150 L240 200 L310 140 L370 195 L430 145 L500 190 L560 155 L600 190 L600 300 L0 300Z"
      fill="url(#midMtnGrad)" opacity="0.65" />
    {/* Foreground */}
    <path d="M0 280 L40 260 L90 270 L150 240 L220 265 L280 250 L350 268 L420 248 L500 265 L600 255 L600 300 L0 300Z"
      fill="url(#fgGrad)" />
    {/* Pine trees left */}
    {[0,20,45,68,88].map((x, i) => (
      <g key={i} transform={`translate(${x}, ${255 - i * 4})`}>
        <polygon points="10,0 20,30 0,30" fill="#0a1628" opacity="0.9" />
        <polygon points="10,15 22,40 -2,40" fill="#0a1628" opacity="0.9" />
      </g>
    ))}
    {/* Pine trees right */}
    {[490,515,540,560,580].map((x, i) => (
      <g key={i} transform={`translate(${x}, ${258 - i * 3})`}>
        <polygon points="10,0 20,28 0,28" fill="#0a1628" opacity="0.9" />
        <polygon points="10,12 22,38 -2,38" fill="#0a1628" opacity="0.9" />
      </g>
    ))}
    {/* Mountain outline glow lines */}
    <path d="M180 150 L240 200 L310 140 L370 195 L430 145"
      stroke="rgba(245,158,11,0.2)" strokeWidth="1" fill="none" />
    {/* Defs */}
    <defs>
      <radialGradient id="moonGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="60%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </radialGradient>
      <linearGradient id="farMtnGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#0f1e35" />
      </linearGradient>
      <linearGradient id="midMtnGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#152b47" />
        <stop offset="100%" stopColor="#0a1628" />
      </linearGradient>
      <linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a1628" />
        <stop offset="100%" stopColor="#060b14" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function AdminLoginPage() {
  const router   = useRouter();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }), credentials: 'include' }
      );
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      if (data.data?.accessToken) {
        Cookies.set('token', data.data.accessToken, { expires: 1, path: '/' });
        localStorage.setItem('adminToken', data.data.accessToken);
      }
      if (data.data?.refreshToken) {
        Cookies.set('refreshToken', data.data.refreshToken, { expires: 7, path: '/' });
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Stars data (stable across renders) ─────────────────────────────────── */
  const stars = [
    { x: 8,  y: 6,  d: '2.1s', delay: '0s',    size: 2 },
    { x: 22, y: 12, d: '3.4s', delay: '0.5s',  size: 1.5 },
    { x: 35, y: 4,  d: '2.8s', delay: '1s',    size: 2 },
    { x: 48, y: 9,  d: '1.9s', delay: '0.2s',  size: 1 },
    { x: 55, y: 3,  d: '3.1s', delay: '1.5s',  size: 1.5 },
    { x: 62, y: 15, d: '2.5s', delay: '0.8s',  size: 1 },
    { x: 72, y: 5,  d: '3.7s', delay: '0.3s',  size: 2 },
    { x: 82, y: 11, d: '2.2s', delay: '1.2s',  size: 1 },
    { x: 90, y: 7,  d: '2.9s', delay: '0.6s',  size: 1.5 },
    { x: 15, y: 20, d: '3.3s', delay: '1.8s',  size: 1 },
    { x: 30, y: 18, d: '2.6s', delay: '0.4s',  size: 1.5 },
    { x: 45, y: 22, d: '1.8s', delay: '2s',    size: 1 },
    { x: 68, y: 25, d: '3s',   delay: '0.7s',  size: 2 },
    { x: 78, y: 18, d: '2.4s', delay: '1.4s',  size: 1 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .hdc-root { font-family: 'DM Sans', sans-serif; }
        .hdc-serif { font-family: 'Playfair Display', serif; }

        /* ── Floating animations ── */
        @keyframes hdc-float-a {
          0%,100% { transform: translateY(0)   rotate(0deg);  }
          50%     { transform: translateY(-18px) rotate(12deg); }
        }
        @keyframes hdc-float-b {
          0%,100% { transform: translateY(0)   rotate(0deg);  }
          50%     { transform: translateY(-22px) rotate(-10deg); }
        }
        @keyframes hdc-float-c {
          0%,100% { transform: translateY(0)   rotate(5deg);  }
          50%     { transform: translateY(-14px) rotate(-6deg); }
        }
        @keyframes hdc-float-d {
          0%,100% { transform: translateY(0)   rotate(-5deg); }
          50%     { transform: translateY(-20px) rotate(8deg);  }
        }
        @keyframes hdc-float-e {
          0%,100% { transform: translateY(0)   rotate(3deg);  }
          50%     { transform: translateY(-16px) rotate(-4deg); }
        }
        .hdc-fa { animation: hdc-float-a 7s   ease-in-out infinite; }
        .hdc-fb { animation: hdc-float-b 9s   ease-in-out infinite 1.2s; }
        .hdc-fc { animation: hdc-float-c 6.5s ease-in-out infinite 2.5s; }
        .hdc-fd { animation: hdc-float-d 8s   ease-in-out infinite 0.8s; }
        .hdc-fe { animation: hdc-float-e 10s  ease-in-out infinite 3.5s; }

        /* ── Star twinkle ── */
        @keyframes hdc-twinkle {
          0%,100% { opacity: 0.25; transform: scale(1); }
          50%     { opacity: 1;    transform: scale(1.6); }
        }
        .hdc-star { animation: hdc-twinkle var(--tw-dur) ease-in-out infinite var(--tw-del); }

        /* ── Panel entrance ── */
        @keyframes hdc-slide-left {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hdc-slide-right {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hdc-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hdc-panel-l { animation: hdc-slide-left  0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .hdc-panel-r { animation: hdc-slide-right 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both; }

        .hdc-f1 { animation: hdc-fade-up 0.7s ease both 0.35s; }
        .hdc-f2 { animation: hdc-fade-up 0.7s ease both 0.45s; }
        .hdc-f3 { animation: hdc-fade-up 0.7s ease both 0.55s; }
        .hdc-f4 { animation: hdc-fade-up 0.7s ease both 0.65s; }
        .hdc-f5 { animation: hdc-fade-up 0.7s ease both 0.72s; }
        .hdc-f6 { animation: hdc-fade-up 0.7s ease both 0.80s; }

        /* ── Logo pulse ── */
        @keyframes hdc-logo-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0),   0 0 30px rgba(245,158,11,0.25); }
          50%     { box-shadow: 0 0 0 10px rgba(245,158,11,0), 0 0 50px rgba(245,158,11,0.45); }
        }
        .hdc-logo-ring { animation: hdc-logo-glow 3.5s ease-in-out infinite; }

        /* ── Shimmer text ── */
        @keyframes hdc-shimmer {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
        .hdc-shimmer {
          background: linear-gradient(90deg, #F59E0B 0%, #FDE68A 30%, #FBBF24 50%, #F59E0B 70%, #EA580C 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hdc-shimmer 4s linear infinite;
        }

        /* ── Divider line ── */
        @keyframes hdc-line-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .hdc-line { animation: hdc-line-grow 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both; transform-origin: left; }

        /* ── Button ── */
        @keyframes hdc-btn-shimmer {
          0%   { left: -100%; }
          100% { left:  200%; }
        }
        .hdc-btn {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #F59E0B 0%, #EA580C 100%);
          border: none; border-radius: 14px;
          padding: 15px 20px;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 15px; letter-spacing: 0.01em;
          cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hdc-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: hdc-btn-shimmer 2.5s ease-in-out infinite;
        }
        .hdc-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(234,88,12,0.45), 0 4px 16px rgba(245,158,11,0.3);
        }
        .hdc-btn:active:not(:disabled) { transform: translateY(0); }
        .hdc-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Input ── */
        .hdc-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px 13px 46px;
          color: #FAF9F6;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .hdc-input::placeholder { color: rgba(255,255,255,0.22); }
        .hdc-input:focus {
          background: rgba(245,158,11,0.06);
          border-color: rgba(245,158,11,0.55);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
        }
        .hdc-input:hover:not(:focus) { border-color: rgba(255,255,255,0.22); }

        /* ── Orbit ring ── */
        @keyframes hdc-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hdc-orbit {
          animation: hdc-orbit 20s linear infinite;
          transform-origin: center;
        }
        .hdc-orbit-rev {
          animation: hdc-orbit 14s linear infinite reverse;
          transform-origin: center;
        }

        /* ── Ambient blobs ── */
        @keyframes hdc-blob {
          0%,100% { transform: scale(1)   translate(0, 0); }
          33%     { transform: scale(1.1) translate(20px, -15px); }
          66%     { transform: scale(0.9) translate(-15px, 20px); }
        }
        .hdc-blob { animation: hdc-blob var(--blob-dur, 12s) ease-in-out infinite; }

        /* ── Error shake ── */
        @keyframes hdc-shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }
        .hdc-shake { animation: hdc-shake 0.4s ease; }

        /* ── Badge dot pulse ── */
        @keyframes hdc-dot-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.5; transform: scale(0.7); }
        }
        .hdc-dot { animation: hdc-dot-pulse 2s ease-in-out infinite; }

        /* ── Mountain draw ── */
        @keyframes hdc-draw {
          from { stroke-dashoffset: 1200; }
          to   { stroke-dashoffset: 0; }
        }
        .hdc-draw { stroke-dasharray: 1200; animation: hdc-draw 3.5s ease forwards 0.5s; }

        /* ── Scroll indicator ── */
        @keyframes hdc-scroll-dot {
          0%   { transform: translateY(0); opacity: 1; }
          80%  { transform: translateY(12px); opacity: 0.2; }
          100% { transform: translateY(0); opacity: 0; }
        }
        .hdc-scroll-dot { animation: hdc-scroll-dot 1.8s ease-in-out infinite; }
      `}</style>

      <div
        className="hdc-root"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #060b14 0%, #09101f 45%, #0b1425 75%, #060b14 100%)',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Ambient background blobs ──────────────────────────────────── */}
        <div className="hdc-blob" style={{ '--blob-dur': '15s' } as React.CSSProperties} aria-hidden>
          <div style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>
        <div className="hdc-blob" style={{ '--blob-dur': '18s', animationDelay: '-6s' } as React.CSSProperties} aria-hidden>
          <div style={{
            position: 'absolute', bottom: '-20%', right: '30%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234,88,12,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>
        <div className="hdc-blob" style={{ '--blob-dur': '20s', animationDelay: '-10s' } as React.CSSProperties} aria-hidden>
          <div style={{
            position: 'absolute', top: '30%', right: '-8%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* ════════════════════════════════════════════════════════════════
            LEFT BRAND PANEL  (hidden on mobile)
        ════════════════════════════════════════════════════════════════ */}
        <div
          className="hdc-panel-l"
          style={{
            flex: '0 0 52%',
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 56px',
            position: 'relative',
            overflow: 'hidden',
            borderRight: '1px solid rgba(245,158,11,0.08)',
          }}
          data-left-panel
        >
          {/* ── Starfield ── */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {stars.map((s, i) => (
              <div
                key={i}
                className="hdc-star"
                style={{
                  '--tw-dur': s.d,
                  '--tw-del': s.delay,
                  position: 'absolute',
                  left:  `${s.x}%`,
                  top:   `${s.y}%`,
                  width:  s.size,
                  height: s.size,
                  borderRadius: '50%',
                  background: '#FDE68A',
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* ── Floating bones + paws ── */}
          <div aria-hidden className="hdc-fa" style={{ position: 'absolute', top: '10%',  left: '6%'  }}><BoneSvg size={42} opacity={0.22} /></div>
          <div aria-hidden className="hdc-fb" style={{ position: 'absolute', top: '20%',  right: '8%' }}><PawSvg  size={34} opacity={0.18} /></div>
          <div aria-hidden className="hdc-fc" style={{ position: 'absolute', top: '55%',  left: '4%'  }}><PawSvg  size={28} opacity={0.15} /></div>
          <div aria-hidden className="hdc-fd" style={{ position: 'absolute', top: '65%',  right: '5%' }}><BoneSvg size={36} opacity={0.20} /></div>
          <div aria-hidden className="hdc-fe" style={{ position: 'absolute', bottom: '22%', left: '50%' }}><PawSvg  size={22} opacity={0.12} /></div>
          <div aria-hidden className="hdc-fa" style={{ position: 'absolute', top: '38%',  right: '12%', animationDelay: '3s' }}><BoneSvg size={26} opacity={0.14} /></div>

          {/* ── Top: Logo + site name ── */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
                flexShrink: 0,
              }}>
                <Image
                  src="/images/logo11.png"
                  alt="Highland Yak Chew"
                  width={36}
                  height={36}
                  style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="hdc-serif" style={{ color: '#FAF9F6', fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>
                  Highland Yak Chew
                </div>
                <div style={{ color: 'rgba(245,158,11,0.7)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                  Admin Portal
                </div>
              </div>
            </div>
          </div>

          {/* ── Centre: Mountain scene + brand copy ── */}
          <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
            {/* Amber rule */}
            <div className="hdc-line" style={{
              height: 2,
              background: 'linear-gradient(90deg, #F59E0B, #EA580C, transparent)',
              borderRadius: 99,
            }} />

            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 99, padding: '5px 14px',
                marginBottom: 20,
              }}>
                <div className="hdc-dot" style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#F59E0B',
                }} />
                <span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Est. in the Scottish Highlands
                </span>
              </div>

              <h1 className="hdc-serif" style={{
                fontSize: 'clamp(32px, 3.5vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.18,
                color: '#FAF9F6',
                marginBottom: 16,
              }}>
                Fuel Their <br />
                <em className="hdc-shimmer" style={{ fontStyle: 'italic' }}>
                  Highland Adventure
                </em>
              </h1>

              <p style={{
                color: 'rgba(250,249,246,0.5)',
                fontSize: 15,
                lineHeight: 1.7,
                maxWidth: 360,
              }}>
                Premium natural yak milk chews, hand-crafted in the highlands.
                Manage your store, track orders, and keep tails wagging.
              </p>
            </div>

            {/* Mountain illustration */}
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(245,158,11,0.1)',
              background: 'linear-gradient(180deg, #060f22 0%, #060b14 100%)',
            }}>
              <MountainScene />
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32 }}>
              {[
                { value: '100%', label: 'Natural Ingredients' },
                { value: '4.9★',  label: 'Average Rating' },
                { value: '24/7',  label: 'Order Management' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="hdc-serif" style={{ color: '#F59E0B', fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2, letterSpacing: '0.04em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom tagline ── */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: 'rgba(255,255,255,0.2)', fontSize: 12,
            }}>
              <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.15)' }} />
              <span style={{ letterSpacing: '0.08em' }}>
                &copy; {new Date().getFullYear()} Highland Yak Chew Ltd. All rights reserved.
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT FORM PANEL
        ════════════════════════════════════════════════════════════════ */}
        <div
          className="hdc-panel-r"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 64px)',
            position: 'relative',
            overflowY: 'auto',
          }}
        >
          {/* Mobile-only floating elements */}
          <div aria-hidden className="hdc-fa" style={{ position: 'absolute', top: '8%', right: '8%', pointerEvents: 'none' }}>
            <BoneSvg size={32} opacity={0.12} />
          </div>
          <div aria-hidden className="hdc-fb" style={{ position: 'absolute', bottom: '12%', left: '6%', pointerEvents: 'none' }}>
            <PawSvg size={24} opacity={0.10} />
          </div>

          <div style={{ width: '100%', maxWidth: 420 }}>

            {/* ── Logo badge ── */}
            <div className="hdc-f1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
              {/* Orbit rings */}
              <div style={{ position: 'relative', width: 110, height: 110, marginBottom: 20 }}>
                {/* Outer orbit */}
                <div className="hdc-orbit" style={{
                  position: 'absolute', inset: -8,
                  borderRadius: '50%',
                  border: '1px solid rgba(245,158,11,0.15)',
                  borderTopColor: 'rgba(245,158,11,0.5)',
                }} />
                {/* Inner orbit */}
                <div className="hdc-orbit-rev" style={{
                  position: 'absolute', inset: 2,
                  borderRadius: '50%',
                  border: '1px dashed rgba(245,158,11,0.12)',
                  borderRightColor: 'rgba(245,158,11,0.35)',
                }} />
                {/* Logo badge */}
                <div
                  className="hdc-logo-ring"
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {/* Inner dark ring */}
                  <div style={{
                    position: 'absolute', inset: 4,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d1830 0%, #060b14 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Image
                      src="/images/logo11.png"
                      alt="Highland Yak Chew"
                      width={50}
                      height={50}
                      style={{ objectFit: 'contain' }}
                      onError={(e) => {
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          (e.target as HTMLImageElement).style.display = 'none';
                          parent.innerHTML = `<span style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;background:linear-gradient(135deg,#F59E0B,#EA580C);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">HYC</span>`;
                        }
                      }}
                    />
                  </div>
                </div>
                {/* Orbit dot */}
                <div className="hdc-orbit" style={{
                  position: 'absolute', inset: -8,
                  borderRadius: '50%',
                }}>
                  <div style={{
                    position: 'absolute', top: 6, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#F59E0B',
                    boxShadow: '0 0 8px rgba(245,158,11,0.8)',
                  }} />
                </div>
              </div>

              <h1 className="hdc-serif" style={{
                fontSize: 26, fontWeight: 700,
                color: '#FAF9F6',
                textAlign: 'center',
                letterSpacing: '-0.01em',
              }}>
                Highland Yak Chew
              </h1>
              <p style={{
                color: 'rgba(245,158,11,0.7)', fontSize: 12,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                marginTop: 5, textAlign: 'center',
              }}>
                Admin Dashboard
              </p>
            </div>

            {/* ── Login card ── */}
            <div
              className="hdc-f2"
              style={{
                background: 'rgba(8,14,28,0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(245,158,11,0.14)',
                borderRadius: 24,
                padding: 'clamp(28px, 5vw, 40px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Card header */}
              <div className="hdc-f3" style={{ marginBottom: 28 }}>
                <h2 className="hdc-serif" style={{
                  color: '#FAF9F6', fontSize: 22, fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}>
                  Welcome back
                </h2>
                <p style={{ color: 'rgba(250,249,246,0.4)', fontSize: 13, marginTop: 5 }}>
                  Sign in to manage your store
                </p>
              </div>

              <form onSubmit={handleSubmit} autoComplete="on" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Email field */}
                <div className="hdc-f4">
                  <label
                    htmlFor="hdc-email"
                    style={{ display: 'block', color: 'rgba(250,249,246,0.6)', fontSize: 13, fontWeight: 500, marginBottom: 8 }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiMail
                      size={15}
                      style={{
                        position: 'absolute', left: 16, top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(245,158,11,0.5)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="hdc-email"
                      className="hdc-input"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@highlanddogchew.co.uk"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="hdc-f4" style={{ animationDelay: '0.62s' }}>
                  <label
                    htmlFor="hdc-password"
                    style={{ display: 'block', color: 'rgba(250,249,246,0.6)', fontSize: 13, fontWeight: 500, marginBottom: 8 }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FiLock
                      size={15}
                      style={{
                        position: 'absolute', left: 16, top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(245,158,11,0.5)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="hdc-password"
                      className="hdc-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                      style={{ paddingRight: 48 }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 14, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.3)',
                        cursor: 'pointer', padding: 4,
                        display: 'flex', alignItems: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,158,11,0.7)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="hdc-f5" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
                  <Link
                    href="/forgot-password"
                    style={{
                      color: 'rgba(245,158,11,0.65)', fontSize: 13,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F59E0B')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,158,11,0.65)')}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Error message */}
                {error && (
                  <div
                    className="hdc-shake"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 12,
                      color: '#FCA5A5',
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)', margin: '2px 0' }} />

                {/* Sign in button */}
                <div className="hdc-f6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="hdc-btn"
                  >
                    {loading ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <FiArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="hdc-f6" style={{
              textAlign: 'center', marginTop: 28,
              color: 'rgba(255,255,255,0.18)', fontSize: 12,
            }}>
              &copy; {new Date().getFullYear()} Highland Yak Chew Ltd.
              {' · '}
              <span style={{ color: 'rgba(245,158,11,0.35)' }}>Premium Natural Pet Treats</span>
            </div>
          </div>
        </div>

        {/* ── CSS for left panel responsive show ── */}
        <style>{`
          @media (min-width: 900px) {
            [data-left-panel] { display: flex !important; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
