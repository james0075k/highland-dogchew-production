import type { Metadata } from 'next';
import '../../globals.css';

const BASE_URL = 'https://highlanddogchew.co.uk';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Forgot Password | Highland Yak Chew Admin',
  description: 'Reset your Highland Yak Chew admin password.',
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'Highland Yak Chew',
    title: 'Forgot Password | Highland Yak Chew Admin',
    description: 'Reset your Highland Yak Chew admin password.',
    url: `${BASE_URL}/forgot-password`,
    images: [
      { url: '/og-image.jpg', width: 500, height: 500, alt: 'Highland Yak Chew' },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Forgot Password | Highland Yak Chew Admin',
    description: 'Reset your Highland Yak Chew admin password.',
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
