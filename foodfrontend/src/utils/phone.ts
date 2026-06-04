// Normalizes a phone number into the digits-only international form that
// wa.me / api.whatsapp.com require (country code + number, no '+', no spaces).
//
// WhatsApp will NOT open a chat from a national-format number like
// "07429325241" — it needs "447429325241". This handles the common cases:
//   "+44 7429 325241" -> "447429325241"
//   "0044 7429 325241" -> "447429325241"
//   "07429 325241"      -> "447429325241"  (leading 0 = national → add country code)
//   "447429325241"      -> "447429325241"  (already international)
//
// defaultCountryCode is the country to assume for national-format numbers
// (those starting with a single 0). Highland Yak Chew is UK-based, so "44".
export function toWhatsAppNumber(raw: string, defaultCountryCode = '44'): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  const hadPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (hadPlus) return digits;                 // +44 7429... -> 447429...
  if (digits.startsWith('00')) return digits.slice(2);             // 0044... -> 44...
  if (digits.startsWith('0')) return defaultCountryCode + digits.slice(1); // 07429... -> 447429...
  return digits;                              // assume already has country code
}

/** Build a full wa.me URL from a raw phone number, optionally with prefilled text. */
export function toWhatsAppUrl(raw: string, text?: string): string {
  const number = toWhatsAppNumber(raw);
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${number}${query}`;
}
