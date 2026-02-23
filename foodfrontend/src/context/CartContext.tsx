'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// --- Types ---
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  tax: number;       // per-item tax
  delivery: number;  // per-item delivery
  isSubscription?: boolean;
  subscriptionInterval?: string;
}

export interface PromoInfo {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discount: number; // calculated discount amount
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'tax' | 'delivery'>) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  totalTax: number;
  totalDelivery: number;
  grandTotal: number;
  promoCode: string;
  promoInfo: PromoInfo | null;
  setPromoCode: (code: string) => void;
  applyPromoCode: () => Promise<string | null>;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Constants ---
const TAX_RATE = 0.20;       // 20% VAT
const DELIVERY_PER_ITEM = 2.99;
const STORAGE_KEY = 'highland-dogchew-cart';

// --- Helper: compute tax & delivery for each item ---
function enrichItem(item: Omit<CartItem, 'tax' | 'delivery'>): CartItem {
  const lineTotal = item.unitPrice * item.quantity;
  return {
    ...item,
    tax: +(lineTotal * TAX_RATE).toFixed(2),
    delivery: +DELIVERY_PER_ITEM.toFixed(2),
  };
}

// --- Provider ---
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoInfo, setPromoInfo] = useState<PromoInfo | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        setItems(parsed);
      }
    } catch {
      // ignore corrupt data
    }
    setHydrated(true);
  }, []);

  // Persist cart to localStorage on change (skip initial hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addToCart = useCallback((newItem: Omit<CartItem, 'tax' | 'delivery'>) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size
      );

      if (idx >= 0) {
        // Update existing item quantity
        const updated = [...prev];
        const existing = updated[idx];
        const merged = {
          ...existing,
          quantity: existing.quantity + newItem.quantity,
        };
        updated[idx] = enrichItem(merged);
        return updated;
      }

      // Add new item
      return [...prev, enrichItem(newItem)];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter(
      (i) => !(i.productId === productId && i.size === size)
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.size === size) {
          return enrichItem({ ...i, quantity });
        }
        return i;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoInfo(null);
    setPromoCode('');
  }, []);

  // Apply promo code via backend
  const applyPromoCode = useCallback(async (): Promise<string | null> => {
    if (!promoCode.trim()) return 'Please enter a promo code';

    const currentSubtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/promo/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: promoCode.trim(),
            subtotal: +currentSubtotal.toFixed(2),
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        return data.message || 'Invalid promo code';
      }

      setPromoInfo({
        code: data.data.code,
        discountType: data.data.discountType,
        discountValue: data.data.discountValue,
        discount: data.data.discount,
      });

      return null; // no error
    } catch {
      return 'Failed to verify promo code. Please try again.';
    }
  }, [promoCode, items]);

  const removePromoCode = useCallback(() => {
    setPromoInfo(null);
    setPromoCode('');
  }, []);

  // Computed totals
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = +items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0).toFixed(2);
  const discount = promoInfo ? promoInfo.discount : 0;
  const discountedSubtotal = +(subtotal - discount).toFixed(2);
  const totalTax = +(discountedSubtotal * TAX_RATE).toFixed(2);
  const totalDelivery = +items.reduce((sum, i) => sum + i.delivery, 0).toFixed(2);
  const grandTotal = +(discountedSubtotal + totalTax + totalDelivery).toFixed(2);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        discount,
        totalTax,
        totalDelivery,
        grandTotal,
        promoCode,
        promoInfo,
        setPromoCode,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// --- Hook ---
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
