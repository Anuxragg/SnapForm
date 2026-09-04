'use client';

import React, { useState } from 'react';
import {
  Search,
  LayoutDashboard,
  Radio,
  FileText,
  Filter,
  Layers,
  Settings,
  Calendar,
  ChevronDown,
  Globe,
  Sliders,
} from 'lucide-react';
import { SnapFormIcon } from './Logo';

interface MetricItem {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const METRICS: MetricItem[] = [
  { id: 'submissions', label: 'Submissions', value: '16,538', change: '+100%', isPositive: true },
  { id: 'visits', label: 'Form Views', value: '21,546', change: '+100%', isPositive: true },
  { id: 'conversion', label: 'Conversion', value: '76.7%', change: '+12.4%', isPositive: true },
  { id: 'bounce', label: 'Drop-off', value: '23.3%', change: '-60.8%', isPositive: true },
  { id: 'completion', label: 'Completion', value: '34s', change: '+100%', isPositive: true },
  { id: 'payloads', label: 'Delivered', value: '16,520', change: '99.9%', isPositive: true },
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

export default function HeroDashboardPreview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('submissions');
  const [chartMode, setChartMode] = useState<'trend' | 'peak'>('trend');

  return (
    <div className="w-full p-3.5 sm:p-6 md:p-8 bg-[#F5F4F0] rounded-[24px] sm:rounded-[30px] border border-neutral-300/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
      <div
        style={{
          fontFamily:
            'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
        className="w-full bg-white border border-neutral-200/90 rounded-[16px] sm:rounded-[20px] shadow-[0_12px_35px_-8px_rgba(0,0,0,0.12)] overflow-hidden text-neutral-900 flex flex-col md:flex-row text-left select-none"
      >
      {/* ─── Left Sidebar Navigation (Clean Light) ─── */}
      <aside className="w-full md:w-[180px] bg-[#F7F7F6] border-b md:border-b-0 md:border-r border-neutral-200/80 p-3 flex flex-col justify-between shrink-0 space-y-3">
        <div className="space-y-3">
          {/* Workspace / Brand Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-neutral-900 flex items-center justify-center text-white shadow-xs">
                <SnapFormIcon className="w-2.5 h-3.5 text-white" fill="#ffffff" />
              </div>
              <span className="font-bold text-[13px] tracking-tight text-neutral-900 font-heading">
                SnapForm
              </span>
            </div>
            <span className="text-[9px] text-neutral-400 font-mono">⌘</span>
          </div>

          {/* Search Box */}
          <div className="relative">
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

          {/* Nav Group: Analytics */}
          <div className="space-y-0.5">
            <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider px-1.5 block">
              Analytics
            </span>

            <nav className="space-y-0.5">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'realtime', label: 'Realtime', icon: Radio },
                { id: 'submissions', label: 'Submissions', icon: FileText },
                { id: 'funnels', label: 'Funnels', icon: Filter },
                { id: 'performance', label: 'Performance', icon: Sliders },
              ].map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-medium transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#EAEAE8] text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? 'text-brand-orange' : 'text-neutral-400'}`} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="pt-2 border-t border-neutral-200/80 flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Sync</span>
        </div>
      </aside>

      {/* ─── Main Content Canvas Area (Clean White) ─── */}
      <main className="flex-1 p-3.5 sm:p-5 space-y-3.5 overflow-x-hidden bg-white">
        
        {/* Top Breadcrumb & Filter Bar */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-neutral-100">
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
            <span>SnapForm</span>
            <span>&gt;</span>
            <span className="text-neutral-900 font-semibold">studio.snapform.live</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3F3F2] border border-neutral-200 text-neutral-700 font-medium">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span>Last 30 days</span>
              <ChevronDown className="w-2.5 h-2.5 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* ─── Horizontal Metric Bar (Clean Light Surface) ─── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 border-b border-neutral-100 pb-3">
          {METRICS.map((m) => {
            const isSelected = selectedMetric === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#F5F5F4] border border-neutral-200 shadow-2xs'
                    : 'hover:bg-neutral-50/80 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-0.5 text-[10px] text-neutral-500">
                  <span className="truncate">{m.label}</span>
                  <span
                    className={`font-mono text-[9px] font-semibold px-0.5 rounded ${
                      m.isPositive
                        ? 'text-emerald-700 bg-emerald-500/10'
                        : 'text-neutral-500'
                    }`}
                  >
                    {m.change}
                  </span>
                </div>
                {/* Small, Refined Numbers */}
                <div className="text-[13px] sm:text-[14px] font-semibold text-neutral-900 font-mono mt-0.5 tracking-tight">
                  {m.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Compact Chart Section ─── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[12px] font-bold text-neutral-900 font-heading tracking-tight">
                Submissions over time
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">Last 30 days</p>
            </div>

            <div className="flex items-center gap-0.5 bg-[#F3F3F2] p-0.5 rounded-md border border-neutral-200 text-[10px]">
              <button
                type="button"
                onClick={() => setChartMode('trend')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
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
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                  chartMode === 'peak'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Conversion peak
              </button>
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart on White Canvas */}
          <div className="relative w-full h-28 sm:h-32 pt-1">
            {/* Y-axis */}
            <div className="absolute right-0 top-0 bottom-4 flex flex-col justify-between text-[9px] font-mono text-neutral-400 pointer-events-none select-none">
              <span>2k</span>
              <span>1k</span>
              <span>0</span>
            </div>

            {/* Grid lines */}
            <div className="absolute inset-x-0 top-1/2 border-b border-neutral-100" />
            <div className="absolute inset-x-0 bottom-4 border-b border-neutral-200/80" />

            <svg
              viewBox="0 0 800 140"
              preserveAspectRatio="none"
              className="w-full h-[calc(100%-16px)] overflow-visible"
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
            <div className="h-4 flex items-center justify-between text-[9px] font-mono text-neutral-400 pt-0.5 pr-5">
              <span>Aug 3</span>
              <span>Aug 7</span>
              <span>Aug 11</span>
              <span>Aug 15</span>
              <span>Aug 19</span>
              <span className="font-semibold text-neutral-800">Aug 23</span>
              <span>Aug 27</span>
              <span>Aug 31</span>
              <span>Sep 2</span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                <span>Submissions</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                <span>Total Views</span>
              </span>
            </div>
            <span className="text-[9px] text-neutral-400">Single 16,511 • Multi 159</span>
          </div>
        </div>

        {/* ─── Bottom Compact Summaries (Light Cards) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {/* Card 1: Top Forms */}
          <div className="p-2.5 rounded-xl bg-[#F9F9F8] border border-neutral-200/80 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-neutral-900 font-heading">
                Top Forms
              </h4>
              <span className="text-[9px] text-neutral-400 font-mono">16.5k responses</span>
            </div>
            <div className="space-y-1">
              {TOP_FORMS.map((form, i) => (
                <div
                  key={form.name}
                  className="flex items-center justify-between text-[10px] p-1.5 rounded-md bg-white border border-neutral-200/60 font-mono shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-neutral-400 text-[9px] w-2.5">{i + 1}</span>
                    <span className="text-neutral-800 truncate">{form.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[9px]">
                    <span className="text-emerald-700 font-semibold">{form.conv}</span>
                    <span className="font-bold text-neutral-900">{form.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Traffic Sources */}
          <div className="p-2.5 rounded-xl bg-[#F9F9F8] border border-neutral-200/80 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-neutral-900 font-heading">
                Traffic Sources
              </h4>
              <span className="text-[9px] text-neutral-400 font-mono">22 referrers</span>
            </div>
            <div className="space-y-1">
              {TOP_SOURCES.map((src) => (
                <div
                  key={src.source}
                  className="flex items-center justify-between text-[10px] p-1.5 rounded-md bg-white border border-neutral-200/60 font-mono shadow-2xs"
                >
                  <span className="text-neutral-800 truncate">{src.source}</span>
                  <div className="flex items-center gap-2 shrink-0 text-[9px]">
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
