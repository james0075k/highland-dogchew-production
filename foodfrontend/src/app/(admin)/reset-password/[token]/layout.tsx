import type { Metadata } from 'next';
import '../../../globals.css';

const BASE_URL = 'https://highlanddogchew.co.uk';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'Reset Password | Highland Yak Chew Admin',
  description: 'Set a new password for your Highland Yak Chew admin account.',
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'Highland Yak Chew',
    title: 'Reset Password | Highland Yak Chew Admin',
    description: 'Set a new password for your Highland Yak Chew admin account.',
    images: [
      { url: '/og-image.jpg', width: 500, height: 500, alt: 'Highland Yak Chew' },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Reset Password | Highland Yak Chew Admin',
    description: 'Set a new password for your Highland Yak Chew admin account.',
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
