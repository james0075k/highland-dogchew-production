// Fallback for the site-wide promo. The homepage banner and /discount-code read
// the live setting from the backend via getPromoBanner() (edited in Dashboard →
// Homepage Banner); this constant is only used when the API can't be reached.
//
// Static copy still reads PROMO directly — the blog CTA (blog/guides.ts,
// blog/[slug]), the shipping-policy card and public/llms.txt. If you change the
// banner's code, update this constant too so those stay in step.
// The code must exist and be active in Dashboard → Promo Codes.
export const PROMO = {
  code: "FRANK10",
  percent: 10,
} as const;

export type PromoBanner = {
  enabled: boolean;
  leadText: string;
  code: string | null;
  discountLabel: string | null; // "10% off" / "£5 off"
};

export const PROMO_BANNER_TAG = "promo-banner";

const FALLBACK: PromoBanner = {
  enabled: true,
  leadText: `${PROMO.percent}% off every chew with code`,
  code: PROMO.code,
  discountLabel: `${PROMO.percent}% off`,
};

// Server-side only. Cached for 5 minutes and tagged so the admin page can
// refresh it immediately after a save (app/api/revalidate-promo-banner).
export async function getPromoBanner(): Promise<PromoBanner> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promo-banner`, {
      next: { revalidate: 300, tags: [PROMO_BANNER_TAG] },
    });
    if (!res.ok) return FALLBACK;
    const json = await res.json();
    const data = json?.data;
    if (!data || typeof data.enabled !== "boolean") return FALLBACK;
    return data.enabled && data.code
      ? { enabled: true, leadText: String(data.leadText), code: String(data.code), discountLabel: String(data.discountLabel) }
      : { enabled: false, leadText: "", code: null, discountLabel: null };
  } catch {
    return FALLBACK;
  }
}
