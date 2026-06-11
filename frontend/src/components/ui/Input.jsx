/**
 * components/ui/Input.jsx
 * ───────────────────────
 * Styled text input with optional left icon slot, error state, and label.
 *
 * Props:
 *   label      – input label text
 *   error      – error message string
 *   leftIcon   – ReactNode to show on the left inside the input
 *   className  – extra Tailwind classes for the wrapper div
 *   inputClass – extra classes for the <input> element
 *   ...rest    – all native <input> props
 */
import { cn } from '../../utils/cn'

function Input({ label, error, leftIcon, className, inputClass, id, ...rest }) {
  const inputId = id || rest.name || Math.random().toString(36).slice(2)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-surface-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-surface-800 px-3 py-2 text-sm text-surface-100',
            'placeholder:text-surface-500',
            'border-surface-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
            'transition-colors duration-150',
            leftIcon && 'pl-9',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500',
            inputClass
          )}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-danger-500">{error}</p>
      )}
    </div>
  )
}

export default Input
