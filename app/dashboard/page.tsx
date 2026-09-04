'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Logo, { SnapFormIcon } from '@/components/Logo';
import UserDropdownMenu from '@/components/UserDropdownMenu';
import CodeBlock from '@/components/CodeBlock';
import { Toaster, toast } from 'sonner';
import {
  LayoutDashboard,
  Plus,
  Globe,
  Settings,
  Inbox,
  Link2,
  Mail,
  Users,
  User,
  HelpCircle,
  MoreVertical,
  Calendar,
  Search,
  Flag,
  ShieldCheck,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Download,
  Trash2,
  X,
  FileSpreadsheet,
  Loader2,
  Check,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Share2,
  Clock,
  ArrowRight,
  Code2,
  TrendingUp,
  Eye,
  Activity,
  Zap,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

interface SavedForm {
  _id: string;
  shortId?: string;
  name: string;
  category: 'contact' | 'payment' | 'survey' | 'booking';
  description: string;
  fields: any[];
  styling: {
    theme: 'minimal' | 'modern' | 'corporate';
    primaryColor: string;
  };
  createdAt: string;
}

interface SubmissionRecord {
  id: string;
  data: Record<string, any>;
  submittedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Navigation and view state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formsMenuExpanded, setFormsMenuExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Form Activity Analytics State
  const [chartTimeframe, setChartTimeframe] = useState<'30days' | '7days' | '12months'>('30days');
  const [chartMetric, setChartMetric] = useState<'submissions' | 'impressions' | 'conversion'>('submissions');
  const [selectedChartForm, setSelectedChartForm] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number; data: any } | null>(null);

  // Forms and Submissions data state
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
  const [fetchingForms, setFetchingForms] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Active form for sidebar selection
  const [activeFormIndex, setActiveFormIndex] = useState(0);

  // Modals state
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedFormForSubmissions, setSelectedFormForSubmissions] = useState<SavedForm | null>(null);
  const [submissionsList, setSubmissionsList] = useState<SubmissionRecord[]>([]);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(false);
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState<SubmissionRecord | null>(null);

  // Setup / Integration modal
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [activeSetupForm, setActiveSetupForm] = useState<SavedForm | null>(null);
  const [setupTab, setSetupTab] = useState<'endpoint' | 'react' | 'embed'>('endpoint');
  const [copiedKey, setCopiedKey] = useState(false);

  // All forms view modal
  const [allFormsModalOpen, setAllFormsModalOpen] = useState(false);

  // Workspace info modal
  const [workspaceModal, setWorkspaceModal] = useState<'emails' | 'team' | 'account' | null>(null);
  const [accountModalTab, setAccountModalTab] = useState<'account' | 'agents' | 'preferences' | 'usage' | 'billing'>('account');
  const [accountNameInput, setAccountNameInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [modalPhotoError, setModalPhotoError] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);

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
  }, [user]);

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
        setWorkspaceModal(null);
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

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Fetch user's saved forms
  useEffect(() => {
    if (!user) {
      setFetchingForms(false);
      return;
    }

    async function fetchSavedForms() {
      try {
        setFetchingForms(true);
        const res = await fetch('/api/templates');
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const userForms = json.data.filter((f: any) => f.userId);
          setSavedForms(userForms);
        }
      } catch (err) {
        console.error('Failed to fetch saved forms:', err);
        toast.error('Failed to load your saved forms');
      } finally {
        setFetchingForms(false);
      }
    }

    fetchSavedForms();
  }, [user]);

  // Form Activity Backend Data State
  const [analyticsData, setAnalyticsData] = useState<{
    totalViews: number;
    totalSubmissions: number;
    avgConversion: string;
    avgResponseTime: string;
    timeSeries: Array<{ label: string; submissions: number; impressions: number; conversion: number }>;
  } | null>(null);
  const [fetchingAnalytics, setFetchingAnalytics] = useState(true);

  // Active form helper
  const currentActiveForm = useMemo(() => {
    if (savedForms.length > 0) {
      return savedForms[activeFormIndex] || savedForms[0];
    }
    return null;
  }, [savedForms, activeFormIndex]);

  // Submissions count calculation from live backend analytics
  const totalSubmissions = useMemo(() => {
    if (analyticsData && typeof analyticsData.totalSubmissions === 'number') {
      return analyticsData.totalSubmissions;
    }
    return 0;
  }, [analyticsData]);

  // Fetch real analytics from backend
  useEffect(() => {
    if (!user) {
      setFetchingAnalytics(false);
      return;
    }

    async function fetchAnalytics() {
      try {
        setFetchingAnalytics(true);
        const res = await fetch(`/api/analytics?timeframe=${chartTimeframe}&formId=${selectedChartForm}`);
        const json = await res.json();

        if (json.success && json.data) {
          setAnalyticsData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setFetchingAnalytics(false);
      }
    }

    fetchAnalytics();
  }, [user, chartTimeframe, selectedChartForm]);

  // ── Form Activity Data Source (Live Backend Data with Organic Spline) ─────────
  const activityData = useMemo(() => {
    if (analyticsData && Array.isArray(analyticsData.timeSeries) && analyticsData.timeSeries.length > 0) {
      return analyticsData.timeSeries;
    }

    if (chartTimeframe === '7days') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((label) => ({ label, submissions: 0, impressions: 0, conversion: 0 }));
    }

    if (chartTimeframe === '30days') {
      return Array.from({ length: 15 }, (_, i) => ({
        label: `Day ${i * 2 + 1}`,
        submissions: 0,
        impressions: 0,
        conversion: 0,
      }));
    }

    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    return months.map((label) => ({ label, submissions: 0, impressions: 0, conversion: 0 }));
  }, [analyticsData, chartTimeframe]);

  // SVG Smooth Curved Path Generator (Bézier Spline)
  const { pathData, areaPathData, points } = useMemo(() => {
    if (!activityData || activityData.length === 0) {
      return { pathData: '', areaPathData: '', points: [] };
    }

    const values = activityData.map((d) => d[chartMetric]);
    const maxVal = Math.max(...values, 1) * 1.15;
    const minVal = 0;
    const width = 1000;
    const height = 180;
    const paddingY = 20;

    const computedPoints = activityData.map((item, index) => {
      const x = (index / (activityData.length - 1)) * width;
      const normalizedY = (item[chartMetric] - minVal) / (maxVal - minVal);
      const y = height - normalizedY * (height - paddingY * 2) - paddingY;
      return { x, y, data: item };
    });

    if (computedPoints.length < 2) {
      return { pathData: '', areaPathData: '', points: computedPoints };
    }

    // Build smooth cubic Bézier curve
    let d = `M ${computedPoints[0].x},${computedPoints[0].y}`;
    for (let i = 0; i < computedPoints.length - 1; i++) {
      const p0 = computedPoints[i === 0 ? 0 : i - 1];
      const p1 = computedPoints[i];
      const p2 = computedPoints[i + 1];
      const p3 = computedPoints[i + 2 >= computedPoints.length ? computedPoints.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    const areaD = `${d} L ${computedPoints[computedPoints.length - 1].x},${height + 20} L ${computedPoints[0].x},${height + 20} Z`;

    return { pathData: d, areaPathData: areaD, points: computedPoints };
  }, [activityData, chartMetric]);

  // Open Submissions Viewer
  const handleOpenSubmissions = async (form: SavedForm) => {
    setSelectedFormForSubmissions(form);
    setSubmissionsModalOpen(true);
    setFetchingSubmissions(true);
    setSubmissionsList([]);

    try {
      const res = await fetch(`/api/templates/${form._id}/submissions`);
      const json = await res.json();

      if (json.success && Array.isArray(json.submissions)) {
        setSubmissionsList(json.submissions);
      } else {
        toast.error(json.message || 'Could not load submissions');
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      toast.error('Network error loading submissions');
    } finally {
      setFetchingSubmissions(false);
    }
  };

  // Open Form Setup
  const handleOpenSetup = (form: SavedForm) => {
    setActiveSetupForm(form);
    setSetupModalOpen(true);
  };

  // Select Form for Focused Analytics
  const handleSelectFormAnalytics = (form: SavedForm) => {
    const index = savedForms.findIndex((f) => f._id === form._id);
    if (index !== -1) {
      setActiveFormIndex(index);
    }
    setSelectedChartForm(form._id);
    setAllFormsModalOpen(false);
    toast.success(`Showing analytics for "${form.name}"`);
    setTimeout(() => {
      const el = document.getElementById('form-activity-chart');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Copy Hosted Link
  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/f/${formId}`;
    navigator.clipboard.writeText(url);
    toast.success('Public form link copied to clipboard!');
  };

  // Copy text helper
  const copyToClipboard = (text: string, label: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.success(label);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Export Submissions to CSV
  const handleExportCsv = () => {
    if (!selectedFormForSubmissions || submissionsList.length === 0) {
      toast.error('No submissions available to export');
      return;
    }

    const fields = selectedFormForSubmissions.fields || [];
    const headers = ['Submission ID', 'Submitted At', ...fields.map((f: any) => f.label || f.id)];

    const rows = submissionsList.map((sub) => {
      const rowData = [
        sub.id,
        new Date(sub.submittedAt).toISOString(),
        ...fields.map((f: any) => {
          const val = sub.data[f.id];
          if (val === undefined || val === null) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/"/g, '""');
          return `"${String(val).replace(/"/g, '""')}"`;
        }),
      ];
      return rowData.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${selectedFormForSubmissions.name.toLowerCase().replace(/\s+/g, '_')}_submissions.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Submissions CSV downloaded!');
  };

  // Handle Form Delete
  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        toast.success(json.message || 'Form deleted successfully!');
        setSavedForms((prev) => prev.filter((f) => f._id !== id));
      } else {
        toast.error(json.message || 'Failed to delete form');
      }
    } catch (err) {
      toast.error('Network error while deleting form');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl animate-pulse">
          <Logo href="/" textClassName="hidden" />
        </div>
        <p className="text-xs font-semibold text-neutral-400">Verifying session...</p>
      </div>
    );
  }

  // Get dynamic greeting
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#1E1E1E] text-brand-charcoal dark:text-neutral-100 font-sans flex flex-row antialiased selection:bg-brand-orange selection:text-white transition-colors duration-200">
      <Toaster position="bottom-right" richColors />

      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR
      ───────────────────────────────────────────────────────────── */}
      <aside
        style={{
          fontFamily:
            'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
        className={`sticky top-0 h-screen z-20 bg-[#f4f4f5] dark:bg-[#1C1C1C] border-r border-[#e5e5e8] dark:border-[#2a2a2a] flex flex-col justify-between shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width] ${sidebarCollapsed ? 'w-[68px]' : 'w-64'
          }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Sidebar Brand Header */}
          <div className="h-14 border-b border-[#e5e5e8] dark:border-[#2a2a2a] flex items-center justify-between px-3.5 shrink-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (sidebarCollapsed) setSidebarCollapsed(false);
                }}
                className={`w-8 h-8 rounded-[8px] bg-brand-charcoal hover:bg-black dark:bg-[#252525] dark:hover:bg-[#2e2e2e] text-white flex items-center justify-center transition-all duration-200 shrink-0 shadow-sm ${sidebarCollapsed ? 'cursor-pointer hover:scale-105' : ''
                  }`}
                title={sidebarCollapsed ? 'Expand sidebar' : 'SnapForm'}
              >
                <SnapFormIcon className="w-3.5 h-4.5 text-white" fill="#ffffff" />
              </button>
              <span
                className={`font-heading font-bold text-base text-brand-charcoal dark:text-white tracking-tight ml-2.5 overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed
                    ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                    : 'max-w-[140px] opacity-100 translate-x-0'
                  }`}
              >
                SnapForm
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1.5 rounded-xl text-neutral-500 hover:text-brand-charcoal dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[#2a2a2a] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shrink-0 ${sidebarCollapsed
                  ? 'max-w-0 opacity-0 pointer-events-none -translate-x-2'
                  : 'max-w-8 opacity-100 translate-x-0'
                }`}
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Input */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed
                ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none py-0'
                : 'max-h-16 opacity-100 translate-y-0 px-3 pt-3 pb-0.5'
              }`}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Find..."
                className="w-full bg-white dark:bg-[#1C1C1C] border border-[#e4e4e7] dark:border-[#2a2a2a] rounded-[8px] pl-7 pr-7 py-1 text-[12px] font-normal leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-100 placeholder:text-[#a1a1aa] dark:placeholder:text-[#71717a] focus:outline-none focus:border-[#71717a] dark:focus:border-[#4a4a4a] transition-all shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-[#a1a1aa] dark:text-[#71717a] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="text-[10px] font-mono text-[#71717a] dark:text-neutral-400 bg-[#e4e4e7] dark:bg-[#2a2a2a] border border-[#d4d4d8] dark:border-[#38383e] px-1 py-0.2 rounded-[4px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                F
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-4">
            {/* Dashboard Link (Active state) */}
            <div>
              <Link
                href="/dashboard"
                className={`w-full h-9 flex items-center rounded-[8px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-white bg-[#e4e4e7] dark:bg-[#2a2a2a] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  sidebarCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'
                }`}
                title="Dashboard"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-4 h-4 text-[#3f3f46] dark:text-neutral-300 shrink-0" />
                </div>
                {!sidebarCollapsed && (
                  <span className="overflow-hidden whitespace-nowrap truncate">
                    Dashboard
                  </span>
                )}
              </Link>
            </div>

            {/* FORMS Section */}
            <div className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between px-2.5 py-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{
                        fontFamily: 'Inter, "Inter Fallback", sans-serif',
                      }}
                      className="text-[12px] font-medium leading-[16px] uppercase tracking-wider text-[oklab(0.145_-0.00000143796_0.00000340492_/_0.7)] dark:text-[#a1a1aa]"
                    >
                      FORMS
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, "Inter Fallback", sans-serif',
                      }}
                      className="text-[11px] font-normal leading-[16px] text-[oklab(0.145_-0.00000143796_0.00000340492_/_0.7)] dark:text-[#71717a]"
                    >
                      {savedForms.length || 1}
                    </span>
                  </div>
                  <Link
                    href="/builder"
                    className="w-4 h-4 rounded flex items-center justify-center text-neutral-400 hover:text-brand-charcoal dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Create new form in Studio"
                  >
                    <Plus className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Primary Active Form Item with Dropdown */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    if (sidebarCollapsed) {
                      setSidebarCollapsed(false);
                      setFormsMenuExpanded(true);
                    } else {
                      setFormsMenuExpanded(!formsMenuExpanded);
                    }
                  }}
                  className={`w-full h-9 flex items-center rounded-[8px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-200 hover:bg-[#e8e8eb] dark:hover:bg-neutral-800/70 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                  }`}
                  title={currentActiveForm ? currentActiveForm.name : 'Forms'}
                >
                  <div className={`flex items-center min-w-0 ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="overflow-hidden whitespace-nowrap text-left truncate max-w-[140px]">
                        {currentActiveForm ? currentActiveForm.name : 'SnapForm'}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 shrink-0 ${
                        formsMenuExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  )}
                </button>

                {/* Sub-links when expanded */}
                {formsMenuExpanded && !sidebarCollapsed && (
                  <div className="pl-6 pr-2 space-y-0.5 animate-in fade-in duration-150">
                    <button
                      onClick={() => currentActiveForm && handleSelectFormAnalytics(currentActiveForm)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-300 hover:bg-[#e8e8eb] dark:hover:bg-neutral-800/70 transition-colors cursor-pointer text-left"
                    >
                      <Activity className="w-3.5 h-3.5 text-brand-orange" />
                      <span>View Analytics</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm && handleOpenSetup(currentActiveForm)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-300 hover:bg-[#e8e8eb] dark:hover:bg-neutral-800/70 transition-colors cursor-pointer text-left"
                    >
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Form Setup</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm ? router.push(`/builder?t=${currentActiveForm.category}`) : router.push('/builder')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-300 hover:bg-[#e8e8eb] dark:hover:bg-neutral-800/70 transition-colors cursor-pointer text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm && handleOpenSubmissions(currentActiveForm)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-300 hover:bg-[#e8e8eb] dark:hover:bg-neutral-800/70 transition-colors cursor-pointer text-left"
                    >
                      <Inbox className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Submissions</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm && handleOpenSetup(currentActiveForm)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-300 hover:bg-[#e8e8eb] dark:hover:bg-neutral-800/70 transition-colors cursor-pointer text-left"
                    >
                      <Link2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Integrations</span>
                    </button>
                  </div>
                )}

                {/* View all forms link */}
                {!sidebarCollapsed && (
                  <button
                    onClick={() => setAllFormsModalOpen(true)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[8px] text-[12px] font-medium leading-[16px] text-neutral-600 dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white hover:bg-[#e8e8eb] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />
                      <span>View all forms</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* Bottom Sidebar Widget & User Profile */}
        <div className="p-3 border-t border-[#e5e5e8] dark:border-[#2a2a2a] space-y-2.5 shrink-0 bg-[#f4f4f5] dark:bg-[#1C1C1C]">
          {/* Help & Support */}
          <Link
            href="/docs"
            className={`w-full h-9 flex items-center rounded-[8px] text-[12px] font-medium leading-[16px] text-[oklch(0.145_0_0)] dark:text-neutral-300 hover:bg-[#e8e8eb] dark:hover:bg-[#262626] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
            }`}
            title="Help & Support"
          >
            <div className={`flex items-center min-w-0 ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0" />
              </div>
              {!sidebarCollapsed && (
                <span className="overflow-hidden whitespace-nowrap truncate max-w-[150px]">
                  Help & Support
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            )}
          </Link>

          {/* User Profile Bar with Dropdown Matching Exact Design */}
          <UserDropdownMenu
            collapsed={sidebarCollapsed}
            align="bottom-to-top"
            avatarUrl={profilePhoto}
            onOpenAccountModal={(tab) => {
              setWorkspaceModal('account');
              if (tab) setAccountModalTab(tab);
            }}
          />
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA
      ───────────────────────────────────────────────────────────── */}
      <main
        style={{
          fontFamily:
            'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
        className="relative flex-1 h-screen overflow-y-auto p-6 md:p-8 space-y-6 bg-white dark:bg-[#1E1E1E] transition-colors duration-200"
      >
        {/* Dynamic Greeting Header */}
        <div className="pt-1">
          <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight">
            {greeting}
          </h1>
        </div>

        {/* ─── Top 3 Stat Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Total Form Views */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-neutral-200/90 dark:border-[#2e2e2e] rounded-2xl p-4 sm:p-4.5 shadow-2xs hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 text-brand-orange" />
              <span>Total Form Views</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                {fetchingAnalytics ? '...' : analyticsData ? analyticsData.totalViews : 0}
              </p>
            </div>
          </div>

          {/* Card 2: Total Submissions */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-neutral-200/90 dark:border-[#2e2e2e] rounded-2xl p-4 sm:p-4.5 shadow-2xs hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs font-semibold">
              <Flag className="w-3.5 h-3.5 text-brand-orange" />
              <span>Total Submissions</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                {totalSubmissions}
              </p>
            </div>
          </div>

          {/* Card 3: Total Spam Blocked */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-neutral-200/90 dark:border-[#2e2e2e] rounded-2xl p-4 sm:p-4.5 shadow-2xs hover:shadow-xs transition-all space-y-2">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
              <span>Total Spam Blocked</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                0
              </p>
            </div>
          </div>
        </div>

        {/* ─── Middle Info Cards (Forms Overview & Quick Links) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 4: Forms Overview */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-neutral-200/90 dark:border-[#2e2e2e] rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-neutral-700 dark:text-neutral-200 text-sm font-semibold">
                <FileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <span>Forms Overview</span>
              </div>
              <Link
                href="/builder"
                className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New form</span>
              </Link>
            </div>

            {/* Forms List inside Overview */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {savedForms.length === 0 ? (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-[#2e2e2e] bg-neutral-50/80 dark:bg-[#252525] text-center text-xs text-neutral-500 dark:text-neutral-400">
                  No forms created yet. Click "+ New form" to get started.
                </div>
              ) : (
                savedForms.slice(0, 3).map((form, idx) => {
                  const isSelected = selectedChartForm === form._id || (selectedChartForm === 'all' && idx === activeFormIndex);
                  return (
                    <div
                      key={form._id}
                      onClick={() => handleSelectFormAnalytics(form)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${selectedChartForm === form._id
                        ? 'border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 shadow-xs'
                        : 'border-neutral-200 dark:border-[#2e2e2e] bg-neutral-50/80 dark:bg-[#252525] hover:border-neutral-300 dark:hover:border-[#3e3e3e] hover:bg-neutral-100/70 dark:hover:bg-[#2c2c2c]'
                        }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-brand-charcoal dark:text-white truncate group-hover:text-brand-orange transition-colors">
                            {form.name}
                          </h4>
                          <span className="text-[9px] font-semibold uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-[#333333] text-neutral-600 dark:text-neutral-300">
                            {form.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {form.fields?.length || 0} fields · Created {new Date(form.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectFormAnalytics(form)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${selectedChartForm === form._id
                            ? 'bg-brand-orange text-white'
                            : 'bg-white dark:bg-[#333333] border border-neutral-200 dark:border-[#3e3e3e] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3d3d3d]'
                            }`}
                          title="Show analytics on dashboard"
                        >
                          <Activity className="w-3 h-3" />
                          <span>{selectedChartForm === form._id ? 'Active' : 'Stats'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenSetup(form)}
                          className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-[#3e3e3e] bg-white dark:bg-[#333333] text-neutral-600 dark:text-neutral-300 hover:text-brand-charcoal dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Form settings"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setAllFormsModalOpen(true)}
                className="text-xs font-semibold text-brand-charcoal dark:text-white hover:text-brand-orange transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>View all forms ({savedForms.length || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {currentActiveForm && (
                <button
                  onClick={() => handleOpenSubmissions(currentActiveForm)}
                  className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Submissions</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 5: Quick Links & Documentation */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-neutral-200/90 dark:border-[#2e2e2e] rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-700 dark:text-neutral-200 text-sm font-semibold">
              <BookOpen className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>Quick Links & Documentation</span>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <Link
                href="/builder"
                className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>Form templates & Studio</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs"
                className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>Customization docs</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs#guides"
                className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>How to Guides</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs#troubleshooting"
                className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>Troubleshooting</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs#api"
                className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>API reference & endpoints</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Bottom Area: Form Activity & Analytics Chart ─── */}
        <div id="form-activity-chart" className="bg-white dark:bg-[#1E1E1E] border border-neutral-200/90 dark:border-[#2e2e2e] rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all space-y-6 scroll-mt-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Activity className="w-4 h-4 text-brand-orange" />
                <h3 className="text-base font-bold text-brand-charcoal dark:text-white font-heading">
                  Form Activity & Analytics
                </h3>
                {selectedChartForm !== 'all' && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold animate-in fade-in duration-150">
                    <span>
                      {savedForms.find((f) => f._id === selectedChartForm)?.name || 'Selected Form'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedChartForm('all');
                        toast.info('Showing analytics across all forms');
                      }}
                      className="hover:text-neutral-900 ml-1 cursor-pointer font-bold"
                      title="Show All Forms"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 font-normal">
                {selectedChartForm === 'all'
                  ? 'Real-time tracking of submissions, impressions, and conversion rates across all forms'
                  : `Real-time analytics for ${savedForms.find((f) => f._id === selectedChartForm)?.name || 'selected form'}`}
              </p>
            </div>

            {/* Metric Pills & Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Metric Toggle Tabs */}
              <div className="flex items-center p-1 bg-neutral-100/80 dark:bg-[#252525] rounded-xl border border-neutral-200/60 dark:border-[#333333]">
                <button
                  onClick={() => setChartMetric('submissions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${chartMetric === 'submissions'
                    ? 'bg-white dark:bg-[#1E1E1E] text-brand-orange shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white'
                    }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Submissions</span>
                </button>
                <button
                  onClick={() => setChartMetric('impressions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${chartMetric === 'impressions'
                    ? 'bg-white dark:bg-[#1E1E1E] text-brand-charcoal dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white'
                    }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Views</span>
                </button>
                <button
                  onClick={() => setChartMetric('conversion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${chartMetric === 'conversion'
                    ? 'bg-white dark:bg-[#1E1E1E] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white'
                    }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Conversion %</span>
                </button>
              </div>

              {/* Form Filter */}
              {savedForms.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedChartForm}
                    onChange={(e) => setSelectedChartForm(e.target.value)}
                    className="appearance-none bg-white dark:bg-[#252525] border border-neutral-200 dark:border-[#333333] rounded-xl px-3 py-1.5 pr-7 text-xs font-semibold text-neutral-700 dark:text-neutral-200 outline-none hover:border-neutral-300 dark:hover:border-[#3e3e3e] focus:border-brand-orange cursor-pointer shadow-xs"
                  >
                    <option value="all">All Forms</option>
                    {savedForms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {/* Timeframe Dropdown */}
              <div className="relative">
                <select
                  value={chartTimeframe}
                  onChange={(e) => setChartTimeframe(e.target.value as any)}
                  className="appearance-none bg-white dark:bg-[#252525] border border-neutral-200 dark:border-[#333333] rounded-xl px-3 py-1.5 pr-7 text-xs font-semibold text-neutral-700 dark:text-neutral-200 outline-none hover:border-neutral-300 dark:hover:border-[#3e3e3e] focus:border-brand-orange cursor-pointer shadow-xs"
                >
                  <option value="30days">Last 30 days</option>
                  <option value="7days">Last 7 days</option>
                  <option value="12months">Last 12 months</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-neutral-100 dark:border-[#2e2e2e]">
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200/70 dark:border-[#333333]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                Total Views
              </span>
              <p className="text-lg font-extrabold text-brand-charcoal dark:text-white font-heading mt-0.5">
                {fetchingAnalytics ? '...' : analyticsData ? analyticsData.totalViews : 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200/70 dark:border-[#333333]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                Submissions
              </span>
              <p className="text-lg font-extrabold text-brand-orange font-heading mt-0.5">
                {fetchingAnalytics ? '...' : analyticsData ? analyticsData.totalSubmissions : 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200/70 dark:border-[#333333]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                Avg. Conversion
              </span>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5">
                {fetchingAnalytics ? '...' : analyticsData ? `${analyticsData.avgConversion}%` : '0.0%'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#252525] border border-neutral-200/70 dark:border-[#333333]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                Avg. Response
              </span>
              <p className="text-lg font-extrabold text-brand-charcoal dark:text-white font-heading mt-0.5">
                {fetchingAnalytics ? '...' : analyticsData?.avgResponseTime || '42s'}
              </p>
            </div>
          </div>

          {/* SVG Bézier Curve Chart */}
          <div className="w-full h-64 pt-2 relative flex flex-col justify-between select-none">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-35">
              <div className="border-b border-dashed border-neutral-300 w-full" />
              <div className="border-b border-dashed border-neutral-300 w-full" />
              <div className="border-b border-dashed border-neutral-300 w-full" />
              <div className="border-b border-dashed border-neutral-300 w-full" />
            </div>

            {/* SVG Visual Wave Curve */}
            <div className="relative flex-1 w-full">
              <svg
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 1000 180"
              >
                <defs>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={
                        chartMetric === 'submissions'
                          ? '#ff4f19'
                          : chartMetric === 'impressions'
                            ? '#4f46e5'
                            : '#059669'
                      }
                      stopOpacity="0.38"
                    />
                    <stop
                      offset="70%"
                      stopColor={
                        chartMetric === 'submissions'
                          ? '#ff4f19'
                          : chartMetric === 'impressions'
                            ? '#4f46e5'
                            : '#059669'
                      }
                      stopOpacity="0.06"
                    />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled Area with Smooth Curve */}
                {areaPathData && <path d={areaPathData} fill="url(#activityGradient)" />}

                {/* Line Stroke with Smooth Curve */}
                {pathData && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={
                      chartMetric === 'submissions'
                        ? '#ff4f19'
                        : chartMetric === 'impressions'
                          ? '#4f46e5'
                          : '#059669'
                    }
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points on hover */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    {/* Invisible hover area target */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ index: idx, x: p.x, y: p.y, data: p.data })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* Visible point */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint?.index === idx ? '6' : '3.5'}
                      fill={
                        chartMetric === 'submissions'
                          ? '#ff4f19'
                          : chartMetric === 'impressions'
                            ? '#4f46e5'
                            : '#059669'
                      }
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-150 pointer-events-none"
                    />
                  </g>
                ))}
              </svg>

              {/* Floating Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-brand-charcoal text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-neutral-700 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    left: `${(hoveredPoint.x / 1000) * 100}%`,
                    top: `${Math.max((hoveredPoint.y / 180) * 100 - 15, 0)}%`,
                  }}
                >
                  <p className="font-bold text-neutral-300 text-[10px] uppercase font-mono tracking-wider">
                    {hoveredPoint.data.label}
                  </p>
                  <div className="flex items-center gap-3 mt-1 font-semibold">
                    <span className="text-brand-orange">
                      {hoveredPoint.data.submissions} Submissions
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-200">
                      {hoveredPoint.data.impressions} Views
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-emerald-400">
                      {hoveredPoint.data.conversion}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 pt-3 border-t border-neutral-100 dark:border-neutral-800 font-mono">
              {activityData.map((item, idx) => (
                <span
                  key={item.label}
                  className={idx === activityData.length - 1 ? 'text-brand-orange font-bold' : ''}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. ALL FORMS CATALOG MODAL
      ───────────────────────────────────────────────────────────── */}
      {allFormsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-neutral-200 dark:border-[#2e2e2e] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-100 dark:border-[#2e2e2e] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-charcoal dark:text-white font-heading">Your Forms</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Manage and preview all your created form endpoints</p>
              </div>
              <button
                onClick={() => setAllFormsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-[#2a2a2a] hover:bg-neutral-200 dark:hover:bg-[#333333] text-neutral-600 dark:text-neutral-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {savedForms.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#2a2a2a] flex items-center justify-center mx-auto text-neutral-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-charcoal dark:text-white">No custom forms saved yet</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                      Build your first form in Studio and save it to generate endpoints and collect submissions.
                    </p>
                  </div>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-orange text-white text-xs font-bold hover:bg-brand-orange-hover transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Form in Studio</span>
                  </Link>
                </div>
              ) : (
                savedForms.map((form) => {
                  const isSelected = selectedChartForm === form._id;
                  return (
                    <div
                      key={form._id}
                      onClick={() => handleSelectFormAnalytics(form)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${isSelected
                        ? 'border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 shadow-xs'
                        : 'border-neutral-200 dark:border-[#2e2e2e] hover:border-neutral-300 dark:hover:border-[#3e3e3e] bg-neutral-50 dark:bg-[#252525] hover:bg-neutral-100/80 dark:hover:bg-[#2c2c2c]'
                        }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-charcoal dark:text-white group-hover:text-brand-orange transition-colors">
                            {form.name}
                          </span>
                          <span className="text-[10px] font-semibold uppercase font-mono px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange">
                            {form.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {form.fields?.length || 0} fields · Created {new Date(form.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectFormAnalytics(form)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${isSelected
                            ? 'border-brand-orange bg-brand-orange text-white'
                            : 'border-neutral-200 dark:border-[#3e3e3e] bg-white dark:bg-[#333333] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3d3d3d]'
                            }`}
                          title="View analytics on dashboard"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Analytics</span>
                        </button>
                        <button
                          onClick={() => {
                            setAllFormsModalOpen(false);
                            handleOpenSetup(form);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-[#3e3e3e] bg-white dark:bg-[#333333] text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3d3d3d] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Globe className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Setup</span>
                        </button>
                        <button
                          onClick={() => {
                            setAllFormsModalOpen(false);
                            handleOpenSubmissions(form);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-[#3e3e3e] bg-white dark:bg-[#333333] text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3d3d3d] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Inbox className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Submissions</span>
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form._id)}
                          disabled={deletingId === form._id}
                          className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete form"
                        >
                          {deletingId === form._id ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FORM SETUP & INTEGRATION MODAL
      ───────────────────────────────────────────────────────────── */}
      {setupModalOpen && activeSetupForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-neutral-200 dark:border-[#2e2e2e] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-100 dark:border-[#2e2e2e] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-charcoal dark:text-white font-heading">{activeSetupForm.name} — Setup</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Send form submissions directly into your SnapForm dashboard</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/f/${activeSetupForm.shortId || activeSetupForm._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-[#3e3e3e] bg-white dark:bg-[#333333] hover:bg-neutral-50 dark:hover:bg-[#3d3d3d] text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Open live public hosted form"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Open Live Form</span>
                </a>
                <button
                  onClick={() => setSetupModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab selection */}
            <div className="px-6 pt-4 border-b border-neutral-100 dark:border-[#2e2e2e] flex gap-4 text-xs font-bold">
              <button
                onClick={() => setSetupTab('endpoint')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${setupTab === 'endpoint'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-neutral-400 hover:text-brand-charcoal dark:hover:text-white'
                  }`}
              >
                POST Endpoint
              </button>
              <button
                onClick={() => setSetupTab('react')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${setupTab === 'react'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-neutral-400 hover:text-brand-charcoal dark:hover:text-white'
                  }`}
              >
                React / Next.js
              </button>
              <button
                onClick={() => setSetupTab('embed')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${setupTab === 'embed'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-neutral-400 hover:text-brand-charcoal dark:hover:text-white'
                  }`}
              >
                Hosted Link
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {setupTab === 'endpoint' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono">
                        POST Ingestion Endpoint
                      </label>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
                        For HTML forms & AJAX
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/f/${activeSetupForm.shortId || activeSetupForm._id}`}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#333333] text-xs font-mono text-neutral-800 dark:text-neutral-200 select-all outline-none"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/api/f/${activeSetupForm.shortId || activeSetupForm._id}`,
                            'Endpoint copied!'
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-brand-charcoal dark:bg-[#2a2a2a] text-white hover:bg-black dark:hover:bg-[#333333] border border-transparent dark:border-[#383838] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">HTML Example</label>
                    <CodeBlock
                      language="html"
                      filename="index.html"
                      code={`<form action="${typeof window !== 'undefined' ? window.location.origin : ''}/api/f/${activeSetupForm.shortId || activeSetupForm._id}" method="POST">
  <input type="text" name="name" required placeholder="Your Name" />
  <input type="email" name="email" required placeholder="Your Email" />
  <textarea name="message" required placeholder="Your Message"></textarea>
  <button type="submit">Send Message</button>
</form>`}
                    />
                  </div>
                </div>
              )}

              {setupTab === 'react' && (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Use standard fetch or Axios to submit JSON directly from your React / Next.js client component:
                  </p>
                  <CodeBlock
                    language="typescript"
                    filename="ContactForm.tsx"
                    code={`const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch('${typeof window !== 'undefined' ? window.location.origin : ''}/api/f/${activeSetupForm.shortId || activeSetupForm._id}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello from SnapForm!'
    })
  });
  const data = await res.json();
  if (data.success) alert('Form submitted successfully!');
};`}
                  />
                </div>
              )}

              {setupTab === 'embed' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#2e2e2e] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-charcoal dark:text-white">Public Hosted Page</span>
                      <a
                        href={`/f/${activeSetupForm.shortId || activeSetupForm._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1"
                      >
                        <span>Open Form</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono break-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/f/${activeSetupForm.shortId || activeSetupForm._id}` : ''}
                    </p>
                    <button
                      onClick={() => handleCopyLink(activeSetupForm.shortId || activeSetupForm._id)}
                      className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Hosted Form Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SUBMISSIONS MODAL
      ───────────────────────────────────────────────────────────── */}
      {submissionsModalOpen && selectedFormForSubmissions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-neutral-200 dark:border-[#2e2e2e] shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-[#2e2e2e] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-charcoal dark:text-white font-heading">
                  {selectedFormForSubmissions.name} — Submissions
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {submissionsList.length} total response{submissionsList.length === 1 ? '' : 's'} recorded
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  disabled={submissionsList.length === 0}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-[#383838] bg-white dark:bg-[#252525] hover:bg-neutral-50 dark:hover:bg-[#2d2d2d] text-xs font-semibold text-brand-charcoal dark:text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    setSubmissionsModalOpen(false);
                    setSelectedSubmissionDetail(null);
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-[#2a2a2a] hover:bg-neutral-200 dark:hover:bg-[#333333] text-neutral-600 dark:text-neutral-300 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {fetchingSubmissions ? (
                <div className="py-16 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-orange mx-auto" />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Loading submissions...</p>
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#252525] flex items-center justify-center mx-auto text-neutral-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-brand-charcoal dark:text-white">No submissions yet</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    Share your form link or connect the POST endpoint to start collecting real-time submissions.
                  </p>
                </div>
              ) : (
                <div className="border border-neutral-200/80 dark:border-[#2e2e2e] rounded-2xl overflow-hidden shadow-2xs bg-white dark:bg-[#1E1E1E]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/90 dark:bg-[#252525] border-b border-neutral-200/80 dark:border-[#2e2e2e] text-neutral-600 dark:text-neutral-300 font-medium">
                          <th className="py-3 px-4 whitespace-nowrap font-medium text-xs">Submitted At</th>
                          {selectedFormForSubmissions.fields?.map((f: any) => (
                            <th key={f.id} className="py-3 px-4 whitespace-nowrap font-medium text-xs">
                              {f.label || f.id}
                            </th>
                          ))}
                          <th className="py-3 px-4 text-right whitespace-nowrap font-medium text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-[#2a2a2a] bg-white dark:bg-[#1E1E1E]">
                        {submissionsList.map((sub) => (
                          <tr
                            key={sub.id}
                            onClick={() => setSelectedSubmissionDetail(sub)}
                            className="hover:bg-neutral-50/80 dark:hover:bg-[#252525] transition-colors cursor-pointer group"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                                {new Date(sub.submittedAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            {selectedFormForSubmissions.fields?.map((f: any) => (
                              <td key={f.id} className="py-3 px-4 text-neutral-700 dark:text-neutral-300 max-w-[200px] truncate text-xs">
                                {sub.data?.[f.id] !== undefined && sub.data?.[f.id] !== '' ? (
                                  typeof sub.data[f.id] === 'boolean' ? (
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${sub.data[f.id]
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                        : 'bg-neutral-100 dark:bg-[#2a2a2a] text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                      {sub.data[f.id] ? 'Yes' : 'No'}
                                    </span>
                                  ) : (
                                    String(sub.data[f.id])
                                  )
                                ) : (
                                  <span className="text-neutral-300 dark:text-neutral-600">—</span>
                                )}
                              </td>
                            ))}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubmissionDetail(sub);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#2a2a2a] hover:bg-neutral-200 dark:hover:bg-[#333333] text-neutral-700 dark:text-neutral-200 text-[11px] font-semibold transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Detail Drawer / Inspector */}
            {selectedSubmissionDetail && (
              <div className="border-t border-neutral-200 dark:border-[#2e2e2e] bg-neutral-50 dark:bg-[#151515] p-6 space-y-4 max-h-72 overflow-y-auto animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider font-mono">
                      Submission Details
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Recorded on {new Date(selectedSubmissionDetail.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmissionDetail(null)}
                    className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedFormForSubmissions.fields?.map((f: any) => (
                    <div key={f.id} className="p-3 rounded-xl bg-white dark:bg-[#202023] border border-neutral-200/80 dark:border-[#2e2e2e] space-y-1">
                      <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
                        {f.label || f.id}
                      </span>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white break-words">
                        {selectedSubmissionDetail.data?.[f.id] !== undefined &&
                          selectedSubmissionDetail.data?.[f.id] !== ''
                          ? String(selectedSubmissionDetail.data[f.id])
                          : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. WORKSPACE DETAILS MODAL (Emails / Team / Account)
      ───────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────
          6. WORKSPACE DETAILS MODAL (Emails / Team / Account)
      ───────────────────────────────────────────────────────────── */}
      {workspaceModal && workspaceModal !== 'account' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-neutral-200 dark:border-[#2e2e2e] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-brand-charcoal dark:text-neutral-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-charcoal dark:text-white capitalize font-heading">
                {workspaceModal === 'emails' && 'Linked Notification Emails'}
                {workspaceModal === 'team' && 'Team Collaboration'}
              </h3>
              <button
                onClick={() => setWorkspaceModal(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-[#27272a] hover:bg-neutral-200 dark:hover:bg-[#323238] text-neutral-600 dark:text-neutral-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {workspaceModal === 'emails' && (
              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <p>Form submissions will notify the primary account address:</p>
                <div className="p-3 bg-neutral-50 dark:bg-[#202023] rounded-xl border border-neutral-200 dark:border-[#27272a] font-mono font-semibold text-brand-charcoal dark:text-white flex items-center justify-between">
                  <span>{user.email}</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            )}

            {workspaceModal === 'team' && (
              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <p>Invite teammates to collaborate on form schemas, templates, and submissions.</p>
                <div className="p-4 bg-brand-orange/5 dark:bg-brand-orange/10 rounded-2xl border border-brand-orange/20 text-brand-charcoal dark:text-neutral-200 space-y-2">
                  <p className="font-bold text-brand-orange">Team collaboration is rolling out!</p>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    You will be able to add teammates with granular role-based permissions.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setWorkspaceModal(null)}
              className="w-full py-2.5 rounded-xl bg-brand-charcoal text-white font-bold text-xs hover:bg-black transition-colors cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. ACCOUNT SETTINGS MODAL (Clean Single-Surface Dialog)
      ───────────────────────────────────────────────────────────── */}
      {workspaceModal === 'account' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
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
                onClick={() => setWorkspaceModal(null)}
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
                          alt="Avatar"
                          onError={() => setModalPhotoError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : user.name ? (
                        user.name
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      ) : user.email ? (
                        user.email.slice(0, 2).toUpperCase()
                      ) : (
                        'AN'
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. DELETE ACCOUNT CONFIRMATION MODAL (Exact Matching Mockup)
      ───────────────────────────────────────────────────────────── */}
      {deleteAccountModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            style={{
              fontFamily:
                'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
            className="bg-[#242424] rounded-[20px] border border-[#333333] shadow-2xl max-w-[390px] w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 text-left"
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
                  'Delete account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
