import React from 'react'
import { getInitials, getAvatarColor } from '../../utils/helpers'

export default function Avatar({ name = '', size = 'md' }) {
  const sizes = { xs: 'w-5 h-5 text-[10px]', sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
  return (
    <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${sizes[size]} ${getAvatarColor(name)}`}>
      {getInitials(name)}
    </div>
  )
}
