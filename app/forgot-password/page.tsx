'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { SnapFormIcon } from '@/components/Logo';
import AuthVisualCard from '@/components/auth/AuthVisualCard';
import { Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedEmail(email.trim());
        toast.success('Password reset link sent to your email');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-center font-sans">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* ─── Left Side: Forgot Password Form ─────────────────────────── */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0 space-y-6">
          {/* Logo Mark */}
          <Link href="/" className="inline-block">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner hover:border-neutral-700 transition-colors">
              <SnapFormIcon className="w-4 h-6 text-white" fill="#ffffff" />
            </div>
          </Link>

          {!submittedEmail ? (
            <>
              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-heading font-semibold tracking-tight text-white">
                  Reset password
                </h1>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Enter your registered email address. We&apos;ll send you a secure link to choose a new password.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label htmlFor="forgot-email" className="text-sm font-semibold text-neutral-200 block">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="alan.turing@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4.5 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] border border-neutral-700/60 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <span>Send reset link</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-white tracking-tight">
                  Check your email
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  We have sent a password reset link to <strong className="text-white">{submittedEmail}</strong>.
                  The link will expire in 30 minutes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                <p>Did not receive the email? Check your spam folder, or click below to request another.</p>
                <button
                  type="button"
                  onClick={() => setSubmittedEmail(null)}
                  className="text-brand-orange hover:underline font-semibold cursor-pointer"
                >
                  Try another email or resend
                </button>
              </div>
            </div>
          )}

          {/* Return to Sign in */}
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>

        {/* ─── Right Side: Interactive Snake-Glow Grid & Centered Logo ───── */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-[560px]">
          <AuthVisualCard />
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070709]" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
