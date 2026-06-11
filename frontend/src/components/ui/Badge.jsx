/**
 * components/ui/Badge.jsx
 * ───────────────────────
 * Compact status badge with semantic colour variants.
 *
 * Props:
 *   variant  – 'success' | 'warning' | 'danger' | 'info' | 'default'
 *   children – label text
 *   dot      – show a coloured dot before the label
 */
import { cn } from '../../utils/cn'

const variantClasses = {
  success: 'bg-green-500/15 text-green-400  border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  danger:  'bg-red-500/15   text-red-400    border-red-500/30',
  info:    'bg-cyan-500/15  text-cyan-400   border-cyan-500/30',
  default: 'bg-surface-700  text-surface-300 border-surface-600',
}

const dotColor = {
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  danger:  'bg-red-400',
  info:    'bg-cyan-400',
  default: 'bg-surface-400',
}

function Badge({ variant = 'default', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColor[variant])} />
      )}
      {children}
    </span>
  )
}

export default Badge
