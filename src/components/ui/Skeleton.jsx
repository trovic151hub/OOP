import React from 'react'

function Shimmer({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
}

export function SkeletonRow({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Shimmer className={`h-4 ${i === 0 ? 'w-32' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <Shimmer className="w-16 h-5 rounded-full" />
        <div className="flex gap-1">
          <Shimmer className="w-5 h-5" />
          <Shimmer className="w-5 h-5" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Shimmer className="w-16 h-16 rounded-full" />
        <Shimmer className="w-28 h-4" />
        <Shimmer className="w-20 h-3" />
      </div>
      <Shimmer className="w-full h-8 rounded-lg" />
      <Shimmer className="w-full h-8 rounded-lg" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="card p-5 animate-pulse">
      <Shimmer className="w-24 h-3 mb-3" />
      <Shimmer className="w-16 h-8 mb-2" />
      <Shimmer className="w-20 h-3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className={`h-3 ${i === 0 ? 'w-32' : 'w-20'}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-4 items-center">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Shimmer className="w-8 h-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Shimmer className="w-24 h-3" />
              <Shimmer className="w-16 h-2" />
            </div>
          </div>
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <Shimmer key={j} className={`h-3 ${j === 0 ? 'w-16' : 'w-20'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonListRow() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <Shimmer className="w-7 h-7 rounded-full flex-shrink-0" />
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <Shimmer className="w-20 h-3" />
        <Shimmer className="w-14 h-2.5 rounded" />
      </div>
    </div>
  )
}

export function SkeletonMessages() {
  return (
    <div className="flex gap-5 h-[calc(100vh-10rem)] animate-pulse">
      <div className="hidden lg:flex flex-1 flex-col card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Shimmer className="w-32 h-3.5" />
            <Shimmer className="w-20 h-2.5" />
          </div>
        </div>
        <div className="flex-1 px-5 py-4 flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`flex ${i % 2 ? 'flex-row-reverse' : ''} gap-3`}>
              <Shimmer className="w-7 h-7 rounded-full flex-shrink-0" />
              <Shimmer className={`h-9 rounded-2xl ${i % 3 === 0 ? 'w-64' : 'w-40'}`} />
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <Shimmer className="w-full h-9 rounded-xl" />
        </div>
      </div>

      <div className="w-full lg:w-56 flex-shrink-0 flex flex-col gap-4">
        <div className="card p-4">
          <Shimmer className="w-16 h-2.5 mb-3" />
          <Shimmer className="w-24 h-4" />
        </div>
        <div className="card p-4 flex-1">
          <Shimmer className="w-24 h-2.5 mb-3" />
          <div className="flex flex-col gap-1">
            {[1, 2, 3, 4].map(i => <SkeletonListRow key={i} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shimmer
