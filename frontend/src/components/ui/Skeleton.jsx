// Skeleton.jsx — Shimmer loading placeholder
import React from 'react'

export default function Skeleton({ className = '', rounded = false, circle = false }) {
  return (
    <div
      aria-hidden
      className={`
        shimmer
        ${circle ? 'rounded-full' : rounded ? 'rounded-md' : 'rounded-sm'}
        ${className}
      `}
    />
  )
}

// Preset compositions
export function SkeletonCard() {
  return (
    <div className="card-base p-4 space-y-3">
      <Skeleton className="h-48 w-full" rounded />
      <Skeleton className="h-4 w-3/4" rounded />
      <Skeleton className="h-3 w-1/2" rounded />
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
          rounded
        />
      ))}
    </div>
  )
}
