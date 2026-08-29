'use client';

import React, { useState, useMemo } from 'react';
import {
  Mail,
  CreditCard,
  BarChart3,
  Calendar,
  ArrowRight,
  Sparkles,
  UserCheck,
  MessageSquareQuote,
  Briefcase,
  Search,
  FileText,
} from 'lucide-react';
import { ISeedFormTemplate } from '@/lib/templates';

interface TemplateSelectorProps {
  templates: ISeedFormTemplate[];
  onSelect: (template: ISeedFormTemplate) => void;
  isLoading?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  contact: Mail,
  payment: CreditCard,
  survey: BarChart3,
  booking: Calendar,
  registration: UserCheck,
  feedback: MessageSquareQuote,
  application: Briefcase,
};

const categoryBadge: Record<string, string> = {
  contact: 'bg-orange-500/10 text-orange-600',
  payment: 'bg-emerald-500/10 text-emerald-600',
  survey: 'bg-amber-500/10 text-amber-600',
  booking: 'bg-pink-500/10 text-pink-600',
  registration: 'bg-blue-500/10 text-blue-600',
  feedback: 'bg-purple-500/10 text-purple-600',
  application: 'bg-indigo-500/10 text-indigo-600',
};

const categoryIconBg: Record<string, string> = {
  contact: 'bg-orange-50 text-orange-600',
  payment: 'bg-emerald-50 text-emerald-600',
  survey: 'bg-amber-50 text-amber-600',
  booking: 'bg-pink-50 text-pink-600',
  registration: 'bg-blue-50 text-blue-600',
  feedback: 'bg-purple-50 text-purple-600',
  application: 'bg-indigo-50 text-indigo-600',
};

const FILTER_TABS = [
  { id: 'all', label: 'All Templates' },
  { id: 'contact', label: 'Contact & Leads' },
  { id: 'payment', label: 'Payments' },
  { id: 'survey', label: 'Surveys' },
  { id: 'registration', label: 'Registrations' },
  { id: 'application', label: 'Job Applications' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'booking', label: 'Bookings' },
  { id: 'saved', label: '⭐ Saved Forms' },
];

export default function TemplateSelector({ templates, onSelect, isLoading = false }: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const isCustom = !!(template as any).userId;

      // Category filter
      if (activeCategory === 'saved') {
        if (!isCustom) return false;
      } else if (activeCategory !== 'all') {
        if (template.category !== activeCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(query);
        const matchesDesc = template.description?.toLowerCase().includes(query);
        const matchesCategory = template.category?.toLowerCase().includes(query);
        const matchesFields = template.fields?.some(
          (f) => f.label?.toLowerCase().includes(query) || f.placeholder?.toLowerCase().includes(query)
        );
        return matchesName || matchesDesc || matchesCategory || matchesFields;
      }

      return true;
    });
  }, [templates, activeCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-white border border-brand-border animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="space-y-5 max-w-3xl mx-auto text-center">
        {/* Search Input */}
        <div className="relative w-full max-w-xl mx-auto">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates by keyword or field..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-24 py-3 rounded-full bg-white border border-brand-border text-sm text-brand-charcoal placeholder:text-neutral-400 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-brand-charcoal cursor-pointer"
            >
              Clear
            </button>
          ) : (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-neutral-400">
              {filteredTemplates.length} forms
            </span>
          )}
        </div>          {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-charcoal text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-brand-orange'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean Grid of Cards */}
      {filteredTemplates.length === 0 ? (
        <div className="w-full py-16 px-6 bg-white border border-neutral-200 rounded-2xl text-center shadow-sm space-y-3 max-w-md mx-auto">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-base font-heading font-semibold text-brand-charcoal">No templates found</h4>
          <p className="text-xs text-neutral-500 font-normal">
            No templates matched your search. Try resetting filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start text-left">
          {filteredTemplates.map((template) => {
            const isCustom = !!(template as any).userId;
            const Icon = isCustom ? Sparkles : (categoryIcons[template.category] || Mail);
            const badgeStyle = isCustom ? 'bg-amber-500/10 text-amber-600' : (categoryBadge[template.category] || 'bg-neutral-100 text-neutral-600');
            const iconBgStyle = isCustom ? 'bg-amber-50 text-amber-600' : (categoryIconBg[template.category] || 'bg-neutral-100 text-brand-charcoal');

            return (
              <div
                key={`${template.id || template.name}-${template.category}-${(template as any)._id || ''}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(template)}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(template)}
                className="relative z-10 hover:z-20 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-brand-orange/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group text-left w-full"
              >
                <div className="space-y-4">
                  {/* Top Row: Icon and Tag */}
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgStyle}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle}`}>
                      {isCustom ? 'Saved Form' : template.category}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-1">
                    <h3 className="text-base font-heading font-semibold text-brand-charcoal group-hover:text-brand-orange transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed min-h-[32px] font-normal">
                      {template.description}
                    </p>
                  </div>

                  {/* Included Fields: Only revealed smoothly ON HOVER */}
                  <div className="opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-48 group-hover:pt-3 group-hover:border-t group-hover:border-neutral-100 transition-all duration-300 overflow-hidden space-y-2">
                    <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                      Included Fields ({template.fields.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.fields.map((field) => (
                        <span
                          key={field.id}
                          className="inline-flex items-center text-[11px] font-medium bg-neutral-100 border border-neutral-200 text-brand-charcoal px-2.5 py-1 rounded-lg shadow-2xs animate-in fade-in slide-in-from-bottom-1 duration-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mr-1.5 shrink-0" />
                          {field.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-4 border-t border-neutral-100 mt-5 flex items-center justify-between text-xs font-medium text-neutral-500 group-hover:text-brand-orange transition-colors">
                  <span>Start with this template</span>
                  <div className="w-6 h-6 rounded-full bg-neutral-100 group-hover:bg-brand-orange group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
