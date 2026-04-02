import React from 'react'

function Shimmer({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
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
      <div className="bg-slate-50 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className={`h-3 ${i === 0 ? 'w-32' : 'w-20'}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-t border-slate-100 flex gap-4 items-center">
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

export default Shimmer
