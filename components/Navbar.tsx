'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Wand2,
  BookOpen,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import Logo from '@/components/Logo';

const NAV_LINKS = [
  { label: 'Builder', href: '/builder', icon: Wand2 },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Docs', href: '/docs', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[52px] bg-black/75 border-b border-white/10 shadow-2xl backdrop-blur-2xl flex items-center text-white font-sans transition duration-500 ease-in-out">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-15 h-[52px] flex items-center justify-between gap-4 transition duration-500 ease-in-out">

          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-7">
            <Logo
              href="/"
              iconContainerClassName="w-7 h-7 rounded-[8px]"
              iconClassName="w-3.5 h-5 text-white"
              textClassName="text-white font-semibold text-[15px] sm:text-[16px] leading-none tracking-tight font-heading"
            />

            <nav className="hidden md:flex items-center gap-5 lg:gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`text-[13px] font-medium transition-colors duration-150 ${
                    pathname === href ? 'text-brand-orange font-semibold' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-[13px] font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer px-3 py-1.5"
                >
                  Sign in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="text-[13px] font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover px-3.5 py-1.5 rounded-[8px] transition-all duration-150 cursor-pointer shadow-md shadow-brand-orange/20"
                >
                  Get started
                </button>
              </div>
            ) : (
              <div className="relative shrink-0" ref={profileRef}>
                {/* Circular Orange Avatar Button Only */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="User account menu"
                  className="w-8 h-8 rounded-full bg-brand-orange hover:brightness-110 active:scale-95 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-md shadow-brand-orange/20 select-none"
                >
                  {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'A'}
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-white dark:bg-[#1C1C1C] border border-[#e4e4e7] dark:border-[#2a2a2a] rounded-[14px] shadow-2xl p-1.5 z-50 text-[oklch(0.145_0_0)] dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-100"
                    style={{
                      fontFamily:
                        'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {/* Header: Signed in as */}
                    <div className="px-2.5 py-2">
                      <p className="text-[12px] font-normal leading-[16px] text-[#71717a] dark:text-neutral-400">
                        Signed in as
                      </p>
                      <p className="text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-white truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="h-px bg-[#f4f4f5] dark:bg-[#27272a] my-1" />

                    {/* Section 1: Navigation Links */}
                    <div className="space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-[#252525] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/builder"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-[#252525] transition-colors"
                      >
                        <Wand2 className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
                        <span>Builder</span>
                      </Link>
                      <Link
                        href="/docs"
                        onClick={() => setProfileOpen(false)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-[#252525] transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
                        <span>Documentation</span>
                      </Link>
                    </div>

                    <div className="h-px bg-[#f4f4f5] dark:bg-[#27272a] my-1" />

                    {/* Section 2: Theme Selector */}
                    <div className="px-2.5 py-1.5 flex items-center justify-between text-[12px] font-normal leading-[16px]">
                      <span className="text-[#71717a] dark:text-neutral-400">Theme</span>
                      <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-[#202023] rounded-[7px] border border-[#e4e4e7] dark:border-[#2e2e33]">
                        <button
                          type="button"
                          onClick={() => setTheme('system')}
                          className={`p-1 rounded-[5px] transition-all cursor-pointer ${
                            mounted && theme === 'system'
                              ? 'bg-white dark:bg-[#27272a] text-[oklch(0.145_0_0)] dark:text-white shadow-2xs font-semibold'
                              : 'text-[#71717a] dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white'
                          }`}
                          title="System"
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          className={`p-1 rounded-[5px] transition-all cursor-pointer ${
                            mounted && theme === 'light'
                              ? 'bg-white dark:bg-[#27272a] text-[oklch(0.145_0_0)] dark:text-white shadow-2xs font-semibold'
                              : 'text-[#71717a] dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white'
                          }`}
                          title="Light"
                        >
                          <Sun className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          className={`p-1 rounded-[5px] transition-all cursor-pointer ${
                            mounted && theme === 'dark'
                              ? 'bg-white dark:bg-[#27272a] text-[oklch(0.145_0_0)] dark:text-white shadow-2xs font-semibold'
                              : 'text-[#71717a] dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white'
                          }`}
                          title="Dark"
                        >
                          <Moon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-[#f4f4f5] dark:bg-[#27272a] my-1" />

                    {/* Section 3: Sign Out */}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[#e11d48] hover:bg-[#fff1f2] dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-[#e11d48] shrink-0" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Full Mobile Navigation Drawer ─── */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-x-0 top-[58px] bottom-0 w-full h-[calc(100dvh-58px)] bg-[#070709] z-[9999] flex flex-col justify-between p-6 animate-in fade-in slide-in-from-top-4 duration-200 overflow-y-auto"
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="space-y-6">
            {/* Navigation Links */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 px-3 pb-1">
                Menu
              </p>
              {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all ${
                    pathname === href
                      ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/30'
                      : 'text-neutral-200 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 text-neutral-400" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Auth / Profile Section */}
          <div className="pt-6 border-t border-neutral-800 space-y-3 pb-4">
            {!user ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-bold text-sm text-center transition-all hover:bg-neutral-800 cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm text-center shadow-lg shadow-brand-orange/20 transition-all cursor-pointer"
                >
                  Get started
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <div className="w-9 h-9 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">
                    {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-xs transition-colors hover:bg-rose-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
