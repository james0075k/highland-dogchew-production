import { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import DashboardShell from "../DashboardShell";
import "../../../app/globals.css";


const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://highlanddogchew.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Dashboard — Highland Yak Chew",
  description: "Admin dashboard for managing the Highland Yak Chew store",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Highland Yak Chew",
    title: "Dashboard — Highland Yak Chew",
    description: "Admin dashboard for managing the Highland Yak Chew store",
    url: `${BASE_URL}/dashboard`,
    images: [
      { url: "/og-image.jpg", width: 500, height: 500, alt: "Highland Yak Chew" },
    ],
  },
  twitter: {
    card: "summary",
    title: "Dashboard — Highland Yak Chew",
    description: "Admin dashboard for managing the Highland Yak Chew store",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current path from headers (works in server components)


  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <DashboardShell>
          {children}
        </DashboardShell>
      </body>
    </html>
  );
}