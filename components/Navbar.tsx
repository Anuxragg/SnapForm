'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, LogOut, LayoutDashboard, Wand2, Star, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, openAuthModal } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/builder?prompt=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 border-b border-brand-border/80 shadow-sm shadow-brand-charcoal/5 backdrop-blur-xl flex items-center">
        <div className="w-full max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-20 flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group"
          >
            <span className="text-[28px] leading-none text-brand-orange transition-transform duration-200 group-hover:scale-105" aria-hidden="true">⚡</span>
            <span className="text-brand-charcoal font-black text-[24px] leading-none tracking-tight">snapform</span>
          </Link>

          <nav className="hidden md:flex items-center gap-9 ml-3">
            {[
              { label: 'Builder', href: '/builder' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Docs', href: '/docs' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[15px] font-semibold text-brand-charcoal/55 hover:text-brand-charcoal transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/45" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) {
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search"
                  className="w-[280px] h-11 bg-brand-sand border border-brand-border rounded-full pl-11 pr-14 text-base text-brand-charcoal placeholder-brand-charcoal/45 outline-none focus:border-brand-orange/50 focus:bg-white transition-all"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 h-6 min-w-9 rounded-md border border-brand-border bg-white px-2 text-center text-[11px] leading-6 text-brand-charcoal/45 shadow-sm">
                  ESC
                </kbd>
              </form>
            ) : (
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
                className="flex items-center gap-3 h-11 w-[280px] rounded-full border border-brand-border bg-brand-sand px-4 text-left transition-all duration-150 hover:bg-white hover:border-brand-orange/40 group cursor-pointer"
              >
                <Search className="w-4 h-4 text-brand-charcoal/45 group-hover:text-brand-orange transition-colors" />
                <span className="text-base text-brand-charcoal/45 group-hover:text-brand-charcoal/70 transition-colors flex-1">Search</span>
                <kbd className="h-6 min-w-9 rounded-md border border-brand-border bg-white px-2 text-center text-[11px] leading-6 text-brand-charcoal/45 shadow-sm">
                  Ctrl K
                </kbd>
              </button>
            )}
          </div>

          <Link
            href="/docs"
            aria-label="Open docs"
            className="hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-sand text-brand-charcoal/55 transition-all duration-150 hover:bg-white hover:text-brand-orange hover:border-brand-orange/40 shrink-0"
          >
            <BookOpen className="w-[18px] h-[18px]" />
          </Link>

          <a
            href="https://github.com/Anuxragg/SnapForm"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 h-11 rounded-full border border-brand-border bg-brand-sand px-4 transition-all duration-150 hover:bg-white hover:border-brand-orange/40 group shrink-0"
          >
            <svg className="w-[18px] h-[18px] text-brand-charcoal" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.94c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" /></svg>
            <span className="text-sm font-bold text-brand-charcoal transition-colors">Github</span>
            <Star className="w-[15px] h-[15px] text-brand-charcoal/35 group-hover:text-brand-orange transition-colors" />
            <span className="text-sm font-medium text-brand-charcoal/45 group-hover:text-brand-charcoal/70 transition-colors"></span>
          </a>

          {!user ? (
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <button
                onClick={() => openAuthModal('login')}
                className="text-sm font-semibold text-brand-charcoal/55 hover:text-brand-charcoal transition-colors cursor-pointer px-1 py-1"
              >
                Sign in
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="text-sm font-bold text-white bg-brand-charcoal hover:bg-brand-orange px-4 py-2 rounded-full transition-all duration-150 cursor-pointer shadow-sm"
              >
                Get started
              </button>
            </div>
          ) : (
            <div className="relative shrink-0" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 h-11 px-2.5 rounded-full border border-brand-border bg-brand-sand hover:bg-white transition-all duration-150 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-brand-charcoal text-white text-[10px] font-black flex items-center justify-center">
                  {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-brand-charcoal/70 group-hover:text-brand-charcoal transition-colors hidden sm:block max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-brand-charcoal/40 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-white border border-brand-border rounded-2xl shadow-2xl shadow-brand-charcoal/10 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-brand-border mb-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-brand-charcoal/35">Account</p>
                    <p className="text-xs font-semibold text-brand-charcoal mt-1 truncate">{user.name}</p>
                    <p className="text-[10px] text-brand-charcoal/45 truncate mt-0.5">{user.email}</p>
                  </div>

                  {[
                    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                    { icon: Wand2, label: 'Builder', href: '/builder' },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-sand transition-all duration-100"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </Link>
                  ))}

                  <div className="h-px bg-brand-border my-1" />

                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-100 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="h-16" />
    </>
  );
}






