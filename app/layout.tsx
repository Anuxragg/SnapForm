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
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://snapform.dev');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SnapForm — High-Speed React Form Compiler & Headless Form Builder",
    template: "%s | SnapForm",
  },
  description:
    "Design beautiful forms and instantly generate production-ready React components, type-safe Zod validation schemas, and Next.js API route handlers with headless submission endpoints.",
  keywords: [
    "Form Builder",
    "React Form Generator",
    "Zod Schema Generator",
    "Next.js Form Builder",
    "Headless Form Backend",
    "Typeform Alternative",
    "Google Forms Alternative",
    "Tailwind CSS Forms",
    "shadcn ui form builder",
    "TypeScript Form Validation",
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
    title: "SnapForm — High-Speed React Form Compiler & Headless Form Builder",
    description:
      "Visual form designer that compiles directly into production-grade React components, Zod schemas, and Next.js API routes.",
    url: baseUrl,
    siteName: "SnapForm",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "SnapForm Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapForm — High-Speed React Form Compiler",
    description:
      "Generate beautiful, production-ready React forms with robust Zod validation and Next.js API routes at hyper-speed.",
    images: ["/logo.png"],
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
          defaultTheme="system"
          enableSystem
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
