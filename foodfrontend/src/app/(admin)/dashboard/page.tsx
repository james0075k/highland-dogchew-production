'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiPackage, FiStar, FiMail, FiTrendingUp,
  FiBox, FiLayers, FiGrid,
} from 'react-icons/fi';
import { GiDogBowl } from 'react-icons/gi';

// --- Animated counter hook ---
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return count;
}

// --- Stat Card ---
function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  gradient: string;
  iconBg: string;
}) {
  const animatedValue = useCountUp(value);

  return (
    <div className={`relative group rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-default ${gradient}`}>
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-2xl" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">{label}</p>
          <p className="text-white text-3xl font-bold tracking-tight">{animatedValue}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} shadow-lg`}>
          <Icon className="text-white" size={22} />
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
    </div>
  );
}

// --- Types ---
interface DashboardStats {
  totalProducts: number;
  yakMilkCount: number;
  puffTreatCount: number;
  highlandMixCount: number;
  totalReviews: number;
  totalContacts: number;
  newContacts: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, yakMilkCount: 0, puffTreatCount: 0,
    highlandMixCount: 0, totalReviews: 0, totalContacts: 0,
    newContacts: 0, totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [productsRes, reviewsRes, contactsRes] = await Promise.allSettled([
        fetch(`${API}/products`).then(r => r.json()),
        fetch(`${API}/reviews`).then(r => r.json()),
        fetch(`${API}/contact`).then(r => r.json()),
      ]);

      // Products
      let totalProducts = 0, yakMilkCount = 0, puffTreatCount = 0, highlandMixCount = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        const products = Array.isArray(productsRes.value.data) ? productsRes.value.data : [];
        totalProducts = products.length;
        yakMilkCount = products.filter((p: any) => p.productType === 'yak-milk').length;
        puffTreatCount = products.filter((p: any) => p.productType === 'puff-treat').length;
        highlandMixCount = products.filter((p: any) => p.productType === 'highland-mix').length;
      }

      // Reviews
      let totalReviews = 0;
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data) {
        const reviews = Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : [];
        totalReviews = reviews.length;
        setRecentReviews(reviews.slice(0, 5));
      }

      // Contacts
      let totalContacts = 0, newContacts = 0;
      if (contactsRes.status === 'fulfilled' && contactsRes.value?.data) {
        const contacts = Array.isArray(contactsRes.value.data)
          ? contactsRes.value.data
          : contactsRes.value.data?.items || [];
        totalContacts = contacts.length;
        newContacts = contacts.filter((c: any) => c.status === 'new').length;
        setRecentContacts(contacts.slice(0, 5));
      }

      setStats({
        totalProducts, yakMilkCount, puffTreatCount, highlandMixCount,
        totalReviews, totalContacts, newContacts, totalOrders: 0,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0c1e35] via-[#132f4f] to-[#0e2640] px-6 md:px-10 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, Admin
              </h1>
              <p className="text-blue-200/70 text-base">
                Here&apos;s what&apos;s happening with your Highland Dog Chew store today.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Store Online</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={FiPackage} label="All Products" value={stats.totalProducts} gradient="bg-gradient-to-br from-blue-600 to-blue-800" iconBg="bg-blue-500/40" />
            <StatCard icon={GiDogBowl} label="Yak Milk" value={stats.yakMilkCount} gradient="bg-gradient-to-br from-amber-500 to-orange-600" iconBg="bg-amber-400/40" />
            <StatCard icon={FiGrid} label="Puff Treats" value={stats.puffTreatCount} gradient="bg-gradient-to-br from-purple-500 to-purple-700" iconBg="bg-purple-400/40" />
            <StatCard icon={FiLayers} label="Highland Mix" value={stats.highlandMixCount} gradient="bg-gradient-to-br from-teal-500 to-teal-700" iconBg="bg-teal-400/40" />
            <StatCard icon={FiStar} label="Reviews" value={stats.totalReviews} gradient="bg-gradient-to-br from-yellow-500 to-amber-600" iconBg="bg-yellow-400/40" />
            <StatCard icon={FiMail} label="Messages" value={stats.totalContacts} gradient="bg-gradient-to-br from-rose-500 to-pink-600" iconBg="bg-rose-400/40" />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Contact Messages */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <FiMail className="text-rose-500" size={18} />
                </div>
                <h3 className="font-bold text-gray-900">Recent Messages</h3>
              </div>
              {stats.newContacts > 0 && (
                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  {stats.newContacts} new
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {recentContacts.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">No messages yet</div>
              ) : (
                recentContacts.map((contact: any) => (
                  <div key={contact._id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">{contact.name}</p>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full
                            ${contact.status === 'new' ? 'bg-blue-100 text-blue-700' : contact.status === 'read' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {contact.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs truncate">{contact.subject || contact.message}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">{formatDate(contact.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl">
                <FiStar className="text-amber-500" size={18} />
              </div>
              <h3 className="font-bold text-gray-900">Recent Reviews</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentReviews.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">No reviews yet</div>
              ) : (
                recentReviews.map((review: any) => (
                  <div key={review._id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{review.guestInfo?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <FiStar
                                key={s}
                                size={12}
                                className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs truncate">{review.comment || 'No comment'}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Add Product', href: '/dashboard/products', icon: FiPackage, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
              { label: 'Add Puff Treat', href: '/dashboard/puff-treats', icon: FiGrid, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
              { label: 'Add Highland Mix', href: '/dashboard/highland-mix', icon: FiLayers, color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
              { label: 'View Messages', href: '/dashboard/contact', icon: FiMail, color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
            ].map(action => (
              <a
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${action.color}`}
              >
                <action.icon size={20} />
                <span className="font-semibold text-sm">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
