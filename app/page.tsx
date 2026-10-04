'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  ShieldCheck,
  Globe,
  Radio,
  Lock,
  Server,
  Fingerprint,
  Gauge,
  Sliders,
  Package,
} from 'lucide-react';
import HeroDashboardPreview from '@/components/HeroDashboardPreview';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeShaderBackground from '@/components/HomeShaderBackground';
import IntegrateSplitPreview from '@/components/landing/IntegrateSplitPreview';
import LandingFAQ from '@/components/landing/LandingFAQ';
import { AnimatedGradientText } from '@/components/velora/animated-gradient-text';

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
}

const FEATURES: FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: 'Proactive blocklist tracking',
    description: (
      <>
        Be the first to know if malicious payloads or disposable emails target your forms. Built with real-time{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">DNS MX</span> checks and{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">Anti-Spam</span> filters.
      </>
    ),
  },
  {
    icon: Gauge,
    title: 'Faster compilation time',
    description: (
      <>
        Compile full-stack forms in milliseconds. Generates standalone{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">TypeScript</span> AST schemas, JSX components, and production-grade handlers.
      </>
    ),
  },
  {
    icon: Fingerprint,
    title: 'Build confidence with Zod',
    description: (
      <>
        Strict schema validation guaranteeing client and server input parity. Protect endpoints against missing fields, type injection, and{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">RFC 5322</span> syntax violations.
      </>
    ),
  },
  {
    icon: Server,
    title: 'Managed API endpoints',
    description: (
      <>
        Hosted submission URLs that capture responses instantly with integrated live charts, spreadsheet exports, and encrypted{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">MongoDB</span> storage.
      </>
    ),
  },
  {
    icon: Radio,
    title: 'DDoS & rate limiter protection',
    description: (
      <>
        Sliding-window IP hashing and auto-purging rate limits. Comply with standards and prevent submission flooding with zero external{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">WAF</span> setup.
      </>
    ),
  },
  {
    icon: Globe,
    title: 'Domain & email monitoring',
    description: (
      <>
        Authenticate users securely with 6-digit OTP verification powered by Nodemailer and Gmail SMTP with no mandatory custom domain setup.
      </>
    ),
  },
  {
    icon: Sliders,
    title: 'Dynamic design system',
    description: (
      <>
        Select between Modern Glass, Stark Minimal, or Corporate styles. All styled with pure{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">Tailwind CSS</span> and smooth cubic-bezier transitions.
      </>
    ),
  },
  {
    icon: Lock,
    title: 'Battle-tested session security',
    description: (
      <>
        Server-side authentication with encrypted{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">AES-256-GCM</span> HTTP-only cookie tokens, zero token exposure in browser local storage.
      </>
    ),
  },
  {
    icon: Package,
    title: 'Zero-configuration exports',
    description: (
      <>
        Export bundled ZIP packages matching standard Next.js directory structure. Drop directly into{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">App Router</span> and start capturing submissions.
      </>
    ),
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans flex flex-col antialiased">
      <HomeShaderBackground />
      <Navbar forceDark />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-32 lg:pt-[220px] pb-8 sm:pb-16 flex-1 flex flex-col items-stretch">
        <div className="flex flex-col items-start text-left w-full max-w-6xl mx-auto space-y-5 sm:space-y-6 pb-8 sm:pb-12">
          <h1
            className="text-[40px] leading-[42px] sm:text-[52px] sm:leading-[54px] lg:text-[64px] lg:leading-[64px] font-[510] tracking-[-0.045em] text-[#f7f8f8] max-w-[1120px]"
            style={{ fontFamily: '"Inter Variable", var(--font-inter), "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}
          >
            <AnimatedGradientText>SnapForm</AnimatedGradientText> builds, hosts, and scales your forms in seconds.
          </h1>

          <div className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <p
              className="text-[15px] leading-6 font-normal text-[#8a8f98] max-w-3xl"
              style={{ fontFamily: '"Inter Variable", var(--font-inter), "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}
            >
              Build, validate, and host production-ready React forms in seconds with zero backend hassle.
            </p>

            <div className="flex flex-row items-center justify-start sm:justify-end gap-2.5 sm:gap-3 shrink-0">
              <Link href="/dashboard" className="text-sm sm:text-base font-semibold text-white/90 hover:text-white transition-colors">
                Hosting Form
              </Link>
              <Link href="/builder" className="inline-flex items-center gap-1.5 text-sm sm:text-base text-white/55 hover:text-white/80 transition-colors">
                <span>Form Templates</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto">
          <HeroDashboardPreview />
        </div>
      </main>

      <section id="intake" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-8 sm:pb-16 border-t border-white/10 scroll-mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-10 sm:mb-16">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-medium leading-[1.02] tracking-tight text-white max-w-md">
            Intake<br />and integrations
          </h2>
          <div className="max-w-xl md:pt-1">
            <p className="font-subtext text-lg sm:text-xl font-normal leading-relaxed text-white/75">
              Turn form responses and customer feedback into actionable submissions, validated and routed to the right place.
            </p>
            <Link href="/docs" className="inline-flex items-center gap-2 mt-8 text-sm text-white/55 hover:text-white transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div id="integrations" className="scroll-mt-16">
          <IntegrateSplitPreview />
        </div>
      </section>

      <section id="features" className="relative z-10 w-full bg-black/85 backdrop-blur-3xl border-t border-white/10 pt-10 sm:pt-24 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16 space-y-3 text-left">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.15]">
              Reach users, not <br />
              broken form endpoints
            </h2>
            <p className="font-subtext text-[15px] font-normal leading-[24px] text-neutral-300">
              A developer platform built with strict type safety, zero boilerplate, and robust security safeguards out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 text-left">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="space-y-3">
                  <div className="w-6 h-6 text-neutral-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFAQ />

      <Footer />
    </div>
  );
}
