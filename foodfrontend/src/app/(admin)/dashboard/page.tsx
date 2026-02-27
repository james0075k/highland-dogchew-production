'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  FiPackage, FiStar, FiMail, FiLayers, FiGrid,
  FiArrowRight, FiAlertCircle, FiRefreshCw, FiShoppingBag,
  FiTrendingUp, FiUsers, FiMessageCircle, FiAward,
} from 'react-icons/fi';
import { GiDogBowl } from 'react-icons/gi';

// ─── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
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

// ─── Live clock ──────────────────────────────────────────────────────────────
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
  if (h >= 5 && h < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  if (h >= 17 && h < 21) return { text: 'Good Evening', emoji: '🌆' };
  return { text: 'Good Night', emoji: '🌙' };
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, iconBg, iconColor }: {
  icon: React.ElementType; label: string; value: number;
  accent: string; iconBg: string; iconColor: string;
}) {
  const animated = useCountUp(value);
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${accent} rounded-t-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{animated}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={iconColor} size={20} />
        </div>
      </div>
    </div>
  );
}

// ─── Inventory breakdown bar ──────────────────────────────────────────────────
function BreakdownBar({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{count}</span>
          <span className="text-xs text-gray-400 w-9 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Star display ─────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={s <= rating ? '#f59e0b' : '#e5e7eb'} />
        </svg>
      ))}
    </div>
  );
}

// ─── Activity Bar Chart ───────────────────────────────────────────────────────
function ActivityChart({ data }: {
  data: { month: string; contacts: number; reviews: number }[];
}) {
  const maxVal = Math.max(...data.map(d => d.contacts + d.reviews), 1);
  const H = 120;
  return (
    <div>
      <div className="flex gap-1">
        {/* Y-axis */}
        <div className="flex flex-col justify-between items-end pr-2 text-[10px] text-gray-300 select-none font-mono" style={{ height: H }}>
          <span>{maxVal}</span>
          <span>{Math.round(maxVal / 2)}</span>
          <span>0</span>
        </div>
        {/* Bars */}
        <div className="flex-1 flex items-end gap-2 relative" style={{ height: H }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-dashed border-gray-100" />
            <div className="border-t border-dashed border-gray-100" />
            <div className="border-t border-dashed border-gray-100" />
          </div>
          {data.map((d, i) => {
            const total = d.contacts + d.reviews;
            const barH = Math.max((total / maxVal) * H, total > 0 ? 4 : 0);
            const cH = total > 0 ? (d.contacts / total) * barH : 0;
            const rH = barH - cH;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-default relative" style={{ height: H }}>
                {/* Tooltip */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2.5 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl pointer-events-none">
                  <p className="font-bold mb-0.5">{d.month}</p>
                  <p className="text-amber-300">Inquiries: {d.contacts}</p>
                  <p className="text-blue-300">Reviews: {d.reviews}</p>
                </div>
                <div className="w-full flex flex-col justify-end rounded-t overflow-hidden" style={{ height: H }}>
                  <div className="w-full bg-blue-300 transition-all duration-700" style={{ height: rH }} />
                  <div className="w-full bg-amber-400 transition-all duration-700" style={{ height: cH }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* X labels */}
      <div className="flex gap-2 mt-1 ml-9">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-gray-400 font-medium">{d.month}</span>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 ml-9">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 bg-amber-400 rounded-sm" />
          <span className="text-[11px] text-gray-500 font-medium">Inquiries</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 bg-blue-300 rounded-sm" />
          <span className="text-[11px] text-gray-500 font-medium">Reviews</span>
        </div>
      </div>
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalProducts: number; yakMilkCount: number; puffTreatCount: number;
  highlandMixCount: number; totalReviews: number; totalContacts: number;
  newContacts: number; pendingReviews: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, yakMilkCount: 0, puffTreatCount: 0,
    highlandMixCount: 0, totalReviews: 0, totalContacts: 0,
    newContacts: 0, pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'reviews'>('messages');
  const now = useLiveClock();
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, reviewsRes, contactsRes] = await Promise.allSettled([
        fetch(`${API}/products`).then(r => r.json()),
        fetch(`${API}/reviews`).then(r => r.json()),
        fetch(`${API}/contact`).then(r => r.json()),
      ]);

      let totalProducts = 0, yakMilkCount = 0, puffTreatCount = 0, highlandMixCount = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        const p = Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
        totalProducts = p.length;
        yakMilkCount = p.filter((x: any) => x.productType === 'yak-milk').length;
        puffTreatCount = p.filter((x: any) => x.productType === 'puff-treat').length;
        highlandMixCount = p.filter((x: any) => x.productType === 'highland-mix').length;
        setAllProducts(p);
      }

      let totalReviews = 0, pendingReviews = 0;
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data) {
        const r = Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : [];
        totalReviews = r.length;
        pendingReviews = r.filter((x: any) => x.status === 'pending').length;
        setRecentReviews(r.slice(0, 6));
        setAllReviews(r);
      }

      let totalContacts = 0, newContacts = 0;
      if (contactsRes.status === 'fulfilled' && contactsRes.value?.data) {
        const c = Array.isArray(contactsRes.value.data)
          ? contactsRes.value.data
          : contactsRes.value.data?.items || [];
        totalContacts = c.length;
        newContacts = c.filter((x: any) => x.status === 'new').length;
        setRecentContacts(c.slice(0, 6));
        setAllContacts(c);
      }

      setStats({ totalProducts, yakMilkCount, puffTreatCount, highlandMixCount, totalReviews, totalContacts, newContacts, pendingReviews });
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Computed: Last 6 months activity ──
  const monthlyData = useMemo(() => {
    const result = [];
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const yr = d.getFullYear(), mo = d.getMonth();
      const label = d.toLocaleDateString('en-GB', { month: 'short' });
      const contacts = allContacts.filter(c => {
        const dt = new Date(c.createdAt);
        return dt.getFullYear() === yr && dt.getMonth() === mo;
      }).length;
      const reviews = allReviews.filter(r => {
        const dt = new Date(r.createdAt || r.date);
        return dt.getFullYear() === yr && dt.getMonth() === mo;
      }).length;
      result.push({ month: label, contacts, reviews });
    }
    return result;
  }, [allContacts, allReviews]);

  // ── Computed: Top products by engagement score ──
  const topProducts = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1)))
      .slice(0, 5);
  }, [allProducts]);

  // ── Computed: Engagement summary metrics ──
  const engagementMetrics = useMemo(() => {
    const totalActivity = allContacts.length + allReviews.length;
    const replyRate = allContacts.length > 0
      ? Math.round((allContacts.filter(c => c.status === 'replied').length / allContacts.length) * 100)
      : 0;
    const avgRating = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(1)
      : '—';
    const approvedReviews = allReviews.filter(r => r.status === 'approved').length;
    const approvalRate = allReviews.length > 0
      ? Math.round((approvedReviews / allReviews.length) * 100)
      : 0;
    return { totalActivity, replyRate, avgRating, approvalRate };
  }, [allContacts, allReviews]);

  const greeting = now ? getGreeting(now.getHours()) : { text: 'Welcome', emoji: '👋' };
  const timeStr = now ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--';
  const dateStr = now ? now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ') : '';

  const productTypeLabel = (t: string) =>
    t === 'yak-milk' ? { label: 'Yak Milk', cls: 'bg-amber-100 text-amber-700' }
    : t === 'puff-treat' ? { label: 'Puff Treat', cls: 'bg-purple-100 text-purple-700' }
    : { label: 'Highland Mix', cls: 'bg-teal-100 text-teal-700' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="text-center">
          <div className="w-14 h-14 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-16">

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0b1d31] via-[#112d4a] to-[#0a1f37] px-6 md:px-10 pt-8 pb-24 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4">
                <span className="text-base leading-none">{greeting.emoji}</span>
                <span className="text-amber-300/80 text-xs font-semibold uppercase tracking-widest">{greeting.text}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight leading-none">Admin</h1>
              <p className="text-blue-200/50 text-sm max-w-sm leading-relaxed">
                Here&apos;s what&apos;s happening with your{' '}
                <span className="text-amber-400/80 font-semibold">Highland Dog Chew</span> store today.
              </p>
            </div>
            <div className="flex flex-row lg:flex-col items-start lg:items-end gap-3 flex-wrap">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-white font-mono text-3xl font-bold tracking-widest tabular-nums">{timeStr}</p>
                <p className="text-blue-200/60 text-xs mt-1 font-medium">{dateStr}</p>
                {timezone && <p className="text-blue-200/30 text-[10px] mt-0.5 uppercase tracking-widest">{timezone}</p>}
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-2.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-emerald-300 text-sm font-semibold">Store Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────── STAT CARDS ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={FiPackage}  label="All Products" value={stats.totalProducts}    accent="bg-blue-500"   iconBg="bg-blue-50"   iconColor="text-blue-600" />
          <StatCard icon={GiDogBowl} label="Yak Milk"     value={stats.yakMilkCount}     accent="bg-amber-500"  iconBg="bg-amber-50"  iconColor="text-amber-600" />
          <StatCard icon={FiGrid}    label="Puff Treats"  value={stats.puffTreatCount}   accent="bg-purple-500" iconBg="bg-purple-50" iconColor="text-purple-600" />
          <StatCard icon={FiLayers}  label="Highland Mix" value={stats.highlandMixCount} accent="bg-teal-500"   iconBg="bg-teal-50"   iconColor="text-teal-600" />
          <StatCard icon={FiStar}    label="Reviews"      value={stats.totalReviews}     accent="bg-yellow-500" iconBg="bg-yellow-50" iconColor="text-yellow-600" />
          <StatCard icon={FiMail}    label="Messages"     value={stats.totalContacts}    accent="bg-rose-500"   iconBg="bg-rose-50"   iconColor="text-rose-600" />
        </div>
      </div>

      {/* ─────────────────────────── ALERT BANNERS ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 space-y-3">
        {stats.newContacts > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-blue-500 flex-shrink-0" size={17} />
              <p className="text-blue-800 text-sm font-medium">
                You have <span className="font-bold text-blue-900">{stats.newContacts}</span> unread {stats.newContacts === 1 ? 'message' : 'messages'} awaiting your reply.
              </p>
            </div>
            <Link href="/dashboard/contact" className="text-blue-600 hover:text-blue-900 text-sm font-bold flex items-center gap-1.5 ml-4 whitespace-nowrap transition-colors">
              View inbox <FiArrowRight size={14} />
            </Link>
          </div>
        )}
        {stats.pendingReviews > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <FiStar className="text-amber-500 flex-shrink-0" size={17} />
              <p className="text-amber-800 text-sm font-medium">
                <span className="font-bold text-amber-900">{stats.pendingReviews}</span> {stats.pendingReviews === 1 ? 'review needs' : 'reviews need'} your approval before going live.
              </p>
            </div>
            <Link href="/dashboard/reviews" className="text-amber-700 hover:text-amber-900 text-sm font-bold flex items-center gap-1.5 ml-4 whitespace-nowrap transition-colors">
              Approve <FiArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* ─────────────────────────── CONTENT GRID ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Product Inventory */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl"><FiShoppingBag className="text-amber-600" size={18} /></div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Product Inventory</h3>
                <p className="text-xs text-gray-400 mt-0.5">{stats.totalProducts} products total</p>
              </div>
            </div>
            <Link href="/dashboard/products" className="text-amber-600 hover:text-amber-700 text-xs font-bold flex items-center gap-1 transition-colors">
              Manage <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4 flex-1">
            <BreakdownBar label="🐮  Yak Milk Chews"  count={stats.yakMilkCount}    total={stats.totalProducts} color="bg-amber-500" />
            <BreakdownBar label="✨  Puff Treats"      count={stats.puffTreatCount}  total={stats.totalProducts} color="bg-purple-500" />
            <BreakdownBar label="🏔️  Highland Mix"    count={stats.highlandMixCount} total={stats.totalProducts} color="bg-teal-500" />
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Add Product</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Yak Milk', href: '/dashboard/products', cls: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100' },
                { label: 'Puff Treat', href: '/dashboard/puff-treats', cls: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100' },
                { label: 'Highland', href: '/dashboard/highland-mix', cls: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-100' },
              ].map(b => (
                <Link key={b.label} href={b.href} className={`text-center text-xs font-bold py-2 px-1 rounded-lg border transition-colors ${b.cls}`}>+ {b.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab('messages')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${activeTab === 'messages' ? 'text-rose-600 border-b-2 border-rose-500 bg-rose-50/40' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
              <FiMail size={15} /> Messages
              {stats.newContacts > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">{stats.newContacts}</span>}
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${activeTab === 'reviews' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/40' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
              <FiStar size={15} /> Reviews
              {stats.pendingReviews > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">{stats.pendingReviews}</span>}
            </button>
          </div>
          <div className="flex-1 divide-y divide-gray-50 overflow-y-auto">
            {activeTab === 'messages' ? (
              recentContacts.length === 0
                ? <div className="py-16 text-center text-gray-400 text-sm"><FiMail size={32} className="mx-auto mb-3 opacity-20" />No messages yet</div>
                : recentContacts.map((c: any) => (
                  <div key={c._id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">{(c.name || 'A')[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'new' ? 'bg-blue-100 text-blue-700' : c.status === 'read' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{c.status}</span>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{c.subject || c.message}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{fmtDate(c.createdAt)}</span>
                  </div>
                ))
            ) : (
              recentReviews.length === 0
                ? <div className="py-16 text-center text-gray-400 text-sm"><FiStar size={32} className="mx-auto mb-3 opacity-20" />No reviews yet</div>
                : recentReviews.map((r: any) => (
                  <div key={r._id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">{(r.guestInfo?.name || 'A')[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm truncate">{r.guestInfo?.name || 'Anonymous'}</p>
                        <Stars rating={r.rating} />
                      </div>
                      <p className="text-gray-400 text-xs truncate">{r.comment || 'No comment'}</p>
                    </div>
                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                  </div>
                ))
            )}
          </div>
          <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <Link href={activeTab === 'messages' ? '/dashboard/contact' : '/dashboard/reviews'} className="text-sm text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-1.5 transition-colors">
              View all {activeTab === 'messages' ? 'messages' : 'reviews'} <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────── QUICK ACTIONS ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Quick Actions</h3>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium py-1.5 px-3 rounded-lg hover:bg-white border border-transparent hover:border-gray-200">
            <FiRefreshCw size={12} /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Yak Milk', sub: 'Yak milk chew products', href: '/dashboard/products', icon: GiDogBowl, card: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 hover:border-amber-300', iw: 'bg-amber-100', ic: 'text-amber-600', tc: 'text-amber-800', sc: 'text-amber-600/70' },
            { label: 'Add Puff Treat', sub: 'Puffed dog treat products', href: '/dashboard/puff-treats', icon: FiGrid, card: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 hover:border-purple-300', iw: 'bg-purple-100', ic: 'text-purple-600', tc: 'text-purple-800', sc: 'text-purple-600/70' },
            { label: 'Highland Mix', sub: 'Mix chew variety products', href: '/dashboard/highland-mix', icon: FiLayers, card: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100 hover:border-teal-300', iw: 'bg-teal-100', ic: 'text-teal-600', tc: 'text-teal-800', sc: 'text-teal-600/70' },
            { label: 'Inbox', sub: `${stats.newContacts} new message${stats.newContacts !== 1 ? 's' : ''}`, href: '/dashboard/contact', icon: FiMail, card: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100 hover:border-rose-300', iw: 'bg-rose-100', ic: 'text-rose-600', tc: 'text-rose-800', sc: 'text-rose-600/70' },
          ].map(a => (
            <Link key={a.label} href={a.href} className={`group flex items-center gap-3 p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${a.card}`}>
              <div className={`p-2.5 rounded-xl ${a.iw} flex-shrink-0 shadow-sm`}><a.icon className={a.ic} size={20} /></div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm ${a.tc}`}>{a.label}</p>
                <p className={`text-xs truncate mt-0.5 ${a.sc}`}>{a.sub}</p>
              </div>
              <FiArrowRight className={`flex-shrink-0 opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all ${a.ic}`} size={15} />
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ─────────────── ANALYTICS SECTION (NEW) ──────────────────
          ══════════════════════════════════════════════════════════ */}

      {/* ─── Section divider ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-10">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <FiTrendingUp size={13} />
            Analytics &amp; Insights
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      {/* ─── Engagement Metrics Row ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FiUsers, label: 'Total Customers', value: String(allContacts.length), sub: 'Unique inquiries', color: 'text-blue-600', bg: 'bg-blue-50', accent: 'bg-blue-500' },
          { icon: FiMessageCircle, label: 'Reply Rate', value: `${engagementMetrics.replyRate}%`, sub: 'Messages replied', color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'bg-emerald-500' },
          { icon: FiStar, label: 'Avg Rating', value: String(engagementMetrics.avgRating), sub: `From ${allReviews.length} reviews`, color: 'text-amber-600', bg: 'bg-amber-50', accent: 'bg-amber-500' },
          { icon: FiAward, label: 'Approval Rate', value: `${engagementMetrics.approvalRate}%`, sub: 'Reviews approved', color: 'text-purple-600', bg: 'bg-purple-50', accent: 'bg-purple-500' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${m.accent} rounded-t-2xl`} />
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${m.bg}`}><m.icon className={m.color} size={18} /></div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">{m.value}</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{m.label}</p>
            <p className="text-[11px] text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Customer Activity Chart + Top Products ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Activity Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Customer Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Inquiries &amp; reviews — last 6 months</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <FiTrendingUp size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500">
                {monthlyData.reduce((s, d) => s + d.contacts + d.reviews, 0)} total
              </span>
            </div>
          </div>
          <ActivityChart data={monthlyData} />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-xl"><FiAward className="text-amber-600" size={16} /></div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Top Products</h3>
                <p className="text-xs text-gray-400">By engagement score</p>
              </div>
            </div>
            <Link href="/dashboard/products" className="text-amber-600 hover:text-amber-700 text-xs font-bold flex items-center gap-1 transition-colors">
              All <FiArrowRight size={12} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <FiPackage size={28} className="mx-auto mb-2 opacity-20" />
              No products yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topProducts.map((p: any, i: number) => {
                const badge = productTypeLabel(p.productType);
                const score = ((p.rating || 0) * Math.log((p.reviews || 0) + 1)).toFixed(1);
                return (
                  <div key={p._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    {/* Rank */}
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-extrabold flex-shrink-0
                      ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                      {i + 1}
                    </span>
                    {/* Product image or avatar */}
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <GiDogBowl className="text-amber-500" size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars rating={p.rating || 0} />
                        <span className="text-[10px] text-gray-400">({p.reviews || 0})</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                      </div>
                    </div>
                    {/* Engagement score */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-gray-900 tabular-nums">{score}</p>
                      <p className="text-[10px] text-gray-400">score</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Revenue Placeholder + Customer Arrivals ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-2xl" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <FiTrendingUp className="text-emerald-600" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Revenue Insights</h3>
                <p className="text-xs text-gray-400 mt-0.5">Sales performance overview</p>
              </div>
            </div>
          </div>

          {/* Revenue chart placeholder — Stripe connect CTA */}
          <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">Connect Stripe Dashboard</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mb-4">
              Link your Stripe account to view real-time revenue, order totals, average order value and payment analytics.
            </p>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#635bff] hover:bg-[#5851ea] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
              </svg>
              Open Stripe Dashboard
            </a>
          </div>

          {/* Simulated sparkline bars */}
          <div className="mt-4">
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest mb-2">Sample chart preview</p>
            <div className="flex items-end gap-1 h-12 opacity-20">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-emerald-400 to-teal-300 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Customer Arrivals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-2xl" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <FiUsers className="text-blue-600" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Customer Arrivals</h3>
                <p className="text-xs text-gray-400 mt-0.5">Inquiries &amp; engagement by source</p>
              </div>
            </div>
          </div>

          {/* Arrival breakdown */}
          <div className="space-y-3 mb-5">
            {[
              { label: 'Contact Inquiries', count: allContacts.length, icon: '📩', color: 'bg-blue-500', pct: allContacts.length + allReviews.length > 0 ? Math.round((allContacts.length / (allContacts.length + allReviews.length)) * 100) : 0 },
              { label: 'Product Reviews', count: allReviews.length, icon: '⭐', color: 'bg-amber-500', pct: allContacts.length + allReviews.length > 0 ? Math.round((allReviews.length / (allContacts.length + allReviews.length)) * 100) : 0 },
              { label: 'New This Week', count: allContacts.filter(c => { const d = new Date(c.createdAt); const now = new Date(); const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24); return diff <= 7; }).length, icon: '🆕', color: 'bg-emerald-500', pct: null },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-base w-7 text-center flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{item.label}</span>
                    <span className="text-xs font-bold text-gray-900 tabular-nums">
                      {item.count}{item.pct !== null ? ` (${item.pct}%)` : ''}
                    </span>
                  </div>
                  {item.pct !== null && (
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Google Analytics CTA */}
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <rect x="3" y="12" width="4" height="9" rx="1" fill="#F9AB00" />
                <rect x="10" y="6" width="4" height="15" rx="1" fill="#E37400" />
                <rect x="17" y="2" width="4" height="19" rx="1" fill="#34A853" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900">Connect Google Analytics</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">View real visitor traffic, session data, bounce rate &amp; conversion funnels.</p>
            </div>
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap flex items-center gap-1">
              Setup <FiArrowRight size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
