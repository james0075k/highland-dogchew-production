'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  FiPackage, FiStar, FiMail, FiLayers, FiGrid,
  FiArrowRight, FiAlertCircle, FiRefreshCw, FiShoppingBag,
  FiTrendingUp, FiTrendingDown, FiUsers, FiMessageCircle, FiAward,
  FiCreditCard, FiRepeat, FiCheckCircle, FiClock, FiXCircle, FiDollarSign,
} from 'react-icons/fi';
import { GiDogBowl } from 'react-icons/gi';

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return count;
}

function useLiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function getGreeting(h: number) {
  if (h >= 5  && h < 12) return { text: 'Good Morning',   emoji: '🌅' };
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  if (h >= 17 && h < 21) return { text: 'Good Evening',   emoji: '🌆' };
  return { text: 'Good Night', emoji: '🌙' };
}

/* ─── SVG: Smooth area line chart ────────────────────────────────────────── */

function SmoothLineChart({ data }: {
  data: { month: string; contacts: number; reviews: number }[];
}) {
  const W = 540, H = 180;
  const PAD = { top: 16, right: 16, bottom: 28, left: 32 };
  const w = W - PAD.left - PAD.right;
  const h = H - PAD.top  - PAD.bottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.contacts, d.reviews)), 1);
  const toX = (i: number) => (data.length < 2 ? w / 2 : (i / (data.length - 1)) * w);
  const toY = (v: number) => h - (v / maxVal) * h;

  function smoothPath(vals: number[]) {
    const pts = vals.map((v, i) => ({ x: toX(i), y: toY(v) }));
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cx} ${pts[i - 1].y} ${cx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  }

  function areaPath(vals: number[]) {
    const line = smoothPath(vals);
    if (!line) return '';
    return `${line} L ${toX(vals.length - 1)} ${h} L ${toX(0)} ${h} Z`;
  }

  const cPath  = smoothPath(data.map(d => d.contacts));
  const cArea  = areaPath(data.map(d => d.contacts));
  const rPath  = smoothPath(data.map(d => d.reviews));
  const rArea  = areaPath(data.map(d => d.reviews));
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(p => ({ y: h - p * h, v: Math.round(p * maxVal) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="lc-amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="lc-indigo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#818CF8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={0} y1={g.y} x2={w} y2={g.y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={-6} y={g.y + 4} textAnchor="end" fill="#94a3b8" fontSize={9} fontFamily="DM Sans,sans-serif">{g.v}</text>
          </g>
        ))}
        {rArea  && <path d={rArea}  fill="url(#lc-indigo)" />}
        {cArea  && <path d={cArea}  fill="url(#lc-amber)" />}
        {rPath  && <path d={rPath}  fill="none" stroke="#818CF8" strokeWidth={2}   strokeLinecap="round" />}
        {cPath  && <path d={cPath}  fill="none" stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" />}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(d.contacts)} r={3.5} fill="#F59E0B" stroke="#fff" strokeWidth={1.5} />
            <circle cx={toX(i)} cy={toY(d.reviews)}  r={3}   fill="#818CF8" stroke="#fff" strokeWidth={1.5} />
            <text x={toX(i)} y={h + 18} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="DM Sans,sans-serif">{d.month}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ─── SVG: Donut chart ───────────────────────────────────────────────────── */

function DonutChart({ yak, puff, highland }: { yak: number; puff: number; highland: number }) {
  const total = yak + puff + highland;
  const r = 44, cx = 60, cy = 60, sw = 16;
  const C = 2 * Math.PI * r;
  const segments = [
    { label: 'Yak Milk',    count: yak,      color: '#F59E0B' },
    { label: 'Puff Treats', count: puff,     color: '#A78BFA' },
    { label: 'Highland Mix', count: highland, color: '#2DD4BF' },
  ];
  let cum = 0;
  const slices = segments.map(s => {
    const pct = total > 0 ? s.count / total : 0;
    const start = cum;
    cum += pct;
    return { ...s, pct, dash: pct * C, gap: C - pct * C, offset: -start * C };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg viewBox="0 0 120 120" style={{ width: 110, height: 110, flexShrink: 0 }}>
        {total === 0
          ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
          : slices.map((s, i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.color} strokeWidth={sw}
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={s.offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 1s ease' }} />
            ))
        }
        <text x={cx} y={cy - 7} textAnchor="middle" fill="#111827"
          fontSize={20} fontWeight="700" fontFamily="DM Sans,sans-serif">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af"
          fontSize={8} fontFamily="DM Sans,sans-serif">TOTAL</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12, color: '#374151', fontFamily: 'DM Sans,sans-serif' }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', fontFamily: 'DM Sans,sans-serif', minWidth: 18, textAlign: 'right' }}>{s.count}</span>
            <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'DM Sans,sans-serif', minWidth: 28, textAlign: 'right' }}>
              {total > 0 ? Math.round(s.count / total * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SVG: Mini sparkline ────────────────────────────────────────────────── */

function MiniSparkline({ vals, color }: { vals: number[]; color: string }) {
  const W = 64, H = 24;
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * W,
    y: H - (v / max) * H,
  }));
  let d = pts.length > 0 ? `M ${pts[0].x} ${pts[0].y}` : '';
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cx} ${pts[i - 1].y} ${cx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
      {d && <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />}
      {pts.length > 0 && (
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color} />
      )}
    </svg>
  );
}

/* ─── Money formatting ──────────────────────────────────────────────────── */

const gbpFull = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const gbpCompact = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', notation: 'compact', maximumFractionDigits: 1 });

function formatMoney(v: number, compact = false): string {
  if (!Number.isFinite(v)) return '£0.00';
  return compact && Math.abs(v) >= 10000 ? gbpCompact.format(v) : gbpFull.format(v);
}

/* ─── SVG: Revenue bar chart ─────────────────────────────────────────────── */

function RevenueBarChart({ buckets, color = '#16a34a' }: {
  buckets: { label: string; value: number }[];
  color?: string;
}) {
  const W = 720, H = 200;
  const PAD = { top: 18, right: 14, bottom: 32, left: 56 };
  const w = W - PAD.left - PAD.right;
  const h = H - PAD.top - PAD.bottom;
  const max = Math.max(...buckets.map(b => b.value), 1);
  const n = Math.max(buckets.length, 1);
  const slot = w / n;
  const barW = Math.max(4, Math.min(slot * 0.6, 26));
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(p => ({ y: h - p * h, v: p * max }));
  // Show ≤ 8 x-axis labels evenly to avoid crowding
  const labelEvery = Math.max(1, Math.ceil(n / 8));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="rev-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={0} y1={g.y} x2={w} y2={g.y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={-8} y={g.y + 4} textAnchor="end" fill="#94a3b8" fontSize={9} fontFamily="DM Sans,sans-serif">
              {formatMoney(g.v, true)}
            </text>
          </g>
        ))}
        {buckets.map((b, i) => {
          const cx = i * slot + slot / 2;
          const barH = (b.value / max) * h;
          const y = h - barH;
          return (
            <g key={i}>
              <rect
                x={cx - barW / 2}
                y={y}
                width={barW}
                height={Math.max(barH, 1)}
                rx={3}
                fill={b.value > 0 ? 'url(#rev-bar)' : '#e5e7eb'}
              >
                <title>{b.label}: {formatMoney(b.value)}</title>
              </rect>
              {i % labelEvery === 0 && (
                <text x={cx} y={h + 18} textAnchor="middle" fill="#94a3b8" fontSize={9} fontFamily="DM Sans,sans-serif">
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ─── Stars ──────────────────────────────────────────────────────────────── */

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width={11} height={11} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={s <= rating ? '#f59e0b' : '#e5e7eb'} />
        </svg>
      ))}
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, accentColor, iconBg, iconColor, sparkVals, sparkColor, sub }: {
  icon: React.ElementType; label: string; value: number;
  accentColor: string; iconBg: string; iconColor: string;
  sparkVals?: number[]; sparkColor?: string; sub?: string;
}) {
  const animated = useCountUp(value);
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #f1f5f9',
      padding: '18px 18px 14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'DM Sans,sans-serif' }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: 'DM Sans,sans-serif', fontVariantNumeric: 'tabular-nums' }}>{animated}</p>
          {sub && <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontFamily: 'DM Sans,sans-serif' }}>{sub}</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ padding: '8px', borderRadius: 10, background: iconBg }}>
            <Icon style={{ color: iconColor }} size={18} />
          </div>
          {sparkVals && sparkColor && <MiniSparkline vals={sparkVals} color={sparkColor} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Breakdown bar ──────────────────────────────────────────────────────── */

function BreakdownBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', fontFamily: 'DM Sans,sans-serif' }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'DM Sans,sans-serif' }}>{count}</span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans,sans-serif', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface DashboardStats {
  totalProducts: number; yakMilkCount: number; puffTreatCount: number;
  highlandMixCount: number; totalReviews: number; totalContacts: number;
  newContacts: number; pendingReviews: number;
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, yakMilkCount: 0, puffTreatCount: 0,
    highlandMixCount: 0, totalReviews: 0, totalContacts: 0,
    newContacts: 0, pendingReviews: 0,
  });
  const [orderStats, setOrderStats]   = useState<any>(null);
  const [subStats,   setSubStats]     = useState<any>(null);
  const [loading,    setLoading]      = useState(true);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [recentReviews,  setRecentReviews]  = useState<any[]>([]);
  const [allProducts,  setAllProducts]  = useState<any[]>([]);
  const [allContacts,  setAllContacts]  = useState<any[]>([]);
  const [allReviews,   setAllReviews]   = useState<any[]>([]);
  const [allOrders,    setAllOrders]    = useState<any[]>([]);
  const [activeTab,    setActiveTab]    = useState<'messages' | 'reviews'>('messages');
  const [revPeriod,    setRevPeriod]    = useState<'7d' | '30d' | '90d' | 'ytd' | '12m' | 'all'>('30d');
  const now = useLiveClock();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || '') : '';
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, reviewsRes, contactsRes, ordersRes, subsRes, ordersListRes] = await Promise.allSettled([
        fetch(`${API}/products`).then(r => r.json()),
        fetch(`${API}/reviews`).then(r => r.json()),
        fetch(`${API}/contact`).then(r => r.json()),
        fetch(`${API}/admin/orders/stats`,        { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API}/admin/subscriptions/stats`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API}/admin/orders?limit=1000`,   { headers: authHeaders() }).then(r => r.json()),
      ]);

      let totalProducts = 0, yakMilkCount = 0, puffTreatCount = 0, highlandMixCount = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        const p = Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
        totalProducts = p.length;
        yakMilkCount    = p.filter((x: any) => x.productType === 'yak-milk').length;
        puffTreatCount  = p.filter((x: any) => x.productType === 'puff-treat').length;
        highlandMixCount = p.filter((x: any) => x.productType === 'highland-mix').length;
        setAllProducts(p);
      }

      let totalReviews = 0, pendingReviews = 0;
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data) {
        const r = Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : [];
        totalReviews   = r.length;
        pendingReviews = r.filter((x: any) => x.status === 'pending').length;
        setRecentReviews(r.slice(0, 8));
        setAllReviews(r);
      }

      let totalContacts = 0, newContacts = 0;
      if (contactsRes.status === 'fulfilled' && contactsRes.value?.data) {
        const c = Array.isArray(contactsRes.value.data)
          ? contactsRes.value.data : (contactsRes.value.data?.items || []);
        totalContacts = c.length;
        newContacts   = c.filter((x: any) => x.status === 'new').length;
        setRecentContacts(c.slice(0, 8));
        setAllContacts(c);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) setOrderStats(ordersRes.value.data);
      if (subsRes.status   === 'fulfilled' && subsRes.value?.data)   setSubStats(subsRes.value.data);
      if (ordersListRes.status === 'fulfilled' && ordersListRes.value?.data) {
        const list = ordersListRes.value.data.orders ?? ordersListRes.value.data ?? [];
        setAllOrders(Array.isArray(list) ? list : []);
      }

      setStats({ totalProducts, yakMilkCount, puffTreatCount, highlandMixCount, totalReviews, totalContacts, newContacts, pendingReviews });
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Derived data ── */
  const monthlyData = useMemo(() => {
    const result: { month: string; contacts: number; reviews: number }[] = [];
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d  = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const yr = d.getFullYear(), mo = d.getMonth();
      const label = d.toLocaleDateString('en-GB', { month: 'short' });
      const contacts = allContacts.filter(c => { const dt = new Date(c.createdAt); return dt.getFullYear() === yr && dt.getMonth() === mo; }).length;
      const reviews  = allReviews.filter(r  => { const dt = new Date(r.createdAt || r.date); return dt.getFullYear() === yr && dt.getMonth() === mo; }).length;
      result.push({ month: label, contacts, reviews });
    }
    return result;
  }, [allContacts, allReviews]);

  const topProducts = useMemo(() =>
    [...allProducts].sort((a, b) => (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1))).slice(0, 5),
    [allProducts]);

  const engagementMetrics = useMemo(() => {
    const replyRate   = allContacts.length > 0 ? Math.round((allContacts.filter(c => c.status === 'replied').length / allContacts.length) * 100) : 0;
    const avgRating   = allReviews.length > 0 ? (allReviews.reduce((s, r) => s + (r.rating || 0), 0) / allReviews.length).toFixed(1) : '—';
    const approvalRate = allReviews.length > 0 ? Math.round((allReviews.filter(r => r.status === 'approved').length / allReviews.length) * 100) : 0;
    return { replyRate, avgRating, approvalRate };
  }, [allContacts, allReviews]);

  const stockStats = useMemo(() => {
    const LOW = 10;
    let totalStock = 0, lowStock = 0, outOfStock = 0;
    for (const p of allProducts) {
      const eff = p.sizes?.length > 0
        ? p.sizes.reduce((s: number, sz: any) => s + (sz.stockQuantity ?? 0), 0)
        : (p.stockQuantity ?? 0);
      totalStock += eff;
      if (!p.trackStock) continue;
      if (eff === 0) outOfStock++;
      else if (eff < LOW) lowStock++;
    }
    return { totalStock, lowStock, outOfStock };
  }, [allProducts]);

  const contactSparkline = monthlyData.map(d => d.contacts);
  const reviewSparkline  = monthlyData.map(d => d.reviews);

  /* ── Revenue analytics ── */
  const PERIOD_META: Record<typeof revPeriod, { label: string; days: number | null; bucket: 'day' | 'month' }> = {
    '7d':  { label: 'Last 7 days',   days: 7,   bucket: 'day' },
    '30d': { label: 'Last 30 days',  days: 30,  bucket: 'day' },
    '90d': { label: 'Last 90 days',  days: 90,  bucket: 'day' },
    'ytd': { label: 'This year',     days: null, bucket: 'month' },
    '12m': { label: 'Last 12 months', days: 365, bucket: 'month' },
    'all': { label: 'All time',      days: null, bucket: 'month' },
  };

  const paidOrders = useMemo(
    () => allOrders.filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled'),
    [allOrders],
  );

  const revenueData = useMemo(() => {
    const meta = PERIOD_META[revPeriod];
    const now = new Date();
    let start: Date;
    let prevStart: Date;
    let prevEnd: Date;

    if (revPeriod === 'ytd') {
      start = new Date(now.getFullYear(), 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1);
    } else if (revPeriod === 'all') {
      // Span from first paid order to now
      const earliest = paidOrders.reduce<Date | null>((min, o) => {
        const d = new Date(o.createdAt);
        return !min || d < min ? d : min;
      }, null);
      start = earliest ?? new Date(now.getFullYear(), 0, 1);
      prevStart = new Date(start);
      prevEnd = new Date(start);
    } else {
      const days = meta.days!;
      start = new Date(now); start.setDate(now.getDate() - (days - 1)); start.setHours(0,0,0,0);
      prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - days);
      prevEnd = new Date(start);
    }

    const currentOrders = paidOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= start && d <= now;
    });
    const previousOrders = paidOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevStart && d < prevEnd;
    });

    const sumTotal = (list: any[]) => list.reduce((s, o) => s + (Number(o.grandTotal) || 0), 0);
    const total = sumTotal(currentOrders);
    const prevTotal = sumTotal(previousOrders);
    const growthPct = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : (total > 0 ? 100 : 0);

    // Build buckets
    const buckets: { label: string; value: number; key: string }[] = [];
    if (meta.bucket === 'day') {
      const days = revPeriod === 'all' ? Math.max(1, Math.ceil((now.getTime() - start.getTime()) / 86400000)) : meta.days!;
      for (let i = 0; i < days; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        buckets.push({ key, label, value: 0 });
      }
      for (const o of currentOrders) {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const b = buckets.find(x => x.key === key);
        if (b) b.value += Number(o.grandTotal) || 0;
      }
    } else {
      // Monthly buckets
      let months = 12;
      let cursor = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      if (revPeriod === 'ytd') {
        months = now.getMonth() + 1;
        cursor = new Date(now.getFullYear(), 0, 1);
      } else if (revPeriod === 'all') {
        const earliest = paidOrders.reduce<Date | null>((min, o) => {
          const d = new Date(o.createdAt);
          return !min || d < min ? d : min;
        }, null);
        if (earliest) {
          cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
          months = (now.getFullYear() - cursor.getFullYear()) * 12 + (now.getMonth() - cursor.getMonth()) + 1;
          months = Math.max(1, Math.min(months, 36));
        } else {
          months = 1;
        }
      }
      for (let i = 0; i < months; i++) {
        const d = new Date(cursor.getFullYear(), cursor.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = (months > 12)
          ? d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
          : d.toLocaleDateString('en-GB', { month: 'short' });
        buckets.push({ key, label, value: 0 });
      }
      for (const o of currentOrders) {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const b = buckets.find(x => x.key === key);
        if (b) b.value += Number(o.grandTotal) || 0;
      }
    }

    const best = buckets.reduce<{ label: string; value: number } | null>(
      (top, b) => (!top || b.value > top.value) ? { label: b.label, value: b.value } : top, null,
    );

    const aov = currentOrders.length > 0 ? total / currentOrders.length : 0;

    return {
      label: meta.label,
      total,
      prevTotal,
      growthPct,
      orderCount: currentOrders.length,
      prevOrderCount: previousOrders.length,
      aov,
      best,
      buckets,
    };
  }, [paidOrders, revPeriod]);

  const greeting = now ? getGreeting(now.getHours()) : { text: 'Welcome', emoji: '👋' };
  const timeStr  = now ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--';
  const dateStr  = now ? now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const pTypeBadge = (t: string) =>
    t === 'yak-milk'    ? { label: 'Yak Milk',    cls: 'bg-amber-100 text-amber-700' }
    : t === 'puff-treat'  ? { label: 'Puff',        cls: 'bg-purple-100 text-purple-700' }
    : { label: 'Highland', cls: 'bg-teal-100 text-teal-700' };

  /* ── Loading screen ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #F59E0B', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontFamily: 'DM Sans,sans-serif', fontSize: 14 }}>Loading dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  /* ── Shared card style ── */
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        .db-root { font-family: 'DM Sans', sans-serif; }
        .db-serif { font-family: 'Playfair Display', serif; }
        @keyframes db-spin { to { transform: rotate(360deg); } }
        @keyframes db-fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes db-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .db-card-hover { transition: box-shadow 0.2s, transform 0.2s; }
        .db-card-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }
        .db-tab-btn { background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:12px 16px; display:flex; align-items:center; gap:6px; border-bottom:2px solid transparent; transition:all 0.2s; }
        .db-tab-btn.active-msg  { color:#e11d48; border-bottom-color:#e11d48; background:rgba(225,29,72,0.04); }
        .db-tab-btn.active-rev  { color:#d97706; border-bottom-color:#d97706; background:rgba(217,119,6,0.04); }
        .db-tab-btn:not(.active-msg):not(.active-rev) { color:#94a3b8; }
        .db-tab-btn:not(.active-msg):not(.active-rev):hover { color:#475569; background:#f8fafc; }
        .db-feed-row { display:flex; align-items:center; gap:12px; padding:14px 20px; border-bottom:1px solid #f8fafc; transition:background 0.15s; }
        .db-feed-row:hover { background:#fafafa; }
        .db-quick-link { display:flex; align-items:center; gap:10px; padding:14px 16px; border-radius:14px; border:1px solid; text-decoration:none; transition:all 0.2s; }
        .db-quick-link:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
        @media (max-width: 639px) {
          .db-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .db-two-col   { grid-template-columns: 1fr !important; }
          .db-three-col { grid-template-columns: 1fr !important; }
          .db-hero-row  { flex-direction: column !important; }
          .db-hero-time { display: none !important; }
          .db-analytics-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .db-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .db-two-col   { grid-template-columns: 1fr !important; }
          .db-three-col { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div className="db-root" style={{ minHeight: '100vh', background: '#f4f5f8', paddingBottom: 64 }}>

        {/* ══════════ HERO ══════════ */}
        <div style={{
          background: 'linear-gradient(135deg, #0b1d31 0%, #112d4a 50%, #0a1f37 100%)',
          padding: 'clamp(28px,4vw,44px) clamp(16px,4vw,40px)',
          paddingBottom: 80,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ambient glows */}
          <div style={{ position:'absolute', top:'-20%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-10%', left:'25%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

          <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
            <div className="db-hero-row" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20 }}>

              {/* Left: greeting */}
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:99, padding:'5px 14px', marginBottom:14 }}>
                  <span>{greeting.emoji}</span>
                  <span style={{ color:'rgba(245,158,11,0.9)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>{greeting.text}</span>
                </div>
                <h1 className="db-serif" style={{ color:'#fff', fontSize:'clamp(28px,4vw,42px)', fontWeight:700, lineHeight:1.15, marginBottom:8 }}>
                  Highland Yak Chew
                </h1>
                <p style={{ color:'rgba(148,163,184,0.8)', fontSize:14, maxWidth:360, lineHeight:1.6 }}>
                  Here's your store overview for today.
                </p>
                {/* Live order + sub badges */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:18 }}>
                  {orderStats && (
                    <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
                      <FiShoppingBag size={13} style={{ color:'#67e8f9' }} />
                      <span style={{ color:'#e2e8f0', fontSize:12, fontWeight:600 }}>
                        {orderStats.totalOrders ?? 0} orders
                      </span>
                    </div>
                  )}
                  {subStats && (
                    <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 16px', display:'flex', alignItems:'center', gap:8 }}>
                      <FiRepeat size={13} style={{ color:'#86efac' }} />
                      <span style={{ color:'#e2e8f0', fontSize:12, fontWeight:600 }}>
                        {subStats.activeSubscriptions ?? 0} active subs
                      </span>
                    </div>
                  )}
                  <div style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:10, padding:'8px 14px', display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:'#34d399', animation:'db-pulse 2s ease-in-out infinite', flexShrink:0 } as React.CSSProperties} />
                    <span style={{ color:'#6ee7b7', fontSize:12, fontWeight:600 }}>Store Online</span>
                  </div>
                </div>
              </div>

              {/* Right: live clock */}
              <div className="db-hero-time" style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'16px 24px', textAlign:'right', flexShrink:0 }}>
                <p style={{ color:'#fff', fontFamily:'monospace', fontSize:'clamp(24px,3vw,32px)', fontWeight:700, letterSpacing:'0.08em', marginBottom:4 }}>{timeStr}</p>
                <p style={{ color:'rgba(148,163,184,0.7)', fontSize:11 }}>{dateStr}</p>
                <button onClick={fetchData} style={{ marginTop:10, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:8, padding:'5px 12px', color:'rgba(245,158,11,0.9)', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5, marginLeft:'auto', fontFamily:'DM Sans,sans-serif' }}>
                  <FiRefreshCw size={11} /> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(12px,3vw,40px)' }}>

          {/* ══════════ STAT CARDS ══════════ */}
          <div className="db-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14, marginTop:-52, position:'relative', zIndex:10 }}>
            <StatCard icon={FiPackage}  label="Products"    value={stats.totalProducts}    accentColor="linear-gradient(90deg,#3b82f6,#6366f1)" iconBg="#eff6ff" iconColor="#3b82f6" sparkVals={[2,4,3,5,4,stats.totalProducts]} sparkColor="#3b82f6" />
            <StatCard icon={GiDogBowl} label="Yak Milk"    value={stats.yakMilkCount}     accentColor="linear-gradient(90deg,#f59e0b,#ea580c)" iconBg="#fffbeb" iconColor="#d97706" sparkVals={[1,2,2,3,stats.yakMilkCount,stats.yakMilkCount]} sparkColor="#f59e0b" />
            <StatCard icon={FiGrid}    label="Puff Treats"  value={stats.puffTreatCount}   accentColor="linear-gradient(90deg,#a78bfa,#7c3aed)" iconBg="#f5f3ff" iconColor="#7c3aed" sparkVals={[1,1,2,2,stats.puffTreatCount,stats.puffTreatCount]} sparkColor="#a78bfa" />
            <StatCard icon={FiLayers}  label="Highland Mix" value={stats.highlandMixCount} accentColor="linear-gradient(90deg,#14b8a6,#0891b2)" iconBg="#f0fdfa" iconColor="#0d9488" sparkVals={[0,1,1,2,stats.highlandMixCount,stats.highlandMixCount]} sparkColor="#2dd4bf" />
            <StatCard icon={FiStar}    label="Reviews"      value={stats.totalReviews}     accentColor="linear-gradient(90deg,#eab308,#f59e0b)" iconBg="#fefce8" iconColor="#ca8a04" sparkVals={reviewSparkline.length ? reviewSparkline : [0,0,0,0,0,stats.totalReviews]} sparkColor="#eab308" />
            <StatCard icon={FiMail}    label="Messages"     value={stats.totalContacts}    accentColor="linear-gradient(90deg,#f43f5e,#e11d48)" iconBg="#fff1f2" iconColor="#e11d48" sparkVals={contactSparkline.length ? contactSparkline : [0,0,0,0,0,stats.totalContacts]} sparkColor="#f43f5e" sub={stats.newContacts > 0 ? `${stats.newContacts} unread` : undefined} />
          </div>

          {/* ══════════ ALERTS ══════════ */}
          {(stats.newContacts > 0 || stats.pendingReviews > 0) && (
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
              {stats.newContacts > 0 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'12px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <FiAlertCircle size={16} style={{ color:'#3b82f6', flexShrink:0 }} />
                    <p style={{ color:'#1e40af', fontSize:13, fontWeight:500 }}>
                      <strong>{stats.newContacts}</strong> unread {stats.newContacts === 1 ? 'message' : 'messages'} awaiting reply.
                    </p>
                  </div>
                  <Link href="/dashboard/contact" style={{ color:'#1d4ed8', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>View inbox <FiArrowRight size={12} /></Link>
                </div>
              )}
              {stats.pendingReviews > 0 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'12px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <FiStar size={16} style={{ color:'#d97706', flexShrink:0 }} />
                    <p style={{ color:'#92400e', fontSize:13, fontWeight:500 }}>
                      <strong>{stats.pendingReviews}</strong> {stats.pendingReviews === 1 ? 'review needs' : 'reviews need'} approval.
                    </p>
                  </div>
                  <Link href="/dashboard/reviews" style={{ color:'#b45309', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>Approve <FiArrowRight size={12} /></Link>
                </div>
              )}
            </div>
          )}

          {/* ══════════ REVENUE PANEL ══════════ */}
          <div style={{ ...card, marginTop: 16, overflow: 'hidden' }}>
            {/* Header + period selector */}
            <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 10, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', borderRadius: 12 }}>
                  <FiDollarSign size={18} style={{ color: '#15803d' }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Revenue</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Paid orders · {revenueData.label}</p>
                </div>
              </div>

              {/* Period selector */}
              <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: '#f1f5f9', borderRadius: 10 }}>
                {([
                  { k: '7d',  l: '7D' },
                  { k: '30d', l: '30D' },
                  { k: '90d', l: '90D' },
                  { k: 'ytd', l: 'YTD' },
                  { k: '12m', l: '12M' },
                  { k: 'all', l: 'All' },
                ] as const).map(p => (
                  <button
                    key={p.k}
                    onClick={() => setRevPeriod(p.k)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 7,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'DM Sans,sans-serif',
                      transition: 'all 0.15s',
                      background: revPeriod === p.k ? '#0c1e35' : 'transparent',
                      color: revPeriod === p.k ? '#fff' : '#64748b',
                    }}
                  >
                    {p.l}
                  </button>
                ))}
              </div>
            </div>

            {/* KPIs row */}
            <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, borderBottom: '1px solid #f1f5f9' }} className="db-three-col">
              {/* Total revenue */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Revenue</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', marginTop: 4, lineHeight: 1 }}>
                  {formatMoney(revenueData.total)}
                </p>
                {revPeriod !== 'all' && (
                  <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: revenueData.growthPct >= 0 ? '#dcfce7' : '#fee2e2' }}>
                    {revenueData.growthPct >= 0 ? <FiTrendingUp size={11} style={{ color: '#15803d' }} /> : <FiTrendingDown size={11} style={{ color: '#b91c1c' }} />}
                    <span style={{ fontSize: 11, fontWeight: 700, color: revenueData.growthPct >= 0 ? '#15803d' : '#b91c1c', fontVariantNumeric: 'tabular-nums' }}>
                      {revenueData.growthPct >= 0 ? '+' : ''}{revenueData.growthPct.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>vs prev.</span>
                  </div>
                )}
              </div>

              {/* Orders */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Paid Orders</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', marginTop: 4, lineHeight: 1 }}>
                  {revenueData.orderCount.toLocaleString('en-GB')}
                </p>
                {revPeriod !== 'all' && revenueData.prevOrderCount > 0 && (
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                    vs {revenueData.prevOrderCount.toLocaleString('en-GB')} prev.
                  </p>
                )}
              </div>

              {/* AOV */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Avg. Order Value</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', marginTop: 4, lineHeight: 1 }}>
                  {formatMoney(revenueData.aov)}
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>across paid orders</p>
              </div>

              {/* Best period */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Best {PERIOD_META[revPeriod].bucket === 'day' ? 'Day' : 'Month'}
                </p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', marginTop: 4, lineHeight: 1 }}>
                  {revenueData.best && revenueData.best.value > 0 ? formatMoney(revenueData.best.value, true) : '—'}
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                  {revenueData.best && revenueData.best.value > 0 ? revenueData.best.label : 'No paid orders'}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div style={{ padding: '14px 22px 20px' }}>
              {revenueData.total === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  <FiDollarSign size={28} style={{ opacity: 0.25, margin: '0 auto 10px', display: 'block' }} />
                  No paid orders in this period
                </div>
              ) : (
                <RevenueBarChart buckets={revenueData.buckets} color="#16a34a" />
              )}
            </div>
          </div>

          {/* ══════════ ROW 1: Orders + Subs | Activity Feed ══════════ */}
          <div className="db-two-col" style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:16, marginTop:16 }}>

            {/* Left col: Orders + Subscriptions stacked */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Orders card */}
              <div style={card} className="db-card-hover">
                <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ padding:8, background:'#f0fdf4', borderRadius:10 }}><FiShoppingBag size={16} style={{ color:'#16a34a' }} /></div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Orders</p>
                      <p style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>All time</p>
                    </div>
                  </div>
                  <Link href="/dashboard/orders" style={{ color:'#16a34a', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:3, textDecoration:'none' }}>View all <FiArrowRight size={11} /></Link>
                </div>
                <div style={{ padding:'14px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:'Total',     value: orderStats?.totalOrders     ?? '—', color:'#0f172a', bg:'#f8fafc' },
                    { label:'Pending',   value: orderStats?.pendingOrders   ?? '—', color:'#d97706', bg:'#fffbeb' },
                    { label:'Confirmed', value: orderStats?.confirmedOrders ?? '—', color:'#2563eb', bg:'#eff6ff' },
                    { label:'Shipped',   value: orderStats?.shippedOrders   ?? '—', color:'#16a34a', bg:'#f0fdf4' },
                  ].map(s => (
                    <div key={s.label} style={{ background:s.bg, borderRadius:10, padding:'10px 12px' }}>
                      <p style={{ fontSize:18, fontWeight:800, color:s.color, fontVariantNumeric:'tabular-nums' }}>{s.value}</p>
                      <p style={{ fontSize:10, color:'#94a3b8', marginTop:2, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscriptions card */}
              <div style={card} className="db-card-hover">
                <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ padding:8, background:'#faf5ff', borderRadius:10 }}><FiRepeat size={16} style={{ color:'#7c3aed' }} /></div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Subscriptions</p>
                      <p style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>Recurring billing</p>
                    </div>
                  </div>
                  <Link href="/dashboard/subscriptions" style={{ color:'#7c3aed', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:3, textDecoration:'none' }}>View all <FiArrowRight size={11} /></Link>
                </div>
                <div style={{ padding:'14px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:'Active',       value: subStats?.activeSubscriptions ?? '—', color:'#7c3aed', bg:'#faf5ff', icon: FiCheckCircle },
                    { label:'Total',        value: subStats?.totalSubscriptions  ?? '—', color:'#0f172a', bg:'#f8fafc',  icon: FiRepeat },
                    { label:'Failed',       value: subStats?.failedSubscriptions ?? '—', color:'#dc2626', bg:'#fef2f2',  icon: FiAlertCircle },
                    { label:'This Month',   value: subStats?.newThisMonth        ?? '—', color:'#0284c7', bg:'#f0f9ff',  icon: FiClock },
                  ].map(s => (
                    <div key={s.label} style={{ background:s.bg, borderRadius:10, padding:'10px 12px' }}>
                      <p style={{ fontSize:18, fontWeight:800, color:s.color, fontVariantNumeric:'tabular-nums' }}>{s.value}</p>
                      <p style={{ fontSize:10, color:'#94a3b8', marginTop:2, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product inventory */}
              <div style={{ ...card, padding:'18px 20px 20px' }} className="db-card-hover">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Product Inventory</p>
                  <Link href="/dashboard/products" style={{ color:'#d97706', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:3, textDecoration:'none' }}>Manage <FiArrowRight size={11} /></Link>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <BreakdownBar label="🐮 Yak Milk Chews"  count={stats.yakMilkCount}    total={stats.totalProducts} color="linear-gradient(90deg,#f59e0b,#ea580c)" />
                  <BreakdownBar label="✨ Puff Treats"       count={stats.puffTreatCount}  total={stats.totalProducts} color="linear-gradient(90deg,#a78bfa,#7c3aed)" />
                  <BreakdownBar label="🏔️ Highland Mix"    count={stats.highlandMixCount} total={stats.totalProducts} color="linear-gradient(90deg,#2dd4bf,#0891b2)" />
                </div>
              </div>
            </div>

            {/* Right col: Activity feed */}
            <div style={{ ...card, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <div style={{ display:'flex', borderBottom:'1px solid #f1f5f9' }}>
                <button className={`db-tab-btn ${activeTab === 'messages' ? 'active-msg' : ''}`} onClick={() => setActiveTab('messages')}>
                  <FiMail size={14} /> Messages
                  {stats.newContacts > 0 && <span style={{ background:'#e11d48', color:'#fff', fontSize:9, fontWeight:800, padding:'1px 6px', borderRadius:99, minWidth:16, textAlign:'center' }}>{stats.newContacts}</span>}
                </button>
                <button className={`db-tab-btn ${activeTab === 'reviews' ? 'active-rev' : ''}`} onClick={() => setActiveTab('reviews')}>
                  <FiStar size={14} /> Reviews
                  {stats.pendingReviews > 0 && <span style={{ background:'#d97706', color:'#fff', fontSize:9, fontWeight:800, padding:'1px 6px', borderRadius:99, minWidth:16, textAlign:'center' }}>{stats.pendingReviews}</span>}
                </button>
              </div>
              <div style={{ flex:1, overflowY:'auto' }}>
                {activeTab === 'messages' ? (
                  recentContacts.length === 0
                    ? <div style={{ padding:48, textAlign:'center', color:'#94a3b8', fontSize:13 }}><FiMail size={28} style={{ opacity:0.2, margin:'0 auto 12px', display:'block' }} />No messages yet</div>
                    : recentContacts.map((c: any) => (
                        <div key={c._id} className="db-feed-row">
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#60a5fa,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700, flexShrink:0 }}>{(c.name || 'A')[0].toUpperCase()}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                              <p style={{ fontWeight:600, color:'#0f172a', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                              <span style={{ flexShrink:0, fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:99, background: c.status === 'new' ? '#dbeafe' : c.status === 'read' ? '#fef3c7' : '#d1fae5', color: c.status === 'new' ? '#1e40af' : c.status === 'read' ? '#92400e' : '#065f46' }}>{c.status}</span>
                            </div>
                            <p style={{ color:'#94a3b8', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.subject || c.message}</p>
                          </div>
                          <span style={{ fontSize:11, color:'#cbd5e1', flexShrink:0 }}>{fmtDate(c.createdAt)}</span>
                        </div>
                      ))
                ) : (
                  recentReviews.length === 0
                    ? <div style={{ padding:48, textAlign:'center', color:'#94a3b8', fontSize:13 }}><FiStar size={28} style={{ opacity:0.2, margin:'0 auto 12px', display:'block' }} />No reviews yet</div>
                    : recentReviews.map((r: any) => (
                        <div key={r._id} className="db-feed-row">
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#fbbf24,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700, flexShrink:0 }}>{(r.guestInfo?.name || 'A')[0].toUpperCase()}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                              <p style={{ fontWeight:600, color:'#0f172a', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.guestInfo?.name || 'Anonymous'}</p>
                              <Stars rating={r.rating} />
                            </div>
                            <p style={{ color:'#94a3b8', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.comment || 'No comment'}</p>
                          </div>
                          <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:99, flexShrink:0, background: r.status === 'approved' ? '#d1fae5' : r.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: r.status === 'approved' ? '#065f46' : r.status === 'rejected' ? '#991b1b' : '#92400e' }}>{r.status}</span>
                        </div>
                      ))
                )}
              </div>
              <div style={{ padding:'12px 20px', borderTop:'1px solid #f1f5f9', background:'#fafafa' }}>
                <Link href={activeTab === 'messages' ? '/dashboard/contact' : '/dashboard/reviews'} style={{ fontSize:12, color:'#64748b', fontWeight:600, display:'flex', alignItems:'center', gap:5, textDecoration:'none' }}>
                  View all {activeTab === 'messages' ? 'messages' : 'reviews'} <FiArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* ══════════ STOCK OVERVIEW ══════════ */}
          <div style={{ ...card, padding:'18px 20px 20px', marginTop:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ padding:8, background:'#eff6ff', borderRadius:10 }}><FiPackage size={16} style={{ color:'#3b82f6' }} /></div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Stock Overview</p>
                  <p style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>Units across all products &amp; variants</p>
                </div>
              </div>
              <Link href="/dashboard/stock" style={{ color:'#3b82f6', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:3, textDecoration:'none' }}>
                Stock Tracker <FiArrowRight size={11} />
              </Link>
            </div>
            <div className="db-three-col" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              <StatCard icon={FiPackage}     label="Total Stock"   value={stockStats.totalStock}  accentColor="linear-gradient(90deg,#3b82f6,#6366f1)" iconBg="#eff6ff"  iconColor="#3b82f6" sub="Total units in inventory" />
              <StatCard icon={FiAlertCircle} label="Low Stock"     value={stockStats.lowStock}    accentColor="linear-gradient(90deg,#f59e0b,#ea580c)" iconBg="#fffbeb"  iconColor="#d97706" sub="Below 10 units" />
              <StatCard icon={FiXCircle}     label="Out of Stock"  value={stockStats.outOfStock}  accentColor="linear-gradient(90deg,#ef4444,#dc2626)" iconBg="#fff1f2"  iconColor="#dc2626" sub="Zero units remaining" />
            </div>
          </div>

          {/* ══════════ ANALYTICS HEADER ══════════ */}
          <div style={{ display:'flex', alignItems:'center', gap:16, margin:'28px 0 16px' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <div style={{ display:'flex', alignItems:'center', gap:7, color:'#94a3b8', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>
              <FiTrendingUp size={12} /> Analytics &amp; Insights
            </div>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>

          {/* ══════════ ANALYTICS METRIC PILLS ══════════ */}
          <div className="db-three-col" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
            {[
              { icon:FiUsers,          label:'Total Customers',  value:String(allContacts.length),             sub:'Unique inquiries',   color:'#2563eb', bg:'#eff6ff', accent:'linear-gradient(90deg,#3b82f6,#6366f1)' },
              { icon:FiMessageCircle,  label:'Reply Rate',       value:`${engagementMetrics.replyRate}%`,       sub:'Messages replied',   color:'#16a34a', bg:'#f0fdf4', accent:'linear-gradient(90deg,#22c55e,#16a34a)' },
              { icon:FiStar,           label:'Avg Rating',       value:String(engagementMetrics.avgRating),    sub:`${allReviews.length} reviews`, color:'#d97706', bg:'#fffbeb', accent:'linear-gradient(90deg,#f59e0b,#d97706)' },
              { icon:FiAward,          label:'Approval Rate',    value:`${engagementMetrics.approvalRate}%`,   sub:'Reviews approved',   color:'#7c3aed', bg:'#faf5ff', accent:'linear-gradient(90deg,#a78bfa,#7c3aed)' },
            ].map(m => (
              <div key={m.label} style={{ ...card, padding:'16px 18px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:m.accent, borderRadius:'16px 16px 0 0' }} />
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ padding:7, background:m.bg, borderRadius:9 }}><m.icon size={16} style={{ color:m.color }} /></div>
                </div>
                <p style={{ fontSize:24, fontWeight:800, color:'#0f172a', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{m.value}</p>
                <p style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:5 }}>{m.label}</p>
                <p style={{ fontSize:11, color:'#cbd5e1', marginTop:3 }}>{m.sub}</p>
              </div>
            ))}
          </div>

          {/* ══════════ ROW 2: Line chart + Donut ══════════ */}
          <div className="db-analytics-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, marginBottom:16 }}>

            {/* Line chart */}
            <div style={{ ...card, padding:'20px 22px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Customer Activity</h3>
                  <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Inquiries &amp; reviews — last 6 months</p>
                </div>
                <div style={{ display:'flex', gap:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:10, height:3, background:'#F59E0B', borderRadius:99 }} />
                    <span style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>Inquiries</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:10, height:3, background:'#818CF8', borderRadius:99 }} />
                    <span style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>Reviews</span>
                  </div>
                </div>
              </div>
              <SmoothLineChart data={monthlyData} />
            </div>

            {/* Donut chart */}
            <div style={{ ...card, padding:'20px 22px' }}>
              <div style={{ marginBottom:18 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Product Mix</h3>
                <p style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Distribution by type</p>
              </div>
              <DonutChart yak={stats.yakMilkCount} puff={stats.puffTreatCount} highland={stats.highlandMixCount} />
              <div style={{ marginTop:18, borderTop:'1px solid #f1f5f9', paddingTop:14, display:'flex', justifyContent:'space-between' }}>
                {[
                  { label:'Add Yak',     href:'/dashboard/products',    color:'#F59E0B' },
                  { label:'Add Puff',    href:'/dashboard/puff-treats', color:'#A78BFA' },
                  { label:'Add Highland', href:'/dashboard/highland-mix', color:'#2DD4BF' },
                ].map(b => (
                  <Link key={b.label} href={b.href} style={{ fontSize:11, fontWeight:700, color:b.color, textDecoration:'none', padding:'5px 8px', borderRadius:7, background:`${b.color}12`, border:`1px solid ${b.color}33` }}>+ {b.label}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════ ROW 3: Top Products + Quick Actions ══════════ */}
          <div className="db-analytics-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

            {/* Top products */}
            <div style={{ ...card, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ padding:7, background:'#fffbeb', borderRadius:9 }}><FiAward size={15} style={{ color:'#d97706' }} /></div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Top Products</p>
                    <p style={{ fontSize:11, color:'#94a3b8' }}>By engagement score</p>
                  </div>
                </div>
                <Link href="/dashboard/products" style={{ color:'#d97706', fontSize:11, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>All <FiArrowRight size={11} /></Link>
              </div>
              {topProducts.length === 0
                ? <div style={{ padding:40, textAlign:'center', color:'#94a3b8', fontSize:13 }}>No products yet</div>
                : topProducts.map((p: any, i: number) => {
                    const badge = pTypeBadge(p.productType);
                    const score = ((p.rating || 0) * Math.log((p.reviews || 0) + 1)).toFixed(1);
                    return (
                      <div key={p._id} className="db-feed-row">
                        <span style={{ width:22, height:22, borderRadius:'50%', background: i===0?'#fef3c7':i===1?'#f1f5f9':i===2?'#fff7ed':'#f8fafc', color:i===0?'#d97706':i===1?'#475569':i===2?'#c2410c':'#94a3b8', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                        {p.image
                          ? <img src={p.image} alt={p.name} style={{ width:34, height:34, borderRadius:8, objectFit:'cover', flexShrink:0, border:'1px solid #f1f5f9' }} />
                          : <div style={{ width:34, height:34, borderRadius:8, background:'#fffbeb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><GiDogBowl size={16} style={{ color:'#d97706' }} /></div>
                        }
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                            <Stars rating={p.rating || 0} />
                            <span style={{ fontSize:10, color:'#94a3b8' }}>({p.reviews||0})</span>
                            <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:99 }} className={badge.cls}>{badge.label}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <p style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{score}</p>
                          <p style={{ fontSize:10, color:'#94a3b8' }}>score</p>
                        </div>
                      </div>
                    );
                  })
              }
            </div>

            {/* Quick actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Quick Actions</p>
              {[
                { label:'Add Yak Milk Product',   sub:'Yak milk chew range',          href:'/dashboard/products',    iconBg:'#fffbeb', iconColor:'#d97706', border:'#fde68a', bg:'#fffdf5', icon:GiDogBowl },
                { label:'Add Puff Treat',         sub:'Puffed dog treats',             href:'/dashboard/puff-treats', iconBg:'#f5f3ff', iconColor:'#7c3aed', border:'#ddd6fe', bg:'#fdf8ff', icon:FiGrid },
                { label:'Manage Highland Mix',    sub:'Highland mix variety',          href:'/dashboard/highland-mix',iconBg:'#f0fdfa', iconColor:'#0d9488', border:'#99f6e4', bg:'#f5fffd', icon:FiLayers },
                { label:'View Orders',            sub:`${orderStats?.pendingOrders ?? 0} pending`, href:'/dashboard/orders',  iconBg:'#f0fdf4', iconColor:'#16a34a', border:'#bbf7d0', bg:'#f8fff8', icon:FiShoppingBag },
                { label:'Subscriptions',          sub:`${subStats?.activeSubscriptions ?? 0} active`, href:'/dashboard/subscriptions', iconBg:'#faf5ff', iconColor:'#7c3aed', border:'#ddd6fe', bg:'#fdf8ff', icon:FiRepeat },
                { label:'Inbox',                  sub:`${stats.newContacts} unread`,   href:'/dashboard/contact',     iconBg:'#fff1f2', iconColor:'#e11d48', border:'#fecdd3', bg:'#fff8f8', icon:FiMail },
              ].map(a => (
                <Link key={a.label} href={a.href} className="db-quick-link" style={{ background:a.bg, borderColor:a.border }}>
                  <div style={{ padding:8, background:a.iconBg, borderRadius:9, flexShrink:0 }}><a.icon size={16} style={{ color:a.iconColor }} /></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{a.label}</p>
                    <p style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{a.sub}</p>
                  </div>
                  <FiArrowRight size={13} style={{ color:'#cbd5e1', flexShrink:0 }} />
                </Link>
              ))}
            </div>
          </div>

        </div>{/* /max-w container */}
      </div>
    </>
  );
}
