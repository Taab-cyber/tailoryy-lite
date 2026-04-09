// Select.jsx — Styled select dropdown with label and error state
import React from 'react'
import { ChevronDown } from 'lucide-react'

const Select = React.forwardRef(function Select(
  { label, error, helper, id, options = [], placeholder = 'Select an option', className = '', required = false, ...props },
  ref
) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="font-sans text-sm font-medium text-charcoal">
          {label}
          {required && <span className="text-error ml-1" aria-hidden>*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            input-base appearance-none pr-10 cursor-pointer
            ${error ? 'border-error focus:ring-error' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-error font-sans mt-0.5">{error}</p>
      )}
      {!error && helper && (
        <p className="text-xs text-muted font-sans mt-0.5">{helper}</p>
      )}
    </div>
  )
})

export default Select
