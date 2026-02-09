import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "InsightML Burnout Intelligence",
  description:
    "Comprehensive InsightML #2 solution for predicting employee burnout risk with interactive analytics, feature engineering, and deployment-ready inference.",
  openGraph: {
    title: "InsightML Burnout Intelligence",
    description:
      "End-to-end predictive analytics workspace for forecasting employee burnout scores.",
    url: "https://agentic-0d27a8f2.vercel.app",
    siteName: "InsightML Burnout Intelligence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InsightML Burnout Intelligence",
    description:
      "Explore features, train models, and generate Kaggle-ready submissions for InsightML #2.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
