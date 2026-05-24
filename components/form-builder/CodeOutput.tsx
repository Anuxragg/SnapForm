'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Download, FileCode, Server, Terminal, ShieldAlert } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface GeneratedCode {
  component: string;
  schema: string;
  apiRoute: string;
}

interface CodeOutputProps {
  code: GeneratedCode | null;
  formName: string;
  isLoading?: boolean;
}

export default function CodeOutput({ code, formName, isLoading = false }: CodeOutputProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 text-left">
        <div className="h-10 w-full bg-neutral-100 animate-pulse rounded-xl border border-neutral-200/50" />
        <div className="h-96 w-full bg-neutral-100 animate-pulse rounded-2xl border border-neutral-200/60" />
      </div>
    );
  }

  if (!code) {
    return (
      <Card className="border border-neutral-200/60 bg-white/60 backdrop-blur-sm p-12 text-center rounded-2xl flex flex-col items-center justify-center min-h-[350px]">
        <div className="p-4 rounded-full bg-amber-50 text-amber-600 mb-4 border border-amber-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <CardTitle className="text-base font-bold text-neutral-800">No generated code</CardTitle>
        <CardDescription className="text-sm text-neutral-500 mt-1 max-w-sm">
          Click the &quot;Generate Production Code&quot; button in the builder options to compile your custom configurations.
        </CardDescription>
      </Card>
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
      const componentFileName = `${formName.replace(/\s+/g, '')}.tsx`;
      
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
      link.download = `SnapForm-${formName.toLowerCase().replace(/\s+/g, '-')}.zip`;
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

  return (
    <div className="flex flex-col gap-4 text-left h-full overflow-hidden">
      {/* Code Header Actions */}
      <div className="flex justify-between items-center bg-white/60 backdrop-blur p-4 rounded-2xl border border-neutral-200/50 shadow-sm shrink-0">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Generated Code</h3>
          <p className="text-xs text-neutral-400">Next.js 14+ / TypeScript / Tailwind CSS</p>
        </div>
        <Button
          size="sm"
          onClick={handleDownloadZip}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95"
        >
          <Download className="w-4 h-4" /> Download ZIP
        </Button>
      </div>

      <Tabs defaultValue="component" className="w-full flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Navigation list */}
        <TabsList className="grid grid-cols-3 rounded-xl bg-neutral-100 p-1 border border-neutral-200/40 mb-2 shrink-0">
          <TabsTrigger value="component" className="rounded-lg text-xs font-semibold flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5" /> Component
          </TabsTrigger>
          <TabsTrigger value="schema" className="rounded-lg text-xs font-semibold flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" /> Schema
          </TabsTrigger>
          <TabsTrigger value="api" className="rounded-lg text-xs font-semibold flex items-center gap-1">
            <Server className="w-3.5 h-3.5" /> API Route
          </TabsTrigger>
        </TabsList>

        {/* Component tab */}
        <TabsContent value="component" className="relative mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wide rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-800 border-none font-mono">
              {formName.replace(/\s+/g, '')}.tsx
            </Badge>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopy(code.component, `${formName.replace(/\s+/g, '')}.tsx`)}
              className="w-7 h-7 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border-neutral-700/50 cursor-pointer shadow-sm"
            >
              {copiedTab === `${formName.replace(/\s+/g, '')}.tsx` ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-lg text-xs flex-1 overflow-y-auto min-h-0">
            <SyntaxHighlighter
              language="tsx"
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: '1.25rem', background: '#1e1e1e', height: '100%' }}
            >
              {code.component}
            </SyntaxHighlighter>
          </div>
        </TabsContent>

        {/* Schema tab */}
        <TabsContent value="schema" className="relative mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wide rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-800 border-none font-mono">
              schema.ts
            </Badge>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopy(code.schema, 'schema.ts')}
              className="w-7 h-7 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border-neutral-700/50 cursor-pointer shadow-sm"
            >
              {copiedTab === 'schema.ts' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-lg text-xs flex-1 overflow-y-auto min-h-0">
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: '1.25rem', background: '#1e1e1e', height: '100%' }}
            >
              {code.schema}
            </SyntaxHighlighter>
          </div>
        </TabsContent>

        {/* API Route tab */}
        <TabsContent value="api" className="relative mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wide rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-800 border-none font-mono">
              api/submit/route.ts
            </Badge>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopy(code.apiRoute, 'api/submit/route.ts')}
              className="w-7 h-7 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border-neutral-700/50 cursor-pointer shadow-sm"
            >
              {copiedTab === 'api/submit/route.ts' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-lg text-xs flex-1 overflow-y-auto min-h-0">
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: '1.25rem', background: '#1e1e1e', height: '100%' }}
            >
              {code.apiRoute}
            </SyntaxHighlighter>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
