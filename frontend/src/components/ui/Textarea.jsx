// Textarea.jsx — Multi-line text input with label and error state
import React from 'react'

export default function Textarea({
  label,
  error,
  helper,
  id,
  rows = 4,
  maxLength,
  value,
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="font-sans text-sm font-medium text-charcoal">
          {label}
          {required && <span className="text-error ml-1" aria-hidden>*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={`
          input-base resize-none
          ${error ? 'border-error focus:ring-error focus:border-error' : ''}
          ${className}
        `}
        aria-invalid={!!error}
        {...props}
      />
      <div className="flex justify-between items-center mt-0.5">
        {error ? (
          <p role="alert" className="text-xs text-error font-sans">{error}</p>
        ) : helper ? (
          <p className="text-xs text-muted font-sans">{helper}</p>
        ) : <span />}
        {maxLength && value != null && (
          <span className="text-xs text-muted font-sans">
            {String(value).length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
