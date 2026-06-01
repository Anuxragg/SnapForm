'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Mail, CreditCard, BarChart3, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { ISeedFormTemplate } from '@/lib/templates';

interface TemplateSelectorProps {
  templates: ISeedFormTemplate[];
  onSelect: (template: ISeedFormTemplate) => void;
  isLoading?: boolean;
}

const categoryIcons = {
  contact: Mail,
  payment: CreditCard,
  survey: BarChart3,
  booking: Calendar,
};

const categoryGlow = {
  contact: 'hover:border-brand-orange/60 hover:shadow-brand-charcoal/5',
  payment: 'hover:border-brand-orange/60 hover:shadow-brand-charcoal/5',
  survey: 'hover:border-brand-orange/60 hover:shadow-brand-charcoal/5',
  booking: 'hover:border-brand-orange/60 hover:shadow-brand-charcoal/5',
};

const categoryBadge = {
  contact: 'bg-brand-charcoal text-white border-brand-charcoal',
  payment: 'bg-brand-orange text-white border-brand-orange',
  survey: 'bg-neutral-800 text-white border-neutral-800',
  booking: 'bg-neutral-600 text-white border-neutral-600',
};

const categoryIconBg = {
  contact: 'bg-brand-sand text-brand-charcoal border border-brand-border',
  payment: 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20',
  survey: 'bg-brand-sand text-brand-charcoal border border-brand-border',
  booking: 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20',
};

export default function TemplateSelector({ templates, onSelect, isLoading = false }: TemplateSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
      {templates.map((template) => {
        const isCustom = !!(template as any).userId;
        const Icon = isCustom ? Sparkles : (categoryIcons[template.category] || Mail);
        const glowClass = isCustom ? 'hover:border-amber-400/80 hover:shadow-amber-100/5' : (categoryGlow[template.category] || '');
        const badgeClass = isCustom ? 'bg-amber-500 text-white border-amber-500' : (categoryBadge[template.category] || '');
        const iconBg = isCustom ? 'bg-amber-50 text-amber-600 border border-amber-200' : (categoryIconBg[template.category] || '');

        return (
          <div
            key={`${template.name}-${template.category}-${(template as any)._id || ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(template)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(template)}
            className={`group relative overflow-hidden bg-white/80 backdrop-blur-md border border-neutral-200/60 shadow-xl shadow-neutral-100/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer rounded-xl ${glowClass}`}
          >
            {/* Visual background gradient accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-neutral-50/50 to-transparent pointer-events-none rounded-full" />

            {/* Header */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 ${iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Badge variant="outline" className={`font-semibold capitalize px-2.5 py-0.5 rounded-full pointer-events-none ${badgeClass}`}>
                  {isCustom ? 'Saved Form' : template.category}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-brand-orange transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-500 min-h-[40px]">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="px-6 pb-4">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                Included Fields
              </div>
              <div className="flex flex-wrap gap-1.5">
                {template.fields.map((field) => (
                  <span
                    key={field.id}
                    className="inline-flex items-center text-xs font-medium bg-neutral-50 border border-neutral-200/50 text-neutral-600 px-2 py-0.5 rounded-md pointer-events-none"
                  >
                    {field.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-100 bg-neutral-50/30 px-6 py-4 flex items-center justify-between pointer-events-none">
              <span className="text-sm font-semibold text-neutral-600 group-hover:text-neutral-900 transition-colors">
                Start with this template
              </span>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:bg-neutral-100/80 group-hover:translate-x-1 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-neutral-700" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
