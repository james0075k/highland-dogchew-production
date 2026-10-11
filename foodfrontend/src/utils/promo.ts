// Single source of truth for the site-wide promo shown in the homepage banner,
// the /discount-code page, its FAQ schema and llms.txt (update that by hand).
// The code must exist and be active in Dashboard → Promo Codes with the same
// percentage, otherwise checkout rejects it.
export const PROMO = {
  code: "FRANK10",
  percent: 10,
} as const;
