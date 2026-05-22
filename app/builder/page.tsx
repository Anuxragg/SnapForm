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
  const [styling, setStyling] = useState<IFormStyling>({ theme: 'modern', primaryColor: '#6366f1' });
  
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

  // Handle template selection
  const handleSelectTemplate = (template: ISeedFormTemplate) => {
    setSelectedTemplate(template);
    setFormName(template.name);
    setFields(template.fields as IFormField[]);
    setStyling(template.styling as IFormStyling);
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
    <div className="h-screen bg-[#f8f9fa] text-neutral-800 font-sans flex flex-col antialiased overflow-hidden">
      {/* Sonner notifications */}
      <Toaster position="bottom-right" richColors />

      {/* Builder Top Bar */}
      <header className="bg-white border-b border-neutral-200/80 px-6 py-4 flex flex-row items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left leading-none hidden sm:block">
                <span className="text-sm font-black tracking-tight text-neutral-900">
                  Form<span className="text-violet-600">Craft</span>
                </span>
                <span className="text-[9px] font-bold text-neutral-400 block tracking-widest mt-0.5">
                  STUDIO
                </span>
              </div>
            </div>
          </Link>
          
          {selectedTemplate && (
            <>
              <div className="text-neutral-300">|</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeselectTemplate}
                className="rounded-xl h-8 px-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Change Template
              </Button>
            </>
          )}
        </div>

        {/* Dynamic Name Input in header */}
        {selectedTemplate ? (
          <div className="flex items-center gap-2 max-w-xs md:max-w-md">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider hidden md:block">
              Editing:
            </span>
            <Input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-8 rounded-xl border-neutral-200 focus-visible:ring-violet-500 text-xs font-bold w-48 sm:w-64"
            />
          </div>
        ) : (
          <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
            <Laptop className="w-4 h-4" /> Select form template to begin
          </div>
        )}

        <div className="flex items-center gap-3">
          {selectedTemplate && (
            <Button
              size="sm"
              onClick={handleGenerateCode}
              disabled={generationLoading || fields.length === 0}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold h-8 px-3 shadow shadow-violet-500/10 flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Wand2 className="w-3.5 h-3.5" /> Compile Code
            </Button>
          )}
          <Link href="/" className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 flex items-center gap-1 transition-colors">
            Home <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Panel Canvas Area */}
      <main className="flex-1 w-full max-w-none flex flex-col overflow-hidden">
        {!selectedTemplate ? (
          /* Landing Template Selector Panel */
          <div className="flex-1 overflow-y-auto px-6 py-12 text-center w-full">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
                Choose a Starter Template
              </h1>
              <p className="text-sm md:text-base text-neutral-500 max-w-2xl mx-auto">
                Select an industry-specific starter configuration below. You can fully customize components, validations, and themes in the visual studio editor.
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
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-neutral-100 h-full overflow-hidden">
            {/* Left Panel: Configuration Fields + Style Customizer */}
            <div className="lg:col-span-4 border-r border-neutral-200/80 bg-white flex flex-col overflow-hidden h-full">
              <Tabs defaultValue="fields" className="w-full flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid grid-cols-2 rounded-none border-b border-neutral-100 bg-neutral-50/50 p-0 h-11 w-full shrink-0">
                  <TabsTrigger
                    value="fields"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-white text-xs font-bold flex items-center justify-center gap-1.5 h-full cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-neutral-500" /> Fields Structure
                  </TabsTrigger>
                  <TabsTrigger
                    value="styling"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-white text-xs font-bold flex items-center justify-center gap-1.5 h-full cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5 text-neutral-500" /> Styling Customizer
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
            <div className="lg:col-span-4 bg-neutral-50 border-r border-neutral-200/80 overflow-y-auto p-8 h-full flex flex-col justify-start">
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
