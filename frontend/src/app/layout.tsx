import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StorefrontHeader } from "@/components/storefront-header";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commerce Checkout Catalog",
  description: "A portfolio-ready ecommerce catalog built with Next.js and Express.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <StorefrontHeader />
            <div className="flex-1">{children}</div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
