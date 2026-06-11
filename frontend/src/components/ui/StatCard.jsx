/**
 * components/ui/StatCard.jsx
 * ──────────────────────────
 * KPI metric card used in Dashboard and Analytics.
 *
 * Props:
 *   label     – metric label
 *   value     – formatted metric value (string or number)
 *   icon      – ReactNode (lucide icon)
 *   delta     – { value: string, positive: bool } optional trend indicator
 *   className – extra Tailwind classes
 */
import { cn } from '../../utils/cn'

function StatCard({ label, value, icon, delta, className }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-800 bg-surface-900 p-5 shadow-sm',
        'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-surface-500">
            {label}
          </span>
          <span className="text-2xl font-bold text-surface-50">{value ?? '—'}</span>
          {delta && (
            <span
              className={cn(
                'text-xs font-medium',
                delta.positive ? 'text-green-400' : 'text-red-400'
              )}
            >
              {delta.positive ? '▲' : '▼'} {delta.value}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
