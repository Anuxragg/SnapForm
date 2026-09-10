import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Database, Server, RefreshCw, Mail, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SnapForm',
  description: 'Learn how SnapForm collects, protects, processes, and manages your data and form submissions.',
};

export default function PrivacyPage() {
  const lastUpdated = 'September 2026';

  const sections = [
    {
      id: 'overview',
      icon: Eye,
      title: '1. Overview & Commitment',
      content: `At SnapForm, we respect your privacy and are committed to protecting your personal data and your users' form submissions. This Privacy Policy explains what information we collect, why we collect it, how we safeguard it, and your rights regarding your data when using our website, compiler tools, hosting APIs, and dashboard services.`,
    },
    {
      id: 'data-collected',
      icon: Database,
      title: '2. Information We Collect',
      content: `We collect minimal information necessary to deliver high-performance form services:
• **Account Information**: When you register or log in via OTP, we collect your email address to authenticate your session and manage your forms.
• **Form Submissions**: When your users submit data through a SnapForm endpoint (/api/f/:id), we store the submitted fields on your behalf in encrypted storage.
• **Technical Metadata**: Request IP address (hashed for rate-limiting and spam mitigation), user agent, submission timestamps, and referrer URLs for analytics.`,
    },
    {
      id: 'data-usage',
      icon: Server,
      title: '3. How We Use Your Data',
      content: `We use collected information solely to:
• Provide, operate, and maintain the SnapForm compilation and submission capture platform.
• Deliver instant email notifications for new submissions to your verified inbox.
• Perform automated security validations, including DNS MX checks and anti-spam verification.
• Monitor and prevent malicious activity, DDoS attacks, and abuse.
• We do NOT sell, rent, or monetize your or your users' personal information to third parties.`,
    },
    {
      id: 'security',
      icon: Lock,
      title: '4. Security & Encryption',
      content: `Security is central to SnapForm's architecture:
• **Encryption at Rest & in Transit**: All data transmitted between clients and our API routes is encrypted using TLS 1.3. Submissions and credentials in our databases are encrypted using industry-standard AES-256-GCM.
• **Secure Authentication**: We use secure, HTTP-only, SameSite cookies for authentication tokens, preventing client-side token exposure to XSS attacks.
• **Spam & Abuse Protection**: Submissions are checked in real-time against disposable email domains and malicious payloads.`,
    },
    {
      id: 'retention-deletion',
      icon: RefreshCw,
      title: '5. Data Retention & Deletion Rights',
      content: `• **Retention**: We retain form submissions as long as your account and form exist, or until you explicitly delete submissions or forms from your dashboard.
• **Your Rights**: You have full ownership of your data. You may export all your form schemas and submissions at any time, or request complete account and data deletion by contacting us or via your dashboard settings.`,
    },
    {
      id: 'cookies',
      icon: Shield,
      title: '6. Cookies & Tracking',
      content: `SnapForm uses only strictly necessary functional cookies for secure user authentication and session management. We do not deploy third-party advertising trackers or behavioral targeting pixels.`,
    },
    {
      id: 'contact',
      icon: Mail,
      title: '7. Contact Us',
      content: `If you have questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please reach out to our privacy team at:
• **Email**: privacy@snapform.live
• **GitHub**: https://github.com/Anuxragg`,
    },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans flex flex-col antialiased">
      {/* Navbar */}
      <Navbar />

      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 pt-28 sm:pt-36 pb-20 flex-1">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mb-6 group font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-brand-orange font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal & Trust</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Sections List */}
        <div className="space-y-10 pt-10">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.id}
                id={sec.id}
                className="p-6 sm:p-7 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3.5 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">
                    {sec.title}
                  </h2>
                </div>
                <div className="text-xs sm:text-[13.5px] leading-relaxed text-neutral-300 font-normal whitespace-pre-line pl-11">
                  {sec.content}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
