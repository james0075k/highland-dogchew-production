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
  delivery: number;  // always 0 — delivery is a flat cart-level charge (DELIVERY_FLAT), not per item
  isSubscription?: boolean;
  subscriptionInterval?: string;
  maxStock?: number;
  tierMinQty?: number; // bulk tier bundle size (step for +/- in cart)
}

export interface PromoInfo {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discount: number; // calculated discount amount
}

interface CartContextType {
  items: CartItem[];
  /** False until the cart has been loaded from localStorage on mount. Use this to
   *  avoid premature "empty cart" decisions (e.g. redirecting from /checkout). */
  hydrated: boolean;
  addToCart: (item: Omit<CartItem, 'tax' | 'delivery'>) => void;
  removeFromCart: (productId: string, size: string, isSubscription?: boolean) => void;
  updateQuantity: (productId: string, size: string, quantity: number, isSubscription?: boolean) => void;
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
// VAT is already baked into product catalogue prices, so we don't add it again
// at the cart level. The field stays in the schema (set to 0) so existing
// orders and webhook payloads keep their shape.
const TAX_RATE = 0;
const DELIVERY_FLAT = 1.99;      // single flat delivery for the entire cart
const STORAGE_KEY = 'highland-dogchew-cart';
// Bump CART_SCHEMA_VERSION whenever the CartItem shape changes in a way that
// would break old localStorage payloads (renaming/required fields, etc.).
// On mismatch we clear the stored cart rather than feed malformed data into
// the checkout flow.
const CART_SCHEMA_VERSION = 2;

// --- Helper: enrich each item with its line-level tax (delivery is cart-level, not per-item) ---
function enrichItem(item: Omit<CartItem, 'tax' | 'delivery'>): CartItem {
  const lineTotal = item.unitPrice * item.quantity;
  return {
    ...item,
    tax: +(lineTotal * TAX_RATE).toFixed(2),
    delivery: 0, // delivery is charged once at cart level
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
        const parsed = JSON.parse(stored);
        // Versioned payload: { v: number, items: CartItem[] }
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.v === CART_SCHEMA_VERSION &&
          Array.isArray(parsed.items)
        ) {
          setItems(parsed.items);
        } else {
          // Unknown / legacy shape — clear it rather than send malformed data to checkout
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  // Persist cart to localStorage on change (skip initial hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: CART_SCHEMA_VERSION, items }),
      );
    }
  }, [items, hydrated]);

  const addToCart = useCallback((newItem: Omit<CartItem, 'tax' | 'delivery'>) => {
    setItems((prev) => {
      // Different tiers, subscriptions, and sizes are always separate line items
      const idx = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          !!i.isSubscription === !!newItem.isSubscription &&
          (i.tierMinQty ?? 0) === (newItem.tierMinQty ?? 0)
      );

      if (idx >= 0) {
        // Update existing item quantity
        const updated = [...prev];
        const existing = updated[idx];
        let newQty = existing.quantity + newItem.quantity;
        const stock = newItem.maxStock ?? existing.maxStock;
        if (stock != null) newQty = Math.min(newQty, stock);
        const merged = {
          ...existing,
          quantity: newQty,
          ...(newItem.maxStock != null ? { maxStock: newItem.maxStock } : {}),
        };
        updated[idx] = enrichItem(merged);
        return updated;
      }

      // Add new item
      return [...prev, enrichItem(newItem)];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size: string, isSubscription?: boolean) => {
    setItems((prev) => prev.filter(
      (i) => !(
        i.productId === productId &&
        i.size === size &&
        (isSubscription === undefined || !!i.isSubscription === !!isSubscription)
      )
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, quantity: number, isSubscription?: boolean) => {
    setItems((prev) => {
      const next = prev.map((i) => {
        if (
          i.productId === productId &&
          i.size === size &&
          (isSubscription === undefined || !!i.isSubscription === !!isSubscription)
        ) {
          const minQty = i.tierMinQty || 1;
          if (quantity < minQty) return null;
          const cappedQty = i.maxStock != null ? Math.min(quantity, i.maxStock) : quantity;
          return enrichItem({ ...i, quantity: cappedQty });
        }
        return i;
      });
      return next.filter((i): i is CartItem => i !== null);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoInfo(null);
    setPromoCode('');
  }, []);

  // Normalize a code the way the backend will: strip whitespace, uppercase,
  // drop any character outside [A-Z0-9_-]. Doing this client-side means a
  // paste with leading/trailing spaces or stray punctuation still hits the
  // server in a form that can possibly validate.
  const normalizeCode = (raw: string): string =>
    raw.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);

  // Apply promo code via backend
  const applyPromoCode = useCallback(async (): Promise<string | null> => {
    const code = normalizeCode(promoCode);
    if (!code) return 'Please enter a promo code';
    if (code.length < 3) return 'Promo code is too short';

    const currentSubtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    if (currentSubtotal <= 0) return 'Add an item to your cart before applying a code';

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/promo/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            subtotal: +currentSubtotal.toFixed(2),
          }),
        }
      );

      // Rate-limit and other non-JSON failures land here.
      let data: { success?: boolean; message?: string; data?: PromoInfo } | null = null;
      try { data = await res.json(); } catch { /* non-JSON body */ }

      if (res.status === 429) {
        return 'Too many attempts — please wait a minute and try again.';
      }
      if (!res.ok || !data?.success || !data.data) {
        return data?.message || 'This promo code is invalid or has expired.';
      }

      setPromoInfo({
        code: data.data.code,
        discountType: data.data.discountType,
        discountValue: data.data.discountValue,
        discount: data.data.discount,
      });

      return null;
    } catch {
      return 'Failed to verify promo code. Please try again.';
    }
  }, [promoCode, items]);

  const removePromoCode = useCallback(() => {
    setPromoInfo(null);
    setPromoCode('');
  }, []);

  // Computed totals — mirrors backend resolveAndCalculate exactly.
  // Tax + delivery are computed on the full subtotal, then the promo discount
  // is applied to the resulting pre-discount grand total. "10% off" / "£X off"
  // therefore reduces the final amount the customer pays.
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = +items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0).toFixed(2);
  const totalTax = +(subtotal * TAX_RATE).toFixed(2);
  const totalDelivery = items.length > 0 ? +DELIVERY_FLAT.toFixed(2) : 0;
  const preDiscountTotal = +(subtotal + totalTax + totalDelivery).toFixed(2);
  // Recompute discount from discountType/discountValue against the *current*
  // pre-discount total, not the stale snapshot taken when applyPromoCode ran.
  const discount = promoInfo
    ? (promoInfo.discountType === 'percentage'
        ? +(preDiscountTotal * (promoInfo.discountValue / 100)).toFixed(2)
        : +Math.min(promoInfo.discountValue, preDiscountTotal).toFixed(2))
    : 0;
  const grandTotal = +(preDiscountTotal - discount).toFixed(2);

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated,
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
