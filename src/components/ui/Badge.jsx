import React from 'react'
import { getBadgeStyle } from '../../utils/helpers'

export default function Badge({ status, onClick, clickable = false }) {
  return (
    <span
      className={`badge ${getBadgeStyle(status)} ${clickable ? 'cursor-pointer hover:opacity-75 transition-opacity select-none' : ''}`}
      onClick={onClick}
      title={clickable ? 'Click to change status' : undefined}
    >
      {status}
    </span>
  )
}
