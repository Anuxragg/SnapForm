'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Download, CheckCircle2, Loader2, FileCode2, ShieldCheck, Zap } from 'lucide-react';

// ── Step durations (ms) ──────────────────────────────────────────────────────
const STEP_DURATIONS = [3200, 3600, 3000]; // Describe, Compile, Export
const TOTAL = STEP_DURATIONS.reduce((a, b) => a + b, 0);

const PROMPT_TEXT = 'contact form with name, email & message validation';

const CODE_LINES = [
  { text: "import { z } from 'zod';", color: 'text-neutral-400' },
  { text: '', color: '' },
  { text: 'export const ContactSchema = z.object({', color: 'text-amber-400' },
  { text: "  name:    z.string().min(2, 'Required'),", color: 'text-emerald-400' },
  { text: "  email:   z.string().email('Invalid email'),", color: 'text-emerald-400' },
  { text: "  message: z.string().min(10, 'Too short'),", color: 'text-emerald-400' },
  { text: '});', color: 'text-amber-400' },
  { text: '', color: '' },
  { text: 'export type ContactInput =', color: 'text-cyan-400' },
  { text: '  z.infer<typeof ContactSchema>;', color: 'text-cyan-400' },
];

const FILES = [
  { icon: '⚛', name: 'ContactForm.tsx', desc: 'React + Tailwind', color: 'text-emerald-400' },
  { icon: '🛡', name: 'schema.ts', desc: 'Zod validation', color: 'text-amber-400' },
  { icon: '⚡', name: 'route.ts', desc: 'Next.js API handler', color: 'text-cyan-400' },
];

export default function WorkflowDemo() {
  const [step, setStep] = useState(0);           // 0 = Describe, 1 = Compile, 2 = Export
  const [progress, setProgress] = useState(0);   // 0–100 across total duration
  const [isPlaying, setIsPlaying] = useState(true);

  // Step 0: typewriter
  const [typed, setTyped] = useState(0);

  // Step 1: code lines revealed
  const [revealedLines, setRevealedLines] = useState(0);
  const [compiling, setCompiling] = useState(true);

  // Step 2: files pop in
  const [revealedFiles, setRevealedFiles] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);

  // Reset per-step state when step changes
  useEffect(() => {
    if (step === 0) { setTyped(0); }
    if (step === 1) { setRevealedLines(0); setCompiling(true); }
    if (step === 2) { setRevealedFiles(0); }
  }, [step]);

  // Typewriter effect for step 0
  useEffect(() => {
    if (step !== 0 || !isPlaying) return;
    if (typed >= PROMPT_TEXT.length) return;
    const t = setTimeout(() => setTyped(p => p + 1), 42);
    return () => clearTimeout(t);
  }, [step, typed, isPlaying]);

  // Code line streaming for step 1
  useEffect(() => {
    if (step !== 1 || !isPlaying) return;
    if (compiling) {
      const t = setTimeout(() => setCompiling(false), 900);
      return () => clearTimeout(t);
    }
    if (revealedLines >= CODE_LINES.length) return;
    const t = setTimeout(() => setRevealedLines(p => p + 1), 240);
    return () => clearTimeout(t);
  }, [step, revealedLines, compiling, isPlaying]);

  // Files pop in for step 2
  useEffect(() => {
    if (step !== 2 || !isPlaying) return;
    if (revealedFiles >= FILES.length) return;
    const t = setTimeout(() => setRevealedFiles(p => p + 1), 380);
    return () => clearTimeout(t);
  }, [step, revealedFiles, isPlaying]);

  // Master progress loop
  const tick = useCallback((now: number) => {
    if (startRef.current === null) startRef.current = now;
    const elapsed = (now - startRef.current + pausedAtRef.current) % TOTAL;
    const pct = (elapsed / TOTAL) * 100;
    setProgress(pct);

    // Determine current step
    let acc = 0;
    for (let i = 0; i < STEP_DURATIONS.length; i++) {
      acc += STEP_DURATIONS[i];
      if (elapsed < acc) {
        setStep(prev => (prev !== i ? i : prev));
        break;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, tick]);

  const STEP_LABELS = ['① Describe', '② Compile', '③ Export'];
  const stepColors = ['bg-brand-orange', 'bg-violet-500', 'bg-emerald-500'];
  const stepTextColors = ['text-brand-orange', 'text-violet-500', 'text-emerald-500'];

  return (
    <div className="relative w-full border border-brand-border bg-white rounded-3xl overflow-hidden shadow-2xl shadow-brand-charcoal/5">

      {/* ── Progress scrubber bar ── */}
      <div className="h-1 w-full bg-neutral-100 relative">
        <div
          className="h-full bg-brand-orange transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-3">
          {/* Step pills */}
          {STEP_LABELS.map((label, i) => (
            <span
              key={i}
              className={`text-[10px] font-black font-mono tracking-wider px-2 py-0.5 rounded transition-all duration-300 ${
                step === i
                  ? `${stepColors[i]} text-white`
                  : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Play / Pause */}
        <button
          onClick={() => {
            if (isPlaying) {
              // Store how far we got
              pausedAtRef.current = (progress / 100) * TOTAL;
            } else {
              startRef.current = null;
            }
            setIsPlaying(p => !p);
          }}
          className="w-7 h-7 rounded-full bg-brand-sand border border-brand-border flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          {isPlaying
            ? <Pause className="w-3 h-3 text-brand-charcoal" />
            : <Play className="w-3 h-3 text-brand-charcoal" />
          }
        </button>
      </div>

      {/* ── Step content area ── */}
      <div className="min-h-[360px] flex flex-col">

        {/* ────────────────── STEP 0: DESCRIBE ────────────────── */}
        {step === 0 && (
          <div className="flex-1 flex flex-col justify-center p-6 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <span className="text-[10px] font-black font-mono text-brand-orange uppercase tracking-[0.2em]">
                STEP 1 — DESCRIBE YOUR FORM
              </span>
              <p className="text-xs text-neutral-500">Type any natural-language prompt to get started.</p>
            </div>

            {/* Simulated prompt bar */}
            <div className="relative flex items-center p-1.5 rounded-full bg-brand-charcoal shadow-xl border border-neutral-800">
              <span className="text-brand-orange text-base font-extrabold pl-4 pr-2 select-none font-mono">⚡</span>
              <span className="flex-1 font-mono text-xs text-white py-2.5 pr-10 min-h-[20px]">
                {PROMPT_TEXT.slice(0, typed)}
                <span className="inline-block w-0.5 h-3.5 bg-brand-orange ml-0.5 animate-pulse align-middle" />
              </span>
              <span className="absolute right-2 w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center shadow shadow-brand-orange/30">
                <Zap className="w-4 h-4 text-white" />
              </span>
            </div>

            {/* Detected fields preview */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                AUTO-DETECTED FIELDS
              </span>
              <div className="flex flex-wrap gap-2">
                {['name · text', 'email · email', 'message · textarea'].map((f, i) => (
                  <span
                    key={f}
                    className="text-[10px] font-semibold font-mono px-2.5 py-1 rounded-lg border border-brand-border bg-brand-sand text-brand-charcoal/70"
                    style={{
                      opacity: typed > 20 + i * 10 ? 1 : 0,
                      transform: typed > 20 + i * 10 ? 'translateY(0)' : 'translateY(4px)',
                      transition: 'opacity 0.3s, transform 0.3s',
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── STEP 1: COMPILE ────────────────── */}
        {step === 1 && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-300">
            {/* Dark terminal */}
            <div className="flex-1 bg-[#1a1a1a] m-4 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col">
              {/* Terminal top bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/80 bg-[#141414]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 ml-2">schema.ts</span>
                </div>
                {compiling ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Compiling...
                  </div>
                ) : revealedLines >= CODE_LINES.length ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Done
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Streaming...
                  </div>
                )}
              </div>

              {/* Code content */}
              <div className="flex-1 p-4 font-mono text-[11px] leading-6 overflow-hidden">
                {!compiling && CODE_LINES.slice(0, revealedLines).map((line, i) => (
                  <div
                    key={i}
                    className={`${line.color || 'text-neutral-300'} transition-all duration-200`}
                    style={{ opacity: 1, animation: 'fadeSlideIn 0.2s ease-out' }}
                  >
                    {line.text || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                <FileCode2 className="w-3.5 h-3.5 text-violet-500" />
                <span>Generating <span className="text-violet-400 font-bold">3 files</span> — FormComponent.tsx · schema.ts · route.ts</span>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── STEP 2: EXPORT ────────────────── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-center p-6 space-y-5 animate-in fade-in duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-black font-mono text-emerald-600 uppercase tracking-[0.2em]">
                STEP 3 — EXPORT READY
              </span>
              <p className="text-xs text-neutral-500">Production bundle compiled. Download your ZIP package.</p>
            </div>

            {/* ZIP file structure */}
            <div className="bg-brand-charcoal rounded-2xl border border-neutral-800 p-5 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-brand-orange font-bold mb-4">
                <span className="text-base">📦</span>
                <span>contact-form-bundle.zip</span>
              </div>
              <div className="space-y-3 pl-4 border-l border-neutral-700 ml-1">
                {FILES.map((file, i) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-2.5 transition-all duration-300"
                    style={{
                      opacity: revealedFiles > i ? 1 : 0,
                      transform: revealedFiles > i ? 'translateX(0)' : 'translateX(-8px)',
                    }}
                  >
                    <span className={`text-base ${file.color}`}>{file.icon}</span>
                    <div>
                      <div className="text-white font-bold leading-none">{file.name}</div>
                      <div className="text-neutral-500 text-[9px] font-sans mt-0.5">{file.desc}</div>
                    </div>
                    {revealedFiles > i && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto animate-in zoom-in duration-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Download button */}
            <button
              className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                opacity: revealedFiles >= FILES.length ? 1 : 0,
                transition: 'opacity 0.4s 0.2s',
              }}
            >
              <Download className="w-4 h-4" />
              Download ZIP Package
            </button>
          </div>
        )}
      </div>

      {/* ── Footer: Stacks ticker ── */}
      <div className="border-t border-brand-border/60 px-5 py-3 flex items-center justify-between">
        <span className="text-[9px] font-extrabold uppercase font-mono text-neutral-400 tracking-widest">
          SUPPORTED STACKS
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono font-black text-brand-charcoal/50">
          {['NEXT.JS', '•', 'ZOD', '•', 'TAILWIND', '•', 'SHADCN'].map((s, i) => (
            <span key={i} className={s !== '•' ? 'hover:text-brand-orange transition-colors cursor-default' : ''}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
