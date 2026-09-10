import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Scale, FileText, CheckCircle2, ShieldAlert, Cpu, RefreshCw, Mail, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — SnapForm',
  description: 'Review the Terms of Service for using SnapForm form compiler, hosting APIs, and developer services.',
};

export default function TermsPage() {
  const lastUpdated = 'September 2026';

  const sections = [
    {
      id: 'acceptance',
      icon: CheckCircle2,
      title: '1. Acceptance of Terms',
      content: `By accessing or using SnapForm (the "Service"), including the form builder, compiler, hosting API endpoints (/api/f/:id), and developer tools, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.`,
    },
    {
      id: 'services',
      icon: Cpu,
      title: '2. Description of Service',
      content: `SnapForm provides developers and businesses with React form compilation, Zod validation schema generation, submission capture endpoints, spam mitigation (DNS MX checks and disposable domain filtering), and dashboard analytics. We reserve the right to improve, update, or modify features of the Service at any time.`,
    },
    {
      id: 'acceptable-use',
      icon: ShieldAlert,
      title: '3. Acceptable Use Policy',
      content: `You agree NOT to use SnapForm to:
• Collect credentials (passwords, PINs) or sensitive financial data in violation of applicable laws.
• Host phishing forms, malware distributors, or deceptive pages intended to mislead end-users.
• Send unsolicited bulk communications (spam) or abuse the submission endpoints to flood networks.
• Attempt to circumvent rate-limiting mechanisms, reverse-engineer server infrastructure, or attack service availability.
Violations of this policy will result in immediate termination of the offending forms and account suspension.`,
    },
    {
      id: 'ownership',
      icon: FileText,
      title: '4. Ownership & Intellectual Property',
      content: `• **Your Content & Submissions**: You retain 100% ownership of all form schemas, component code, and end-user submissions processed through your forms.
• **SnapForm Platform**: All platform code, trademarks, designs, algorithms, and service architecture remain the intellectual property of SnapForm and its maintainers.`,
    },
    {
      id: 'uptime-liability',
      icon: Scale,
      title: '5. Service Availability & Limitation of Liability',
      content: `• We strive for high availability and reliability across our global CDN and database infrastructure. However, the Service is provided "as is" and "as available" without warranties of any kind.
• In no event shall SnapForm or its contributors be liable for any indirect, incidental, or consequential damages arising from data loss, server downtime, or third-party email delivery delays.`,
    },
    {
      id: 'termination',
      icon: RefreshCw,
      title: '6. Account Termination',
      content: `You may stop using our services and delete your account or forms at any time through your dashboard. SnapForm reserves the right to suspend or terminate accounts that breach these terms with reasonable prior notice where practical.`,
    },
    {
      id: 'contact',
      icon: Mail,
      title: '7. Contact Information',
      content: `For any legal inquiries, compliance questions, or terms clarifications, please reach out to:
• **Email**: legal@snapform.live
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
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Terms of Service
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
