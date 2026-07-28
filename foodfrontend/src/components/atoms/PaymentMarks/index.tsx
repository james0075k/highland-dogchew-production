// Brand marks for the payment methods we accept.
//
// These are hand-authored inline SVGs rather than remote logos: no network
// request, no next.config image-host entry, and they inherit the amber/cream
// theme in dark mode. Used for the trust strips around checkout, the cart, the
// footer and product pages.
//
// NOTE: the icons *inside* Stripe's Payment Element are rendered by Stripe and
// cannot be replaced — these are only for our own surrounding UI.

import React from 'react';

export type PaymentMarkName =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'klarna'
  | 'paybybank'
  | 'amazonpay'
  | 'googlepay'
  | 'applepay'
  | 'revolut'
  | 'link';

type MarkProps = { className?: string };

// ─── Card networks ────────────────────────────────────────────────────────────

export function VisaMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 16" className={className} role="img" aria-label="Visa">
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="1"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#1A1F71"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 38 24" className={className} role="img" aria-label="Mastercard">
      <circle cx="15" cy="12" r="9" fill="#EB001B" />
      <circle cx="23" cy="12" r="9" fill="#F79E1B" />
      <path d="M19 5.8a9 9 0 0 1 0 12.4A9 9 0 0 1 19 5.8z" fill="#FF5F00" />
    </svg>
  );
}

export function AmexMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 24" className={className} role="img" aria-label="American Express">
      <rect width="48" height="24" rx="3" fill="#007BC1" />
      <text
        x="24"
        y="11"
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#FFFFFF"
      >
        AMERICAN
      </text>
      <text
        x="24"
        y="19"
        textAnchor="middle"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#FFFFFF"
      >
        EXPRESS
      </text>
    </svg>
  );
}

// ─── Buy now, pay later ───────────────────────────────────────────────────────

export function KlarnaMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 24" className={className} role="img" aria-label="Klarna">
      <rect width="48" height="24" rx="4" fill="#FFB3C7" />
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        letterSpacing="-0.2"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#0B051D"
      >
        Klarna
      </text>
    </svg>
  );
}

// ─── Bank / open banking ──────────────────────────────────────────────────────

export function PayByBankMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 24" className={className} role="img" aria-label="Pay by Bank">
      <g fill="currentColor">
        {/* Pediment */}
        <path d="M9 8.4 15.5 4.6 22 8.4v1.3H9z" />
        {/* Columns */}
        <rect x="10.6" y="11.1" width="1.9" height="6.2" rx="0.4" />
        <rect x="14.6" y="11.1" width="1.9" height="6.2" rx="0.4" />
        <rect x="18.5" y="11.1" width="1.9" height="6.2" rx="0.4" />
        {/* Base */}
        <rect x="8.6" y="18.4" width="13.8" height="1.7" rx="0.5" />
      </g>
      <text
        x="26"
        y="11.5"
        fontSize="6.6"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="currentColor"
      >
        PAY BY
      </text>
      <text
        x="26"
        y="19"
        fontSize="6.6"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="currentColor"
      >
        BANK
      </text>
    </svg>
  );
}

// ─── Wallets ──────────────────────────────────────────────────────────────────

export function AmazonPayMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 64 24" className={className} role="img" aria-label="Amazon Pay">
      <text
        x="4"
        y="13"
        fontSize="10"
        fontWeight="700"
        letterSpacing="-0.3"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="currentColor"
      >
        amazon
      </text>
      {/* Smile arc */}
      <path
        d="M5 16.4c5.2 3 13.6 3 18.8 0"
        stroke="#FF9900"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M23.8 15.2l1.5 1.4-2 .6z" fill="#FF9900" />
      <text
        x="29"
        y="16"
        fontSize="10"
        fontWeight="700"
        letterSpacing="-0.3"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="currentColor"
      >
        pay
      </text>
    </svg>
  );
}

export function GooglePayMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 24" className={className} role="img" aria-label="Google Pay">
      {/* Simplified 'G' roundel */}
      <path d="M13.4 11.1v2.3h3.3a2.9 2.9 0 0 1-1.2 1.9l1.9 1.5a5.7 5.7 0 0 0 1.7-4.3c0-.5 0-.9-.1-1.4z" fill="#4285F4" />
      <path d="M9.6 14.3a3.5 3.5 0 0 0 5.9.9l-1.9-1.5a3.5 3.5 0 0 1-5.3-1.1z" fill="#34A853" />
      <path d="M8.3 12.6a3.5 3.5 0 0 1 0-2.2l-2-1.5a5.8 5.8 0 0 0 0 5.2z" fill="#FBBC04" />
      <path d="M11.8 8.7a3.2 3.2 0 0 1 2.2.9l1.7-1.7a5.7 5.7 0 0 0-9.4 1.9l2 1.5a3.5 3.5 0 0 1 3.5-2.6z" fill="#EA4335" />
      <text
        x="22"
        y="16"
        fontSize="10.5"
        fontWeight="600"
        letterSpacing="-0.2"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="currentColor"
      >
        Pay
      </text>
    </svg>
  );
}

export function ApplePayMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 24" className={className} role="img" aria-label="Apple Pay">
      {/* Apple glyph */}
      <g fill="currentColor" transform="translate(11 5.2) scale(0.062)">
        <path d="M76 26c5-6 8-14 7-22-7 .3-15 4.6-20 10.6-4.4 5.3-8.2 13.6-7.2 21.6 7.8.6 15.4-3.9 20.2-10.2zM83 39c-11-.7-20 6.2-25 6.2S44 39.1 35 39.3c-11.6.2-22.3 6.7-28.2 17.1-12 20.8-3.1 51.6 8.6 68.5 5.7 8.3 12.6 17.6 21.6 17.3 8.6-.3 12-5.6 22.4-5.6s13.4 5.6 22.5 5.4c9.3-.2 15.2-8.4 20.9-16.8 6.6-9.6 9.3-18.9 9.4-19.4-.2-.1-18.1-7-18.3-27.7-.2-17.3 14.1-25.6 14.8-26-8.1-11.9-20.7-13.3-25.1-13.6z" />
      </g>
      <text
        x="22"
        y="16"
        fontSize="10.5"
        fontWeight="600"
        letterSpacing="-0.2"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="currentColor"
      >
        Pay
      </text>
    </svg>
  );
}

export function RevolutMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 24" className={className} role="img" aria-label="Revolut Pay">
      <rect width="48" height="24" rx="4" fill="#0A0A0A" />
      <text
        x="24"
        y="16.5"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill="#FFFFFF"
      >
        R
      </text>
    </svg>
  );
}

export function LinkMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 48 24" className={className} role="img" aria-label="Link">
      <rect width="48" height="24" rx="4" fill="#00D66F" />
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        letterSpacing="-0.2"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#011E0F"
      >
        link
      </text>
    </svg>
  );
}

// ─── Strip ────────────────────────────────────────────────────────────────────

const MARKS: Record<PaymentMarkName, { Mark: React.FC<MarkProps>; label: string }> = {
  visa:       { Mark: VisaMark,       label: 'Visa' },
  mastercard: { Mark: MastercardMark, label: 'Mastercard' },
  amex:       { Mark: AmexMark,       label: 'American Express' },
  klarna:     { Mark: KlarnaMark,     label: 'Klarna' },
  paybybank:  { Mark: PayByBankMark,  label: 'Pay by Bank' },
  amazonpay:  { Mark: AmazonPayMark,  label: 'Amazon Pay' },
  googlepay:  { Mark: GooglePayMark,  label: 'Google Pay' },
  applepay:   { Mark: ApplePayMark,   label: 'Apple Pay' },
  revolut:    { Mark: RevolutMark,    label: 'Revolut Pay' },
  link:       { Mark: LinkMark,       label: 'Link' },
};

/** Default order — cards first, then BNPL/bank, then wallets. */
export const DEFAULT_PAYMENT_MARKS: PaymentMarkName[] = [
  'visa', 'mastercard', 'amex', 'klarna', 'paybybank',
  'revolut', 'amazonpay', 'googlepay', 'applepay', 'link',
];

const SIZES = {
  sm: { tile: 'w-11 h-7 px-1.5', art: 'h-3.5' },
  md: { tile: 'w-12 h-8 px-2',   art: 'h-4'   },
} as const;

export default function PaymentMethodStrip({
  methods = DEFAULT_PAYMENT_MARKS,
  size = 'md',
  className = '',
}: {
  methods?: PaymentMarkName[];
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <ul className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {methods.map((name) => {
        const entry = MARKS[name];
        if (!entry) return null;
        const { Mark, label } = entry;
        return (
          <li
            key={name}
            title={label}
            className={`${s.tile} shrink-0 rounded-md bg-white dark:bg-[#241b16] border border-[#2E1F14]/10 dark:border-[#3a2c23] flex items-center justify-center text-[#2f1e14] dark:text-[#f5e9dc] shadow-[0_1px_2px_rgba(47,30,20,0.06)] transition-colors duration-200`}
          >
            <Mark className={`${s.art} w-auto max-w-full`} />
          </li>
        );
      })}
    </ul>
  );
}
