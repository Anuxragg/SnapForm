import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TableOfContents from '@/components/legal/TableOfContents';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SnapForm',
  description: 'Learn how SnapForm collects, protects, processes, and manages your personal data and form submissions.',
};

export default function PrivacyPage() {
  const effectiveDate = 'SEPTEMBER 10, 2026';

  const tableOfContents = [
    { id: 'covers', label: 'What this Privacy Policy Covers' },
    { id: 'personal-data', label: 'Personal Data We Collect' },
    { id: 'how-we-use', label: 'How We Use Personal Data' },
    { id: 'how-we-share', label: 'How We Share Your Personal Data' },
    { id: 'tracking-tools', label: 'Tracking Tools and Cookies' },
    { id: 'security-retention', label: 'Data Security and Retention' },
    { id: 'privacy-rights', label: 'Your Privacy Rights & Choices' },
    { id: 'changes', label: 'Changes to this Privacy Policy' },
    { id: 'contact', label: 'Contact Information' },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col antialiased selection:bg-brand-orange selection:text-white">
      {/* Navbar */}
      <Navbar />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 pt-32 sm:pt-40 pb-24 flex-1 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start justify-between">
        
        {/* Main Article Content */}
        <main className="flex-1 min-w-0 max-w-3xl text-left">
          
          {/* Title */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 sm:mb-8 leading-tight">
            Privacy Policy
          </h1>

          {/* Effective Date */}
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-400 mb-8 sm:mb-10 select-none">
            EFFECTIVE DATE: {effectiveDate}
          </div>

          {/* Intro Paragraphs */}
          <div className="space-y-5 text-sm sm:text-[15px] leading-[1.75] text-neutral-300 font-normal">
            <p>
              At SnapForm (&ldquo;<strong className="text-white font-semibold">SnapForm</strong>&rdquo;), we take your privacy seriously. Please read this Privacy Policy to learn how we treat your personal data and your form submissions. <strong className="text-white font-semibold">By using or accessing our Services in any manner, you acknowledge that you accept the practices and policies outlined below, and you hereby consent that we will collect, use and share your information as described in this Privacy Policy.</strong>
            </p>

            <p>
              Remember that your use of SnapForm&apos;s Services is at all times subject to our{' '}
              <Link
                href="/terms"
                className="text-white underline underline-offset-4 decoration-neutral-500 hover:decoration-brand-orange hover:text-brand-orange transition-colors"
              >
                Terms of Service
              </Link>
              . Any terms we use in this Policy without defining them have the definitions given to them in the{' '}
              <Link
                href="/terms"
                className="text-white underline underline-offset-4 decoration-neutral-500 hover:decoration-brand-orange hover:text-brand-orange transition-colors"
              >
                Terms of Service
              </Link>
              .
            </p>

            <p>
              If you have questions about accessibility or need to access this Privacy Policy in an alternative format, please contact{' '}
              <a
                href="mailto:anuragpal9002@gmail.com"
                className="text-white underline underline-offset-4 decoration-neutral-500 hover:decoration-brand-orange hover:text-brand-orange transition-colors"
              >
                anuragpal9002@gmail.com
              </a>
              .
            </p>
          </div>

          {/* Dotted Divider */}
          <hr className="border-t border-dotted border-white/20 my-10 sm:my-12" />

          {/* Inline TOC on mobile/tablet */}
          <div className="block lg:hidden mb-12">
            <div className="space-y-2.5 font-mono text-xs sm:text-[13.5px] text-neutral-400 select-none">
              {tableOfContents.map((item, index) => (
                <div key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    {index + 1}. {item.label}
                  </a>
                </div>
              ))}
            </div>
            <hr className="border-t border-dotted border-white/20 my-10" />
          </div>

          {/* Policy Sections */}
          <div className="space-y-12 sm:space-y-14 text-sm sm:text-[15px] leading-[1.75] text-neutral-300 font-normal">
            
            {/* Section 1 */}
            <section id="covers" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                1. What this Privacy Policy Covers
              </h2>
              <p>
                This Privacy Policy covers how we treat Personal Data that we gather when you access or use our Services. &ldquo;Personal Data&rdquo; means any information that identifies or relates to a particular individual and also includes information referred to as &ldquo;personally identifiable information&rdquo; or &ldquo;personal information&rdquo; under applicable data privacy laws.
              </p>
              <p>
                This policy does not apply to the practices of companies that we do not own or control, or to individuals whom we do not employ or manage.
              </p>
            </section>

            {/* Section 2 */}
            <section id="personal-data" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                2. Personal Data We Collect
              </h2>
              <p>
                We collect Personal Data about you from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                <li>
                  <strong className="text-white font-semibold">You directly:</strong> When you create an account, log in via one-time passcode (OTP), configure forms, or request support (e.g. email address, account settings).
                </li>
                <li>
                  <strong className="text-white font-semibold">Your form respondents:</strong> When visitors submit responses to forms hosted on your SnapForm endpoints (<code className="text-neutral-200 bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">/api/form/:id</code>), we store and process these payloads on your behalf in encrypted storage.
                </li>
                <li>
                  <strong className="text-white font-semibold">Automated logs & telemetry:</strong> Technical information including IP address (hashed for sliding-window rate limiting), browser user agent, submission timestamps, and referrer headers for spam filtering.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="how-we-use" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                3. How We Use Personal Data
              </h2>
              <p>
                We process Personal Data to operate, maintain, and enhance the Services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                <li>Compiling and serving custom React form components, Zod validation schemas, and Next.js route handlers.</li>
                <li>Delivering instant email notifications to your verified email address when new responses arrive.</li>
                <li>Executing automated security safeguards, including real-time DNS MX checks, disposable email detection, and anti-abuse filtering.</li>
                <li>Preventing DDoS attacks, brute-force spamming, and platform misuse.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="how-we-share" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                4. How We Share Your Personal Data
              </h2>
              <p>
                We do not sell, rent, or trade your or your respondents&apos; personal information to third parties. We share Personal Data only with trusted service providers strictly necessary to operate our infrastructure:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                <li>Cloud hosting, serverless compute, and encrypted database infrastructure.</li>
                <li>Transactional email delivery services (e.g. Nodemailer / SMTP) for authentication passcodes and submission alerts.</li>
                <li>Legal authorities when required by subpoena, court order, or applicable law.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="tracking-tools" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                5. Tracking Tools and Cookies
              </h2>
              <p>
                SnapForm uses strictly necessary functional cookies and HTTP-only session tokens to maintain authenticated sessions securely. We do not use third-party behavioral advertising trackers, cross-site pixels, or marketing trackers.
              </p>
            </section>

            {/* Section 6 */}
            <section id="security-retention" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                6. Data Security and Retention
              </h2>
              <p>
                We employ industry-standard technical and organizational measures to safeguard your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                <li><strong className="text-white font-semibold">Encryption:</strong> All data in transit is protected using TLS 1.3. Form responses and credentials are encrypted at rest using AES-256-GCM.</li>
                <li><strong className="text-white font-semibold">Session Isolation:</strong> Authentication tokens are stored in secure, encrypted HTTP-only SameSite cookies, inaccessible to client-side scripts.</li>
                <li><strong className="text-white font-semibold">Retention:</strong> Form submissions are retained as long as your form remains active, or until you permanently delete responses or your account from your dashboard.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="privacy-rights" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                7. Your Privacy Rights & Choices
              </h2>
              <p>
                Depending on your jurisdiction (including the EU/EEA under GDPR and California under CCPA/CPRA), you have rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                <li><strong className="text-white font-semibold">Access & Export:</strong> You can export all form schemas and responses in standard formats (ZIP / CSV / JSON) at any time.</li>
                <li><strong className="text-white font-semibold">Correction & Deletion:</strong> You can edit or permanently delete forms, submissions, and your account directly in the dashboard or by contacting us.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="changes" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                8. Changes to this Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements. We will alert you to material changes by updating the &ldquo;Effective Date&rdquo; at the top of this page or via email notice where appropriate.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                9. Contact Information
              </h2>
              <p>
                If you have any questions or comments about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                <li>
                  <span className="text-neutral-400">Email:</span>{' '}
                  <a
                    href="mailto:anuragpal9002@gmail.com"
                    className="text-white underline underline-offset-4 decoration-neutral-500 hover:decoration-brand-orange hover:text-brand-orange transition-colors font-medium"
                  >
                    anuragpal9002@gmail.com
                  </a>
                </li>
                <li>
                  <span className="text-neutral-400">X (Twitter):</span>{' '}
                  <a
                    href="https://x.com/anuragossips"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline underline-offset-4 decoration-neutral-500 hover:decoration-brand-orange hover:text-brand-orange transition-colors font-medium"
                  >
                    @anuragossips
                  </a>
                </li>
              </ul>
            </section>

          </div>
        </main>

        {/* Right Sticky On This Page Sidebar (Desktop) */}
        <aside className="hidden lg:block sticky top-36 w-60 xl:w-64 shrink-0">
          <TableOfContents items={tableOfContents} />
        </aside>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
