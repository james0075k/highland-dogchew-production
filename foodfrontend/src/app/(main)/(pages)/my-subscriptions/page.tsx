'use client';

import React from 'react';
import Link from 'next/link';
import MySubscriptions from '@/components/subscription/MySubscriptions';
import { RefreshCcw, ShoppingBag, Truck, Mail } from 'lucide-react';

export default function MySubscriptionsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#1a1410] transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <span
              className="text-[1.9rem] font-extralight tracking-[0.18em] text-[#2f1e14] dark:text-[#f5e9dc] lowercase leading-none select-none"
              style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif', fontWeight: 200 }}
            >
              Highland Yak Chew
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-3 mb-1">
            <RefreshCcw className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">Subscription Management</p>
          </div>
          <p className="text-xs text-[#aaa] dark:text-[#555] tracking-wide">
            Manage, pause or cancel your recurring deliveries
          </p>
        </div>

        {/* Subscription component */}
        <MySubscriptions />

        {/* Footer links */}
        <div className="mt-10 pt-6 border-t border-[#e8e3dc] dark:border-[#2e2420] flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {[
            { label: 'My Orders',    href: '/my-orders',    icon: ShoppingBag },
            { label: 'Track Order',  href: '/track-order',  icon: Truck },
            { label: 'Contact',      href: '/contact',      icon: Mail },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={label} href={href}
              className="flex items-center gap-1 text-[11px] text-[#aaa] dark:text-[#555] hover:text-[#2f1e14] dark:hover:text-[#f5e9dc] transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
