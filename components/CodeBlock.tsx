'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#333333] bg-[#151515] shadow-sm text-left font-mono group">
      {/* Floating Top-Right Copy Action Control */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center select-none">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in duration-200" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Body with Line Numbers */}
      <div className="overflow-x-auto text-[13px] leading-[1.75] py-4 pr-16 pl-2">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1.25em',
            color: '#555761',
            textAlign: 'right',
            userSelect: 'none',
            fontSize: '12px',
          }}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '13px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            lineHeight: '1.75',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            },
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
