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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, openAuthModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
  const [fetchingForms, setFetchingForms] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          // Filter forms that belong specifically to the logged-in user
          // The API returns all templates (public seeds + custom user ones),
          // so we filter for custom user ones that have a userId associated.
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
        setSavedForms(prev => prev.filter(f => f._id !== id));
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
          <Link href="/dashboard" className="text-brand-orange">Console</Link>
          <Link href="/builder" className="hover:text-brand-orange transition-colors">Studio</Link>
          <Link href="/docs" className="hover:text-brand-orange transition-colors">Docs</Link>
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
                className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-2 transition-all hover:scale-105 active:scale-95 shadow-sm border border-brand-orange"
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
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
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

      {/* Main SaaS Content Grid */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col gap-10">
        
        {/* If Anonymous: Beautiful SaaS Upsell Portal */}
        {!user ? (
          <div className="w-full max-w-4xl mx-auto text-center py-16 px-8 bg-white border border-brand-border rounded-[2.5rem] shadow-xl relative overflow-hidden my-auto">
            <div className="absolute inset-0 bg-radial-gradient from-brand-orange/5 to-transparent pointer-events-none" />
            
            <span className="text-brand-orange text-4xl font-extrabold block mb-6 select-none animate-pulse">⚡</span>
            
            <h1 className="text-3xl md:text-5xl font-black text-brand-charcoal tracking-tight max-w-2xl mx-auto leading-tight">
              Unlock Your Personal Developer Workspace
            </h1>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed mt-4">
              Sign In or create a free profile to save your compiled React form templates securely in the cloud, manage live assets, unlock custom theme styling, and export zip bundles instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Button
                onClick={() => openAuthModal('signup')}
                className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-extrabold px-8 h-12 flex items-center gap-2 shadow-lg shadow-brand-orange/20 border border-brand-orange hover:scale-105 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
              >
                Create Free Profile <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => openAuthModal('login')}
                className="rounded-full border-brand-border bg-white text-brand-charcoal text-sm font-bold px-8 h-12 hover:bg-brand-sand-dark transition-all w-full sm:w-auto cursor-pointer"
              >
                Sign In to Account
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-brand-border/60 pt-12 mt-16 max-w-3xl mx-auto text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-orange font-bold text-xs font-mono uppercase tracking-wider">
                  <Database className="w-4 h-4" /> Cloud Storage
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Never lose your forms. Keep all custom Zod validation schemas and component configurations saved in your dashboard.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-orange font-bold text-xs font-mono uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Customized Themes
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Design beautiful Glassmorphic, corporate, or minimalist UI forms fitted with tailor-made accent styles instantly.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-orange font-bold text-xs font-mono uppercase tracking-wider">
                  <FileCode2 className="w-4 h-4" /> Complete Codebase
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Export ready-to-run React packages, Zod types, and NextJS route handlers structured and pre-zipped in seconds.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard Workspace */
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Top Developer Stats Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: 'CUSTOM COMPILED FORMS',
                  value: savedForms.length,
                  icon: FileCode2,
                  desc: 'Forms saved in your profile',
                  accent: 'bg-brand-orange/5 border-brand-orange/20 text-brand-orange'
                },
                {
                  title: 'SIMULATED ENDPOINT SUBMISSIONS',
                  value: '4,812',
                  icon: TrendingUp,
                  desc: '+14% active test entries this week',
                  accent: 'bg-emerald-50 border-emerald-100 text-emerald-600'
                },
                {
                  title: 'SYSTEM COMPILER STATUS',
                  value: 'Healthy',
                  icon: CheckCircle,
                  desc: 'Gemini engines & fallback compilers online',
                  accent: 'bg-indigo-50 border-indigo-100 text-indigo-600'
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white border border-brand-border rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black font-mono text-neutral-400 tracking-wider block uppercase">
                        {stat.title}
                      </span>
                      <p className="text-2xl md:text-3xl font-black text-brand-charcoal tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-medium text-neutral-500">
                        {stat.desc}
                      </p>
                    </div>
                    <div className={`p-3 rounded-2xl border ${stat.accent} shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Segmented List: My Forms */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl md:text-2xl font-black text-brand-charcoal tracking-tight">
                    My Saved Workspace Forms
                  </h2>
                  <p className="text-xs text-neutral-500 font-medium">
                    Select a previously compiled form configuration to reload in Studio or download its ZIP bundle.
                  </p>
                </div>

                <Link href="/builder">
                  <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black px-4.5 py-2.5 h-9.5 shadow border border-brand-orange flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> New Form Studio
                  </Button>
                </Link>
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
                <div className="w-full py-16 px-6 bg-white border border-brand-border rounded-[2rem] text-center shadow-sm max-w-3xl mx-auto space-y-6">
                  <div className="p-4 rounded-2xl bg-brand-sand border border-brand-border/60 w-fit mx-auto text-brand-orange shadow-inner">
                    <FileCode2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-brand-charcoal">No custom forms saved yet</h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                      You haven&apos;t saved any custom form schemas to your profile. Choose a quick-starter template below to launch the editor and save it!
                    </p>
                  </div>
                  <Link href="/builder" className="inline-block pt-2">
                    <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black px-6 py-3 h-10 shadow border border-brand-orange flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      <Plus className="w-4 h-4" /> Start Building
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {savedForms.map(form => (
                    <div
                      key={form._id}
                      className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded uppercase tracking-wider">
                            {form.category}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400">
                            {new Date(form.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-black text-brand-charcoal truncate">
                            {form.name}
                          </h3>
                          <p className="text-xs text-neutral-500 truncate">
                            {form.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 text-[10px] font-bold text-neutral-400 font-mono pt-1">
                          <div>
                            FIELDS: <span className="text-brand-charcoal font-black">{form.fields.length}</span>
                          </div>
                          <div>
                            THEME: <span className="text-brand-charcoal font-black uppercase">{form.styling.theme}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hover action row */}
                      <div className="flex items-center justify-between border-t border-brand-border/60 pt-4 mt-6">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/builder?t=${encodeURIComponent(form.category)}&id=${form._id}`}>
                            <button className="text-[10px] font-black text-brand-orange hover:underline uppercase flex items-center gap-1 cursor-pointer">
                              Edit <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <span className="text-neutral-200">|</span>
                          <button
                            onClick={(e) => handleDownloadZip(form, e)}
                            className="text-[10px] font-black text-neutral-500 hover:text-brand-orange uppercase flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            Zip <Download className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={(e) => handleDeleteForm(form._id, e)}
                          disabled={deletingId === form._id}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete Custom Template"
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
            <div className="space-y-6 pt-4 border-t border-brand-border/60">
              <div className="text-left space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-brand-charcoal tracking-tight">
                  Public Starter configurations
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Click any standard industry configuration to instantly spin up a live edit workspace in Studio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {PREDEFINED_TEMPLATES.map((starter, index) => (
                  <div
                    key={index}
                    onClick={() => handleStartWithTemplate(starter.category)}
                    className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-brand-orange/40 transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="space-y-4">
                      <span className="text-[8px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded uppercase tracking-wider w-fit block">
                        {starter.category}
                      </span>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-brand-charcoal group-hover:text-brand-orange transition-colors">
                          {starter.name}
                        </h3>
                        <p className="text-[11px] text-neutral-500 leading-normal">
                          {starter.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-black text-brand-orange uppercase pt-6 mt-auto">
                      Open in Studio <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Solid Brand Footer */}
      <footer className="relative z-20 border-t border-brand-border/60 py-8 bg-brand-sand mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <Link href="/">
              <div className="flex items-center gap-1 cursor-pointer">
                <span className="text-lg font-black tracking-tight text-brand-charcoal flex items-center gap-0.5 select-none">
                  <span className="text-brand-orange text-xl font-extrabold -mt-0.5">⚡</span>
                  snapform
                </span>
              </div>
            </Link>
            <p className="text-[10px] font-mono text-neutral-400">
              &copy; {new Date().getFullYear()} SnapForm Studio. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-brand-charcoal/80">
            <Link href="/dashboard" className="text-brand-orange">Console</Link>
            <Link href="/builder" className="hover:text-brand-orange transition-colors">Studio</Link>
            <Link href="/docs" className="hover:text-brand-orange transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
