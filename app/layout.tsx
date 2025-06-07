import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yudoku",
  description: "The Youtube Course Experience Platform",
  openGraph: {
    title: "Yudoku",
    description: "Track your progress through YouTube courses",
    url: "https://yudoku.vercel.app", // Replace with your site's URL
    siteName: "Yudoku",
    images: [
      {
        url: "homepage.png", // Replace with your image URL
        width: 1200, // Match your image's dimensions
        height: 630, // Match your image's dimensions
        alt: "Yudoku platform thumbnail", // Descriptive alt text
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Analytics />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
