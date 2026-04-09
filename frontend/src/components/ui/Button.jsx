// Button.jsx — Reusable button component with brand variants
import React from 'react'
import Spinner from './Spinner'

const variantClasses = {
  primary: 'bg-terracotta text-white hover:bg-terracotta-dark border border-transparent',
  ghost:   'bg-transparent text-terracotta border border-terracotta hover:bg-terracotta hover:text-white',
  danger:  'bg-error text-white hover:bg-red-700 border border-transparent',
  outline: 'bg-transparent text-espresso border border-border hover:border-terracotta hover:text-terracotta',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-sans font-medium rounded-sm
        transition-all duration-200 ease-brand
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" color={variant === 'ghost' ? 'terracotta' : 'white'} />}
      {children}
    </button>
  )
}
