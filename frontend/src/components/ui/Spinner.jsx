/**
 * components/ui/Spinner.jsx
 * ─────────────────────────
 * Reusable loading spinner.
 *
 * Props:
 *   size     – 'sm' | 'md' | 'lg'  (default 'md')
 *   className – extra Tailwind classes
 */
import { cn } from '../../utils/cn'

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
}

function Spinner({ size = 'md', className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full',
        'border-surface-700 border-t-brand-500',
        sizeMap[size],
        className
      )}
    />
  )
}

export default Spinner
