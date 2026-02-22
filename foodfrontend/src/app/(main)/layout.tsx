// layout.tsx - Fixed version without fetchAPI
export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { DM_Sans, Playfair_Display, Cormorant_Garamond, DM_Serif_Display } from "next/font/google";

import "../../app/globals.css";
import Footer from "@/components/organisms/Footer";
import Navbar from "@/components/organisms/NavBar";
import GoToTop from "@/components/organisms/GoToTop/GoToTop";
import WhatsappWidget from "@/components/organisms/WhatsappWidget/WhatsappWidget";
import TopNavbar from "@/components/organisms/NavBar/TopNavbar/TopNavbar";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/providers/ThemeProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-antique-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Highland Dogchew ",
  description: "We are here to fulfill your desire to experience different kinds of adventure activities.",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${playfair.variable} ${cormorant.variable} ${dmSerifDisplay.variable}`}>
      <body className="antialiased">
        <ThemeProvider>
          <CartProvider>
            {/* <TopNavbar/> */}
            <Navbar />
            {children}
            <Footer />
            <GoToTop/>
            {/* <ChatbotWidget/> */}
            <WhatsappWidget/>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
