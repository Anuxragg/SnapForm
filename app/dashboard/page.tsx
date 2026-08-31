'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Logo, { SnapFormIcon } from '@/components/Logo';
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

  return (
    <div className="relative min-h-screen bg-white text-brand-charcoal font-sans flex flex-row antialiased selection:bg-brand-orange selection:text-white">
      <Toaster position="bottom-right" richColors />

      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR
      ───────────────────────────────────────────────────────────── */}
      <aside
        className={`sticky top-0 h-screen z-20 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Sidebar Brand Header */}
          <div className={`h-14 border-b border-neutral-100 flex items-center shrink-0 ${
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}>
            {!sidebarCollapsed ? (
              <>
                <Logo
                  href="/"
                  showText={true}
                  textClassName="text-base font-bold text-brand-charcoal tracking-tight font-heading truncate"
                />
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 rounded-xl text-neutral-500 hover:text-brand-charcoal hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-9 h-9 rounded-xl bg-brand-charcoal hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 group"
                title="Expand sidebar"
              >
                <SnapFormIcon className="w-3.5 h-4.5 text-white" fill="#ffffff" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-4">
            {/* Dashboard Link */}
            <div>
              <Link
                href="/dashboard"
                className={`flex items-center rounded-xl text-sm font-bold bg-neutral-100 text-brand-charcoal border border-neutral-200/80 shadow-xs transition-all ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-orange shrink-0" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </Link>
            </div>

            {/* FORMS Section */}
            <div className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  <div className="flex items-center gap-1.5">
                    <span>FORMS</span>
                    <span className="text-[10px] text-neutral-500 font-mono font-normal">
                      {savedForms.length || 1}
                    </span>
                  </div>
                  <Link
                    href="/builder"
                    className="w-4 h-4 rounded flex items-center justify-center text-neutral-400 hover:text-brand-charcoal hover:bg-neutral-100 transition-colors cursor-pointer"
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
                  className={`w-full flex items-center rounded-xl text-sm font-semibold text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer group ${
                    sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                  }`}
                  title={currentActiveForm ? currentActiveForm.name : 'Forms'}
                >
                  <div className={`flex items-center min-w-0 ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <div className="w-4 h-4 rounded text-neutral-500 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-neutral-600" />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="truncate text-left font-medium text-[13px]">
                        {currentActiveForm ? currentActiveForm.name : 'SnapForm'}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
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
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                    >
                      <Activity className="w-3.5 h-3.5 text-brand-orange" />
                      <span>View Analytics</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm && handleOpenSetup(currentActiveForm)}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                    >
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Form Setup</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm ? router.push(`/builder?t=${currentActiveForm.category}`) : router.push('/builder')}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm && handleOpenSubmissions(currentActiveForm)}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                    >
                      <Inbox className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Submissions</span>
                    </button>
                    <button
                      onClick={() => currentActiveForm && handleOpenSetup(currentActiveForm)}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left"
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
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-500 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer"
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

            {/* WORKSPACE Section */}
            <div className="space-y-0.5">
              {!sidebarCollapsed && (
                <p className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  WORKSPACE
                </p>
              )}

              <button
                onClick={() => setWorkspaceModal('emails')}
                className={`w-full flex items-center rounded-xl text-sm font-medium text-neutral-700 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                }`}
                title="Linked Emails"
              >
                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                {!sidebarCollapsed && <span>Linked Emails</span>}
              </button>

              <button
                onClick={() => setWorkspaceModal('team')}
                className={`w-full flex items-center rounded-xl text-sm font-medium text-neutral-700 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                }`}
                title="Team"
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Users className="w-4 h-4 text-neutral-500 shrink-0" />
                  {!sidebarCollapsed && <span>Team</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full font-mono uppercase">
                    New
                  </span>
                )}
              </button>

              <button
                onClick={() => setWorkspaceModal('account')}
                className={`w-full flex items-center rounded-xl text-sm font-medium text-neutral-700 hover:text-brand-charcoal hover:bg-neutral-50 transition-colors cursor-pointer text-left ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                }`}
                title="My Account"
              >
                <User className="w-4 h-4 text-neutral-500 shrink-0" />
                {!sidebarCollapsed && <span>My Account</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Widget & User Profile */}
        <div className="p-3 border-t border-neutral-100 space-y-2.5 shrink-0 bg-white">
          {/* Help & Support */}
          <Link
            href="/docs"
            className={`flex items-center rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors ${
              sidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-1.5'
            }`}
            title="Help & Support"
          >
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0" />
              {!sidebarCollapsed && <span>Help & Support</span>}
            </div>
            {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
          </Link>

          {/* User Profile Bar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer group text-left ${
                sidebarCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
              }`}
              title={user.name || 'User Profile'}
            >
              <div className={`flex items-center min-w-0 ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <div className="w-8 h-8 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-brand-charcoal truncate">{user.name || 'User'}</p>
                    <p className="text-[11px] text-neutral-500 truncate font-normal">{user.email}</p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && <MoreVertical className="w-4 h-4 text-neutral-400 group-hover:text-brand-charcoal" />}
            </button>

            {/* Profile Dropdown */}
            {userMenuOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                  <p className="text-xs font-bold text-brand-charcoal truncate">{user.name}</p>
                  <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                </div>
                <Link
                  href="/builder"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Form Studio</span>
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA
      ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-7xl bg-white">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-charcoal tracking-tight font-heading">
            Dashboard
          </h1>
          <p className="text-sm font-normal text-neutral-500">
            Here&apos;s an overview of your account!
          </p>
        </div>

        {/* ─── Top 3 Stat Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Form Views */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-700 text-sm font-semibold">
              <Eye className="w-4 h-4 text-brand-orange" />
              <span>Total Form Views</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-charcoal tracking-tight font-heading">
                {fetchingAnalytics ? '...' : analyticsData ? analyticsData.totalViews : 0}
              </p>
            </div>
            <div className="text-xs text-neutral-400">
              Impressions across all published endpoints
            </div>
          </div>

          {/* Card 2: Total Submissions */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-700 text-sm font-semibold">
              <Flag className="w-4 h-4 text-brand-orange" />
              <span>Total Submissions</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-charcoal tracking-tight font-heading">
                {totalSubmissions}
              </p>
            </div>
            <div className="text-xs text-neutral-400">
              Across all live forms and endpoints
            </div>
          </div>

          {/* Card 3: Total Spam Blocked */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-700 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              <span>Total Spam Blocked</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-charcoal tracking-tight font-heading">
                0
              </p>
            </div>
            <div className="text-xs text-neutral-400">
              Bot protection active on all endpoints
            </div>
          </div>
        </div>

        {/* ─── Middle Info Cards (Forms Overview & Quick Links) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 4: Forms Overview */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-neutral-700 text-sm font-semibold">
                <FileText className="w-4 h-4 text-neutral-500" />
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
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 text-center text-xs text-neutral-500">
                  No forms created yet. Click "+ New form" to get started.
                </div>
              ) : (
                savedForms.slice(0, 3).map((form, idx) => {
                  const isSelected = selectedChartForm === form._id || (selectedChartForm === 'all' && idx === activeFormIndex);
                  return (
                    <div
                      key={form._id}
                      onClick={() => handleSelectFormAnalytics(form)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        selectedChartForm === form._id
                          ? 'border-brand-orange bg-brand-orange/5 shadow-xs'
                          : 'border-neutral-200 bg-neutral-50/80 hover:border-neutral-300 hover:bg-neutral-100/70'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-brand-charcoal truncate group-hover:text-brand-orange transition-colors">
                            {form.name}
                          </h4>
                          <span className="text-[9px] font-semibold uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-600">
                            {form.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          {form.fields?.length || 0} fields · Created {new Date(form.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectFormAnalytics(form)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                            selectedChartForm === form._id
                              ? 'bg-brand-orange text-white'
                              : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                          }`}
                          title="Show analytics on dashboard"
                        >
                          <Activity className="w-3 h-3" />
                          <span>{selectedChartForm === form._id ? 'Active' : 'Stats'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenSetup(form)}
                          className="w-7 h-7 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-brand-charcoal flex items-center justify-center transition-colors cursor-pointer"
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
                className="text-xs font-semibold text-brand-charcoal hover:text-brand-orange transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>View all forms ({savedForms.length || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {currentActiveForm && (
                <button
                  onClick={() => handleOpenSubmissions(currentActiveForm)}
                  className="text-xs font-semibold text-neutral-600 hover:text-brand-charcoal transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Submissions</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 5: Quick Links & Documentation */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-700 text-sm font-semibold">
              <BookOpen className="w-4 h-4 text-neutral-500" />
              <span>Quick Links & Documentation</span>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <Link
                href="/builder"
                className="flex items-center justify-between text-neutral-700 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>Form templates & Studio</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs"
                className="flex items-center justify-between text-neutral-700 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>Customization docs</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs#guides"
                className="flex items-center justify-between text-neutral-700 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>How to Guides</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs#troubleshooting"
                className="flex items-center justify-between text-neutral-700 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>Troubleshooting</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/docs#api"
                className="flex items-center justify-between text-neutral-700 hover:text-brand-orange transition-colors py-0.5"
              >
                <span>API reference & endpoints</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Bottom Area: Form Activity & Analytics Chart ─── */}
        <div id="form-activity-chart" className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all space-y-6 scroll-mt-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Activity className="w-4 h-4 text-brand-orange" />
                <h3 className="text-base font-bold text-brand-charcoal font-heading">
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
              <div className="flex items-center p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/60">
                <button
                  onClick={() => setChartMetric('submissions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    chartMetric === 'submissions'
                      ? 'bg-white text-brand-orange shadow-xs'
                      : 'text-neutral-500 hover:text-brand-charcoal'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Submissions</span>
                </button>
                <button
                  onClick={() => setChartMetric('impressions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    chartMetric === 'impressions'
                      ? 'bg-white text-brand-charcoal shadow-xs'
                      : 'text-neutral-500 hover:text-brand-charcoal'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Views</span>
                </button>
                <button
                  onClick={() => setChartMetric('conversion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    chartMetric === 'conversion'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-neutral-500 hover:text-brand-charcoal'
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
                    className="appearance-none bg-white border border-neutral-200 rounded-xl px-3 py-1.5 pr-7 text-xs font-semibold text-neutral-700 outline-none hover:border-neutral-300 focus:border-brand-orange cursor-pointer shadow-xs"
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
                  className="appearance-none bg-white border border-neutral-200 rounded-xl px-3 py-1.5 pr-7 text-xs font-semibold text-neutral-700 outline-none hover:border-neutral-300 focus:border-brand-orange cursor-pointer shadow-xs"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-neutral-100">
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Total Views
              </span>
              <p className="text-lg font-extrabold text-brand-charcoal font-heading mt-0.5">
                {fetchingAnalytics ? '...' : analyticsData ? analyticsData.totalViews : 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Submissions
              </span>
              <p className="text-lg font-extrabold text-brand-orange font-heading mt-0.5">
                {fetchingAnalytics ? '...' : analyticsData ? analyticsData.totalSubmissions : 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Avg. Conversion
              </span>
              <p className="text-lg font-extrabold text-emerald-600 font-heading mt-0.5">
                {fetchingAnalytics ? '...' : analyticsData ? `${analyticsData.avgConversion}%` : '0.0%'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Avg. Response
              </span>
              <p className="text-lg font-extrabold text-brand-charcoal font-heading mt-0.5">
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
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 pt-3 border-t border-neutral-100 font-mono">
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-charcoal font-heading">Your Forms</h3>
                <p className="text-xs text-neutral-500">Manage and preview all your created form endpoints</p>
              </div>
              <button
                onClick={() => setAllFormsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {savedForms.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-charcoal">No custom forms saved yet</p>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                        isSelected
                          ? 'border-brand-orange bg-brand-orange/5 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50 hover:bg-neutral-100/80'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-charcoal group-hover:text-brand-orange transition-colors">
                            {form.name}
                          </span>
                          <span className="text-[10px] font-semibold uppercase font-mono px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange">
                            {form.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {form.fields?.length || 0} fields · Created {new Date(form.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectFormAnalytics(form)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isSelected
                              ? 'border-brand-orange bg-brand-orange text-white'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
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
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Globe className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Setup</span>
                        </button>
                        <button
                          onClick={() => {
                            setAllFormsModalOpen(false);
                            handleOpenSubmissions(form);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Inbox className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Submissions</span>
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form._id)}
                          disabled={deletingId === form._id}
                          className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-charcoal font-heading">{activeSetupForm.name} — Setup</h3>
                <p className="text-xs text-neutral-500">Send form submissions directly into your SnapForm dashboard</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/f/${activeSetupForm.shortId || activeSetupForm._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
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
            <div className="px-6 pt-4 border-b border-neutral-100 flex gap-4 text-xs font-bold">
              <button
                onClick={() => setSetupTab('endpoint')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                  setupTab === 'endpoint'
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-neutral-400 hover:text-brand-charcoal'
                }`}
              >
                POST Endpoint
              </button>
              <button
                onClick={() => setSetupTab('react')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                  setupTab === 'react'
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-neutral-400 hover:text-brand-charcoal'
                }`}
              >
                React / Next.js
              </button>
              <button
                onClick={() => setSetupTab('embed')}
                className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                  setupTab === 'embed'
                    ? 'border-brand-orange text-brand-orange'
                    : 'border-transparent text-neutral-400 hover:text-brand-charcoal'
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
                      <label className="text-xs font-bold text-brand-charcoal uppercase tracking-wider font-mono">
                        POST Ingestion Endpoint
                      </label>
                      <span className="text-[11px] text-neutral-500 font-sans">
                        For HTML forms & AJAX
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/f/${activeSetupForm.shortId || activeSetupForm._id}`}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-800 select-all outline-none"
                      />
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/api/f/${activeSetupForm.shortId || activeSetupForm._id}`,
                            'Endpoint copied!'
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-brand-charcoal text-white hover:bg-black text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                      <span>Looking for the standalone web page?</span>
                      <a
                        href={`/f/${activeSetupForm.shortId || activeSetupForm._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-orange hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Open hosted web form</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700">HTML Example</label>
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
                  <p className="text-xs text-neutral-600">
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
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-charcoal">Public Hosted Page</span>
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
                    <p className="text-xs text-neutral-600 font-mono break-all">
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-charcoal font-heading">
                  {selectedFormForSubmissions.name} — Submissions
                </h3>
                <p className="text-xs text-neutral-500">
                  {submissionsList.length} total response{submissionsList.length === 1 ? '' : 's'} recorded
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  disabled={submissionsList.length === 0}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-brand-charcoal flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    setSubmissionsModalOpen(false);
                    setSelectedSubmissionDetail(null);
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {fetchingSubmissions ? (
                <div className="py-16 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-orange mx-auto" />
                  <p className="text-xs text-neutral-500">Loading submissions...</p>
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-brand-charcoal">No submissions yet</p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Share your form link or connect the POST endpoint to start collecting real-time submissions.
                  </p>
                </div>
              ) : (
                <div className="border border-neutral-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/90 border-b border-neutral-200/80 text-neutral-600 font-medium">
                          <th className="py-3 px-4 whitespace-nowrap font-medium text-xs">Submitted At</th>
                          {selectedFormForSubmissions.fields?.map((f: any) => (
                            <th key={f.id} className="py-3 px-4 whitespace-nowrap font-medium text-xs">
                              {f.label || f.id}
                            </th>
                          ))}
                          <th className="py-3 px-4 text-right whitespace-nowrap font-medium text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 bg-white">
                        {submissionsList.map((sub) => (
                          <tr
                            key={sub.id}
                            onClick={() => setSelectedSubmissionDetail(sub)}
                            className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="text-xs font-medium text-neutral-800">
                                {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                {new Date(sub.submittedAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            {selectedFormForSubmissions.fields?.map((f: any) => (
                              <td key={f.id} className="py-3 px-4 text-neutral-700 max-w-[200px] truncate text-xs">
                                {sub.data?.[f.id] !== undefined && sub.data?.[f.id] !== '' ? (
                                  typeof sub.data[f.id] === 'boolean' ? (
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        sub.data[f.id]
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-neutral-100 text-neutral-600'
                                      }`}
                                    >
                                      {sub.data[f.id] ? 'Yes' : 'No'}
                                    </span>
                                  ) : (
                                    String(sub.data[f.id])
                                  )
                                ) : (
                                  <span className="text-neutral-300">—</span>
                                )}
                              </td>
                            ))}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubmissionDetail(sub);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-semibold transition-colors"
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
              <div className="border-t border-neutral-200 bg-neutral-50 p-6 space-y-4 max-h-72 overflow-y-auto animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider font-mono">
                      Submission Details
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Recorded on {new Date(selectedSubmissionDetail.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmissionDetail(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 font-semibold cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedFormForSubmissions.fields?.map((f: any) => (
                    <div key={f.id} className="p-3 rounded-xl bg-white border border-neutral-200/80 space-y-1">
                      <span className="text-[11px] font-medium text-neutral-500 block">
                        {f.label || f.id}
                      </span>
                      <p className="text-xs font-semibold text-neutral-900 break-words">
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
      {workspaceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-charcoal capitalize font-heading">
                {workspaceModal === 'emails' && 'Linked Notification Emails'}
                {workspaceModal === 'team' && 'Team Collaboration'}
                {workspaceModal === 'account' && 'Account Settings'}
              </h3>
              <button
                onClick={() => setWorkspaceModal(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {workspaceModal === 'emails' && (
              <div className="space-y-3 text-xs text-neutral-600">
                <p>Form submissions will notify the primary account address:</p>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 font-mono font-semibold text-brand-charcoal flex items-center justify-between">
                  <span>{user.email}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            )}

            {workspaceModal === 'team' && (
              <div className="space-y-3 text-xs text-neutral-600">
                <p>Invite teammates to collaborate on form schemas, templates, and submissions.</p>
                <div className="p-4 bg-brand-orange/5 rounded-2xl border border-brand-orange/20 text-brand-charcoal space-y-2">
                  <p className="font-bold text-brand-orange">Team collaboration is rolling out!</p>
                  <p className="text-[11px] text-neutral-600">
                    You will be able to add teammates with granular role-based permissions.
                  </p>
                </div>
              </div>
            )}

            {workspaceModal === 'account' && (
              <div className="space-y-3 text-xs text-neutral-700">
                <div className="space-y-1">
                  <span className="text-neutral-400 font-semibold text-[11px]">Full Name</span>
                  <p className="font-bold text-brand-charcoal">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 font-semibold text-[11px]">Email Address</span>
                  <p className="font-bold text-brand-charcoal">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-400 font-semibold text-[11px]">Account ID</span>
                  <p className="font-mono text-neutral-600 text-[10px]">{user.id}</p>
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
    </div>
  );
}
