import type { Metadata } from 'next';
import '../../globals.css';

const BASE_URL = 'https://highlanddogchew.co.uk';

// Admin routes live in their own route group with their own <html> shell, so
// they inherit nothing from (main)/layout.tsx. Without an explicit og:image the
// link scrapers (WhatsApp, Slack, iMessage) fall back to whatever image they
// can find and end up showing a stock/placeholder logo — hence the explicit
// Highland Yak Chew branding below.
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Admin Login | Highland Yak Chew',
  description: 'Secure admin sign-in for the Highland Yak Chew store.',
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'Highland Yak Chew',
    title: 'Admin Login | Highland Yak Chew',
    description: 'Secure admin sign-in for the Highland Yak Chew store.',
    url: `${BASE_URL}/login`,
    images: [
      {
        url: '/og-image.jpg',
        width: 500,
        height: 500,
        alt: 'Highland Yak Chew',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Admin Login | Highland Yak Chew',
    description: 'Secure admin sign-in for the Highland Yak Chew store.',
    images: ['/og-image.jpg'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
