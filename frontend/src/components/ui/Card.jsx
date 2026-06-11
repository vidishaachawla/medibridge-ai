/**
 * components/ui/Card.jsx
 * ──────────────────────
 * Base card container with optional header, body, and footer slots.
 *
 * Props:
 *   className  – extra Tailwind classes
 *   children   – card body content
 *   title      – optional header text
 *   action     – optional ReactNode placed in the top-right of the header
 *   noPadding  – skip inner padding (useful for table cards)
 */
import { cn } from '../../utils/cn'

function Card({ className, children, title, action, noPadding = false }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-800 bg-surface-900 shadow-sm',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
          {title && (
            <h3 className="text-sm font-semibold text-surface-100 tracking-wide">
              {title}
            </h3>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5')}>{children}</div>
    </div>
  )
}

export default Card
