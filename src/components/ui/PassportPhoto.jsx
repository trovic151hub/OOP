import React from 'react'
import { Stethoscope } from 'lucide-react'

export default function PassportPhoto({ src, name = '', size = 'md' }) {
  const sizes = { sm: 'w-16 h-20', md: 'w-24 h-32', lg: 'w-28 h-36', xl: 'w-40 h-52' }
  const iconSizes = { sm: 18, md: 24, lg: 28, xl: 40 }
  if (src) {
    return <img src={src} alt={name} className={`rounded-lg object-cover border border-slate-200 flex-shrink-0 ${sizes[size]}`} />
  }
  return (
    <div className={`rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 ${sizes[size]}`}>
      <Stethoscope size={iconSizes[size]} className="text-slate-300" />
    </div>
  )
}
