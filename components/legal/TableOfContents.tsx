'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlignLeft } from 'lucide-react';

export interface TOCItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '');
  const [indicatorTop, setIndicatorTop] = useState<number>(6);
  const [indicatorVisible, setIndicatorVisible] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const lastScrollY = useRef<number>(0);

  // Scrollspy detection & scroll direction tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Track directional velocity for dynamic trailing tail
      if (Math.abs(currentScrollY - lastScrollY.current) > 2) {
        if (currentScrollY > lastScrollY.current) {
          setScrollDirection('down');
        } else if (currentScrollY < lastScrollY.current) {
          setScrollDirection('up');
        }
        lastScrollY.current = currentScrollY;
      }

      const scrollPosition = currentScrollY + 160;

      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(items[i].id);
            return;
          }
        }
      }

      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // Update gliding diamond position whenever activeId changes or on window resize
  useEffect(() => {
    const updateIndicator = () => {
      const activeElement = itemRefs.current.get(activeId);
      const container = containerRef.current;

      if (activeElement && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        // Calculate vertical center relative to the container
        const relativeTop = activeRect.top - containerRect.top + (activeRect.height / 2) - 4;
        setIndicatorTop(Math.round(relativeTop));
        setIndicatorVisible(true);
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);

    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeId, items]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const currentScrollY = window.scrollY;
      const targetY = element.getBoundingClientRect().top + window.pageYOffset - 110;
      
      setScrollDirection(targetY > currentScrollY ? 'down' : 'up');
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav aria-label="Table of contents" className="select-none text-left">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 font-mono uppercase tracking-wider mb-4">
        <AlignLeft className="w-3.5 h-3.5" />
        <span>On This Page</span>
      </div>

      {/* Navigation List with Vertical Rail & Directional Comet Tail Indicator */}
      <div
        ref={containerRef}
        className="relative pl-3.5 border-l border-white/10 space-y-2 text-[13px]"
      >
        {/* Butter-Smooth Gliding Active Indicator with Directional Trailing Tail */}
        <div
          className="absolute -left-[4.5px] top-0 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex flex-col items-center"
          style={{
            transform: `translateY(${indicatorTop}px)`,
            opacity: indicatorVisible ? 1 : 0,
          }}
          aria-hidden="true"
        >
          {/* Upper Tail (Trails above when scrolling down) */}
          <span
            className={`w-[1px] h-14 bg-gradient-to-t from-white/70 via-white/20 to-transparent absolute bottom-1.5 transition-opacity duration-300 ${
              scrollDirection === 'down' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Glowing Diamond Center Marker */}
          <span className="w-2 h-2 rotate-45 bg-white shadow-[0_0_8px_rgba(255,255,255,0.85)] relative z-20" />

          {/* Lower Tail (Trails below when scrolling up) */}
          <span
            className={`w-[1px] h-14 bg-gradient-to-b from-white/70 via-white/20 to-transparent absolute top-1.5 transition-opacity duration-300 ${
              scrollDirection === 'up' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <div key={item.id} className="relative group">
              <a
                href={`#${item.id}`}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                  else itemRefs.current.delete(item.id);
                }}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`block transition-colors duration-200 py-1 leading-snug ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
              </a>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
