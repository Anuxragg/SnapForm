'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, Copy, FileCode2, Terminal as TerminalIcon, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
  code: string;
  jsCode?: string;
  filename?: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function TypeScriptIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[3px] shrink-0`} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#3178C6"/>
      <text x="16" y="22.5" fill="#ffffff" fontSize="17" fontWeight="900" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" textAnchor="middle" letterSpacing="-0.5">
        TS
      </text>
    </svg>
  );
}

export function JavaScriptIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[3px] shrink-0`} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#F7DF1E"/>
      <text x="16" y="22.5" fill="#000000" fontSize="17" fontWeight="900" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" textAnchor="middle" letterSpacing="-0.5">
        JS
      </text>
    </svg>
  );
}

function LanguageIcon({ lang }: { lang: string }) {
  const l = lang.toLowerCase();

  if (l.includes('ts') || l.includes('typescript')) {
    return <TypeScriptIcon />;
  }

  if (l.includes('js') || l.includes('javascript')) {
    return <JavaScriptIcon />;
  }

  if (l === 'bash' || l === 'terminal' || l === 'cli' || l === 'sh') {
    return <TerminalIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  }

  return <FileCode2 className="w-3.5 h-3.5 text-brand-orange shrink-0" />;
}

// Convert simple TypeScript code to JavaScript by stripping typings
function convertTsToJs(ts: string): string {
  return ts
    .replace(/<FormValues>/g, '')
    .replace(/:\s*React\.FC/g, '')
    .replace(/:\s*NextRequest/g, '')
    .replace(/:\s*FormValues/g, '')
    .replace(/export type FormValues = [^;]+;/g, '')
    .replace(/:\s*(?:string|number|boolean|any|void)\b/g, '')
    .replace(/(\n\s*\n){2,}/g, '\n\n')
    .trim();
}

// Tokenizer for rich code syntax coloring
function highlightLine(line: string): React.ReactNode[] {
  if (!line) return [<span key="empty">&nbsp;</span>];

  if (line.trim().startsWith('//')) {
    return [<span key="comment" className="text-neutral-500 italic">{line}</span>];
  }

  const tokens: React.ReactNode[] = [];
  const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|\/\/[^\n]*|\b(?:import|export|from|default|function|return|const|let|var|async|await|type|interface|if|else|try|catch|true|false|null|undefined|typeof)\b|<(?:\/?[a-zA-Z0-9_-]+)|(?:\/?>)|[a-zA-Z0-9_]+(?=\()|\b[A-Z][a-zA-Z0-9_]*\b|\b\d+\b|[{}()[\]=;,.<>:]|\s+|[a-zA-Z_][a-zA-Z0-9_]*)/g;

  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(line)) !== null) {
    const text = match[0];

    if (/^["'`]/.test(text)) {
      tokens.push(
        <span key={idx++} className="text-amber-300 font-medium">
          {text}
        </span>
      );
    } else if (
      /^(?:import|export|from|default|function|return|const|let|var|async|await|type|interface|if|else|try|catch|typeof)$/.test(
        text
      )
    ) {
      tokens.push(
        <span key={idx++} className="text-purple-400 font-semibold">
          {text}
        </span>
      );
    } else if (/^(?:true|false|null|undefined|\d+)$/.test(text)) {
      tokens.push(
        <span key={idx++} className="text-orange-400 font-mono">
          {text}
        </span>
      );
    } else if (/^<(?:\/?[a-zA-Z0-9_-]+)/.test(text)) {
      tokens.push(
        <span key={idx++} className="text-rose-400 font-semibold">
          {text}
        </span>
      );
    } else if (/^(?:className|onSubmit|onClick|onChange|disabled|type|placeholder|required|id|href|key|value|resolver|variant)$/.test(text)) {
      tokens.push(
        <span key={idx++} className="text-emerald-400">
          {text}
        </span>
      );
    } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(text)) {
      tokens.push(
        <span key={idx++} className="text-sky-300 font-semibold">
          {text}
        </span>
      );
    } else if (match.index + text.length < line.length && line[match.index + text.length] === '(') {
      tokens.push(
        <span key={idx++} className="text-blue-300 font-medium">
          {text}
        </span>
      );
    } else {
      tokens.push(
        <span key={idx++} className="text-neutral-200">
          {text}
        </span>
      );
    }
  }

  return tokens.length > 0 ? tokens : [<span key="raw" className="text-neutral-200">{line}</span>];
}

export default function CodeBlock({
  code,
  jsCode,
  filename,
  language = 'tsx',
  showLineNumbers = true,
}: CodeBlockProps) {
  const isTsEligible = language.toLowerCase().includes('ts') || language.toLowerCase() === 'tsx';
  const [selectedLang, setSelectedLang] = useState<'ts' | 'js'>(isTsEligible ? 'ts' : 'js');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCode = isTsEligible
    ? selectedLang === 'ts'
      ? code
      : jsCode || convertTsToJs(code)
    : code;

  const displayFilename = filename
    ? isTsEligible && selectedLang === 'js'
      ? filename.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js')
      : filename
    : undefined;

  const lines = activeCode.trim().split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    toast.success('Snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-[#090d16] border border-neutral-800 shadow-xl overflow-hidden font-mono text-xs my-4 group">
      {/* Code Header Bar */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1320] border-b border-neutral-800/80 text-neutral-400 text-xs select-none">
          {/* File Label & Dots */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <FileCode2 className="w-3.5 h-3.5 text-brand-orange ml-1" />
            <span className="text-neutral-200 font-bold tracking-tight text-[11px]">{displayFilename}</span>
          </div>

          {/* Right Controls: Copy + Language Switcher Dropdown */}
          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-all cursor-pointer"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Language Switcher Dropdown (TypeScript / JavaScript) */}
            {isTsEligible ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700/80 border border-neutral-700/60 text-white text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                >
                  {selectedLang === 'ts' ? (
                    <>
                      <TypeScriptIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] text-neutral-300">TS</span>
                    </>
                  ) : (
                    <>
                      <JavaScriptIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] text-neutral-300">JS</span>
                    </>
                  )}
                  <ChevronDown className="w-3 h-3 text-neutral-400 transition-transform" />
                </button>

                {/* Dropdown Menu Modal */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#111622] border border-neutral-700/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                    <button
                      onClick={() => {
                        setSelectedLang('ts');
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                        selectedLang === 'ts'
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                      }`}
                    >
                      <TypeScriptIcon className="w-4 h-4" />
                      <span>TypeScript ({language === 'tsx' ? '.tsx' : '.ts'})</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLang('js');
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                        selectedLang === 'js'
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                      }`}
                    >
                      <JavaScriptIcon className="w-4 h-4" />
                      <span>JavaScript ({language === 'tsx' ? '.jsx' : '.js'})</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-neutral-300 bg-neutral-800/80 border border-neutral-700/60 px-2 py-0.5 rounded-md">
                <LanguageIcon lang={language} />
                <span>{language}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code Editor Body with Line Numbers */}
      <div className="p-4 overflow-x-auto leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, lineIndex) => (
              <tr key={lineIndex} className="hover:bg-white/[0.03] transition-colors">
                {showLineNumbers && (
                  <td className="select-none text-neutral-600 font-mono text-[11px] text-right pr-4 pl-1 align-top w-8 border-r border-neutral-800/50">
                    {lineIndex + 1}
                  </td>
                )}
                <td className="pl-4 align-top whitespace-pre font-mono text-[11.5px]">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
