import { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import DashboardShell from "../DashboardShell";
import "../../../app/globals.css";


const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard - Fusion Expeditions",
  description: "Admin Dashboard for managing Fusion Expeditions",
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