'use client';

import React, { useState } from 'react';
import {
  Search,
  LayoutDashboard,
  Radio,
  FileText,
  Filter,
  Sliders,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { SnapFormIcon } from './Logo';

interface MetricItem {
  id: string;
  label: string;
  shortLabel: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const METRICS: MetricItem[] = [
  { id: 'submissions', label: 'Submissions', shortLabel: 'Submissions', value: '16,538', change: '+100%', isPositive: true },
  { id: 'visits', label: 'Form Views', shortLabel: 'Views', value: '21,546', change: '+100%', isPositive: true },
  { id: 'conversion', label: 'Conversion', shortLabel: 'Conv. Rate', value: '76.7%', change: '+12.4%', isPositive: true },
  { id: 'bounce', label: 'Drop-off', shortLabel: 'Drop-off', value: '23.3%', change: '-60.8%', isPositive: true },
  { id: 'completion', label: 'Completion', shortLabel: 'Avg Time', value: '34s', change: '+100%', isPositive: true },
  { id: 'payloads', label: 'Delivered', shortLabel: 'Delivered', value: '16,520', change: '99.9%', isPositive: true },
];

const TOP_FORMS = [
  { name: '/forms/enterprise-inquiry', views: '8,420', conv: '78.2%', count: '6,584' },
  { name: '/forms/beta-waitlist', views: '5,910', conv: '84.1%', count: '4,970' },
  { name: '/forms/product-feedback', views: '4,110', conv: '68.5%', count: '2,815' },
];

const TOP_SOURCES = [
  { source: 'nextjs.org / showcase', visitors: '7,430', pct: '45%' },
  { source: 'github.com / repositories', visitors: '4,210', pct: '25%' },
  { source: 'twitter.com / x', visitors: '2,890', pct: '18%' },
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'realtime', label: 'Realtime', icon: Radio },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'funnels', label: 'Funnels', icon: Filter },
  { id: 'performance', label: 'Performance', icon: Sliders },
];

export default function HeroDashboardPreview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('submissions');
  const [chartMode, setChartMode] = useState<'trend' | 'peak'>('trend');

  return (
    <div className="w-full p-2 sm:p-4 md:p-7 bg-[#F5F4F0] rounded-[18px] sm:rounded-[24px] md:rounded-[30px] border border-neutral-300/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
      <div
        style={{
          fontFamily:
            'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
        className="w-full bg-white border border-neutral-200/90 rounded-[14px] sm:rounded-[18px] md:rounded-[20px] shadow-[0_12px_35px_-8px_rgba(0,0,0,0.12)] overflow-hidden text-neutral-900 flex flex-row text-left select-none"
      >
        {/* ─── Left Sidebar (Icon Rail on Mobile, Full on Desktop) ─── */}
        <aside className="w-11 sm:w-12 md:w-[170px] bg-[#F7F7F6] border-r border-neutral-200/80 p-1.5 sm:p-2 md:p-3 flex flex-col justify-between shrink-0 space-y-2.5">
          <div className="space-y-2.5">
            {/* Workspace / Brand Header */}
            <div className="flex items-center justify-center md:justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 md:w-5 md:h-5 rounded-md bg-neutral-900 flex items-center justify-center text-white shadow-xs shrink-0">
                  <SnapFormIcon className="w-2.5 h-3.5 text-white" fill="#ffffff" />
                </div>
                <span className="hidden md:inline font-bold text-[13px] tracking-tight text-neutral-900 font-heading">
                  SnapForm
                </span>
              </div>
              <span className="hidden md:inline text-[9px] text-neutral-400 font-mono">⌘</span>
            </div>

            {/* Search Box / Search Icon */}
            <div className="relative flex justify-center">
              {/* Mobile Search Icon Button */}
              <div className="md:hidden w-7 h-7 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 shadow-2xs">
                <Search className="w-3.5 h-3.5" />
              </div>

              {/* Desktop Full Search Input */}
              <div className="hidden md:block w-full relative">
                <Search className="w-3 h-3 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  readOnly
                  placeholder="Find..."
                  className="w-full bg-white border border-neutral-200 rounded-md pl-6 pr-5 py-1 text-[11px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none cursor-default"
                />
                <span className="text-[9px] font-mono text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 border border-neutral-200 rounded px-1 bg-neutral-50">
                  F
                </span>
              </div>
            </div>

            {/* Nav Group: Analytics */}
            <div className="space-y-0.5">
              <span className="hidden md:block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider px-1.5 pb-0.5">
                Analytics
              </span>

              <nav className="space-y-1 md:space-y-0.5 flex flex-col items-center md:items-stretch">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      title={label}
                      className={`w-7 h-7 md:w-full md:h-auto flex items-center justify-center md:justify-start gap-2 md:px-2 md:py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EAEAE8] text-neutral-900 font-semibold shadow-2xs md:shadow-none'
                          : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-orange' : 'text-neutral-400'}`} />
                      <span className="hidden md:inline truncate">{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* ─── Main Content Area (100% Fluid Width, Fits All Screens) ─── */}
        <main className="flex-1 min-w-0 p-2.5 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3.5 bg-white overflow-hidden">
          
          {/* Top Breadcrumb & Filter Bar */}
          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-neutral-100">
            <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-neutral-500 font-mono truncate">
              <span className="hidden xs:inline">SnapForm</span>
              <span className="hidden xs:inline">&gt;</span>
              <span className="text-neutral-900 font-semibold truncate">studio.snapform.live</span>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] shrink-0">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-md bg-[#F3F3F2] border border-neutral-200 text-neutral-700 font-medium">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400 shrink-0" />
                <span className="hidden xs:inline">Last</span> 30 days
                <ChevronDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-neutral-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* ─── Metric Bar (3 Cols on Mobile, 6 Cols on Desktop - Fits 100%) ─── */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 border-b border-neutral-100 pb-2 sm:pb-3">
            {METRICS.map((m) => {
              const isSelected = selectedMetric === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMetric(m.id)}
                  className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer text-left min-w-0 ${
                    isSelected
                      ? 'bg-[#F5F5F4] border border-neutral-200 shadow-2xs'
                      : 'hover:bg-neutral-50/80 border border-transparent bg-neutral-50/50 sm:bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-0.5 text-[9px] sm:text-[10px] text-neutral-500">
                    <span className="truncate">{m.shortLabel}</span>
                    <span
                      className={`font-mono text-[8px] sm:text-[9px] font-semibold px-0.5 rounded shrink-0 ${
                        m.isPositive
                          ? 'text-emerald-700 bg-emerald-500/10'
                          : 'text-neutral-500 bg-neutral-200/60'
                      }`}
                    >
                      {m.change}
                    </span>
                  </div>
                  {/* Monospace Metric Values */}
                  <div className="text-[11px] sm:text-[13px] md:text-[14px] font-bold text-neutral-900 font-mono mt-0.5 tracking-tight truncate">
                    {m.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Compact Chart Section ─── */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <h3 className="text-[11px] sm:text-[12px] font-bold text-neutral-900 font-heading tracking-tight truncate">
                  Submissions over time
                </h3>
                <p className="text-[9px] text-neutral-400 font-mono">Last 30 days</p>
              </div>

              <div className="flex items-center gap-0.5 bg-[#F3F3F2] p-0.5 rounded-md border border-neutral-200 text-[9px] sm:text-[10px] shrink-0">
                <button
                  type="button"
                  onClick={() => setChartMode('trend')}
                  className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold transition-all cursor-pointer ${
                    chartMode === 'trend'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Trend
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('peak')}
                  className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold transition-all cursor-pointer ${
                    chartMode === 'peak'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Peak
                </button>
              </div>
            </div>

            {/* SVG Smooth Curve Area Chart */}
            <div className="relative w-full h-20 sm:h-28 pt-1">
              {/* Y-axis */}
              <div className="absolute right-0 top-0 bottom-3 flex flex-col justify-between text-[8px] sm:text-[9px] font-mono text-neutral-400 pointer-events-none select-none">
                <span>2k</span>
                <span>1k</span>
                <span>0</span>
              </div>

              {/* Grid lines */}
              <div className="absolute inset-x-0 top-1/2 border-b border-neutral-100" />
              <div className="absolute inset-x-0 bottom-3 border-b border-neutral-200/80" />

              <svg
                viewBox="0 0 800 140"
                preserveAspectRatio="none"
                className="w-full h-[calc(100%-12px)] overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradientWhite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4f19" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#ff4f19" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="secondaryGradientWhite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Dotted Baseline */}
                <path
                  d="M 0,130 L 360,130 Q 400,130 430,90 T 500,55 T 580,48 T 660,70 T 740,45 L 780,130"
                  fill="url(#secondaryGradientWhite)"
                  stroke="#65a30d"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />

                {/* Primary Filled Area */}
                <path
                  d="M 0,130 L 370,130 C 410,130 420,75 450,60 C 480,45 510,70 540,55 C 570,42 600,55 630,52 C 660,48 700,60 730,45 C 760,32 780,75 800,130 Z"
                  fill="url(#chartGradientWhite)"
                />

                {/* Primary Smooth Curve Line */}
                <path
                  d="M 0,130 L 370,130 C 410,130 420,75 450,60 C 480,45 510,70 540,55 C 570,42 600,55 630,52 C 660,48 700,60 730,45 C 760,32 780,75 800,130"
                  fill="none"
                  stroke="#ff4f19"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Data Point Pin */}
                <circle cx="730" cy="45" r="3.5" fill="#ff4f19" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* X-axis Dates */}
              <div className="h-3 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-neutral-400 pt-0.5 pr-4">
                <span>Aug 3</span>
                <span className="hidden sm:inline">Aug 7</span>
                <span>Aug 11</span>
                <span className="hidden sm:inline">Aug 15</span>
                <span>Aug 19</span>
                <span className="font-semibold text-neutral-800">Aug 23</span>
                <span className="hidden sm:inline">Aug 27</span>
                <span className="hidden sm:inline">Aug 31</span>
                <span>Sep 2</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-between pt-0.5 text-[8px] sm:text-[9px] font-mono text-neutral-500">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                  <span>Submissions</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                  <span>Total Views</span>
                </span>
              </div>
              <span className="hidden xs:inline text-[8px] sm:text-[9px] text-neutral-400">Single 16,511 • Multi 159</span>
            </div>
          </div>

          {/* ─── Bottom Compact Summaries (Side-by-Side) ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
            {/* Card 1: Top Forms */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#F9F9F8] border border-neutral-200/80 space-y-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-neutral-900 font-heading">
                  Top Forms
                </h4>
                <span className="text-[8px] sm:text-[9px] text-neutral-400 font-mono">16.5k</span>
              </div>
              <div className="space-y-1">
                {TOP_FORMS.slice(0, 2).map((form, i) => (
                  <div
                    key={form.name}
                    className="flex items-center justify-between text-[9px] p-1 sm:p-1.5 rounded-md bg-white border border-neutral-200/60 font-mono shadow-2xs min-w-0"
                  >
                    <div className="flex items-center gap-1 min-w-0 pr-1">
                      <span className="text-neutral-400 text-[8px] w-2 shrink-0">{i + 1}</span>
                      <span className="text-neutral-800 truncate">{form.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[8px] sm:text-[9px]">
                      <span className="text-emerald-700 font-semibold">{form.conv}</span>
                      <span className="font-bold text-neutral-900">{form.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Traffic Sources */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#F9F9F8] border border-neutral-200/80 space-y-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-neutral-900 font-heading">
                  Traffic Sources
                </h4>
                <span className="text-[8px] sm:text-[9px] text-neutral-400 font-mono">22 refs</span>
              </div>
              <div className="space-y-1">
                {TOP_SOURCES.slice(0, 2).map((src) => (
                  <div
                    key={src.source}
                    className="flex items-center justify-between text-[9px] p-1 sm:p-1.5 rounded-md bg-white border border-neutral-200/60 font-mono shadow-2xs min-w-0"
                  >
                    <span className="text-neutral-800 truncate min-w-0 pr-1">{src.source}</span>
                    <div className="flex items-center gap-1.5 shrink-0 text-[8px] sm:text-[9px]">
                      <span className="text-neutral-400">{src.visitors}</span>
                      <span className="font-bold text-brand-orange">{src.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
