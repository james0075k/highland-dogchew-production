import '../../globals.css';
import Head from 'next/head';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <title>Admin Login | Fusion Expeditions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 font-sans">
        {children}
      </body>
    </html>
  );
} 