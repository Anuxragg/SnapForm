'use client';

import React, { useId, useState } from 'react';

interface BreathingTextProps {
  children?: React.ReactNode;
  label?: string;
  staggerDuration?: number;
  duration?: number;
  className?: string;
}

export default function BreathingText({
  children,
  label,
  staggerDuration = 0.06,
  duration = 0.75,
  className = '',
}: BreathingTextProps) {
  const textContent = (typeof children === 'string' ? children : label) || '';
  const letters = Array.from(textContent);
  const id = useId().replace(/:/g, '');
  const animName = `thin-to-normal-${id}`;

  const [hoverKey, setHoverKey] = useState<number | null>(null);

  const handleMouseEnter = () => {
    // Re-trigger the one-time thin-to-normal wave
    setHoverKey(Date.now());
  };

  return (
    <span
      className={`inline-flex flex-nowrap cursor-pointer select-none transition-all ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      <style>{`
        @keyframes ${animName} {
          0% {
            font-variation-settings: 'wght' 600, 'slnt' 0;
            font-weight: 600;
            opacity: 1;
          }
          45% {
            font-variation-settings: 'wght' 100, 'slnt' -6;
            font-weight: 100;
            opacity: 0.75;
          }
          100% {
            font-variation-settings: 'wght' 600, 'slnt' 0;
            font-weight: 600;
            opacity: 1;
          }
        }
      `}</style>
      {letters.map((char, index) => (
        <span
          key={`${index}-${hoverKey || 'static'}`}
          className="inline-block whitespace-pre will-change-[font-variation-settings,font-weight,opacity]"
          style={{
            animationName: hoverKey ? animName : 'none',
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
