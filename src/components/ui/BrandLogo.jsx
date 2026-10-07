import React, { useId } from 'react'

export function MedCoreMark({ className = 'w-9 h-9', title = 'MedCore' }) {
  const gradientId = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="8" y1="6" x2="41" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill={`url(#${gradientId})`} />
      <path
        d="M24 11.5 34.5 16v8.5c0 7.4-4.1 11.6-10.5 14-6.4-2.4-10.5-6.6-10.5-14V16L24 11.5Z"
        stroke="white"
        strokeWidth="2.6"
        strokeLinejoin="round"
        opacity=".9"
      />
      <path
        d="M14 25h5.1l2-5.4 4.3 12.2 2.7-6.8H34"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 17v4.8M21.6 19.4h4.8"
        stroke="white"
        strokeWidth="2.3"
        strokeLinecap="round"
        opacity=".92"
      />
    </svg>
  )
}

export default function BrandLogo({
  name = 'MedCore',
  subtitle,
  showText = true,
  className = '',
  markClassName = 'w-9 h-9',
  textClassName = 'text-slate-900 dark:text-slate-100',
  subtitleClassName = 'text-slate-400 dark:text-slate-600',
}) {
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <MedCoreMark className={`${markClassName} flex-shrink-0`} title={name} />
      {showText && (
        <div className="min-w-0">
          <p className={`font-extrabold leading-tight truncate ${textClassName}`}>{name}</p>
          {subtitle && (
            <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${subtitleClassName}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
