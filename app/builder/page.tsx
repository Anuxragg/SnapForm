'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import {
  Settings2,
  Palette,
  Wand2,
  ChevronLeft,
  ExternalLink,
  Laptop,
  Save,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import TemplateSelector from '@/components/form-builder/TemplateSelector';
import FieldEditor from '@/components/form-builder/FieldEditor';
import StyleCustomizer from '@/components/form-builder/StyleCustomizer';
import LivePreview from '@/components/form-builder/LivePreview';
import CodeOutput from '@/components/form-builder/CodeOutput';
import { ISeedFormTemplate, PREDEFINED_TEMPLATES } from '@/lib/templates';
import { IFormField, IFormStyling } from '@/models/FormTemplate';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export default function BuilderPage() {
  const router = useRouter();
  const { user, logout, openAuthModal } = useAuth();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Initialize with predefined templates immediately — no loading delay
  const [templates, setTemplates] = useState<ISeedFormTemplate[]>(PREDEFINED_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<ISeedFormTemplate | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [fields, setFields] = useState<IFormField[]>([]);
  const [styling, setStyling] = useState<IFormStyling>({ theme: 'modern', primaryColor: '#ff4f19' });

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
        if (json.success && json.data && json.data.length > 0) {
          const normalized: ISeedFormTemplate[] = json.data.map((t: any) => ({
            _id: t._id,
            name: t.name || 'Untitled',
            category: t.category || 'contact',
            description: t.description || '',
            fields: Array.isArray(t.fields) ? t.fields : [],
            styling: {
              theme: t.styling?.theme || 'modern',
              primaryColor: t.styling?.primaryColor || '#ff4f19',
            },
          }));
          setTemplates(normalized);
        }
      } catch (err) {
        console.warn('Background template sync failed, using local templates:', err);
      }
    }
    fetchTemplatesInBackground();
  }, [refreshCounter]);

  // ─── Core: apply a template into React state ─────────────────────────────────
  const applyTemplate = useCallback((template: ISeedFormTemplate) => {
    const safeFields = Array.isArray(template.fields) ? template.fields as IFormField[] : [];
    const safeTheme = template.styling?.theme || 'modern';
    setSelectedTemplate(template);
    setFormName(template.name || 'My Form');
    setFields(safeFields);
    setGeneratedCode(null);
    setStyling({ theme: safeTheme as any, primaryColor: '#ff4f19' });
  }, []);

  // ─── Browser back button → popstate → return to template picker ──────────────
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!e.state?.templateSelected) {
        // Back to /builder base — show template picker
        setSelectedTemplate(null);
        setGeneratedCode(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ─── URL: parse ?prompt= and ?id= on first load ───────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || templates.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt');
    const id = params.get('id');

    if (id) {
      const target = templates.find(t => t._id === id);
      if (target) {
        applyTemplate(target);
        // ReplaceState to clean URL representation
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
        target = templates.find(t => t.category === 'payment') || PREDEFINED_TEMPLATES[1];
      else if (pl.includes('survey') || pl.includes('feed') || pl.includes('rate'))
        target = templates.find(t => t.category === 'survey') || PREDEFINED_TEMPLATES[2];
      else if (pl.includes('book') || pl.includes('sched') || pl.includes('date'))
        target = templates.find(t => t.category === 'booking') || PREDEFINED_TEMPLATES[3];

      applyTemplate(target);
      // replaceState — don't pollute history for auto-selections
      window.history.replaceState(
        { templateSelected: true, category: target.category },
        '',
        `/builder?t=${target.category}`
      );
    }
  }, [templates, applyTemplate]);

  // ─── Select a template: pushState so back button works ───────────────────────
  const handleSelectTemplate = (template: ISeedFormTemplate) => {
    applyTemplate(template);
    // Push new history entry → browser back fires popstate → returns to picker
    window.history.pushState(
      { templateSelected: true, category: template.category },
      '',
      `/builder?t=${encodeURIComponent(template.category)}`
    );
  };

  // ─── Deselect: history.back() so the URL also resets cleanly ─────────────────
  const handleDeselectTemplate = () => {
    window.history.back();
  };

  // ─── Code generation ──────────────────────────────────────────────────────────
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
    } catch (err) {
      console.error('Code generation request failed:', err);
    } finally {
      setGenerationLoading(false);
    }
  }, [fields, styling, formName]);

  // Handle Save Custom Form to User Profile
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
          category: selectedTemplate?.category || 'contact',
          description: `Custom saved form compiled by ${user.name}`,
          fields,
          styling,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Form template saved successfully!');
        // Trigger templates refetch
        setRefreshCounter(prev => prev + 1);

        // Redirect to developer console dashboard so they see their custom form card
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        toast.error(json.message || 'Failed to save template');
      }
    } catch (err) {
      toast.error('Network error while saving template');
    } finally {
      setSavingTemplate(false);
    }
  };

  // Debounced auto-compilation
  useEffect(() => {
    if (!selectedTemplate) return;
    const timer = setTimeout(() => handleGenerateCode(), 500);
    return () => clearTimeout(timer);
  }, [fields, styling, formName, selectedTemplate, handleGenerateCode]);

  return (
    <div className="h-screen bg-brand-sand text-brand-charcoal font-sans flex flex-col antialiased overflow-hidden">
      {/* Subtle paper-like noise grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#d5d0c5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Sonner notifications */}
      <Toaster position="bottom-right" richColors />

      {/* Builder Top Bar */}
      <header className="relative z-10 bg-brand-sand border-b border-brand-border/60 px-6 py-4 flex flex-row items-center justify-between sticky top-0 shadow-sm backdrop-blur-md bg-brand-sand/90 font-sans">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <div className="flex items-center gap-1.5 group cursor-pointer">
              <span className="text-lg font-black tracking-tight text-brand-charcoal flex items-center gap-0.5">
                <span className="text-brand-orange text-xl font-extrabold -mt-0.5">⚡</span>
                snapform
              </span>
              <span className="text-[8px] font-black text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded tracking-widest leading-none font-mono">
                STUDIO
              </span>
            </div>
          </Link>

          {selectedTemplate && (
            <>
              <div className="text-neutral-300 select-none">|</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeselectTemplate}
                className="rounded-xl h-8 px-2.5 text-neutral-500 hover:text-brand-orange hover:bg-white border border-transparent hover:border-brand-border/60 flex items-center gap-1 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Change Template
              </Button>
            </>
          )}
        </div>

        {/* Dynamic Name Input in header */}
        {selectedTemplate ? (
          <div className="flex items-center gap-2 max-w-xs md:max-w-md">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono hidden md:block">
              EDITING FORM:
            </span>
            <Input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-8 rounded-xl border-brand-border bg-white focus-visible:ring-brand-orange text-xs font-bold w-48 sm:w-64"
            />
          </div>
        ) : (
          <div className="text-[10px] font-bold text-neutral-400 font-mono flex items-center gap-1 uppercase tracking-wider">
            <Laptop className="w-4 h-4 text-brand-orange" /> Select form template to begin
          </div>
        )}

        <div className="flex items-center gap-3">
          {selectedTemplate && (
            <>
              <Button
                size="sm"
                onClick={handleSaveForm}
                disabled={savingTemplate || fields.length === 0}
                className="rounded-xl border border-brand-border bg-white text-brand-charcoal hover:bg-brand-sand-dark font-bold h-8 px-3 flex items-center gap-1.5 cursor-pointer text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                {savingTemplate ? (
                  <div className="w-3.5 h-3.5 border border-brand-charcoal border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-brand-orange" />
                )}
                Save to Profile
              </Button>
              
              <Button
                size="sm"
                onClick={handleGenerateCode}
                disabled={generationLoading || fields.length === 0}
                className="rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold h-8 px-3 shadow border border-brand-orange flex items-center gap-1.5 cursor-pointer text-xs transition-all hover:scale-105 active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5" /> Compile Code
              </Button>
            </>
          )}

          {/* Dynamic Builder Login Session Display */}
          {!user ? (
            <button
              onClick={() => openAuthModal('login')}
              className="text-xs font-bold text-brand-charcoal hover:text-brand-orange cursor-pointer px-2.5 py-1 rounded-lg hover:bg-white hover:border-brand-border transition-all border border-transparent"
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1 p-0.5 rounded-full border border-brand-border bg-white shadow-sm hover:border-brand-orange/60 transition-all cursor-pointer"
              >
                <div className="w-6.5 h-6.5 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-[#fdfcf9] border border-brand-border rounded-xl shadow-lg p-2.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                    <div className="px-2 py-1 mb-1.5 border-b border-brand-border/60">
                      <p className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase">User</p>
                      <p className="text-xs font-extrabold text-brand-charcoal truncate">{user.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <Link href="/dashboard" className="text-xs font-bold text-neutral-500 hover:text-brand-orange flex items-center gap-1 transition-colors pl-1">
            Console <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Panel Canvas Area */}
      <main className="relative z-10 flex-1 w-full max-w-none flex flex-col overflow-hidden">
        {!selectedTemplate ? (
          /* Template Selector Panel */
          <div className="flex-1 overflow-y-auto px-6 py-12 text-center w-full">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <span className="text-[11px] font-black font-mono text-brand-orange uppercase tracking-[0.25em]">
                  STARTER TEMPLATES
                </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-brand-charcoal">
                  Choose a Starter Configuration
                </h1>
                <p className="text-xs md:text-sm text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                  Select an industry-specific starter configuration below. You can fully customize inputs, validation rules, and custom accent themes inside the visual studio compiler editor.
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
          /* Multi-Panel Studio Editor */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-brand-border/60 h-full overflow-hidden">

            {/* Left Panel */}
            <div className="lg:col-span-4 border-r border-brand-border/60 bg-white flex flex-col overflow-hidden h-full">
              <Tabs defaultValue="fields" className="w-full flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid grid-cols-2 rounded-none border-b border-brand-border/60 bg-brand-sand/30 p-0 h-11 w-full shrink-0">
                  <TabsTrigger
                    value="fields"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange data-[state=active]:bg-white text-xs font-extrabold flex items-center justify-center gap-1.5 h-full cursor-pointer transition-all"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Fields Structure
                  </TabsTrigger>
                  <TabsTrigger
                    value="styling"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange data-[state=active]:bg-white text-xs font-extrabold flex items-center justify-center gap-1.5 h-full cursor-pointer transition-all"
                  >
                    <Palette className="w-3.5 h-3.5" /> Style Customizer
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="fields"
                  className="flex-1 overflow-y-auto p-5 mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <FieldEditor fields={fields} onChange={setFields} />
                </TabsContent>

                <TabsContent
                  value="styling"
                  className="flex-1 overflow-y-auto p-5 mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-left"
                >
                  <StyleCustomizer styling={styling} onChange={setStyling} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Center Panel */}
            <div className="lg:col-span-4 bg-brand-sand/30 border-r border-brand-border/60 overflow-y-auto p-8 h-full flex flex-col justify-start">
              <LivePreview fields={fields} styling={styling} formName={formName} />
            </div>

            {/* Right Panel */}
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
    </div>
  );
}
