'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import {
  Settings2,
  Palette,
  Wand2,
  ChevronLeft,
  ExternalLink,
  Laptop,
  Save,
  LogOut,
  ChevronDown,
  Settings,
  Link2,
  Inbox,
  Globe,
  Copy,
  LayoutDashboard,
  Check,
  Download,
  Loader2,
  ShieldCheck,
  X,
  FileCode2,
} from 'lucide-react';
import TemplateSelector from '@/components/form-builder/TemplateSelector';
import FieldEditor from '@/components/form-builder/FieldEditor';
import StyleCustomizer from '@/components/form-builder/StyleCustomizer';
import LivePreview from '@/components/form-builder/LivePreview';
import CodeOutput from '@/components/form-builder/CodeOutput';
import { ISeedFormTemplate, PREDEFINED_TEMPLATES } from '@/lib/templates';
import { IFormField, IFormStyling } from '@/models/FormTemplate';
import { useAuth } from '@/components/AuthProvider';
import Logo from '@/components/Logo';
import CodeBlock from '@/components/CodeBlock';

export default function BuilderPage() {
  const router = useRouter();
  const { user, loading, logout, openAuthModal } = useAuth();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeBuilderTab, setActiveBuilderTab] = useState('fields');
  const [copiedText, setCopiedText] = useState(false);
  
  // Submissions Modal State
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(false);
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState<any | null>(null);

  const promptedForAuthRef = useRef(false);

  // ─── Strict Auth Guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Template and Form State
  const [templates, setTemplates] = useState<ISeedFormTemplate[]>(PREDEFINED_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<ISeedFormTemplate | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('contact');
  const [formDescription, setFormDescription] = useState<string>('');
  const [fields, setFields] = useState<IFormField[]>([]);
  const [styling, setStyling] = useState<IFormStyling>({ theme: 'modern', primaryColor: '#ff4f19' });
  const [savedFormId, setSavedFormId] = useState<string | null>(null);

  const [generatedCode, setGeneratedCode] = useState<{
    component: string;
    schema: string;
    apiRoute: string;
  } | null>(null);

  const [templatesLoading] = useState<boolean>(false);
  const [generationLoading, setGenerationLoading] = useState<boolean>(false);

  // ─── Background template sync from API ───────────────────────────────────────
  useEffect(() => {
    async function fetchTemplatesInBackground() {
      try {
        const res = await fetch('/api/templates');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const userCustoms: ISeedFormTemplate[] = [];
          for (const t of json.data) {
            if (t.userId) {
              userCustoms.push({
                _id: t._id,
                id: t.shortId || t._id,
                shortId: t.shortId || t._id,
                name: t.name || 'Untitled Form',
                category: t.category || 'contact',
                description: t.description || 'Custom saved form',
                fields: Array.isArray(t.fields) ? t.fields : [],
                styling: {
                  theme: t.styling?.theme || 'modern',
                  primaryColor: t.styling?.primaryColor || '#ff4f19',
                },
                userId: t.userId,
              });
            }
          }
          setTemplates([...userCustoms, ...PREDEFINED_TEMPLATES]);
        }
      } catch (err) {
        console.warn('Background template sync failed, using local templates:', err);
        setTemplates(PREDEFINED_TEMPLATES);
      }
    }
    fetchTemplatesInBackground();
  }, [refreshCounter]);

  // ─── Apply template into state ───────────────────────────────────────────────
  const applyTemplate = useCallback((template: ISeedFormTemplate) => {
    const safeFields = Array.isArray(template.fields) ? (template.fields as IFormField[]) : [];
    const safeTheme = template.styling?.theme || 'modern';
    setSelectedTemplate(template);
    setFormName(template.name || 'My Form');
    setFormCategory(template.category || 'contact');
    setFormDescription(template.description || '');
    setFields(safeFields);
    setGeneratedCode(null);
    setStyling({ theme: safeTheme as any, primaryColor: template.styling?.primaryColor || '#ff4f19' });
    setSavedFormId((template as any).shortId || (template as any)._id || null);
  }, []);

  // ─── Browser back button handler ─────────────────────────────────────────────
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!e.state?.templateSelected) {
        setSelectedTemplate(null);
        setGeneratedCode(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ─── URL Query param loader ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || templates.length === 0 || loading) return;
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt');
    const id = params.get('id');
    const hasStarterIntent = Boolean(prompt || id);

    if (hasStarterIntent && !user) {
      if (!promptedForAuthRef.current) {
        promptedForAuthRef.current = true;
        toast.warning('Please sign in first to start working.');
        openAuthModal('login');
      }
      window.history.replaceState({}, '', '/builder');
      return;
    }

    if (id) {
      const target = templates.find((t) => t._id === id);
      if (target) {
        applyTemplate(target);
        window.history.replaceState(
          { templateSelected: true, category: target.category, id: target._id },
          '',
          `/builder?t=${target.category}&id=${target._id}`
        );
        return;
      }
    }

    if (prompt) {
      const pl = prompt.toLowerCase();
      let target = templates[0] || PREDEFINED_TEMPLATES[0];
      if (pl.includes('pay') || pl.includes('bill') || pl.includes('sub'))
        target = templates.find((t) => t.category === 'payment') || PREDEFINED_TEMPLATES[1];
      else if (pl.includes('survey') || pl.includes('feed') || pl.includes('rate'))
        target = templates.find((t) => t.category === 'survey') || PREDEFINED_TEMPLATES[2];
      else if (pl.includes('book') || pl.includes('sched') || pl.includes('date'))
        target = templates.find((t) => t.category === 'booking') || PREDEFINED_TEMPLATES[3];

      applyTemplate(target);
      window.history.replaceState(
        { templateSelected: true, category: target.category },
        '',
        `/builder?t=${target.category}`
      );
    }
  }, [templates, applyTemplate, loading, user, openAuthModal]);

  // ─── Template Selector Handlers ──────────────────────────────────────────────
  const handleSelectTemplate = (template: ISeedFormTemplate) => {
    if (!user) {
      toast.warning('Please sign in first to start working.');
      openAuthModal('login');
      return;
    }

    applyTemplate(template);
    window.history.pushState(
      { templateSelected: true, category: template.category },
      '',
      `/builder?t=${encodeURIComponent(template.category)}`
    );
  };

  const handleDeselectTemplate = () => {
    window.history.back();
  };

  // ─── Code Generation ──────────────────────────────────────────────────────────
  const handleGenerateCode = useCallback(async () => {
    if (fields.length === 0) return;
    try {
      setGenerationLoading(true);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, styling, name: formName || 'Form' }),
      });
      const json = await res.json();
      if (json.success && json.data) setGeneratedCode(json.data);
      toast.success('Code successfully compiled and ready to use!');
    } catch (err) {
      console.error('Code generation request failed:', err);
      toast.error('Code compilation failed');
    } finally {
      setGenerationLoading(false);
    }
  }, [fields, styling, formName]);

  // ─── Save / Update Form in Database ───────────────────────────────────────────
  const handleSaveForm = async () => {
    if (!user) {
      toast.warning('Please Sign In to save forms to your profile!');
      openAuthModal('login');
      return;
    }

    if (fields.length === 0) return;

    setSavingTemplate(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName || 'My Saved Form',
          category: formCategory || 'contact',
          description: formDescription || `Custom saved form compiled by ${user.name}`,
          fields,
          styling,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Form template saved successfully!');
        if (json.data?.shortId || json.data?._id) {
          setSavedFormId(json.data.shortId || json.data._id);
        }
        setRefreshCounter((prev) => prev + 1);
      } else {
        toast.error(json.message || 'Failed to save template');
      }
    } catch (err) {
      toast.error('Network error while saving template');
    } finally {
      setSavingTemplate(false);
    }
  };

  // ─── Fetch Submissions Modal ──────────────────────────────────────────────────
  const handleOpenSubmissions = async () => {
    const targetId = savedFormId || (selectedTemplate as any)?.shortId || (selectedTemplate as any)?._id;
    if (!targetId) {
      toast.info('Please save the form first to view recorded submissions!');
      return;
    }

    setSubmissionsModalOpen(true);
    setFetchingSubmissions(true);
    try {
      const res = await fetch(`/api/templates/${targetId}/submissions`);
      const json = await res.json();
      if (json.success && Array.isArray(json.submissions)) {
        setSubmissionsList(json.submissions);
      } else {
        setSubmissionsList([]);
      }
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setFetchingSubmissions(false);
    }
  };

  const handleCopyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    setCopiedText(true);
    toast.success('Endpoint copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  // ─── Guard: Block view while verifying auth ───────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white text-brand-charcoal flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shadow-xs animate-pulse">
          <Logo href="/" textClassName="hidden" />
        </div>
        <p className="text-xs font-semibold text-neutral-400">Verifying session...</p>
      </div>
    );
  }

  const currentFormId = savedFormId || (selectedTemplate as any)?.shortId || (selectedTemplate as any)?._id;
  const endpointUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/f/${currentFormId || 'sf_sample'}`;

  return (
    <div className="h-screen bg-white text-brand-charcoal font-sans flex flex-col antialiased overflow-hidden selection:bg-brand-orange selection:text-white">
      {/* Sonner notifications */}
      <Toaster position="bottom-right" richColors />

      {/* ─────────────────────────────────────────────────────────────
          1. BUILDER TOP HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 bg-white border-b border-neutral-200 px-5 py-3 flex flex-row items-center justify-between sticky top-0 shadow-2xs shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <Logo
            href="/dashboard"
            badgeText="STUDIO"
            textClassName="text-base font-bold tracking-tight text-brand-charcoal font-heading"
          />

          {selectedTemplate && (
            <>
              <div className="text-neutral-200 select-none">|</div>
              <button
                onClick={handleDeselectTemplate}
                className="h-8 px-2.5 rounded-xl text-neutral-500 hover:text-brand-orange hover:bg-neutral-50 border border-neutral-200/60 flex items-center gap-1 cursor-pointer transition-all text-xs font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change Template</span>
              </button>
            </>
          )}
        </div>

        {/* Dynamic Name Input in header */}
        {selectedTemplate ? (
          <div className="flex items-center gap-2 max-w-xs md:max-w-md">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono hidden md:block">
              EDITING FORM:
            </span>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Form name..."
              className="h-8 rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 focus:bg-white focus:border-brand-orange outline-none text-xs font-bold text-brand-charcoal w-44 sm:w-60 transition-all"
            />
          </div>
        ) : (
          <div className="text-[11px] font-semibold text-neutral-400 font-mono flex items-center gap-1.5 uppercase tracking-wider">
            <Laptop className="w-4 h-4 text-brand-orange" /> Select form template to begin
          </div>
        )}

        {/* Action Buttons & Links */}
        <div className="flex items-center gap-2.5">
          {selectedTemplate && (
            <>
              {currentFormId && (
                <Link href={`/f/${currentFormId}`} target="_blank">
                  <button
                    className="h-8 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Open live public form link"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="hidden sm:inline">Live Link</span>
                  </button>
                </Link>
              )}

              {/* Submissions Modal Trigger */}
              <button
                onClick={handleOpenSubmissions}
                className="h-8 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="View recorded submissions"
              >
                <Inbox className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Submissions</span>
              </button>

              {/* Save Form */}
              <button
                onClick={handleSaveForm}
                disabled={savingTemplate || fields.length === 0}
                className="h-8 px-3.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-brand-charcoal font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
              >
                {savingTemplate ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-orange" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-brand-orange" />
                )}
                <span>Save to Profile</span>
              </button>

              {/* Compile Code */}
              <button
                onClick={handleGenerateCode}
                disabled={generationLoading || fields.length === 0}
                className="h-8 px-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50"
              >
                {generationLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>Compile Code</span>
              </button>
            </>
          )}

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer shadow-2xs hover:opacity-90 transition-opacity"
            >
              {user.name ? user.name[0].toUpperCase() : 'A'}
            </button>

            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-40 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                  <div className="px-3 py-2 mb-1 border-b border-neutral-100">
                    <p className="text-xs font-bold text-brand-charcoal truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Dashboard Console</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Dashboard console shortcut */}
          <Link
            href="/dashboard"
            className="h-8 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-brand-orange" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN STUDIO CANVAS
      ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full flex flex-col overflow-hidden bg-white">
        {!selectedTemplate ? (
          /* Template Picker Screen */
          <div className="flex-1 overflow-y-auto px-6 py-12 text-center w-full">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[11px] font-bold font-mono text-brand-orange uppercase tracking-[0.25em]">
                  STARTER TEMPLATES
                </span>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-brand-charcoal">
                  Choose a Starter Form
                </h1>
                <p className="text-xs md:text-sm text-neutral-500 max-w-2xl mx-auto leading-relaxed font-normal">
                  Select an industry-specific starter configuration below. You can customize fields, validation rules, endpoint actions, and styles inside the studio editor.
                </p>
              </div>

              <TemplateSelector
                templates={templates}
                onSelect={handleSelectTemplate}
                isLoading={templatesLoading}
              />
            </div>
          </div>
        ) : (
          /* 3-Column Studio Editor */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-neutral-200 h-full overflow-hidden">
            {/* Left Config Panel (Fields / Styling / Settings / Integrations) */}
            <div className="lg:col-span-4 border-r border-neutral-200 bg-white flex flex-col overflow-hidden h-full">
              <Tabs
                value={activeBuilderTab}
                onValueChange={setActiveBuilderTab}
                className="w-full flex-1 flex flex-col overflow-hidden"
              >
                {/* 4-Tab Navigation Bar matching Dashboard Capabilities */}
                <TabsList className="grid grid-cols-4 rounded-none border-b border-neutral-200 bg-neutral-50 p-1 h-12 w-full shrink-0">
                  <TabsTrigger
                    value="fields"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-orange data-[state=active]:shadow-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 h-full cursor-pointer transition-all"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Fields</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="styling"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-orange data-[state=active]:shadow-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 h-full cursor-pointer transition-all"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Style</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-orange data-[state=active]:shadow-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 h-full cursor-pointer transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="integrations"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-orange data-[state=active]:shadow-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 h-full cursor-pointer transition-all"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Endpoint</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Fields Editor */}
                <TabsContent
                  value="fields"
                  className="flex-1 overflow-y-auto p-5 mt-0 focus-visible:outline-none"
                >
                  <FieldEditor fields={fields} onChange={setFields} />
                </TabsContent>

                {/* Tab 2: Style Customizer */}
                <TabsContent
                  value="styling"
                  className="flex-1 overflow-y-auto p-5 mt-0 focus-visible:outline-none text-left"
                >
                  <StyleCustomizer styling={styling} onChange={setStyling} />
                </TabsContent>

                {/* Tab 3: Form Settings & Security */}
                <TabsContent
                  value="settings"
                  className="flex-1 overflow-y-auto p-5 mt-0 focus-visible:outline-none text-left space-y-5"
                >
                  <div className="space-y-1 border-b border-neutral-100 pb-3">
                    <h3 className="text-sm font-bold text-brand-charcoal font-heading">Form Settings</h3>
                    <p className="text-xs text-neutral-500">Configure form categorization and metadata</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Form Title</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-orange focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Category Tag</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-brand-charcoal outline-none focus:border-brand-orange focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="contact">Contact & Leads</option>
                        <option value="survey">Surveys & Questionnaires</option>
                        <option value="feedback">User Feedback</option>
                        <option value="payment">Payments & Orders</option>
                        <option value="booking">Reservations & Bookings</option>
                        <option value="registration">Event Registration</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700">Form Description</label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Brief summary of what this form collects..."
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-normal text-brand-charcoal outline-none focus:border-brand-orange focus:bg-white transition-all resize-none"
                      />
                    </div>

                    {/* Security & Spam Protection */}
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                      <div className="flex items-center gap-2 text-brand-charcoal font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-brand-orange" />
                        <span>Spam Protection & Rate Limiting</span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Bot detection and IP-hash rate limiting are active automatically across all submissions.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Integrations & Endpoint Setup */}
                <TabsContent
                  value="integrations"
                  className="flex-1 overflow-y-auto p-5 mt-0 focus-visible:outline-none text-left space-y-5"
                >
                  <div className="space-y-1 border-b border-neutral-100 pb-3">
                    <h3 className="text-sm font-bold text-brand-charcoal font-heading">Integration & Endpoints</h3>
                    <p className="text-xs text-neutral-500">Connect your form anywhere with a standard POST URL</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono">
                        POST Endpoint URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={endpointUrl}
                          className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-800 select-all outline-none"
                        />
                        <button
                          onClick={() => handleCopyEndpoint(endpointUrl)}
                          className="px-3 py-2 rounded-xl bg-brand-charcoal text-white hover:bg-black text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-700">HTML Form Example</label>
                      <CodeBlock
                        language="html"
                        filename="index.html"
                        code={`<form action="${endpointUrl}" method="POST">
  <input type="text" name="name" required placeholder="Your Name" />
  <input type="email" name="email" required placeholder="Your Email" />
  <textarea name="message" required placeholder="Your Message"></textarea>
  <button type="submit">Submit Form</button>
</form>`}
                      />
                    </div>

                    {currentFormId && (
                      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-charcoal">Public Hosted Page</span>
                          <a
                            href={`/f/${currentFormId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono break-all">
                          {`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${currentFormId}`}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Center Panel (Interactive Live Canvas) */}
            <div className="lg:col-span-4 bg-neutral-50/70 border-r border-neutral-200 overflow-y-auto p-6 md:p-8 h-full flex flex-col justify-start">
              <LivePreview fields={fields} styling={styling} formName={formName} />
            </div>

            {/* Right Panel (Generated React/Next.js/Zod Code Output) */}
            <div className="lg:col-span-4 bg-white overflow-hidden p-5 h-full">
              <CodeOutput
                code={generatedCode}
                formName={formName}
                isLoading={generationLoading}
              />
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. SUBMISSIONS MODAL
      ───────────────────────────────────────────────────────────── */}
      {submissionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-charcoal font-heading">
                  {formName || 'Form'} — Submissions
                </h3>
                <p className="text-xs text-neutral-500">
                  {submissionsList.length} total response{submissionsList.length === 1 ? '' : 's'} recorded
                </p>
              </div>
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
                          {fields.map((f: any) => (
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
                            key={sub._id || sub.id}
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
                            {fields.map((f: any) => (
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
                  {fields.map((f: any) => (
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
    </div>
  );
}
