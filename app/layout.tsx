import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: "Yudoku",
  description: "The Youtube Course Experience Platform",
  openGraph: {
    title: "Yudoku",
    description: "The Youtube Course Experience Platform",
    url: "https://yudoku.jerkeyray.com", // Replace with your site's URL
    siteName: "Yudoku",
    images: [
      {
        url: "/demo.png",
        width: 1200, // Match your image's dimensions
        height: 630, // Match your image's dimensions
        alt: "Yudoku platform thumbnail", // Descriptive alt text
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yudoku",
    description: "The Youtube Course Experience Platform",
    images: ["/demo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-black">
      <body className={`${inter.className} bg-black`} suppressHydrationWarning>
        <Analytics />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
