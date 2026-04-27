import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { GoogleAnalytics } from "@/components/google-analytics";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://the-exp.net";

export const metadata: Metadata = {
  title: "ContentAI — AI-Powered SEO Content Generator",
  description:
    "Generate SEO-optimized blog posts, social media content, product descriptions, email campaigns, and ad copy in seconds. AI-powered with smart provider fallback.",
  keywords: [
    "AI content generator",
    "SEO content",
    "blog post generator",
    "social media content",
    "AI writer",
    "content creation tool",
    "SEO title generator",
    "product description writer",
    "email campaign generator",
    "ad copy generator",
    "AI wrapper",
    "content marketing",
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ContentAI — AI-Powered SEO Content Generator",
    description: "Generate SEO-optimized blog posts, social media content, product descriptions, and more in seconds. Start free.",
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "ContentAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentAI — AI-Powered SEO Content Generator",
    description: "Generate SEO-optimized blog posts, social media content, product descriptions, and more in seconds. Start free.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
