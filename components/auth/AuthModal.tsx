'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    signup,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});

  if (!authModalOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (authModalMode === 'signup' && (!name || name.trim().length < 2)) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!email || !email.includes('@')) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      let success = false;
      if (authModalMode === 'login') {
        success = await login(email, password);
      } else {
        success = await signup(name, email, password);
      }
      
      if (success) {
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
      onClick={closeAuthModal}
    >
      
      {/* Light box container */}
      <div 
        className="relative w-full max-w-md bg-[#fdfcf9] border border-brand-border rounded-3xl p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle noise grain overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#d5d0c5_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 z-50 p-2 rounded-full hover:bg-brand-sand transition-all text-neutral-400 hover:text-brand-charcoal cursor-pointer border border-transparent hover:border-brand-border/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Logo & Title */}
        <div className="text-center space-y-2 mb-8 relative z-10 flex flex-col items-center">
          <Logo href="" textClassName="text-2xl font-black tracking-tight text-brand-charcoal" />
          <span className="text-[9px] font-black text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded tracking-widest leading-none font-mono uppercase inline-block">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create SaaS Profile'}
          </span>
          <p className="text-xs text-neutral-500 max-w-[280px] mx-auto">
            {authModalMode === 'login' 
              ? 'Log in to compile and save templates directly under your profile.' 
              : 'Sign up to build form libraries and manage your exports instantly.'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errors.general && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold font-sans text-center">
            {errors.general}
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {authModalMode === 'signup' && (
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider font-mono block pl-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <User className="w-4 h-4" />
                </span>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10 h-11 rounded-2xl bg-white border-brand-border focus-visible:ring-brand-orange text-xs font-medium"
                />
              </div>
              {errors.name && (
                <span className="text-[10px] font-semibold text-rose-500 block pl-1">
                  {errors.name}
                </span>
              )}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider font-mono block pl-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail className="w-4 h-4" />
              </span>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="pl-10 h-11 rounded-2xl bg-white border-brand-border focus-visible:ring-brand-orange text-xs font-medium"
              />
            </div>
            {errors.email && (
              <span className="text-[10px] font-semibold text-rose-500 block pl-1">
                {errors.email}
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider font-mono block pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="pl-10 pr-10 h-11 rounded-2xl bg-white border-brand-border focus-visible:ring-brand-orange text-xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-charcoal cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] font-semibold text-rose-500 block pl-1">
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm border border-brand-orange shadow-lg shadow-brand-orange/20 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-99"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5" />
                {authModalMode === 'login' ? 'Sign In to Studio' : 'Create Free Account'}
              </>
            )}
          </Button>
        </form>

        {/* Tab Selector Footer Link */}
        <div className="mt-6 text-center text-xs font-medium text-neutral-500 relative z-10 border-t border-brand-border/60 pt-4.5">
          {authModalMode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="text-brand-orange font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-brand-orange font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
