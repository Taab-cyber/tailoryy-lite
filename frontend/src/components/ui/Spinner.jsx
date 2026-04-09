// Spinner.jsx — Loading spinner with size and color variants
import React from 'react'

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-9 h-9' }

const colorMap = {
  terracotta: 'border-terracotta',
  white:      'border-white',
  espresso:   'border-espresso',
  muted:      'border-muted',
}

export default function Spinner({ size = 'md', color = 'terracotta', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`
        inline-block rounded-full border-2 border-t-transparent animate-spin
        ${sizeMap[size] || sizeMap.md}
        ${colorMap[color] || colorMap.terracotta}
        ${className}
      `}
    />
  )
}
