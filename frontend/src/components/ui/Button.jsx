/**
 * components/ui/Button.jsx
 * ────────────────────────
 * Polymorphic button with variants: primary | secondary | ghost | danger
 * and sizes: sm | md | lg.
 *
 * Props:
 *   variant    – 'primary' | 'secondary' | 'ghost' | 'danger'
 *   size       – 'sm' | 'md' | 'lg'
 *   loading    – shows a spinner and disables the button
 *   leftIcon   – ReactNode rendered before label
 *   rightIcon  – ReactNode rendered after label
 *   className  – extra Tailwind classes
 *   ...rest    – all native <button> props
 */
import { cn } from '../../utils/cn'

const variantClasses = {
  primary:   'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-surface-800 text-surface-100 hover:bg-surface-700 border border-surface-700',
  ghost:     'bg-transparent text-surface-300 hover:bg-surface-800 hover:text-surface-100',
  danger:    'bg-danger-500 text-white hover:bg-red-600 active:bg-red-700',
}

const sizeClasses = {
  sm: 'h-8  px-3 text-xs gap-1.5',
  md: 'h-9  px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
}

function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

export default Button
