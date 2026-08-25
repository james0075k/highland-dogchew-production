import type { StripeError } from '@stripe/stripe-js';

// ─── Shape shown to the customer ──────────────────────────────────────────────
//
// `message` is one short sentence: what happened. `hint` is one short sentence:
// what to do next. `code` is only set when it's a real Stripe reason worth
// quoting to support — never an internal HTTP/transport label.
//
// Keep both strings short. A wall of red text reads as a broken site.
//
export interface FriendlyError {
  message: string;
  hint?: string;
  code?: string;
}

const TRY_AGAIN    = 'Please try again — you have not been charged.';
const OTHER_METHOD = 'Try another card or payment method.';
const REFRESH      = 'Refresh the page to start again.';

// ─── Stripe `decline_code` (the reason the *bank* gave) ───────────────────────
//
// Fraud-flavoured codes are deliberately collapsed into one neutral message:
// Stripe's own guidance is not to tell the cardholder a card was reported
// lost/stolen/fraudulent, because that information belongs to their bank.
//
const DECLINE_CODES: Record<string, FriendlyError> = {
  insufficient_funds: {
    message: 'Your card was declined — insufficient funds.',
    hint: OTHER_METHOD,
  },
  expired_card: {
    message: 'That card has expired.',
    hint: 'Check the expiry date, or use another card.',
  },
  incorrect_cvc: {
    message: 'The security code is incorrect.',
    hint: 'Check the 3 digits on the back of your card.',
  },
  invalid_cvc: {
    message: 'The security code is invalid.',
    hint: 'Check the 3 digits on the back of your card.',
  },
  incorrect_number: {
    message: 'That card number isn’t valid.',
    hint: 'Check the number on the front of your card.',
  },
  invalid_number: {
    message: 'That card number isn’t valid.',
    hint: 'Check the number on the front of your card.',
  },
  invalid_expiry_month: {
    message: 'That expiry date isn’t valid.',
    hint: 'Enter it as MM / YY.',
  },
  invalid_expiry_year: {
    message: 'That expiry date isn’t valid.',
    hint: 'Enter it as MM / YY.',
  },
  incorrect_zip: {
    message: 'The postcode doesn’t match your card.',
    hint: 'Check the billing postcode in your address.',
  },
  card_not_supported: {
    message: 'This card can’t be used for this purchase.',
    hint: OTHER_METHOD,
  },
  currency_not_supported: {
    message: 'This card can’t be charged in pounds.',
    hint: OTHER_METHOD,
  },
  duplicate_transaction: {
    message: 'This looks like a duplicate payment.',
    hint: 'Check your email for a confirmation first.',
  },
  authentication_required: {
    message: 'Your bank needs to verify this payment.',
    hint: 'Try again and complete your bank’s verification.',
  },
  card_velocity_exceeded: {
    message: 'Your card has hit its spending limit.',
    hint: 'Contact your bank, or use another card.',
  },
  withdrawal_count_limit_exceeded: {
    message: 'Your card has hit its spending limit.',
    hint: 'Contact your bank, or use another card.',
  },
  processing_error: {
    message: 'Your bank couldn’t process the payment.',
    hint: TRY_AGAIN,
  },
  issuer_not_available: {
    message: 'Your bank couldn’t be reached.',
    hint: TRY_AGAIN,
  },
  try_again_later: {
    message: 'Your bank asked us to retry this later.',
    hint: 'Wait a minute, or use another payment method.',
  },
  reenter_transaction: {
    message: 'Your bank couldn’t process the payment.',
    hint: TRY_AGAIN,
  },
  testmode_decline: {
    message: 'That’s a test card, so it was declined.',
    hint: 'Please use a real card.',
  },
  // Fraud / bank-block family — one neutral message, no detail.
  fraudulent:                        declinedByBank(),
  lost_card:                         declinedByBank(),
  stolen_card:                       declinedByBank(),
  pickup_card:                       declinedByBank(),
  restricted_card:                   declinedByBank(),
  security_violation:                declinedByBank(),
  merchant_blacklist:                declinedByBank(),
  stop_payment_order:                declinedByBank(),
  revocation_of_authorization:       declinedByBank(),
  revocation_of_all_authorizations:  declinedByBank(),
  // "No reason given" family.
  generic_decline:         declinedNoReason(),
  do_not_honor:            declinedNoReason(),
  do_not_try_again:        declinedNoReason(),
  call_issuer:             declinedNoReason(),
  approve_with_id:         declinedNoReason(),
  not_permitted:           declinedNoReason(),
  transaction_not_allowed: declinedNoReason(),
  service_not_allowed:     declinedNoReason(),
};

function declinedByBank(): FriendlyError {
  return {
    message: 'Your bank declined this payment.',
    hint: 'Contact your bank, or use another card.',
  };
}

function declinedNoReason(): FriendlyError {
  return {
    message: 'Your card was declined.',
    hint: OTHER_METHOD,
  };
}

// ─── Stripe `code` (the reason *Stripe* gave) ─────────────────────────────────
const ERROR_CODES: Record<string, FriendlyError> = {
  payment_intent_authentication_failure: {
    message: 'We couldn’t verify this payment with your bank.',
    hint: 'Try again, or use another card.',
  },
  setup_intent_authentication_failure: {
    message: 'We couldn’t verify this card with your bank.',
    hint: 'Try again, or use another card.',
  },
  payment_intent_unexpected_state: {
    message: 'This payment has already been processed.',
    hint: 'Check your email for the confirmation.',
  },
  payment_intent_payment_attempt_failed: {
    message: 'The payment didn’t go through.',
    hint: OTHER_METHOD,
  },
  amount_too_small: {
    message: 'The total is below the £0.30 minimum.',
    hint: 'Add another item to your basket.',
  },
  amount_too_large: {
    message: 'The total is above the maximum for one payment.',
    hint: 'Contact us and we’ll help you place it.',
  },
  postal_code_invalid: {
    message: 'That postcode isn’t valid.',
    hint: 'Enter it like SW1A 1AA.',
  },
  email_invalid: {
    message: 'That email address isn’t valid.',
    hint: 'Check it so we can send your confirmation.',
  },
  resource_missing: {
    message: 'This checkout session has expired.',
    hint: REFRESH,
  },
  payment_method_unactivated: {
    message: 'That payment method isn’t available for this order.',
    hint: 'Please choose another one.',
  },
  payment_method_not_available: {
    message: 'That payment method isn’t available right now.',
    hint: 'Please choose another one.',
  },
  balance_insufficient: {
    message: 'That payment method has insufficient funds.',
    hint: OTHER_METHOD,
  },
  card_declined: declinedNoReason(), // only reached when decline_code is absent
  processing_error: {
    message: 'Your bank couldn’t process the payment.',
    hint: TRY_AGAIN,
  },
  expired_card:         DECLINE_CODES.expired_card,
  incorrect_cvc:        DECLINE_CODES.incorrect_cvc,
  invalid_cvc:          DECLINE_CODES.invalid_cvc,
  incorrect_number:     DECLINE_CODES.incorrect_number,
  invalid_number:       DECLINE_CODES.invalid_number,
  invalid_expiry_month: DECLINE_CODES.invalid_expiry_month,
  invalid_expiry_year:  DECLINE_CODES.invalid_expiry_year,
  incorrect_zip:        DECLINE_CODES.incorrect_zip,
};

// ─── Stripe `type` — last resort when neither code matched ────────────────────
const ERROR_TYPES: Record<string, FriendlyError> = {
  card_error: declinedNoReason(),
  invalid_request_error: {
    message: 'We couldn’t take this payment.',
    hint: `Nothing was charged. ${REFRESH}`,
  },
  api_connection_error: {
    message: 'We couldn’t reach the payment network.',
    hint: 'Check your connection and try again.',
  },
  api_error: {
    message: 'Our payment provider is having trouble.',
    hint: 'Please try again in a minute.',
  },
  rate_limit_error: {
    message: 'Too many attempts in a short time.',
    hint: 'Wait a minute, then try again.',
  },
  authentication_error: {
    message: 'Card payments are temporarily unavailable.',
    hint: 'Please contact us and we’ll take your order.',
  },
  idempotency_error: {
    message: 'This payment was already submitted.',
    hint: 'Check your email before trying again.',
  },
};

const GENERIC_FAILURE: FriendlyError = {
  message: 'The payment didn’t go through.',
  hint: TRY_AGAIN,
};

// ─── Keep developer text off the page ─────────────────────────────────────────
//
// Stripe's integration errors are written for whoever wrote the code ("You
// specified 'never' for fields.billing_details.address…") and are several
// sentences long. They must never reach a customer: they're alarming, useless
// to act on, and leak how the integration is wired. They go to the console
// instead, where the person who can fix them will see them.
//
const DEVELOPER_TEXT = /confirmParams|payment_method_data|billing_details|fields\.|elements|stripe\.|You specified|IntegrationError|parameter|API key|integration/i;
const MAX_MESSAGE_LENGTH = 90;

function isCustomerSafe(message?: string | null): message is string {
  if (!message) return false;
  if (message.length > MAX_MESSAGE_LENGTH) return false;
  return !DEVELOPER_TEXT.test(message);
}

/**
 * Turns a Stripe.js error into one short line a customer can act on.
 *
 * Priority: `decline_code` (the bank's reason) → `code` (Stripe's reason) →
 * Stripe's own `message` when it's short and customer-facing (e.g. "Your card
 * number is incomplete.") → `type`. The raw error always goes to the console.
 */
export function stripeErrorToFriendly(err?: StripeError | null): FriendlyError {
  if (!err) return GENERIC_FAILURE;

  if (typeof console !== 'undefined') {
    console.error('[checkout] Stripe error', err);
  }

  const declineCode = (err as StripeError & { decline_code?: string }).decline_code;
  const code        = err.code;
  // Only quote a reference the customer could usefully give us over the phone.
  const reference   = [code, declineCode].filter(Boolean).join(' · ') || undefined;

  const matched =
    (declineCode && DECLINE_CODES[declineCode]) ||
    (code && ERROR_CODES[code]) ||
    null;

  if (matched) return { ...matched, code: reference };

  // Field-level validation errors ("Your card number is incomplete.") already
  // read well and are more specific than anything we'd substitute.
  if (err.type === 'validation_error' && isCustomerSafe(err.message)) {
    return { message: err.message };
  }

  const byType = ERROR_TYPES[err.type];
  if (byType) return { ...byType, code: reference };

  if (isCustomerSafe(err.message)) return { message: err.message, hint: TRY_AGAIN, code: reference };

  return { ...GENERIC_FAILURE, code: reference };
}

// ─── Transport-level failures (fetch never returned a response) ───────────────
export function networkErrorToFriendly(err: unknown): FriendlyError {
  if (typeof console !== 'undefined') {
    console.error('[checkout] request failed', err);
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { message: 'You’re offline.', hint: 'Reconnect and try again — nothing was charged.' };
  }
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { message: 'That timed out.', hint: TRY_AGAIN };
  }
  if (err instanceof TypeError) {
    return { message: 'We couldn’t reach our server.', hint: 'Check your connection and try again.' };
  }
  if (err instanceof Error && isCustomerSafe(err.message)) {
    return { message: err.message, hint: TRY_AGAIN };
  }
  return GENERIC_FAILURE;
}

// ─── Our own API's 4xx/5xx bodies ─────────────────────────────────────────────
//
// Most backend messages are already written for customers (stock warnings,
// promo problems) so they're passed through. The handful that name request
// fields are developer-facing, so they're rewritten here.
//
const SERVER_MESSAGE_RULES: Array<{ test: RegExp; error: FriendlyError }> = [
  {
    test: /paymentIntentId is required|updateToken is required|Invalid update token|Invalid payment reference/i,
    error: { message: 'This checkout session has expired.', hint: REFRESH },
  },
  {
    test: /already been completed or cancelled/i,
    error: {
      message: 'This payment was already completed.',
      hint: 'Check your email for the confirmation.',
    },
  },
  {
    // Must precede the generic `^shipping\.` rule below — `.find()` takes the
    // first match, and this one carries the actionable hint.
    test: /UK addresses only/i,
    error: {
      message: 'We currently deliver to UK addresses only.',
      hint: 'Use a UK delivery address, or contact us if you’d like us to ship further afield.',
      code: 'shipping_country_unsupported',
    },
  },
  {
    test: /valid UK postcode/i,
    error: {
      message: 'That doesn’t look like a valid UK postcode.',
      hint: 'Enter it like SW1A 1AA.',
      code: 'shipping_postcode_invalid',
    },
  },
  {
    test: /^customer\.|^shipping\.|customer\.email|shipping\.address/i,
    error: {
      message: 'Some of your details are missing.',
      hint: 'Go back and check your name, email and address.',
    },
  },
  {
    test: /"items"|"promoCode"|is not allowed|must be a|is required$/i,
    error: {
      message: 'There’s a problem with your basket.',
      hint: 'Return to the cart and try again.',
    },
  },
];

export function apiErrorToFriendly(status: number, serverMessage?: string, code?: string): FriendlyError {
  // The backend forwards Stripe's code/decline_code as `errorCode`, so a Stripe
  // rejection raised server-side gets exactly the same wording as one raised in
  // the browser. Reversed because decline_code is the more specific of the two.
  if (code) {
    for (const part of code.split('·').map((c) => c.trim()).reverse()) {
      const matched = DECLINE_CODES[part] || ERROR_CODES[part];
      if (matched) return { ...matched, code };
    }
  }

  if (status === 401 || status === 403) {
    return { message: 'This checkout session has expired.', hint: REFRESH };
  }
  if (status === 408) {
    return { message: 'That timed out.', hint: TRY_AGAIN };
  }
  if (status === 429) {
    return { message: 'Too many attempts in a short time.', hint: 'Wait a minute, then try again.' };
  }
  if (status >= 500) {
    return { message: 'Something went wrong on our side.', hint: `Nothing was charged. ${TRY_AGAIN}` };
  }

  if (serverMessage) {
    const rule = SERVER_MESSAGE_RULES.find((r) => r.test.test(serverMessage));
    if (rule) return rule.error;
    // A 402 means Stripe rejected it server-side; that message is customer-facing.
    if (isCustomerSafe(serverMessage)) return { message: serverMessage, code };
  }

  return { message: 'We couldn’t complete that.', hint: TRY_AGAIN, code };
}

// ─── JSON POST with real error reporting ──────────────────────────────────────
//
// Wraps the three ways a call can fail — transport, non-JSON body, and an
// error payload — so no call site has to fall back to "something went wrong".
//
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: FriendlyError };

export async function postJson<T = unknown>(
  url: string,
  body: unknown,
  timeoutMs = 20000,
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    return { ok: false, error: networkErrorToFriendly(e) };
  } finally {
    clearTimeout(timer);
  }

  // Read as text first: a proxy 502/504 returns HTML, and res.json() would throw
  // an unhelpful parse error over the real status.
  let payload: { success?: boolean; message?: string; errorCode?: string; data?: T } | null = null;
  try {
    const text = await res.text();
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!res.ok || payload?.success === false) {
    if (typeof console !== 'undefined') {
      console.error('[checkout] API error', res.status, payload?.message ?? '(no body)');
    }
    return { ok: false, error: apiErrorToFriendly(res.status, payload?.message, payload?.errorCode) };
  }
  if (!payload || payload.success !== true) {
    if (typeof console !== 'undefined') {
      console.error('[checkout] unexpected API response', res.status, payload);
    }
    return {
      ok: false,
      error: { message: 'We got an unexpected response.', hint: `Nothing was charged. ${REFRESH}` },
    };
  }

  return { ok: true, data: (payload.data ?? ({} as T)) as T };
}
