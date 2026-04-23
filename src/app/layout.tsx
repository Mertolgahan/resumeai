import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeAI — AI-Powered Resume & Cover Letter Builder",
  description:
    "Create professional, ATS-optimized resumes and cover letters in seconds with AI. Land your dream job faster.",
  keywords: [
    "AI resume builder",
    "resume generator",
    "cover letter AI",
    "ATS resume",
    "job application",
    "professional resume",
  ],
  openGraph: {
    title: "ResumeAI — AI-Powered Resume Builder",
    description:
      "Create professional resumes and cover letters in seconds with AI.",
    type: "website",
  },
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Toaster position="bottom-right" />
        {children}
      </body>
    </html>
  );
}