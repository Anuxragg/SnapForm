'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { X, Eye, EyeOff, Loader2, RefreshCw, CheckCircle2, ArrowLeft, ArrowRight, Check, Circle } from 'lucide-react';
import { SnapFormIcon } from '@/components/Logo';
import AuthVisualCard from './AuthVisualCard';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Signup step state: 'form' | 'otp'
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState<{ general?: string; email?: string; otp?: string; password?: string }>({});

  // Password mandatory requirement checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasMixedChars = hasLetter && hasNumber && hasSymbol;
  const isPasswordValid = hasMinLength && hasMixedChars;

  // Reset states when modal mode changes
  useEffect(() => {
    setSignupStep('form');
    setOtpCode('');
    setErrors({});
  }, [authModalMode, authModalOpen]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!authModalOpen) return null;

  // 1. Submit Sign Up (Validate Email & Password -> Send OTP)
  const handleStartSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid standard email address' });
      return;
    }

    if (!isPasswordValid) {
      setErrors({ password: 'Password does not meet the mandatory security requirements' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSignupStep('otp');
        setResendCooldown(60);
      } else {
        setErrors({ general: data.message || 'Failed to send verification code' });
      }
    } catch (err: any) {
      setErrors({ general: 'Network error while sending verification code' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Verify 6-digit OTP and complete Account Creation
  const handleVerifyOtpAndCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit verification code' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Step A: Verify OTP
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: otpCode.trim() }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setErrors({ otp: verifyData.message || 'Incorrect verification code' });
        setIsSubmitting(false);
        return;
      }

      // Step B: Finalize Signup with pre-entered password
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
      const signupData = await signupRes.json();

      if (signupRes.ok && signupData.success) {
        closeAuthModal();
        window.location.href = '/dashboard';
      } else {
        setErrors({ general: signupData.message || 'Failed to create account' });
      }
    } catch (err: any) {
      setErrors({ otp: 'Network error during account verification' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please provide a valid email address' });
      return;
    }
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setErrors({ general: 'Invalid email or password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 w-screen h-screen bg-[#070709] text-white font-sans overflow-y-auto flex flex-col justify-center animate-in fade-in duration-200"
    >
      {/* Exit Button */}
      <button
        onClick={closeAuthModal}
        className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800 shadow-xl"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Grid Canvas */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* ─── Left Side: Auth Content ────────────────────────────────────── */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0 space-y-5">
          {/* Logo Mark */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner">
              <SnapFormIcon className="w-4 h-6 text-white" fill="#ffffff" />
            </div>
          </div>

          {/* Header Title & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {authModalMode === 'login'
                ? 'Welcome back!'
                : signupStep === 'otp'
                ? 'Verify your email'
                : 'Create an account'}
            </h1>
            {signupStep === 'otp' ? (
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                Enter the 6-digit verification code we sent to{' '}
                <span className="font-semibold text-white">{email}</span>.
              </p>
            ) : null}
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {errors.general}
            </div>
          )}

          {/* ─── LOGIN VIEW ───────────────────────────────────────────────── */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold text-neutral-200 block">Email</label>
                <input
                  type="email"
                  placeholder="alan.turing@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4.5 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                />
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold text-neutral-200 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4.5 pr-12 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] border border-neutral-700/60 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
          )}

          {/* ─── SIGNUP STEP 1: EMAIL, PASSWORD & REQUIREMENTS ────────────── */}
          {authModalMode === 'signup' && signupStep === 'form' && (
            <form onSubmit={handleStartSignup} className="space-y-4">
              {/* Email */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold text-neutral-200 block">Email</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    placeholder="alan.turing@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4.5 pr-24 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                  />
                  {email.includes('@') && email.length > 5 && (
                    <button
                      type="button"
                      onClick={() => handleStartSignup()}
                      disabled={isSubmitting || !isPasswordValid}
                      className="absolute right-2.5 px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Verify'}
                    </button>
                  )}
                </div>
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold text-neutral-200 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4.5 pr-12 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* ─── Mandatory Password Requirements Checklist ───────── */}
                <div className="space-y-1.5 pt-1.5 text-xs">
                  <div className={`flex items-center gap-2 transition-colors ${hasMinLength ? 'text-emerald-400 font-medium' : 'text-neutral-400'}`}>
                    <span className="w-4 h-4 flex items-center justify-center">
                      {hasMinLength ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                    </span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${hasMixedChars ? 'text-emerald-400 font-medium' : 'text-neutral-400'}`}>
                    <span className="w-4 h-4 flex items-center justify-center">
                      {hasMixedChars ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                    </span>
                    <span>Mix of letters, numbers, and symbols</span>
                  </div>
                </div>

                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
              </div>

              {/* Create account CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid || !email.includes('@')}
                className="w-full py-3.5 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] border border-neutral-700/60 disabled:opacity-40 disabled:pointer-events-none mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>
            </form>
          )}

          {/* ─── SIGNUP STEP 2: SHADCN INPUT-OTP FORM ──────────────────────── */}
          {authModalMode === 'signup' && signupStep === 'otp' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSignupStep('form')}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to form</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartSignup()}
                  disabled={resendCooldown > 0 || isSubmitting}
                  className="inline-flex items-center gap-1 text-xs text-brand-orange hover:text-brand-orange-hover font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(val) => {
                    setOtpCode(val);
                    if (val.length === 6) {
                      setErrors({});
                    }
                  }}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                {errors.otp && (
                  <p className="text-xs text-rose-400 text-center font-medium mt-3">{errors.otp}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtpAndCreate}
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-orange/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Creating Account...</span>
                  </>
                ) : (
                  <span>Verify Code & Complete</span>
                )}
              </button>
            </div>
          )}

          {/* ─── OAuth Buttons & Divider (Only on main Form views) ──────────── */}
          {(authModalMode === 'login' || (authModalMode === 'signup' && signupStep === 'form')) && (
            <>
              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-neutral-800 w-full" />
                <span className="bg-[#070709] px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-widest absolute">
                  or
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@snapform.io');
                    setPassword('Password123!');
                  }}
                  className="group py-3.5 rounded-2xl bg-neutral-900/90 hover:bg-white border border-neutral-800 hover:border-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  title="Continue with Google"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('developer@github.com');
                    setPassword('Password123!');
                  }}
                  className="group py-3.5 rounded-2xl bg-neutral-900/90 hover:bg-white border border-neutral-800 hover:border-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  title="Continue with GitHub"
                >
                  <svg className="w-5 h-5 fill-white group-hover:fill-neutral-950 transition-colors" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('user@icloud.com');
                    setPassword('Password123!');
                  }}
                  className="group py-3.5 rounded-2xl bg-neutral-900/90 hover:bg-white border border-neutral-800 hover:border-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  title="Continue with Apple"
                >
                  <svg className="w-5 h-5 fill-white group-hover:fill-neutral-950 transition-colors" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.65-2.81 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.14-.47 2.8-1.29z"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Mode Switcher */}
          <div className="text-center pt-1">
            <p className="text-xs text-neutral-400">
              {authModalMode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="text-brand-orange font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="text-brand-orange font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* ─── Right Side: Glowing Snake Grid Card ────────────────────────── */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-[560px]">
          <AuthVisualCard />
        </div>

      </div>
    </div>
  );
}
