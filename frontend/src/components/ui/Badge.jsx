// Badge.jsx — Status/category badge with brand variants
import React from 'react'

const variantClasses = {
  success: 'bg-green-50 text-success border-green-200',
  warning: 'bg-amber-50 text-warning border-amber-200',
  error:   'bg-red-50 text-error border-red-200',
  neutral: 'bg-cream text-charcoal border-border',
  brand:   'bg-terracotta-light text-terracotta-dark border-terracotta-light',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5
        text-xs font-sans font-medium rounded-full border
        ${variantClasses[variant] || variantClasses.neutral}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
