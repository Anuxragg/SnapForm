'use client';

import React, { useState, useRef, useCallback } from 'react';
import { SnapFormIcon } from '@/components/Logo';

interface TrailItem {
  key: string;
  intensity: number; // 1 to 5 (1 = brightest head, 5 = dimmest tail)
}

export default function AuthVisualCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const trailRef = useRef<string[]>([]);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 14 cols x 17 rows fine grid
  const cols = 14;
  const rows = 17;

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
      
      // Update trail: keep last 5 distinct positions for a 5-stage moving snake glow
      if (trailRef.current[0] !== key) {
        const newHistory = [key, ...trailRef.current.filter((k) => k !== key)].slice(0, 5);
        trailRef.current = newHistory;

        setTrail(
          newHistory.map((k, idx) => ({
            key: k,
            intensity: idx + 1, // 1 to 5
          }))
        );

        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = setTimeout(() => {
          trailRef.current = [];
          setTrail([]);
        }, 1400);
      }
    }
  }, [cols, rows]);

  const handleMouseLeave = () => {
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      trailRef.current = [];
      setTrail([]);
    }, 400);
  };

  const getTileClass = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const activeItem = trail.find((t) => t.key === key);

    if (!activeItem) {
      // Solid deep black uniform tile
      return 'bg-[#08080a]';
    }

    // 5-Stage Gradual Brightness Trail
    if (activeItem.intensity === 1) {
      // 1. Brightest (Head)
      return 'bg-[#ff551f] shadow-[0_0_24px_#ff4f19,inset_0_0_12px_#ff7e47] z-20 scale-[1.04] transition-all duration-75';
    }
    if (activeItem.intensity === 2) {
      // 2. High brightness
      return 'bg-[#ff6d31]/90 shadow-[0_0_18px_#ff4f1999] z-10 scale-[1.02] transition-all duration-100';
    }
    if (activeItem.intensity === 3) {
      // 3. Medium brightness
      return 'bg-[#ff8348]/70 shadow-[0_0_12px_#ff4f1966] z-0 scale-[1.01] transition-all duration-150';
    }
    if (activeItem.intensity === 4) {
      // 4. Low brightness (Less bright)
      return 'bg-[#ff9c65]/45 shadow-[0_0_8px_#ff4f1933] transition-all duration-200';
    }
    if (activeItem.intensity === 5) {
      // 5. Subtle dim glow (Tail)
      return 'bg-[#ffb688]/25 shadow-[0_0_4px_#ff4f1922] transition-all duration-300';
    }

    return 'bg-[#08080a]';
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
