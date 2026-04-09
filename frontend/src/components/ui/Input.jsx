// Input.jsx — Form input with label, error state, and helper text
import React from 'react'

const Input = React.forwardRef(function Input(
  { label, error, helper, id, className = '', required = false, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-sm font-medium text-charcoal"
        >
          {label}
          {required && <span className="text-error ml-1" aria-hidden>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          input-base
          ${error ? 'border-error focus:ring-error focus:border-error' : ''}
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-error font-sans mt-0.5">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${inputId}-helper`} className="text-xs text-muted font-sans mt-0.5">
          {helper}
        </p>
      )}
    </div>
  )
})

export default Input
