'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  BookOpen,
  Search,
  Star,
  User,
  LayoutDashboard,
  Wand2,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function Navbar() {
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/60 border-b border-white/10 shadow-2xl backdrop-blur-2xl flex items-center text-white font-sans">
        <div className="w-full max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-20 flex items-center gap-6">
          <Logo href="/" textClassName="text-white font-black text-[22px] leading-none tracking-tight" />

          <nav className="hidden md:flex items-center gap-9 ml-3">
            {[
              { label: 'Builder', href: '/builder' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Docs', href: '/docs' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[15px] font-semibold text-neutral-300 hover:text-white transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                  placeholder="Search templates & prompts..."
                  className="w-[280px] h-11 bg-black/80 border border-white/20 rounded-full pl-11 pr-14 text-sm text-white placeholder-neutral-400 outline-none focus:border-brand-orange transition-all"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 h-6 min-w-9 rounded-md border border-white/20 bg-neutral-900 px-2 text-center text-[10px] leading-6 text-neutral-400 shadow-sm font-mono">
                  ESC
                </kbd>
              </form>
            ) : (
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
                className="flex items-center gap-3 h-11 w-[280px] rounded-full border border-white/10 bg-white/5 px-4 text-left transition-all duration-150 hover:bg-white/10 hover:border-brand-orange/40 group cursor-pointer"
              >
                <Search className="w-4 h-4 text-neutral-400 group-hover:text-brand-orange transition-colors" />
                <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors flex-1">Search</span>
                <kbd className="h-6 min-w-9 rounded-md border border-white/15 bg-neutral-900 px-2 text-center text-[10px] leading-6 text-neutral-400 shadow-sm font-mono">
                  Ctrl K
                </kbd>
              </button>
            )}
          </div>

          <Link
            href="/docs"
            aria-label="Open docs"
            className="hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition-all duration-150 hover:bg-white/10 hover:text-white hover:border-brand-orange/40 shrink-0"
          >
            <BookOpen className="w-[18px] h-[18px]" />
          </Link>

          <a
            href="https://github.com/Anuxragg/SnapForm"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 h-11 rounded-full border border-white/10 bg-white/5 px-4 transition-all duration-150 hover:bg-white/10 hover:border-brand-orange/40 group shrink-0"
          >
            <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.94c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" /></svg>
            <span className="text-sm font-bold text-white transition-colors">Github</span>
            <Star className="w-[15px] h-[15px] text-neutral-400 group-hover:text-brand-orange transition-colors" />
          </a>

          {!user ? (
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <button
                onClick={() => openAuthModal('login')}
                className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer px-1 py-1"
              >
                Sign in
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-hover px-4 py-2 rounded-full transition-all duration-150 cursor-pointer shadow-lg shadow-brand-orange/20"
              >
                Get started
              </button>
            </div>
          ) : (
            <div className="relative shrink-0" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 h-11 px-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-all duration-150 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                  {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors hidden sm:block max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-neutral-900/95 border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Account</p>
                    <p className="text-xs font-semibold text-white mt-1 truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  {[
                    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
                    { icon: Wand2, label: 'Builder', href: '/builder' },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer text-left"
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
      </header>
    </>
  );
}
