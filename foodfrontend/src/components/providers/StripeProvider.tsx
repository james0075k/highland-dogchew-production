'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
  theme?: 'stripe' | 'night' | 'flat';
}

export default function StripeProvider({
  clientSecret,
  children,
  theme = 'stripe',
}: StripeProviderProps) {
  const isDark = theme === 'night';

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        loader: 'auto',
        // Priority order for payment method tabs shown to the customer.
        // Only methods enabled in the Stripe Dashboard will actually appear.
        // Enabled: card, link, apple_pay, revolut_pay, bancontact, eps,
        //          amazon_pay, kakao_pay, naver_pay, payco, samsung_pay
        paymentMethodOrder: [
          'card',
          'apple_pay',
          'link',
          'revolut_pay',
          'amazon_pay',
          'bancontact',
          'eps',
        ],
        appearance: {
          theme,
          variables: {
            colorPrimary: isDark ? '#f5e9dc' : '#2f1e14',
            colorBackground: isDark ? '#2a2a2a' : '#ffffff',
            colorText: isDark ? '#f5e9dc' : '#2f1e14',
            colorTextSecondary: isDark ? '#c8b6a6' : '#555555',
            colorTextPlaceholder: isDark ? '#777777' : '#bbbbbb',
            colorIcon: isDark ? '#c8b6a6' : '#555555',
            colorIconTab: isDark ? '#c8b6a6' : '#555555',
            colorIconTabSelected: isDark ? '#f5e9dc' : '#2f1e14',
            colorIconTabHover: isDark ? '#f5e9dc' : '#2f1e14',
            colorIconCheckmark: isDark ? '#f5e9dc' : '#ffffff',
            colorDanger: '#ef4444',
            borderRadius: '4px',
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            fontSizeBase: '14px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              border: `1px solid ${isDark ? '#444444' : '#d0d0d0'}`,
              backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
              color: isDark ? '#f5e9dc' : '#2f1e14',
              boxShadow: 'none',
              outline: 'none',
            },
            '.Input:focus': {
              borderColor: isDark ? '#f5e9dc' : '#2f1e14',
              boxShadow: 'none',
            },
            '.Input::placeholder': {
              color: isDark ? '#666666' : '#bbbbbb',
            },
            '.Label': {
              color: isDark ? '#c8b6a6' : '#555555',
              fontWeight: '500',
            },
            '.Tab': {
              border: `1px solid ${isDark ? '#444444' : '#d0d0d0'}`,
              backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
              color: isDark ? '#c8b6a6' : '#555555',
              boxShadow: 'none',
            },
            '.Tab:hover': {
              backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
              color: isDark ? '#f5e9dc' : '#2f1e14',
            },
            '.Tab--selected': {
              border: `1px solid ${isDark ? '#f5e9dc' : '#2f1e14'}`,
              backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
              color: isDark ? '#f5e9dc' : '#2f1e14',
              boxShadow: 'none',
            },
            '.TabLabel': {
              color: isDark ? '#c8b6a6' : '#555555',
            },
            '.TabLabel--selected': {
              color: isDark ? '#f5e9dc' : '#2f1e14',
            },
            '.TabIcon': {
              fill: isDark ? '#c8b6a6' : '#555555',
            },
            '.TabIcon--selected': {
              fill: isDark ? '#f5e9dc' : '#2f1e14',
            },
            '.Block': {
              backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
              border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
            },
            '.BlockDivider': {
              backgroundColor: isDark ? '#3a3a3a' : '#e0e0e0',
            },
            '.Action': {
              color: isDark ? '#c8b6a6' : '#2f1e14',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
