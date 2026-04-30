import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import CursorFollower from "@/components/CursorFollower";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Regal Event London – Excellence in Every Detail",
    template: "%s | Regal Event London",
  },
  description:
    "London's premier event decoration and planning company. Bespoke celebrations for birthdays, baby showers, engagements, corporate events and more.",
  keywords:
    "event planning London, event decoration, birthday party London, baby shower London, corporate events London, wedding decoration",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ backgroundColor:"#011F23", color:"#F9F4EE" }}>
        <Preloader />
        <CursorFollower />
        <div className="grain-overlay" aria-hidden="true" />
        <SmoothScroll>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
