'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, Sparkles, Box, Moon, Minimize2 } from 'lucide-react';
import { IFormStyling } from '@/models/FormTemplate';

interface StyleCustomizerProps {
  styling: IFormStyling;
  onChange: (styling: IFormStyling) => void;
}

const themePresets = [
  {
    id: 'modern',
    name: 'Liquid Glass',
    desc: 'Frosted translucency, refractive blur & liquid specular sheen',
    icon: Sparkles,
  },
  {
    id: 'neobrutalist',
    name: 'Neobrutalism',
    desc: 'High-contrast bold 2px borders & retro pop shadows',
    icon: Box,
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    desc: 'Obsidian dark card, deep inputs & vibrant neon pop',
    icon: Moon,
  },
  {
    id: 'minimal',
    name: 'Minimal Stark',
    desc: 'Sharp square lines & clean high-density layout',
    icon: Minimize2,
  },
];

const colorPresets = [
  { name: 'Snap Orange', value: '#ff4f19' },
  { name: 'Indigo Electric', value: '#6366f1' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Violet Purple', value: '#8b5cf6' },
  { name: 'Cyan Sky', value: '#06b6d4' },
  { name: 'Rose Pink', value: '#ec4899' },
  { name: 'Amber Gold', value: '#f59e0b' },
  { name: 'Noir Dark', value: '#18181b' },
];

export default function StyleCustomizer({ styling, onChange }: StyleCustomizerProps) {
  const currentTheme = styling.theme || 'modern';

  const update = (patch: Partial<IFormStyling>) => {
    onChange({ ...styling, ...patch });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="pb-2 border-b border-neutral-100 dark:border-[#262626]">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading">Visual Designer</h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Personalize themes and primary accent colors</p>
      </div>

      {/* 1. Theme Presets Grid */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Design Preset</Label>
        <div className="grid grid-cols-1 gap-2">
          {themePresets.map((preset) => {
            const isSelected = currentTheme === preset.id;
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => update({ theme: preset.id as any })}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white bg-white dark:bg-[#1E1E1E] shadow-sm ring-1 ring-neutral-900/10 dark:ring-white/20'
                    : 'border-neutral-200/90 dark:border-[#2a2a2a] bg-white dark:bg-[#1A1A1A] hover:border-neutral-300 dark:hover:border-[#383838] hover:bg-neutral-50/70 dark:hover:bg-[#222222]'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-[#282828] dark:text-white dark:border dark:border-[#383838]'
                      : 'bg-neutral-100 dark:bg-[#202020] text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-neutral-900 dark:text-white' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">{preset.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Color Accent */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Primary Color Accent</Label>
          <span className="text-[11px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase">{styling.primaryColor}</span>
        </div>

        {/* Color Swatches */}
        <div className="grid grid-cols-8 gap-2">
          {colorPresets.map((preset) => {
            const isSelected = styling.primaryColor.toLowerCase() === preset.value.toLowerCase();
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => update({ primaryColor: preset.value })}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
                className={`w-7 h-7 rounded-full border shadow-xs transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer ${
                  isSelected ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-400/50' : 'border-neutral-200/60 dark:border-white/20'
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Hex Input */}
        <div className="relative flex items-center">
          <span className="absolute left-3 text-neutral-400 font-mono text-xs">#</span>
          <Input
            type="text"
            placeholder="ff4f19"
            maxLength={6}
            value={styling.primaryColor.replace('#', '')}
            onChange={(e) => {
              const hex = e.target.value;
              if (/^[0-9A-Fa-f]{0,6}$/.test(hex)) {
                update({ primaryColor: hex ? `#${hex}` : '#ff4f19' });
              }
            }}
            className="pl-7 rounded-xl border-neutral-200/90 dark:border-[#2c2c2c] font-mono text-xs h-8 bg-neutral-50/80 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-[#202020]"
          />
        </div>
      </div>
    </div>
  );
}

