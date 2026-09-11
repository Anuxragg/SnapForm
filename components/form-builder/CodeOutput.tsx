'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download, FileCode, Server, Terminal, Wand2, Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import JSZip from 'jszip';
import { toast } from 'sonner';

const customCodeTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: '#1e293b',
    background: '#ffffff',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.75',
    fontWeight: '400',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 2,
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#1e293b',
    background: '#ffffff',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.75',
    fontWeight: '400',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 2,
    hyphens: 'none',
    margin: 0,
    padding: '1.25rem',
    overflow: 'auto',
  },
  comment: { color: '#94a3b8', fontStyle: 'italic' },
  prolog: { color: '#94a3b8', fontStyle: 'italic' },
  doctype: { color: '#94a3b8', fontStyle: 'italic' },
  cdata: { color: '#94a3b8', fontStyle: 'italic' },
  punctuation: { color: '#334155' },
  property: { color: '#0284c7' },
  tag: { color: '#e11d48' },
  boolean: { color: '#e11d48' },
  number: { color: '#0284c7' },
  constant: { color: '#0284c7' },
  symbol: { color: '#0284c7' },
  deleted: { color: '#e11d48' },
  selector: { color: '#059669' },
  'attr-name': { color: '#d97706' },
  string: { color: '#059669' },
  char: { color: '#059669' },
  builtin: { color: '#2563eb' },
  inserted: { color: '#059669' },
  operator: { color: '#e11d48' },
  entity: { color: '#2563eb', cursor: 'help' },
  url: { color: '#0284c7' },
  variable: { color: '#d97706' },
  atrule: { color: '#e11d48' },
  'attr-value': { color: '#059669' },
  function: { color: '#7c3aed' },
  'class-name': { color: '#d97706' },
  keyword: { color: '#e11d48' },
  regex: { color: '#059669' },
  important: { color: '#e11d48' },
};

interface GeneratedCode {
  component: string;
  schema: string;
  apiRoute: string;
}

interface CodeOutputProps {
  code: GeneratedCode | null;
  formName: string;
  isLoading?: boolean;
  onCompile?: () => void;
}

export default function CodeOutput({ code, formName, isLoading = false, onCompile }: CodeOutputProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center p-8 space-y-3 bg-white">
        <div className="p-3.5 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange animate-pulse">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <p className="text-xs font-mono font-medium text-neutral-600">Compiling production-ready code...</p>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center p-8 space-y-4 bg-white">
        <div className="p-3.5 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
          <Wand2 className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-sm font-bold text-neutral-800 font-mono">No Code Compiled Yet</h4>
          <p className="text-xs text-neutral-500 leading-relaxed font-sans">
            Click compile to generate the React component, Zod schema, and Next.js route.
          </p>
        </div>
        {onCompile && (
          <Button
            size="sm"
            onClick={onCompile}
            className="rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-4 h-9 cursor-pointer transition-all shadow-xs active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Compile Code Now
          </Button>
        )}
      </div>
    );
  }

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    toast.success(`${tabName} code copied to clipboard!`, { duration: 2000 });
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      const componentFileName = `${(formName || 'Form').replace(/\s+/g, '')}.tsx`;

      // Setup file structure in zip
      zip.file(componentFileName, code.component);
      zip.file('schema.ts', code.schema);

      const apiFolder = zip.folder('api');
      const submitFolder = apiFolder?.folder('submit');
      submitFolder?.file('route.ts', code.apiRoute);

      const content = await zip.generateAsync({ type: 'blob' });

      // Create download link and trigger click
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SnapForm-${(formName || 'form').toLowerCase().replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('ZIP package downloaded successfully!', {
        description: 'Contains React component, Zod validation schema, and Next.js API Route.',
        duration: 4000,
      });
    } catch (err: any) {
      console.error('Failed to generate ZIP:', err);
      toast.error('Could not generate zip download. Please try copying individual code tabs.');
    }
  };

  const componentFileName = `${(formName || 'Form').replace(/\s+/g, '')}.tsx`;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-left bg-white">
      <Tabs defaultValue="component" className="w-full flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top Sub-header inside Code View */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 border-b border-neutral-100 shrink-0 bg-[#fafafa]">
          <TabsList className="bg-neutral-200/50 border border-neutral-200/60 p-0.5 rounded-lg h-7">
            <TabsTrigger
              value="component"
              className="rounded-md text-[11px] font-mono data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-2xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 h-6 px-2.5 cursor-pointer transition-all"
            >
              <FileCode className="w-3 h-3 text-brand-orange" />
              <span>{componentFileName}</span>
            </TabsTrigger>
            <TabsTrigger
              value="schema"
              className="rounded-md text-[11px] font-mono data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-2xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 h-6 px-2.5 cursor-pointer transition-all"
            >
              <Terminal className="w-3 h-3 text-brand-orange" />
              <span>schema.ts</span>
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="rounded-md text-[11px] font-mono data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-2xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 h-6 px-2.5 cursor-pointer transition-all"
            >
              <Server className="w-3 h-3 text-brand-orange" />
              <span>route.ts</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownloadZip}
              className="h-7 rounded-lg bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 border border-neutral-200 shadow-2xs font-mono text-[11px] px-2.5 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-3 h-3 text-neutral-500" />
              <span className="hidden sm:inline">Download ZIP</span>
            </Button>
          </div>
        </div>

        {/* Component tab */}
        <TabsContent value="component" className="relative mt-0 pt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="absolute right-4 top-2.5 z-10">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopy(code.component, componentFileName)}
              className="w-7 h-7 bg-white/95 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 rounded-md border-neutral-200 shadow-2xs cursor-pointer transition-all active:scale-95"
              title="Copy component code"
            >
              {copiedTab === componentFileName ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="w-full bg-white text-xs flex-1 overflow-y-auto min-h-0 font-mono">
            <SyntaxHighlighter
              language="tsx"
              style={customCodeTheme}
              customStyle={{
                margin: 0,
                padding: '0.85rem 1.25rem',
                background: '#ffffff',
                height: '100%',
                fontSize: '13px',
                lineHeight: '1.75',
              }}
            >
              {code.component}
            </SyntaxHighlighter>
          </div>
        </TabsContent>

        {/* Schema tab */}
        <TabsContent value="schema" className="relative mt-0 pt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="absolute right-4 top-2.5 z-10">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopy(code.schema, 'schema.ts')}
              className="w-7 h-7 bg-white/95 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 rounded-md border-neutral-200 shadow-2xs cursor-pointer transition-all active:scale-95"
              title="Copy schema code"
            >
              {copiedTab === 'schema.ts' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="w-full bg-white text-xs flex-1 overflow-y-auto min-h-0 font-mono">
            <SyntaxHighlighter
              language="typescript"
              style={customCodeTheme}
              customStyle={{
                margin: 0,
                padding: '0.85rem 1.25rem',
                background: '#ffffff',
                height: '100%',
                fontSize: '13px',
                lineHeight: '1.75',
              }}
            >
              {code.schema}
            </SyntaxHighlighter>
          </div>
        </TabsContent>

        {/* API Route tab */}
        <TabsContent value="api" className="relative mt-0 pt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="absolute right-4 top-2.5 z-10">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopy(code.apiRoute, 'api/submit/route.ts')}
              className="w-7 h-7 bg-white/95 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 rounded-md border-neutral-200 shadow-2xs cursor-pointer transition-all active:scale-95"
              title="Copy API Route code"
            >
              {copiedTab === 'api/submit/route.ts' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="w-full bg-white text-xs flex-1 overflow-y-auto min-h-0 font-mono">
            <SyntaxHighlighter
              language="typescript"
              style={customCodeTheme}
              customStyle={{
                margin: 0,
                padding: '0.85rem 1.25rem',
                background: '#ffffff',
                height: '100%',
                fontSize: '13px',
                lineHeight: '1.75',
              }}
            >
              {code.apiRoute}
            </SyntaxHighlighter>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


