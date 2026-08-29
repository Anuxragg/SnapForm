'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { SnapFormIcon } from '@/components/Logo';
import AuthVisualCard from '@/components/auth/AuthVisualCard';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-center font-sans">
      {/* Seamless Edge-to-Edge Grid (No outer card border) */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* ─── Left Side: Sign In Form ──────────────────────────────────── */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0 space-y-6">
          {/* Logo Mark */}
          <Link href="/" className="inline-block">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner hover:border-neutral-700 transition-colors">
              <SnapFormIcon className="w-4 h-6 text-white" fill="#ffffff" />
            </div>
          </Link>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-heading font-semibold tracking-tight text-white">
              Welcome back!
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2 text-left">
              <label htmlFor="login-email" className="text-sm font-semibold text-neutral-200 block">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="alan.turing@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4.5 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 text-left">
              <label htmlFor="login-password" className="text-sm font-semibold text-neutral-200 block">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4.5 pr-12 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In CTA */}
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

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-[#070709] px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-widest absolute">
              or
            </span>
          </div>

          {/* OAuth Buttons */}
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

          {/* Switch to Signup */}
          <div className="text-center pt-2">
            <p className="text-xs text-neutral-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand-orange font-bold hover:underline cursor-pointer ml-1">
                Sign up
              </Link>
            </p>
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
