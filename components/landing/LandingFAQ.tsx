'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'General',
    question: 'How does SnapForm work?',
    answer:
      'SnapForm visually builds and compiles production-ready React forms with type-safe Zod schemas and Next.js handlers ready to drop in or host instantly.',
  },
  {
    category: 'Backend & Hosting',
    question: 'Do I need a custom backend or database to capture submissions?',
    answer:
      'No backend needed. Use our hosted submission endpoints to capture responses, run automated spam checks, and receive real-time email alerts.',
  },
  {
    category: 'Export & Code',
    question: 'Can I export the code and host it completely on my own server?',
    answer:
      'Yes, 100%. Export complete TypeScript JSX, Zod validation schemas, and Next.js App Router API routes as a standalone ZIP package with zero lock-in.',
  },
  {
    category: 'Security & Spam',
    question: 'How does automated spam prevention and MX validation work?',
    answer:
      'Every submission is verified in milliseconds using DNS MX checks, disposable email blocklists, IP rate limiting, and honeypots to block bot spam.',
  },
];

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-16 sm:pb-24 border-t border-white/10 text-left">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-9 space-y-2.5 sm:space-y-3">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold leading-[1.15] text-white tracking-tight">
          Frequently Asked <span className="text-brand-orange">Questions</span>
        </h2>

        <p className="font-subtext text-xs sm:text-[14px] font-normal leading-[20px] sm:leading-[22px] text-white/80 max-w-md mx-auto">
          Everything you need to know about SnapForm compilation, hosting, type safety, and spam protection.
        </p>
      </div>

      {/* Unified Glass Container */}
      <div className="w-full bg-black/60 backdrop-blur-2xl border border-white/12 rounded-[20px] sm:rounded-[26px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] divide-y divide-white/10 overflow-hidden">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={`transition-colors duration-200 ${
                isOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className={`w-full px-5 sm:px-7 flex items-center justify-between text-left gap-4 cursor-pointer select-none group ${
                  isOpen ? 'pt-4 sm:pt-5 pb-1.5 sm:pb-2' : 'py-4 sm:py-5'
                }`}
              >
                <span className={`text-sm sm:text-[15px] font-semibold tracking-tight font-heading transition-colors ${
                  isOpen ? 'text-brand-orange' : 'text-white group-hover:text-white'
                }`}>
                  {faq.question}
                </span>

                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                    isOpen
                      ? 'text-brand-orange rotate-180'
                      : 'text-neutral-400 group-hover:text-white'
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-7 pb-4 sm:pb-5 pt-0 text-xs sm:text-[13.5px] leading-relaxed text-white font-normal animate-in fade-in slide-in-from-top-1 duration-200 pr-8 sm:pr-12">
                  <p className="text-white leading-relaxed font-normal">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
