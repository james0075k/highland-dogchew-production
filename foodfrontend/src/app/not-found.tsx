import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  // suppressHydrationWarning matches (main)/layout.tsx — needed because browser
  // extensions and the theme provider mutate <html> attributes/classes after SSR.
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body className="bg-[#FDFAF6] dark:bg-[#1a1410] min-h-screen flex flex-col items-center justify-center px-6 text-center font-sans transition-colors duration-300">
        <div className="max-w-md w-full">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logos.jpeg"
              alt="Highland Yakchew"
              width={90}
              height={90}
              className="rounded-full"
            />
          </div>

          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C4A882] dark:text-amber-400 mb-3">
            404 — Page Not Found
          </p>
          <h1 className="text-5xl font-bold text-[#2E1F14] dark:text-[#f5e9dc] mb-4 leading-tight">
            Oops, this page<br />went for a walk.
          </h1>
          <p className="text-[#7A5C4F] dark:text-[#c8b6a6] text-base leading-relaxed mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get your dog back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-[#2E1F14] hover:bg-[#3D2B1C] dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/products"
              className="border border-[#2E1F14]/30 hover:border-[#2E1F14] dark:border-[#3a2c23] dark:hover:border-amber-500 text-[#2E1F14] dark:text-[#f5e9dc] text-sm font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Shop Products
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-[#2E1F14]/10 dark:border-[#3a2c23]">
            <p className="text-xs text-[#7A5C4F] dark:text-[#c8b6a6] uppercase tracking-widest font-semibold mb-4">
              Quick Links
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              {[
                { label: 'Yak Milk Chews', href: '/products/yak-chews' },
                { label: 'Puff Treats',    href: '/products/puff-treats' },
                { label: 'Highland Mix',   href: '/products/highland-mix' },
                { label: 'Contact Us',     href: '/contact' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[#7A5C4F] dark:text-[#c8b6a6] hover:text-[#2E1F14] dark:hover:text-amber-400 transition-colors underline underline-offset-4"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
