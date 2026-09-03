'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from 'next-themes';
import {
  CreditCard,
  BookOpen,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronsUpDown,
  Headphones,
  IdCard,
} from 'lucide-react';

interface UserDropdownMenuProps {
  collapsed?: boolean;
  align?: 'bottom-to-top' | 'top-to-bottom';
  onOpenAccountModal?: (tab?: 'account' | 'agents' | 'preferences' | 'usage' | 'billing') => void;
  avatarUrl?: string | null;
}

export default function UserDropdownMenu({
  collapsed = false,
  align = 'bottom-to-top',
  onOpenAccountModal,
  avatarUrl: propAvatarUrl,
}: UserDropdownMenuProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [internalAvatarUrl, setInternalAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const updateAvatarFromStorage = useCallback(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const saved = localStorage.getItem(`snapform_avatar_${user.id}`);
      setInternalAvatarUrl(saved || user?.avatar || null);
    } else {
      setInternalAvatarUrl(user?.avatar || null);
    }
  }, [user?.id, user?.avatar]);

  useEffect(() => {
    setMounted(true);
    setImgError(false);
    updateAvatarFromStorage();

    const handleAvatarUpdated = () => {
      setImgError(false);
      updateAvatarFromStorage();
    };

    window.addEventListener('snapform_avatar_updated', handleAvatarUpdated);
    window.addEventListener('storage', handleAvatarUpdated);
    return () => {
      window.removeEventListener('snapform_avatar_updated', handleAvatarUpdated);
      window.removeEventListener('storage', handleAvatarUpdated);
    };
  }, [updateAvatarFromStorage]);

  const activeAvatar = propAvatarUrl !== undefined ? propAvatarUrl : internalAvatarUrl;

  const hasValidAvatar = Boolean(
    activeAvatar &&
    typeof activeAvatar === 'string' &&
    activeAvatar.trim().length > 0 &&
    !imgError
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      }
    }
  };

  if (!user) return null;

  // Extract initials (e.g. "AN")
  const initials = user.name
    ? user.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : user.email
      ? user.email.slice(0, 2).toUpperCase()
      : 'AN';

  const isUp = align === 'bottom-to-top';

  const fontStyle = {
    fontFamily:
      'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  return (
    <div className="relative w-full" ref={menuRef} style={fontStyle}>
      {/* ─── Trigger Button ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center rounded-xl border border-neutral-200/90 dark:border-[#2a2a2a] bg-white dark:bg-[#1C1C1C] hover:border-neutral-400 dark:hover:border-[#52525b] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-2xs select-none ${collapsed
            ? 'justify-center p-1.5'
            : 'justify-between px-2.5 py-1.5 gap-2'
          }`}
        title={user.email}
        aria-expanded={isOpen}
      >
        <div className="flex items-center min-w-0 gap-2">
          {/* Initials badge */}
          <div className="w-5 h-5 rounded-[5px] bg-neutral-200/80 dark:bg-[#2a2a2a] text-[oklch(0.145_0_0)] dark:text-neutral-100 text-[11px] font-bold font-mono tracking-tight shrink-0 flex items-center justify-center overflow-hidden">
            {hasValidAvatar ? (
              <img
                src={activeAvatar!}
                alt={user.name || user.email || 'Avatar'}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <span
            className={`text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${collapsed
                ? 'max-w-0 opacity-0 -translate-x-1 pointer-events-none'
                : 'max-w-[155px] opacity-100 translate-x-0 truncate'
              }`}
          >
            {user.email}
          </span>
        </div>

        <ChevronsUpDown
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${collapsed ? 'max-w-0 opacity-0 pointer-events-none scale-50' : 'max-w-4 opacity-100 scale-100'
            }`}
        />
      </button>

      {/* ─── Popup Dropdown Menu ────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`absolute left-0 w-[240px] bg-white dark:bg-[#1C1C1C] border border-[#e4e4e7] dark:border-[#2a2a2a] rounded-[14px] shadow-2xl p-1.5 z-50 text-[oklch(0.145_0_0)] dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-100 ${isUp ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          style={fontStyle}
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

          {/* Section 1: Account & Billing */}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenAccountModal) {
                  onOpenAccountModal('account');
                }
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-[#252525] transition-colors cursor-pointer text-left"
            >
              <IdCard className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
              <span>Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenAccountModal) {
                  onOpenAccountModal('billing');
                }
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-[#252525] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
                <span>Upgrade</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenAccountModal) {
                  onOpenAccountModal('billing');
                }
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-[#252525] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
                <span>Billing</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#71717a] dark:text-neutral-500" />
            </button>
          </div>

          <div className="h-px bg-[#f4f4f5] dark:bg-neutral-800 my-1" />

          {/* Section 2: Docs & Contact */}
          <div className="space-y-0.5">
            <Link
              href="/docs"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
                <span>Docs</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#71717a] dark:text-neutral-500" />
            </Link>

            <a
              href="mailto:support@snapform.io"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#f4f4f5] dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Headphones className="w-4 h-4 text-[#3f3f46] dark:text-neutral-400 shrink-0" />
                <span>Contact</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#71717a] dark:text-neutral-500" />
            </a>
          </div>

          <div className="h-px bg-[#f4f4f5] dark:bg-[#27272a] my-1" />

          {/* Section 3: Theme & Sounds */}
          <div className="px-2.5 py-1.5 space-y-2 text-[12px] font-normal leading-[16px]">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] dark:text-neutral-400">Theme</span>
              <div className="flex items-center p-0.5 bg-white dark:bg-[#202023] rounded-[7px] border border-[#e4e4e7] dark:border-[#2e2e33]">
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`p-1 rounded-[5px] transition-all cursor-pointer ${mounted && theme === 'system'
                      ? 'bg-neutral-100 dark:bg-[#27272a] text-[oklch(0.145_0_0)] dark:text-white shadow-2xs font-semibold'
                      : 'text-[#71717a] dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white'
                    }`}
                  title="System Theme"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`p-1 rounded-[5px] transition-all cursor-pointer ${mounted && theme === 'light'
                      ? 'bg-neutral-100 dark:bg-[#27272a] text-[oklch(0.145_0_0)] dark:text-white shadow-2xs font-semibold'
                      : 'text-[#71717a] dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white'
                    }`}
                  title="Light Theme"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`p-1 rounded-[5px] transition-all cursor-pointer ${mounted && theme === 'dark'
                      ? 'bg-neutral-100 dark:bg-[#27272a] text-[oklch(0.145_0_0)] dark:text-white shadow-2xs font-semibold'
                      : 'text-[#71717a] dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white'
                    }`}
                  title="Dark Theme"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sounds Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[#71717a] dark:text-neutral-400">Sounds</span>
              <button
                type="button"
                onClick={() => setSoundsEnabled(!soundsEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${soundsEnabled ? 'bg-[#2563eb]' : 'bg-[#e4e4e7] dark:bg-[#2e2e33]'
                  }`}
                aria-label="Toggle sounds"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${soundsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>

          <div className="h-px bg-[#f4f4f5] dark:bg-[#27272a] my-1" />

          {/* Section 4: Sign out */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[12px] font-normal leading-[16px] text-[#e11d48] hover:bg-[#fff1f2] dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-[#e11d48] shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
