// Avatar.jsx — User avatar with image or initials fallback
import React from 'react'

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const [imgError, setImgError] = React.useState(false)

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full overflow-hidden bg-terracotta-light
        font-sans font-semibold text-terracotta select-none
        ${sizeMap[size] || sizeMap.md}
        ${className}
      `}
      aria-label={name || 'User avatar'}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
