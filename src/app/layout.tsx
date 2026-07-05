import type { Metadata, Viewport } from "next";
import { Archivo_Narrow, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

// Free, self-hosted stand-in for the licensed HelveticaNeueLTPro-cn —
// a true condensed grotesque (not a squished Arial), so it renders the
// same for every visitor regardless of what's installed on their device.
const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EShop — Handcrafted Clothing",
    template: "%s | EShop",
  },
  description: "Handcrafted clothing made with care in Lithuania.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets fixed/sticky bars extend under the iOS notch/home-indicator area
  // so we can pad them precisely with the pt-safe/pb-safe utilities.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoNarrow.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
