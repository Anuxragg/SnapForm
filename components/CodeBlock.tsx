'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  theme?: 'dark' | 'light';
}

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  theme = 'light',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`relative rounded-xl overflow-hidden border text-left font-mono group transition-colors ${
        isDark
          ? 'border-neutral-800 bg-[#151515] text-white shadow-sm'
          : 'border-neutral-200 bg-neutral-50/70 text-neutral-900 shadow-2xs'
      }`}
    >
      {/* Floating Top-Right Copy Action Control */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center select-none">
        <button
          type="button"
          onClick={handleCopy}
          className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
            isDark
              ? 'text-neutral-400 hover:text-white hover:bg-white/10'
              : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/70'
          }`}
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in duration-200" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Body with Line Numbers */}
      <div className="overflow-x-auto text-[12px] leading-[1.7] py-3 pr-10 pl-2">
        <SyntaxHighlighter
          language={language}
          style={isDark ? vscDarkPlus : oneLight}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: '2.2em',
            paddingRight: '1em',
            color: isDark ? '#555761' : '#94a3b8',
            textAlign: 'right',
            userSelect: 'none',
            fontSize: '11.5px',
          }}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '12px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            lineHeight: '1.7',
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

