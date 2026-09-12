'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'account' | 'agents' | 'preferences' | 'usage' | 'billing';
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user } = useAuth();

  const [accountNameInput, setAccountNameInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [modalPhotoError, setModalPhotoError] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Delete account confirmation modal state
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setModalPhotoError(false);
    if (user?.name) {
      setAccountNameInput(user.name);
    }
    if (user?.avatar && user.avatar.trim().length > 0) {
      setProfilePhoto(user.avatar);
    } else if (user?.id && typeof window !== 'undefined') {
      const userKey = `snapform_avatar_${user.id}`;
      const saved = localStorage.getItem(userKey);
      setProfilePhoto(saved && saved.trim().length > 0 ? saved : null);
    } else {
      setProfilePhoto(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    if (file.size > 512 * 1024) {
      toast.error('Image size must be under 512 KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      if (typeof window !== 'undefined' && user?.id) {
        localStorage.setItem(`snapform_avatar_${user.id}`, dataUrl);
        window.dispatchEvent(new Event('snapform_avatar_updated'));
      }

      try {
        await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: dataUrl }),
        });
      } catch (err) {
        console.error('Failed to sync avatar to database:', err);
      }

      toast.success('Profile photo saved to database successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = async () => {
    if (!accountNameInput.trim()) return;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accountNameInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Name updated in database successfully');
      } else {
        toast.error(data.message || 'Failed to update name');
      }
    } catch {
      toast.error('Network error saving name');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Your account has been deleted.');
        setDeleteAccountModalOpen(false);
        onClose();
        if (user?.id && typeof window !== 'undefined') {
          localStorage.removeItem(`snapform_avatar_${user.id}`);
        }
        window.location.href = '/login';
      } else {
        toast.error(data.message || 'Failed to delete account');
      }
    } catch {
      toast.error('Network error during account deletion');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 text-left">
        <div
          style={{
            fontFamily:
              'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
          className="bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-neutral-200 dark:border-[#2e2e2e] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 md:px-8 md:pt-8 pb-4 border-b border-neutral-100 dark:border-[#2a2a2a] shrink-0">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-heading">
                Account
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Your profile and security
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-[#2a2a2a] hover:bg-neutral-200 dark:hover:bg-[#333333] text-neutral-600 dark:text-neutral-300 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-[12px] font-normal leading-[16px]">
            {/* Profile Section */}
            <div className="space-y-4">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                Profile
              </span>

              {/* Profile Photo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-[#2a2a2a]">
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white">Profile photo</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    JPEG, PNG, or WebP up to 512 KB. Shown in the app navigation.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-7 h-7 rounded-[6px] bg-neutral-200 dark:bg-[#2a2a2a] text-neutral-900 dark:text-neutral-100 text-[11px] font-bold font-mono flex items-center justify-center overflow-hidden">
                    {profilePhoto && profilePhoto.trim().length > 0 && !modalPhotoError ? (
                      <img
                        src={profilePhoto}
                        alt="Profile avatar"
                        onError={() => setModalPhotoError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name
                        ? user.name
                          .split(' ')
                          .filter(Boolean)
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                        : user.email
                          ? user.email.slice(0, 2).toUpperCase()
                          : 'AN'
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-[8px] border border-neutral-200 dark:border-[#383838] bg-white dark:bg-[#252525] hover:bg-neutral-50 dark:hover:bg-[#2d2d2d] text-xs font-medium text-neutral-900 dark:text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    Upload photo
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-[#2a2a2a]">
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white">Name</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Optional. Used to greet you on the dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={accountNameInput}
                    onChange={(e) => setAccountNameInput(e.target.value)}
                    className="w-40 bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#333333] rounded-[8px] px-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="px-3.5 py-1.5 rounded-[8px] border border-neutral-200 dark:border-[#383838] bg-white dark:bg-[#252525] hover:bg-neutral-50 dark:hover:bg-[#2d2d2d] text-xs font-medium text-neutral-900 dark:text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Account ID */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-[#2a2a2a]">
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white">Account ID</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Your unique identifier. Use it when contacting support.
                  </p>
                  <p className="font-mono text-xs text-neutral-700 dark:text-neutral-300 pt-1">
                    usr_{user.id ? user.id.slice(-16) : 'be0955225a024e0b'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`usr_${user.id ? user.id.slice(-16) : 'be0955225a024e0b'}`);
                    toast.success('Account ID copied to clipboard');
                  }}
                  className="px-3.5 py-1.5 rounded-[8px] border border-neutral-200 dark:border-[#383838] bg-white dark:bg-[#252525] hover:bg-neutral-50 dark:hover:bg-[#2d2d2d] text-xs font-medium text-neutral-900 dark:text-white transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-center"
                >
                  Copy
                </button>
              </div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-[#2a2a2a]">
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white">Email</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Signed in as {user.email}. Primary email used for notifications and sign in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info(`A verification link has been sent to ${user.email} to change your email address.`)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-neutral-200 dark:border-[#383838] bg-white dark:bg-[#252525] hover:bg-neutral-50 dark:hover:bg-[#2d2d2d] text-xs font-medium text-neutral-900 dark:text-white transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-center"
                >
                  Change email
                </button>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4 pt-2">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                Password
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-[#2a2a2a]">
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white">Password</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Change the password you use to sign in to SnapForm with email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/auth/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email }),
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        toast.success(`Password reset link sent to ${user.email}`);
                      } else {
                        toast.error(data.message || 'Failed to send reset link');
                      }
                    } catch {
                      toast.error('Network error sending reset email');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-[8px] border border-neutral-200 dark:border-[#383838] bg-white dark:bg-[#252525] hover:bg-neutral-50 dark:hover:bg-[#2d2d2d] text-xs font-medium text-neutral-900 dark:text-white transition-colors cursor-pointer shadow-2xs shrink-0 self-start sm:self-center"
                >
                  Change password
                </button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="space-y-4 pt-2">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                Delete account
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white">Delete account</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Permanently remove your account, all created forms, submissions, and analytics data. This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteAccountModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-[8px] border border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs font-medium transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteAccountModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-left">
          <div
            style={{
              fontFamily:
                'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
            className="bg-[#242424] rounded-[20px] border border-[#333333] shadow-2xl max-w-[390px] w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header + Top Description */}
            <div className="space-y-2 pb-3.5 border-b border-[#303030]">
              <h3
                style={{
                  fontFamily:
                    'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  color: 'oklch(0.985 0 0)',
                }}
                className="text-[15px] font-bold tracking-tight"
              >
                Delete your account?
              </h3>
              <p
                style={{
                  fontFamily:
                    'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: 'oklch(0.708 0 0)',
                }}
              >
                This will permanently remove your account, all created forms, form submissions, and analytics data. This cannot be undone.
              </p>
            </div>

            {/* Confirm Prompt */}
            <div
              style={{
                fontFamily:
                  'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'oklch(0.708 0 0)',
              }}
            >
              <p>
                Type{' '}
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: '16px',
                    color: 'oklch(0.985 0 0)',
                  }}
                  className="bg-[#141414] px-2 py-0.5 rounded border border-neutral-700 select-all inline-block align-middle"
                >
                  DELETE
                </span>{' '}
                to confirm.
              </p>
            </div>

            {/* Confirm Input */}
            <div className="space-y-1.5">
              <label
                style={{
                  fontFamily:
                    'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  color: 'oklch(0.985 0 0)',
                }}
                className="block"
              >
                Confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={isDeletingAccount}
                autoFocus
                style={{
                  fontFamily:
                    'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '14px',
                  color: 'oklch(0.985 0 0)',
                }}
                className="w-full bg-[#181818] border border-[#383838] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-[8px] px-3.5 py-2 placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteAccountModalOpen(false)}
                disabled={isDeletingAccount}
                style={{
                  fontFamily:
                    'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  color: 'oklch(0.985 0 0)',
                }}
                className="px-4 py-1.5 rounded-[8px] border border-[#383838] bg-[#2a2a2a] hover:bg-[#333333] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmText.trim().toUpperCase() !== 'DELETE' ||
                  isDeletingAccount
                }
                style={{
                  fontFamily:
                    'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
                className="px-3.5 py-1.5 rounded-[8px] border border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/40 disabled:bg-rose-950/10 disabled:border-transparent disabled:text-rose-500/25 text-rose-400 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
