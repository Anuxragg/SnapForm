import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TableOfContents from '@/components/legal/TableOfContents';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — SnapForm',
  description: 'Review the Terms of Service for using SnapForm form compiler, hosting APIs, and developer services.',
};

export default function TermsPage() {
  const effectiveDate = 'SEPTEMBER 10, 2026';

  const tableOfContents = [
    { id: 'agreement', label: 'Agreement to Terms' },
    { id: 'services', label: 'Description of Services' },
    { id: 'acceptable-use', label: 'Acceptable Use Policy' },
    { id: 'ownership', label: 'Ownership & Intellectual Property' },
    { id: 'availability', label: 'Service Availability & Warranties' },
    { id: 'limitation', label: 'Limitation of Liability' },
    { id: 'termination', label: 'Account Termination' },
    { id: 'governing-law', label: 'Governing Law' },
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
            Terms of Service
          </h1>

          {/* Effective Date */}
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-400 mb-8 sm:mb-10 select-none">
            EFFECTIVE DATE: {effectiveDate}
          </div>

          {/* Intro Paragraphs */}
          <div className="space-y-5 text-sm sm:text-[15px] leading-[1.75] text-neutral-300 font-normal">
            <p>
              Please read these Terms of Service (these &ldquo;<strong className="text-white font-semibold">Terms</strong>&rdquo;) carefully. By creating an account, compiling form schemas, accessing our hosting endpoints, or using any services provided by SnapForm (&ldquo;<strong className="text-white font-semibold">SnapForm</strong>&rdquo;, &ldquo;<strong className="text-white font-semibold">we</strong>&rdquo;, or &ldquo;<strong className="text-white font-semibold">us</strong>&rdquo;), you agree to be bound by these Terms.
            </p>

            <p>
              Your privacy is important to us. Please review our{' '}
              <Link
                href="/privacy"
                className="text-white underline underline-offset-4 decoration-neutral-500 hover:decoration-brand-orange hover:text-brand-orange transition-colors"
              >
                Privacy Policy
              </Link>{' '}
              for information on how we collect, store, and process your data.
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
            <section id="agreement" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing our website, visual form builder, compiler APIs, and form endpoints (<code className="text-neutral-200 bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">/api/f/:id</code>), you agree to adhere to these Terms of Service. If you disagree with any part of the terms, you must not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section id="services" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                2. Description of Services
              </h2>
              <p>
                SnapForm provides developers and teams with full-stack React form compilation tools, Zod schema generation, hosted submission endpoints, real-time MX spam verification, and response dashboards. We continually improve the Service and reserve the right to modify features at our discretion.
              </p>
            </section>

            {/* Section 3 */}
            <section id="acceptable-use" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                3. Acceptable Use Policy
              </h2>
              <p>
                You agree that you will not use SnapForm to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                <li>Harvest credentials, passwords, social security numbers, or sensitive financial information illegally.</li>
                <li>Deploy deceptive phishing campaigns, malware, or fraudulent schemes targeting web visitors.</li>
                <li>Flood submission endpoints with malicious automated traffic or attempt DDoS attacks against platform infrastructure.</li>
                <li>Circumvent or exploit sliding-window rate limiters or security controls.</li>
              </ul>
              <p>
                We reserve the right to immediately suspend endpoints or terminate accounts found violating this policy.
              </p>
            </section>

            {/* Section 4 */}
            <section id="ownership" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                4. Ownership & Intellectual Property
              </h2>
              <p>
                <strong className="text-white font-semibold">Your Content:</strong> You retain 100% intellectual property rights and full ownership over your form component code, schemas, and user submissions captured through your endpoints.
              </p>
              <p>
                <strong className="text-white font-semibold">SnapForm Platform:</strong> All trademarks, algorithms, UI designs, code compiler engines, and platform infrastructure remain the exclusive property of SnapForm and its maintainers.
              </p>
            </section>

            {/* Section 5 */}
            <section id="availability" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                5. Service Availability & Warranties
              </h2>
              <p>
                The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. While we strive for 99.9% uptime and reliable message delivery, we do not warrant that the service will be uninterrupted, timely, or error-free.
              </p>
            </section>

            {/* Section 6 */}
            <section id="limitation" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                6. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, in no event shall SnapForm, its creators, or contributors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including damages for loss of profits, goodwill, or data.
              </p>
            </section>

            {/* Section 7 */}
            <section id="termination" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                7. Account Termination
              </h2>
              <p>
                You may terminate your account and delete your forms and submissions at any time from your dashboard settings. SnapForm may terminate or suspend your access for violations of these Terms with reasonable notice where feasible.
              </p>
            </section>

            {/* Section 8 */}
            <section id="governing-law" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                8. Governing Law
              </h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                9. Contact Information
              </h2>
              <p>
                For any legal notices, questions, or concerns regarding these Terms, please contact us:
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
