import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapForm — High-Speed React Form Compiler",
  description: "Generate beautiful, production-ready React forms with robust Zod validation and Next.js API routes at hyper-speed.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
      className={`${spaceGrotesk.className} antialiased`}
    >
      <body className="min-h-screen bg-[#f4f3ef] text-[#121212]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
