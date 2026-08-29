'use client';

import React, { useState, useRef, useEffect } from 'react';
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

const NAV_LINKS = [
  { label: 'Builder', href: '/builder', icon: Wand2 },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Docs', href: '/docs', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
      <header className="fixed top-0 left-0 right-0 z-50 h-[58px] bg-black/75 border-b border-white/10 shadow-2xl backdrop-blur-2xl flex items-center text-white font-sans transition duration-500 ease-in-out">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-15 h-[58px] flex items-center justify-between gap-4 transition duration-500 ease-in-out">

          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo href="/" textClassName="text-white font-semibold text-xl sm:text-[22px] leading-none tracking-tight font-heading" />

            <nav className="hidden md:flex items-center gap-7 lg:gap-9">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`text-[15px] font-semibold transition-colors duration-150 ${
                    pathname === href ? 'text-brand-orange' : 'text-neutral-300 hover:text-white'
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
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer px-3 py-1.5"
                >
                  Sign in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-hover px-4.5 py-2 rounded-full transition-all duration-150 cursor-pointer shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98]"
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
                  <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-neutral-900/95 border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                      <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-neutral-400">Account</p>
                      <p className="text-xs font-medium text-white mt-1 truncate">{user.name}</p>
                      <p className="text-[10px] font-normal text-neutral-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    {[
                      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                      { icon: Wand2, label: 'Builder', href: '/builder' },
                    ].map(({ icon: Icon, label, href }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <Icon className="w-4 h-4 text-neutral-400" />
                        <span>{label}</span>
                      </Link>
                    ))}

                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Log out</span>
                      </button>
                    </div>
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
