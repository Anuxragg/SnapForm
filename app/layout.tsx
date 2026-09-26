import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://snappform.vercel.app');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SnapForm — Build, Host & Share Forms in Seconds",
    template: "%s | SnapForm",
  },
  description:
    "Build and host responsive forms instantly with real-time response tracking, anti-spam filters, and optional export to production-grade React components and Zod schemas.",
  keywords: [
    "Form Hosting",
    "Form Builder",
    "Share Forms Online",
    "Online Survey Maker",
    "Form Backend",
    "React Form Generator",
    "Zod Schema Generator",
    "Typeform Alternative",
    "Google Forms Alternative",
    "Headless Form Backend",
  ],
  authors: [{ name: "SnapForm Team" }],
  creator: "SnapForm",
  publisher: "SnapForm",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SnapForm — Build, Host & Share Forms in Seconds",
    description:
      "Build and host responsive forms instantly with real-time response tracking, anti-spam filters, and optional export to production-grade React components and Zod schemas.",
    url: baseUrl,
    siteName: "SnapForm",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SnapForm — Build, Host & Share Forms in Seconds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapForm — Build, Host & Share Forms in Seconds",
    description:
      "Build and host responsive forms instantly with real-time response tracking, anti-spam filters, and optional export to production-grade React components and Zod schemas.",
    images: ["/opengraph-image"],
    creator: "@snapform",
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
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    google: "google1a1667f42ad55c9d",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SnapForm",
  operatingSystem: "Web",
  applicationCategory: "DeveloperApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "High-speed React form compiler and headless form submission backend with live visual builder, Zod validation, and Next.js route code export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${inter.className} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
