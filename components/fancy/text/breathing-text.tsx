'use client';

import React, { useState, useEffect } from 'react';

interface BreathingTextProps {
  children?: React.ReactNode;
  label?: string;
  staggerDuration?: number;
  duration?: number;
  className?: string;
  animateOnMount?: boolean;
}

export default function BreathingText({
  children,
  label,
  staggerDuration = 0.06,
  duration = 0.75,
  className = '',
  animateOnMount = true,
}: BreathingTextProps) {
  const textContent = (typeof children === 'string' ? children : label) || '';
  const letters = Array.from(textContent);

  const [hoverKey, setHoverKey] = useState<number | null>(null);

  useEffect(() => {
    if (animateOnMount) {
      // Automatically trigger the breathing wave animation on initial page load
      const timer = setTimeout(() => {
        setHoverKey(Date.now());
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [animateOnMount]);

  const handleMouseEnter = () => {
    // Re-trigger the one-time thin-to-normal wave on hover
    setHoverKey(Date.now());
  };

  return (
    <span
      className={`inline-flex flex-nowrap cursor-pointer select-none transition-all ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {letters.map((char, index) => (
        <span
          key={`${index}-${hoverKey || 'static'}`}
          className="inline-block whitespace-pre will-change-[font-variation-settings,font-weight,opacity]"
          style={{
            animationName: hoverKey ? 'breathing-wave' : 'none',
            animationDuration: `${duration}s`,
            animationTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
            animationIterationCount: 1,
            animationFillMode: 'forwards',
            animationDelay: `${index * staggerDuration}s`,
            fontVariationSettings: "'wght' 600, 'slnt' 0",
            fontWeight: 600,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
