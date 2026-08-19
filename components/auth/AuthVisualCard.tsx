'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SnapFormIcon } from '@/components/Logo';

export default function AuthVisualCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<string[]>([]);
  const trailRef = useRef<string[]>([]);
  const decayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  
  const cols = 14;
  const rows = 17;

  
  const startDecay = useCallback(() => {
    if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);

    decayIntervalRef.current = setInterval(() => {
      if (trailRef.current.length > 0) {
       
        const next = trailRef.current.slice(0, -1);
        trailRef.current = next;
        setTrail([...next]);
      } else {
        if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
      }
    }, 120); 
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colWidth = rect.width / cols;
    const rowHeight = rect.height / rows;

    const col = Math.floor(x / colWidth);
    const row = Math.floor(y / rowHeight);

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const key = `${row}-${col}`;

      
      if (trailRef.current[0] !== key) {
        const updated = [key, ...trailRef.current.filter((k) => k !== key)].slice(0, 6);
        trailRef.current = updated;
        setTrail([...updated]);

        startDecay();
      }
    }
  }, [cols, rows, startDecay]);

  const handleMouseLeave = () => {
    startDecay();
  };

  useEffect(() => {
    return () => {
      if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
    };
  }, []);

  const getTileClass = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const index = trail.indexOf(key);

    if (index === -1) {
      // Idle black tile
      return 'bg-[#08080a] transition-all duration-300';
    }

    // Index 0 = Newest / Head (Brightest)
    // Index 5 = Oldest / Tail (Dies first in sequential order)
    switch (index) {
      case 0:
        return 'bg-[#ff551f] shadow-[0_0_24px_#ff4f19,inset_0_0_12px_#ff7e47] z-20 scale-[1.04] transition-all duration-75';
      case 1:
        return 'bg-[#ff6d31]/90 shadow-[0_0_18px_#ff4f1999] z-10 scale-[1.02] transition-all duration-100';
      case 2:
        return 'bg-[#ff8348]/70 shadow-[0_0_12px_#ff4f1966] z-0 scale-[1.01] transition-all duration-150';
      case 3:
        return 'bg-[#ff9c65]/50 shadow-[0_0_8px_#ff4f1933] transition-all duration-200';
      case 4:
        return 'bg-[#ffb688]/30 shadow-[0_0_5px_#ff4f1922] transition-all duration-250';
      case 5:
      default:
        return 'bg-[#ffcfb0]/15 shadow-[0_0_2px_#ff4f1911] transition-all duration-300';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full rounded-3xl relative overflow-hidden flex items-center justify-center border border-neutral-800/80 bg-gradient-to-br from-[#1c1411] via-[#100e10] to-[#070709] shadow-2xl select-none group"
    >
      {/* Background ambient warm glowing orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Seamless Edge-to-Edge Grid with Ultra-Thin Hairline Lines ─── */}
      <div
        className="absolute inset-0 grid border-t border-l border-white/[0.045]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              className={`border-r border-b border-white/[0.045] transition-all duration-200 ${getTileClass(
                r,
                c
              )}`}
            />
          ))
        )}
      </div>

      {/* ─── Center Hero Logo with Ambient Backlight ───────────────────── */}
      <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative group/logo">
          {/* Radial ambient glow behind logo */}
          <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/40 via-rose-500/30 to-amber-500/40 rounded-3xl blur-2xl opacity-85" />

          {/* Logo Badge Container */}
          <div className="relative w-20 h-20 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-center transition-all duration-300">
            <SnapFormIcon className="w-8 h-12 text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.5)]" fill="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}
