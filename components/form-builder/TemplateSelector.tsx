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
  contact: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
  payment: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
  survey: 'hover:border-slate-800/50 hover:shadow-slate-800/10',
  booking: 'hover:border-pink-500/50 hover:shadow-pink-500/10',
};

const categoryBadge = {
  contact: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
  payment: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
  survey: 'bg-slate-100 text-slate-800 border-slate-200',
  booking: 'bg-pink-50 text-pink-700 border-pink-200/50',
};

const categoryIconBg = {
  contact: 'bg-indigo-50 text-indigo-600',
  payment: 'bg-emerald-50 text-emerald-600',
  survey: 'bg-slate-100 text-slate-700',
  booking: 'bg-pink-50 text-pink-600',
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
                <CardTitle className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-primary transition-colors">
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
