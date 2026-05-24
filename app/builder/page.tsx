'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import {
  Sparkles,
  ArrowLeft,
  Settings2,
  Palette,
  Layers,
  Wand2,
  ChevronLeft,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import TemplateSelector from '@/components/form-builder/TemplateSelector';
import FieldEditor from '@/components/form-builder/FieldEditor';
import StyleCustomizer from '@/components/form-builder/StyleCustomizer';
import LivePreview from '@/components/form-builder/LivePreview';
import CodeOutput from '@/components/form-builder/CodeOutput';
import { ISeedFormTemplate, PREDEFINED_TEMPLATES } from '@/lib/templates';
import { IFormField, IFormStyling } from '@/models/FormTemplate';

export default function BuilderPage() {
  // State variables
  const [templates, setTemplates] = useState<ISeedFormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ISeedFormTemplate | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [fields, setFields] = useState<IFormField[]>([]);
  const [styling, setStyling] = useState<IFormStyling>({ theme: 'modern', primaryColor: '#ff4f19' });

  const [generatedCode, setGeneratedCode] = useState<{
    component: string;
    schema: string;
    apiRoute: string;
  } | null>(null);

  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);
  const [generationLoading, setGenerationLoading] = useState<boolean>(false);

  // Fetch templates from API route on load

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setTemplatesLoading(true);
        const res = await fetch('/api/templates');
        const json = await res.json();
        if (json.success && json.data) {
          setTemplates(json.data);
        } else {
          setTemplates(PREDEFINED_TEMPLATES);
        }
      } catch (err) {
        console.error('Failed to load templates from API, falling back to local files:', err);
        setTemplates(PREDEFINED_TEMPLATES);
      } finally {
        setTemplatesLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // Parse prompt parameter from URL
  useEffect(() => {
    if (typeof window !== 'undefined' && templates.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const prompt = params.get('prompt');
      if (prompt) {
        const promptLower = prompt.toLowerCase();
        let targetTemplate = templates[0] || PREDEFINED_TEMPLATES[0];

        if (promptLower.includes('pay') || promptLower.includes('bill') || promptLower.includes('sub')) {
          targetTemplate = templates.find(t => t.category === 'payment') || PREDEFINED_TEMPLATES[1];
        } else if (promptLower.includes('survey') || promptLower.includes('feed') || promptLower.includes('rate')) {
          targetTemplate = templates.find(t => t.category === 'survey') || PREDEFINED_TEMPLATES[2];
        } else if (promptLower.includes('book') || promptLower.includes('sched') || promptLower.includes('date')) {
          targetTemplate = templates.find(t => t.category === 'booking') || PREDEFINED_TEMPLATES[3];
        }

        setSelectedTemplate(targetTemplate);
        setFormName(prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt);
        setFields(targetTemplate.fields as IFormField[]);
        setStyling({
          theme: 'modern',
          primaryColor: '#ff4f19',
        });

        // Remove search param from URL to avoid re-triggering if templates change
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [templates]);

  // Handle template selection
  const handleSelectTemplate = (template: ISeedFormTemplate) => {
    setSelectedTemplate(template);
    setFormName(template.name);
    setFields(template.fields as IFormField[]);
    setStyling({
      theme: template.styling.theme as any,
      primaryColor: '#ff4f19', // Use signature orange as default
    });
  };

  // Reset/Deselect template to go back to choice view
  const handleDeselectTemplate = () => {
    setSelectedTemplate(null);
    setGeneratedCode(null);
  };

  // Perform code compilation using /api/generate
  const handleGenerateCode = useCallback(async () => {
    if (fields.length === 0) return;
    try {
      setGenerationLoading(true);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields,
          styling,
          name: formName || 'Form',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedCode(json.data);
      }
    } catch (err) {
      console.error('Code generation request failed:', err);
    } finally {
      setGenerationLoading(false);
    }
  }, [fields, styling, formName]);

  // Debounced auto-compilation on layout changes for an ultra-premium reactive developer experience
  useEffect(() => {
    if (!selectedTemplate) return;
    const timer = setTimeout(() => {
      handleGenerateCode();
    }, 500); // 500ms debounce
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
          <Link href="/">
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
            <Button
              size="sm"
              onClick={handleGenerateCode}
              disabled={generationLoading || fields.length === 0}
              className="rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold h-8 px-3 shadow border border-brand-orange flex items-center gap-1.5 cursor-pointer text-xs transition-all hover:scale-105 active:scale-95"
            >
              <Wand2 className="w-3.5 h-3.5" /> Compile Code
            </Button>
          )}
          <Link href="/" className="text-xs font-bold text-neutral-500 hover:text-brand-orange flex items-center gap-1 transition-colors">
            Home <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Panel Canvas Area */}
      <main className="relative z-10 flex-1 w-full max-w-none flex flex-col overflow-hidden">
        {!selectedTemplate ? (
          /* Landing Template Selector Panel */
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
          /* Multi-Panel Studio Editor Split */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-brand-border/60 h-full overflow-hidden">

            {/* Left Panel: Configuration Fields + Style Customizer */}
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

            {/* Center Panel: Visual Live Preview Canvas */}
            <div className="lg:col-span-4 bg-brand-sand/30 border-r border-brand-border/60 overflow-y-auto p-8 h-full flex flex-col justify-start">
              <LivePreview fields={fields} styling={styling} formName={formName} />
            </div>

            {/* Right Panel: Syntax highlighted Code Output tabs */}
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
