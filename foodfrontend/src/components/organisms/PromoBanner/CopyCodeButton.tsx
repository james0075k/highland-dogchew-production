"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Copies the code and pre-fills the checkout promo field (CartContext keeps it
// for the session), so the customer doesn't have to paste it.
// `icon` renders a compact icon-only button (homepage strip); otherwise a text label.
export default function CopyCodeButton({
  code,
  className = "",
  icon = false,
}: {
  code: string;
  className?: string;
  icon?: boolean;
}) {
  const { setPromoCode } = useCart();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    setPromoCode(code);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard can be blocked (insecure context, permissions). The code is
      // still pre-filled at checkout, which is what actually matters.
    }
    setCopied(true);
  };

  const label = copied ? `${code} copied and added at checkout` : `Copy code ${code}`;

  return (
    <button type="button" onClick={handleCopy} aria-label={label} title={label} className={className}>
      {icon ? (
        copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      ) : copied ? (
        "Copied"
      ) : (
        "Copy"
      )}
    </button>
  );
}
