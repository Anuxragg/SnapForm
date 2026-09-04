'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  showText?: boolean;
  badgeText?: string;
  className?: string;
  textClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
}

export function SnapFormIcon({
  className = 'w-6 h-8',
  fill = 'currentColor',
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      fill="none"
      viewBox="0 0 32 48"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
    >
      <g fill={fill}>
        <path d="m.599609 19.2002h9.59998v9.59999h-9.59998z" />
        <path
          d="m31.4004 28.7998h9.6v9.59999h-9.6z"
          transform="matrix(-1 0 -0 -1 62.8008 57.5996)"
        />
        <path
          d="m10.1992 19.2001 11.6-9.6v9.6l-11.6 9.6z"
          opacity=".2"
        />
        <path
          d="m21.7988 28.7999-11.6 9.6v-9.6l11.6-9.6z"
          opacity=".5"
        />
        <path
          d="m.599609 19.2 21.199991-19.2v9.59999l-11.6 9.60001z"
          opacity=".6"
        />
        <path
          d="m31.4004 28.8-21.2 19.2v-9.6l11.6-9.6z"
          opacity=".7"
        />
      </g>
    </svg>
  );
}

export default function Logo({
  href = '/',
  showText = true,
  badgeText,
  className = '',
  textClassName = 'text-2xl font-black tracking-tight text-brand-charcoal',
  iconContainerClassName = '',
  iconClassName = '',
}: LogoProps) {
  const content = (
    <div className={`flex items-center gap-2 group cursor-pointer select-none ${className}`}>
      {/* Brand Icon inside sleek dark/contrast container */}
      <div className={`w-8 h-8 rounded-xl bg-brand-charcoal flex items-center justify-center text-white shadow-sm ${iconContainerClassName}`}>
        <SnapFormIcon className={iconClassName || "w-4 h-6 text-white"} fill="#ffffff" />
      </div>

      {showText && (
        <span className={`flex items-center gap-1.5 leading-none font-heading font-semibold ${textClassName}`}>
          <span>SnapForm</span>
          {badgeText && (
            <span className="text-[8px] font-bold text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded tracking-widest leading-none font-mono uppercase">
              {badgeText}
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
