'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  ArrowRight,
  Sparkles,
  Mail,
  CreditCard,
  BarChart3,
  Calendar,
  UserCheck,
  MessageSquareQuote,
  Briefcase,
  Layers,
  FileText,
  Zap,
  ChevronDown,
  Check,
  Filter,
} from 'lucide-react';
import { ISeedFormTemplate, PREDEFINED_TEMPLATES } from '@/lib/templates';

interface TemplateSelectorProps {
  templates?: ISeedFormTemplate[];
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

const FILTER_TABS = [
  { id: 'all', label: 'All Categories', icon: Layers },
  { id: 'contact', label: 'Contact & Leads', icon: Mail },
  { id: 'payment', label: 'Payments & Checkout', icon: CreditCard },
  { id: 'survey', label: 'Surveys & Feedback', icon: BarChart3 },
  { id: 'registration', label: 'Event Registrations', icon: UserCheck },
  { id: 'application', label: 'Job Applications', icon: Briefcase },
  { id: 'feedback', label: 'Product Feedback', icon: MessageSquareQuote },
  { id: 'booking', label: 'Bookings & Appointments', icon: Calendar },
  { id: 'saved', label: 'Saved Templates', icon: Sparkles },
];

const BLANK_TEMPLATE: ISeedFormTemplate = {
  id: 'blank-canvas',
  name: 'Blank Custom Form',
  category: 'custom',
  description: 'Start with a clean canvas. Add custom fields, validation rules, and themes.',
  fields: [
    {
      id: 'fullName',
      type: 'text',
      label: 'Full Name',
      placeholder: 'e.g. Jane Doe',
      required: true,
      validation: { minLength: 2, maxLength: 60 },
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'jane@company.com',
      required: true,
    },
    {
      id: 'message',
      type: 'textarea',
      label: 'Your Message',
      placeholder: 'Write your notes or message here...',
      required: false,
    },
  ],
  styling: {
    theme: 'modern',
    primaryColor: '#ff4f19',
  },
};

export default function TemplateSelector({
  templates = PREDEFINED_TEMPLATES,
  onSelect,
  isLoading = false,
}: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableTemplates = templates && templates.length > 0 ? templates : PREDEFINED_TEMPLATES;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: availableTemplates.length };
    availableTemplates.forEach((t) => {
      const isCustom = !!(t as any).userId;
      if (isCustom) {
        counts.saved = (counts.saved || 0) + 1;
      }
      if (t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    return counts;
  }, [availableTemplates]);

  const activeTabObj = FILTER_TABS.find((t) => t.id === activeCategory) || FILTER_TABS[0];
  const ActiveIcon = activeTabObj.icon;

  const filteredTemplates = useMemo(() => {
    return availableTemplates.filter((template) => {
      const isCustom = !!(template as any).userId;

      // Category filter
      if (activeCategory === 'saved') {
        if (!isCustom) return false;
      } else if (activeCategory !== 'all') {
        if (template.category !== activeCategory) return false;
      }

      return true;
    });
  }, [availableTemplates, activeCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 text-left">
      {/* ─── 1. Primary Hero: Start from Scratch ──────────────────────── */}
      <div className="max-w-xl mx-auto">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(BLANK_TEMPLATE)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(BLANK_TEMPLATE)}
          className="group relative rounded-2xl border-2 border-dashed border-neutral-300/90 dark:border-[#333333] hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-[#1C1C1C] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-shadow duration-200 hover:shadow-xl hover:shadow-neutral-300/40 dark:hover:shadow-black/60 select-none"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#282828] text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-[#333333]">
                Blank Slate
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                Start from Scratch
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Build a custom form from an empty canvas. Add form fields, validation schemas, endpoints, and themes manually.
              </p>
            </div>

            {/* Wireframe Graphic */}
            <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-[#151515] border border-neutral-200/70 dark:border-[#2a2a2a] space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="h-4 w-24 bg-neutral-200 dark:bg-[#2a2a2a] rounded" />
              <div className="h-6 w-full bg-white dark:bg-[#1E1E1E] rounded border border-neutral-200/60 dark:border-[#2e2e2e]" />
              <div className="h-5 w-16 bg-neutral-900 dark:bg-white rounded ml-auto" />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200/70 dark:border-[#2a2a2a] mt-5 flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
            <span>Create Blank Form</span>
            <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-[#282828] group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 flex items-center justify-center transition-all group-hover:translate-x-1">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Section Divider ───────────────────────────────────────── */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-[#2a2a2a]" />
        </div>
        <div className="relative bg-neutral-50/40 dark:bg-[#121212] px-4 text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
          Or pick a pre-made template
        </div>
      </div>

      {/* ─── 3. Pre-made Templates Category Dropdown Filter ─── */}
      <div className="flex items-center justify-start">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="h-9 px-3.5 rounded-xl bg-white dark:bg-[#1C1C1C] border border-neutral-200/90 dark:border-[#2a2a2a] hover:border-neutral-400 dark:hover:border-neutral-500 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <ActiveIcon className="w-3.5 h-3.5 text-neutral-500" />
              <span>{activeTabObj.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-neutral-100 dark:bg-[#282828] text-neutral-600 dark:text-neutral-400">
                {countsByCategory[activeCategory] || 0}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-[#1C1C1C] border border-neutral-200 dark:border-[#2e2e2e] rounded-xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Filter by category
              </div>
              {FILTER_TABS.map((tab) => {
                const isSelected = activeCategory === tab.id;
                const Icon = tab.icon;
                const count = countsByCategory[tab.id] || 0;

                if (tab.id === 'saved' && count === 0) return null;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(tab.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#252525]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-white/20 dark:bg-black/15 text-white dark:text-neutral-900'
                            : 'bg-neutral-100 dark:bg-[#282828] text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {count}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. Pre-made Templates Grid ───────────────────────────────── */}
      {filteredTemplates.length === 0 ? (
        <div className="w-full py-12 px-6 bg-white dark:bg-[#1C1C1C] border border-neutral-200 dark:border-[#2a2a2a] rounded-2xl text-center shadow-sm space-y-3 max-w-md mx-auto">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#242424] border border-neutral-200 dark:border-[#2e2e2e] flex items-center justify-center text-neutral-400 mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">No templates found</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No templates available for this category.
          </p>
          <button
            onClick={() => setActiveCategory('all')}
            className="text-xs font-semibold text-neutral-900 dark:text-white underline hover:opacity-80 cursor-pointer"
          >
            Show all templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const isCustom = !!(template as any).userId;
            const Icon = isCustom ? Sparkles : (categoryIcons[template.category] || Mail);

            return (
              <div
                key={`${template.id || template.name}-${template.category}-${(template as any)._id || ''}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(template)}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(template)}
                className="group relative rounded-2xl bg-white dark:bg-[#1C1C1C] border border-neutral-200/80 dark:border-[#282828] p-5 flex flex-col justify-between cursor-pointer transition-shadow duration-200 hover:shadow-xl hover:shadow-neutral-300/40 dark:hover:shadow-black/60"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Icon + Category Badge + Field Count */}
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-[#252525] border border-neutral-200/60 dark:border-[#333333] text-neutral-800 dark:text-neutral-200 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#252525] text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-[#333333]">
                        {isCustom ? 'Saved' : template.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        {template.fields.length} fields
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-heading group-hover:text-neutral-900 dark:group-hover:text-white">
                      {template.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-3.5 border-t border-neutral-100 dark:border-[#27272a] mt-4 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-orange" />
                    Open in Studio
                  </span>
                  <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-[#282828] group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 flex items-center justify-center transition-all group-hover:translate-x-1">
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
