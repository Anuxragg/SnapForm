'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Check } from 'lucide-react';
import { IFormStyling } from '@/models/FormTemplate';

interface StyleCustomizerProps {
  styling: IFormStyling;
  onChange: (styling: IFormStyling) => void;
}

const colorPresets = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Charcoal', value: '#0f172a' },
];

export default function StyleCustomizer({ styling, onChange }: StyleCustomizerProps) {
  const handleThemeChange = (theme: 'minimal' | 'modern' | 'corporate') => {
    onChange({ ...styling, theme });
  };

  const handleColorChange = (primaryColor: string) => {
    onChange({ ...styling, primaryColor });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-800">Visual Designer</h3>
          <p className="text-xs text-neutral-400">Personalize styling and aesthetics</p>
        </div>
      </div>

      {/* Theme Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-neutral-700">Form Layout Theme</Label>
        <Select
          value={styling.theme}
          onValueChange={(val) => handleThemeChange(val as 'minimal' | 'modern' | 'corporate')}
        >
          <SelectTrigger className="rounded-xl border-neutral-200">
            <SelectValue placeholder="Select theme style" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="modern">Modern Glassmorphism</SelectItem>
            <SelectItem value="minimal">Minimal stark lines</SelectItem>
            <SelectItem value="corporate">Rigid Business Corporate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Primary Color Picker */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold text-neutral-700">Primary Color Accent</Label>
          <span className="text-xs font-mono text-neutral-400 uppercase">{styling.primaryColor}</span>
        </div>
        
        {/* Presets Grid */}
        <div className="grid grid-cols-7 gap-2">
          {colorPresets.map((preset) => {
            const isSelected = styling.primaryColor.toLowerCase() === preset.value.toLowerCase();
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleColorChange(preset.value)}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
                className="w-8 h-8 rounded-full border border-neutral-200/20 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Hex Input */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-neutral-500">Custom Accent HEX</Label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-neutral-400 font-mono text-sm">#</span>
            <Input
              type="text"
              placeholder="6366f1"
              maxLength={6}
              value={styling.primaryColor.replace('#', '')}
              onChange={(e) => {
                const hex = e.target.value;
                if (/^[0-9A-Fa-f]{0,6}$/.test(hex)) {
                  handleColorChange(hex ? `#${hex}` : '#6366f1');
                }
              }}
              className="pl-7 rounded-xl border-neutral-200 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
