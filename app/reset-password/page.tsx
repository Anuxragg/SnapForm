'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SnapFormIcon } from '@/components/Logo';
import AuthVisualCard from '@/components/auth/AuthVisualCard';
import { Eye, EyeOff, Loader2, Check, Circle, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Requirement checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet all security requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully! Redirecting...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please request a new link.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-center font-sans">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* ─── Left Side: Reset Password Form ──────────────────────────── */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0 space-y-6">
          {/* Logo Mark */}
          <Link href="/" className="inline-block">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner hover:border-neutral-700 transition-colors">
              <SnapFormIcon className="w-4 h-6 text-white" fill="#ffffff" />
            </div>
          </Link>

          {!isSuccess ? (
            <>
              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-heading font-semibold tracking-tight text-white">
                  Set new password
                </h1>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Enter a secure new password for <strong className="text-white">{email || 'your account'}</strong>.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2 text-left">
                  <label htmlFor="new-password" className="text-sm font-semibold text-neutral-200 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4.5 pr-12 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 text-left">
                  <label htmlFor="confirm-password" className="text-sm font-semibold text-neutral-200 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4.5 pr-12 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Validation Checklist */}
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    )}
                    <span className={hasMinLength ? 'text-neutral-200 font-medium' : 'text-neutral-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasLetter && hasNumber && hasSymbol ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    )}
                    <span
                      className={
                        hasLetter && hasNumber && hasSymbol
                          ? 'text-neutral-200 font-medium'
                          : 'text-neutral-500'
                      }
                    >
                      Contains letters, numbers, and symbols
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordsMatch ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    )}
                    <span className={passwordsMatch ? 'text-neutral-200 font-medium' : 'text-neutral-500'}>
                      Passwords match
                    </span>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid || !passwordsMatch}
                  className="w-full py-3.5 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] border border-neutral-700/60 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Update password</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success Confirmation */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-white tracking-tight">
                  Password updated!
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Your password has been reset successfully. You can now sign in with your new credentials.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full py-3.5 px-5 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Proceed to sign in</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* ─── Right Side: Interactive Snake-Glow Grid & Centered Logo ───── */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-[560px]">
          <AuthVisualCard />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070709]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
