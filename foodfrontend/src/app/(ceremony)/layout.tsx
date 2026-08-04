import type { Metadata } from 'next';
import { Marcellus, DM_Sans } from 'next/font/google';

import './ceremony.css';

/* Marcellus is a Roman inscriptional face — the lettering of a dedication
   plaque. A ribbon cutting is a dedication, so the display type is doing the
   same job the ceremony is. DM Sans carries the utility text and keeps
   continuity with the rest of the shop. */
const marcellus = Marcellus({
  variable: '--font-ceremony-display',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-ceremony-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Opening Day — Highland Yak Chew',
  description: 'Cut the ribbon on the Highland Yak Chew shop.',
  robots: { index: false, follow: false },
};

export default function CeremonyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${marcellus.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
