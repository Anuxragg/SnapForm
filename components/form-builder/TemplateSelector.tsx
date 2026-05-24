'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, CreditCard, BarChart3, Calendar, ArrowRight } from 'lucide-react';
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
        const Icon = categoryIcons[template.category] || Mail;
        const glowClass = categoryGlow[template.category] || '';
        const badgeClass = categoryBadge[template.category] || '';
        const iconBg = categoryIconBg[template.category] || '';

        return (
          <Card
            key={template.name}
            className={`group relative overflow-hidden bg-white/80 backdrop-blur-md border border-neutral-200/60 shadow-xl shadow-neutral-100/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${glowClass}`}
            onClick={() => onSelect(template)}
          >
            {/* Visual background gradient accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-neutral-50/50 to-transparent pointer-events-none rounded-full" />

            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 ${iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Badge variant="outline" className={`font-semibold capitalize px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                  {template.category}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-brand-orange transition-colors">
                  {template.name}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-neutral-500 min-h-[40px]">
                  {template.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                Included Fields
              </div>
              <div className="flex flex-wrap gap-1.5">
                {template.fields.map((field) => (
                  <span
                    key={field.id}
                    className="inline-flex items-center text-xs font-medium bg-neutral-50 border border-neutral-200/50 text-neutral-600 px-2 py-0.5 rounded-md"
                  >
                    {field.label}
                  </span>
                ))}
              </div>
            </CardContent>

            <CardFooter className="border-t border-neutral-50/80 bg-neutral-50/30 pt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-600 group-hover:text-neutral-900 transition-colors">
                Start with this template
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl group-hover:bg-neutral-100/80 group-hover:translate-x-1 transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4 text-neutral-700" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
