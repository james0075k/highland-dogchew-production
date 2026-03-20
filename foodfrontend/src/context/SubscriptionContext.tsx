'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;            // SUB-YYYYMMDD-XXXX
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  size: string;
  quantity: number;
  unitPrice: number;
  intervalLabel: string; // e.g. "Every 2 weeks"
  intervalWeeks: number; // computed from intervalLabel
  status: 'active' | 'paused' | 'cancelled';
  nextDelivery: string;  // ISO date
  createdAt: string;     // ISO date
  orderNumber?: string;
}

export type AddSubscriptionInput = Omit<Subscription, 'id' | 'status' | 'createdAt' | 'intervalWeeks' | 'nextDelivery'> & {
  nextDelivery?: string;
};

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (data: AddSubscriptionInput) => Subscription;
  pauseSubscription: (id: string) => void;
  resumeSubscription: (id: string) => void;
  cancelSubscription: (id: string) => void;
  skipNext: (id: string) => void;
  getUpcomingDates: (sub: Subscription, count?: number) => Date[];
  activeCount: number;
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hyk_subscriptions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIntervalWeeks(label: string): number {
  const wk = label.match(/every\s+(\d+)\s+weeks?/i);
  if (wk) return parseInt(wk[1], 10);
  const mo = label.match(/every\s+(\d+)\s+months?/i);
  if (mo) return parseInt(mo[1], 10) * 4;
  return 4;
}

function addWeeksToDate(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function generateId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SUB-${dateStr}-${rand}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSubscriptions(JSON.parse(stored));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions, hydrated]);

  const addSubscription = useCallback((data: AddSubscriptionInput): Subscription => {
    const intervalWeeks = parseIntervalWeeks(data.intervalLabel);
    const nextDelivery = data.nextDelivery || addWeeksToDate(new Date(), intervalWeeks).toISOString();
    const sub: Subscription = {
      ...data,
      intervalWeeks,
      nextDelivery,
      id: generateId(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [...prev, sub]);
    return sub;
  }, []);

  const pauseSubscription = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'paused' } : s))
    );
  }, []);

  const resumeSubscription = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'active' } : s))
    );
  }, []);

  const cancelSubscription = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s))
    );
  }, []);

  const skipNext = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = addWeeksToDate(new Date(s.nextDelivery), s.intervalWeeks);
        return { ...s, nextDelivery: next.toISOString() };
      })
    );
  }, []);

  const getUpcomingDates = useCallback((sub: Subscription, count = 3): Date[] => {
    const dates: Date[] = [];
    let current = new Date(sub.nextDelivery);
    for (let i = 0; i < count; i++) {
      dates.push(new Date(current));
      current = addWeeksToDate(current, sub.intervalWeeks);
    }
    return dates;
  }, []);

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        addSubscription,
        pauseSubscription,
        resumeSubscription,
        cancelSubscription,
        skipNext,
        getUpcomingDates,
        activeCount,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSubscriptionContext() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  return ctx;
}
