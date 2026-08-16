'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  ExternalLink,
  FileCode2,
  Download,
  Wand2,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Database,
  CheckCircle,
  LogOut,
  ChevronDown,
  User as UserIcon,
  ChevronRight,
  Sparkles,
  Copy,
  Inbox,
  X,
  FileSpreadsheet,
  Clock,
  Loader2,
  Share2,
} from 'lucide-react';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';

interface SavedForm {
  _id: string;
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
  const { user, loading, logout, openAuthModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
  const [fetchingForms, setFetchingForms] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Submissions modal state
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedFormForSubmissions, setSelectedFormForSubmissions] = useState<SavedForm | null>(null);
  const [submissionsList, setSubmissionsList] = useState<SubmissionRecord[]>([]);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(false);
  const [totalSubmissionsCount, setTotalSubmissionsCount] = useState<number>(0);

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

  // Open Submissions Viewer
  const handleOpenSubmissions = async (form: SavedForm, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  // Copy Hosted Link
  const handleCopyLink = (formId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/f/${formId}`;
    navigator.clipboard.writeText(url);
    toast.success('Public form link copied to clipboard!');
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
  const handleDeleteForm = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this custom form? This action cannot be undone.')) {
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

  // Quick Starter trigger redirect
  const handleStartWithTemplate = (category: string) => {
    router.push(`/builder?t=${encodeURIComponent(category)}`);
  };

  // Re-compile form download ZIP
  const handleDownloadZip = async (form: SavedForm, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const toastId = toast.loading('Re-packaging form zip bundle...');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: form.fields,
          styling: form.styling,
          name: form.name,
        }),
      });

      const json = await res.json();
      if (json.success && json.downloadUrl) {
        toast.success('Bundle generated! Starting download...', { id: toastId });
        window.location.href = json.downloadUrl;
      } else {
        toast.error('Failed to pack zip download', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error during generation', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-sand text-brand-charcoal flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono font-black text-neutral-400 uppercase tracking-widest">
            Loading Workspace Sessions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-sand text-brand-charcoal font-sans flex flex-col antialiased">
      {/* Subtle paper-like noise grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#d5d0c5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* sonner notifications */}
      <Toaster position="bottom-right" richColors />

      {/* Global SaaS Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-brand-border/60">
        <Link href="/">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xl font-black tracking-tight text-brand-charcoal flex items-center gap-0.5">
              <span className="text-brand-orange text-2xl font-extrabold -mt-1">⚡</span>
              snapform
            </span>
            <span className="text-[8px] font-black text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded tracking-widest leading-none font-mono mt-0.5">
              CONSOLE
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-brand-charcoal/80">
          <Link href="/dashboard" className="text-brand-orange">
            Console
          </Link>
          <Link href="/builder" className="hover:text-brand-orange transition-colors">
            Studio
          </Link>
          <Link href="/docs" className="hover:text-brand-orange transition-colors">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-4 relative">
          {!user ? (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-bold text-brand-charcoal/80 hover:text-brand-orange cursor-pointer transition-colors px-3 py-1.5 rounded-full hover:bg-brand-sand-dark"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-2 transition-all hover:scale-105 active:scale-95 shadow-sm border border-brand-orange cursor-pointer"
              >
                Create Account
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-brand-border bg-white shadow-sm hover:border-brand-orange/60 hover:shadow transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-brand-orange text-white text-xs font-black flex items-center justify-center shadow-inner">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 mr-1 animate-in fade-in" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-35" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-[#fdfcf9] border border-brand-border rounded-2xl shadow-xl p-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-2 border-b border-brand-border/60 mb-2">
                      <p className="text-[10px] font-black font-mono text-neutral-400 uppercase tracking-widest leading-none">
                        Active Profile
                      </p>
                      <p className="text-xs font-bold text-brand-charcoal truncate mt-1">
                        {user.name}
                      </p>
                      <p className="text-[10px] font-medium text-neutral-500 truncate leading-none mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <Link href="/builder" onClick={() => setProfileDropdownOpen(false)}>
                      <button className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-sand hover:text-brand-orange transition-all cursor-pointer flex items-center gap-2">
                        <Wand2 className="w-3.5 h-3.5" />
                        Launch Studio
                      </button>
                    </Link>

                    <Link href="/docs" onClick={() => setProfileDropdownOpen(false)}>
                      <button className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-sand hover:text-brand-orange transition-all cursor-pointer flex items-center gap-2 mt-1">
                        <FileCode2 className="w-3.5 h-3.5" />
                        API Documentation
                      </button>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-2 mt-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Console Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-6 md:py-8 space-y-8">
        {!user ? (
          /* Guest Screen */
          <div className="max-w-xl mx-auto text-center py-16 space-y-6 bg-white border border-brand-border rounded-[2.5rem] p-10 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange shadow-inner">
              <Zap className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-brand-charcoal tracking-tight">
                Sign in to your SnapForm Console
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                Connect your account to access your saved custom schemas, view live form submissions, and export client datasets.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => openAuthModal('login')}
                className="w-full sm:w-auto rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black px-8 py-3.5 h-11 shadow border border-brand-orange hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Sign In Now
              </Button>
              <Button
                onClick={() => openAuthModal('signup')}
                variant="outline"
                className="w-full sm:w-auto rounded-full border-brand-border bg-white text-brand-charcoal text-xs font-bold px-6 py-3.5 h-11 hover:bg-brand-sand cursor-pointer"
              >
                Create Account
              </Button>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="space-y-8">
            {/* Top Banner Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE CLUSTER
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-brand-charcoal tracking-tight">
                  Welcome back, {user.name}
                </h1>
                <p className="text-xs md:text-sm text-neutral-500 font-medium">
                  Manage your hosted forms, live respondent links, and form submissions in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/builder">
                  <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black px-5 py-2.5 h-9.5 shadow border border-brand-orange flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    <Wand2 className="w-3.5 h-3.5" />
                    Create New Form
                  </Button>
                </Link>
              </div>
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 text-left">
              {[
                {
                  title: 'HOSTED FORMS',
                  value: savedForms.length,
                  desc: 'Active forms on your account',
                  icon: Database,
                  accent: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
                },
                {
                  title: 'STARTER BLUEPRINTS',
                  value: PREDEFINED_TEMPLATES.length,
                  desc: 'Curated production blueprints',
                  icon: Layers,
                  accent: 'text-blue-600 bg-blue-50 border-blue-200',
                },
                {
                  title: 'EXPORT FORMATS',
                  value: 'Next.js / CSV',
                  desc: 'Live hosted & code export',
                  icon: Zap,
                  accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-brand-border rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black font-mono text-neutral-400 tracking-wider block uppercase">
                        {stat.title}
                      </span>
                      <p className="text-2xl font-black text-brand-charcoal tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-[11px] font-medium text-neutral-500">{stat.desc}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${stat.accent} shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Segmented List: My Forms */}
            <div className="space-y-5">
              <div className="space-y-0.5 text-left">
                <h2 className="text-xl md:text-2xl font-black text-brand-charcoal tracking-tight">
                  My Hosted & Saved Forms
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Share public form links with users, view live submissions, or download React & Zod code bundles.
                </p>
              </div>

              {fetchingForms ? (
                <div className="w-full py-16 bg-white border border-brand-border rounded-3xl text-center space-y-4 shadow-sm">
                  <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    Retrieving custom schemas...
                  </p>
                </div>
              ) : savedForms.length === 0 ? (
                /* Empty State Workspace */
                <div className="w-full py-16 px-6 bg-white border border-brand-border rounded-3xl text-center shadow-sm max-w-2xl mx-auto space-y-5">
                  <div className="p-4 rounded-2xl bg-brand-sand border border-brand-border/60 w-fit mx-auto text-brand-orange shadow-inner">
                    <FileCode2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-brand-charcoal">No custom forms saved yet</h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                      You haven&apos;t saved any custom form schemas to your profile. Choose a quick-starter template below to launch the editor and save it!
                    </p>
                  </div>
                  <Link href="/builder" className="inline-block pt-1">
                    <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black px-6 py-2.5 h-9.5 shadow border border-brand-orange flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      <Plus className="w-4 h-4" /> Start Building
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {savedForms.map((form) => (
                    <div
                      key={form._id}
                      className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-brand-orange/40 transition-all duration-200 flex flex-col justify-between group relative"
                    >
                      <div className="space-y-4">
                        {/* Top Category & Date */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {form.category}
                          </span>
                          <span className="text-[11px] font-medium text-neutral-400 font-mono">
                            {new Date(form.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-brand-charcoal leading-tight tracking-tight">
                            {form.name}
                          </h3>
                          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                            {form.description}
                          </p>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="bg-brand-sand/80 border border-brand-border/60 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                            <span className="text-neutral-400 font-mono text-[10px]">FIELDS</span>
                            <span className="font-black text-brand-orange">{form.fields.length}</span>
                          </div>
                          <div className="bg-brand-sand/80 border border-brand-border/60 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                            <span className="text-neutral-400 font-mono text-[10px]">THEME</span>
                            <span className="font-black uppercase">{form.styling.theme}</span>
                          </div>
                        </div>

                        {/* Hosted Live Link Container */}
                        <div className="bg-brand-sand/50 border border-brand-border/80 rounded-2xl p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wide">
                              Live Form Link
                            </span>
                            <button
                              onClick={(e) => handleCopyLink(form._id, e)}
                              className="text-[11px] font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              Copy Link
                            </button>
                          </div>

                          <Link
                            href={`/f/${form._id}`}
                            target="_blank"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono font-medium text-brand-charcoal hover:border-brand-orange/60 hover:text-brand-orange flex items-center justify-between group/link transition-all shadow-sm"
                          >
                            <span className="truncate">/f/{form._id}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover/link:text-brand-orange shrink-0 ml-2" />
                          </Link>

                          <button
                            onClick={(e) => handleOpenSubmissions(form, e)}
                            className="w-full py-2 px-3 rounded-xl bg-brand-charcoal hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                          >
                            <Inbox className="w-3.5 h-3.5 text-brand-orange" />
                            View Submissions
                          </button>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-between border-t border-brand-border/60 pt-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/builder?t=${encodeURIComponent(form.category)}&id=${form._id}`}>
                            <button className="px-3.5 py-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
                              Edit <ChevronRight className="w-3 h-3" />
                            </button>
                          </Link>

                          <button
                            onClick={(e) => handleDownloadZip(form, e)}
                            className="px-3 py-1.5 rounded-xl border border-brand-border bg-white hover:bg-brand-sand text-brand-charcoal text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          >
                            <Download className="w-3 h-3 text-neutral-500" />
                            ZIP
                          </button>
                        </div>

                        <button
                          onClick={(e) => handleDeleteForm(form._id, e)}
                          disabled={deletingId === form._id}
                          className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                          title="Delete Form"
                        >
                          {deletingId === form._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Starter Templates Segment */}
            <div className="space-y-4 pt-6 border-t border-brand-border/60">
              <div className="space-y-0.5 text-left">
                <h2 className="text-xl md:text-2xl font-black text-brand-charcoal tracking-tight">
                  Public Starter Blueprints
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Pre-compiled full-stack templates ready to preview, test, and customize.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {PREDEFINED_TEMPLATES.map((tmpl, idx) => (
                  <div
                    key={tmpl.id || tmpl.category || idx}
                    className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm hover:border-brand-orange hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold font-mono bg-brand-sand text-brand-charcoal px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        {tmpl.category}
                      </span>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-brand-charcoal group-hover:text-brand-orange transition-colors">
                          {tmpl.name}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-brand-border/50 mt-4 flex items-center justify-between">
                      <Link
                        href={`/f/${tmpl.id}`}
                        target="_blank"
                        className="text-xs font-bold text-neutral-500 hover:text-brand-orange flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Preview
                      </Link>
                      <button
                        onClick={() => handleStartWithTemplate(tmpl.category)}
                        className="px-3 py-1 rounded-xl bg-brand-sand hover:bg-brand-orange hover:text-white text-xs font-bold text-brand-charcoal uppercase flex items-center gap-1 transition-all cursor-pointer"
                      >
                        Use <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SUBMISSIONS MODAL */}
      {submissionsModalOpen && selectedFormForSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#fdfcf9] border border-brand-border rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded uppercase">
                    {selectedFormForSubmissions.category}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {submissionsList.length} Responses recorded
                  </span>
                </div>
                <h3 className="text-lg font-black text-brand-charcoal mt-1">
                  {selectedFormForSubmissions.name} - Submissions Inbox
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {submissionsList.length > 0 && (
                  <Button
                    onClick={handleExportCsv}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 h-9 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                )}
                <button
                  onClick={() => setSubmissionsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-brand-sand hover:bg-brand-sand-dark flex items-center justify-center text-neutral-500 hover:text-brand-charcoal transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content / Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {fetchingSubmissions ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto" />
                  <p className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                    Fetching Submissions...
                  </p>
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-brand-sand border border-brand-border flex items-center justify-center text-neutral-400 mx-auto">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-brand-charcoal">No submissions yet</h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      Share your public form link with users to start collecting answers.
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleCopyLink(selectedFormForSubmissions._id, e)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-orange text-white text-xs font-bold hover:bg-brand-orange-hover shadow-sm transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Public Form Link
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto border border-brand-border rounded-2xl bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-brand-sand/60 border-b border-brand-border text-neutral-500 font-mono font-bold uppercase text-[10px]">
                          <th className="p-3.5">Time</th>
                          {selectedFormForSubmissions.fields.map((f: any) => (
                            <th key={f.id} className="p-3.5 whitespace-nowrap">
                              {f.label || f.id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60 font-medium text-brand-charcoal">
                        {submissionsList.map((sub) => (
                          <tr key={sub.id} className="hover:bg-brand-sand/30 transition-colors">
                            <td className="p-3.5 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                              {new Date(sub.submittedAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            {selectedFormForSubmissions.fields.map((f: any) => {
                              const val = sub.data[f.id];
                              let displayVal = '-';
                              if (val !== undefined && val !== null && val !== '') {
                                if (typeof val === 'boolean') {
                                  displayVal = val ? 'Yes' : 'No';
                                } else if (Array.isArray(val)) {
                                  displayVal = val.join(', ');
                                } else {
                                  displayVal = String(val);
                                }
                              }
                              return (
                                <td key={f.id} className="p-3.5 max-w-xs truncate" title={displayVal}>
                                  {displayVal}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
