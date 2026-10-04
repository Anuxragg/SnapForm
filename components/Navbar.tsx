'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard,
  Wand2,
  BookOpen,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Logo from '@/components/Logo';
import UserDropdownMenu from '@/components/UserDropdownMenu';

const NAV_LINKS = [
  { label: 'Builder', href: '/builder', icon: Wand2 },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Docs', href: '/docs', icon: BookOpen },
];

const MOBILE_NAV_LINKS = [
  { label: 'Builder', href: '/builder' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Docs', href: '/docs' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms & Services', href: '/terms' },
];

interface NavbarProps {
  forceDark?: boolean;
}

export default function Navbar({ forceDark = false }: NavbarProps) {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const headerClass = forceDark
    ? 'fixed top-0 left-0 right-0 z-50 h-16 bg-black/75 border-b border-white/10 shadow-2xl backdrop-blur-2xl flex items-center text-white font-sans transition-colors duration-200'
    : 'fixed top-0 left-0 right-0 z-50 h-16 bg-[#f4f3ef]/80 dark:bg-black/75 border-b border-brand-border/80 dark:border-white/10 shadow-xs dark:shadow-2xl backdrop-blur-xl flex items-center text-brand-charcoal dark:text-white font-sans transition-colors duration-200';

  const logoTextClass = forceDark
    ? 'text-white font-semibold text-[15px] sm:text-[16px] leading-none tracking-tight font-heading'
    : 'text-brand-charcoal dark:text-white font-semibold text-[15px] sm:text-[16px] leading-none tracking-tight font-heading';

  const getNavLinkClass = (href: string) => {
    if (pathname === href) {
      return 'text-brand-orange font-semibold';
    }
    return forceDark
      ? 'text-neutral-300 hover:text-white'
      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white';
  };

  const signInBtnClass = forceDark
    ? 'whitespace-nowrap text-[13px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5'
    : 'text-[13px] font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer px-3 py-1.5';

  const mobileToggleClass = forceDark
    ? 'p-2 rounded-xl bg-transparent border-0 text-neutral-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors duration-75 cursor-pointer'
    : 'p-2 rounded-xl bg-transparent border-0 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 transition-colors duration-75 cursor-pointer';

  return (
    <>
      <header className={headerClass}>
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-15 h-16 flex items-center justify-between gap-2 sm:gap-4">

          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-7">
            <Logo
              href="/"
              iconContainerClassName="w-7 h-7 rounded-[8px]"
              iconClassName="w-3.5 h-5 text-white"
              textClassName={logoTextClass}
            />

            <nav className="hidden md:flex items-center gap-5 lg:gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`text-[13px] font-medium transition-colors duration-150 ${getNavLinkClass(href)}`}
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
                  className={signInBtnClass}
                >
                  {forceDark ? 'Log in' : 'Sign in'}
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className={forceDark
                    ? 'whitespace-nowrap rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-neutral-950 hover:bg-neutral-200 transition-colors cursor-pointer'
                    : 'text-[13px] font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover px-3.5 py-1.5 rounded-[8px] transition-all duration-150 cursor-pointer shadow-md shadow-brand-orange/20'}
                >
                  {forceDark ? 'Sign up' : 'Get started'}
                </button>
              </div>
            ) : (
              <UserDropdownMenu triggerType="avatar" align="top-to-bottom" />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-1 sm:hidden">
            {!user && (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="whitespace-nowrap px-1.5 py-1.5 text-[13px] font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-[12px] font-semibold text-neutral-950 hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={mobileToggleClass}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 transition-none" /> : <Menu className="w-5 h-5 transition-none" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Full Mobile Navigation Drawer ─── */}
      {mobileMenuOpen && (
        <div
          className={`mobile-menu-enter sm:hidden fixed inset-x-0 top-16 bottom-0 w-full h-[calc(100dvh-64px)] z-[9999] flex flex-col justify-between p-6 overflow-y-auto ${
            forceDark
              ? 'bg-[#070709] text-white border-t border-neutral-800'
              : 'bg-[#f4f3ef] dark:bg-[#070709] text-brand-charcoal dark:text-white border-t border-brand-border dark:border-neutral-800'
          }`}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="space-y-5">
            {MOBILE_NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[25px] leading-tight font-medium tracking-tight text-neutral-100 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Profile Section */}
          {user && (
            <div className={`pt-6 border-t space-y-3 pb-4 ${forceDark ? 'border-neutral-800' : 'border-brand-border dark:border-neutral-800'}`}>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
                  forceDark
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-white dark:bg-neutral-900 border-brand-border dark:border-neutral-800'
                }`}>
                  <div className="w-9 h-9 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">
                    {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${forceDark ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>{user.name}</p>
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
            </div>
          )}
        </div>
      )}
    </>
  );
}
