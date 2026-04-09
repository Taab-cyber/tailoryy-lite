// Divider.jsx — Horizontal or vertical visual separator
import React from 'react'

export default function Divider({ vertical = false, label, className = '' }) {
  if (vertical) {
    return <div className={`w-px bg-border self-stretch ${className}`} aria-hidden />
  }

  if (label) {
    return (
      <div className={`flex items-center gap-4 my-2 ${className}`}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-sans text-muted uppercase tracking-widest">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    )
  }

  return <hr className={`border-none h-px bg-border ${className}`} aria-hidden />
}
